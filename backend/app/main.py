import os
import io
import cv2
import numpy as np
import torch
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import segmentation_models_pytorch as smp
from PIL import Image
import base64

# =========================
# CONFIG
# =========================
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
IMAGE_SIZE = 256
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "weights", "ulcer_unet.pth")

app = FastAPI(title="Diabetic Foot Ulcer Monitoring API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# MODEL SETUP
# =========================
model = smp.Unet(
    encoder_name="resnet18",
    encoder_weights=None,
    in_channels=3,
    classes=1
)

# Load weights if they exist, otherwise use a placeholder
if os.path.exists(MODEL_PATH):
    try:
        model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
        print(f"Loaded weights from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading weights: {e}")
else:
    print(f"No weights found at {MODEL_PATH}, using uninitialized model for demonstration.")

model.to(DEVICE)
model.eval()

# =========================
# UTILS
# =========================
def process_image(img_bytes):
    nparr = np.frombuffer(img_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    original_h, original_w = image.shape[:2]
    
    # Preprocess for model
    image_r = cv2.resize(image, (IMAGE_SIZE, IMAGE_SIZE))
    image_norm = image_r / 255.0
    image_tensor = np.transpose(image_norm, (2, 0, 1))
    image_tensor = torch.tensor(image_tensor, dtype=torch.float32).unsqueeze(0).to(DEVICE)
    
    # Inference
    with torch.no_grad():
        pred = model(image_tensor)
        pred = torch.sigmoid(pred)
        mask = (pred > 0.5).float().cpu().numpy()[0][0]
    
    # Resize mask back to original
    mask_resized = cv2.resize(mask, (original_w, original_h))
    
    # Encode original image to base64
    _, buffer = cv2.imencode('.jpg', image)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    # Create mask overlay (red highlights)
    mask_bool = mask_resized > 0.5
    overlay = np.zeros_like(image)
    overlay[mask_bool] = [0, 0, 255] # Red in BGR
    
    # Blend overlay with original
    alpha = 0.5
    blended = cv2.addWeighted(image, 1 - alpha, overlay, alpha, 0)
    _, blended_buffer = cv2.imencode('.jpg', blended)
    blended_base64 = base64.b64encode(blended_buffer).decode('utf-8')
    
    # Simple risk prediction based on segmentation area
    ulcer_pixels = np.sum(mask_bool)
    total_pixels = original_h * original_w
    ulcer_ratio = ulcer_pixels / total_pixels
    
    severity = "None"
    risk_score = 0
    if ulcer_ratio > 0.1:
        severity = "High"
        risk_score = 90
    elif ulcer_ratio > 0.02:
        severity = "Moderate"
        risk_score = 50
    elif ulcer_ratio > 0:
        severity = "Low"
        risk_score = 20
        
    return {
        "detection": "Ulcer Detected" if ulcer_ratio > 0 else "No Ulcer Detected",
        "severity": severity,
        "risk_score": risk_score,
        "ulcer_area_ratio": round(float(ulcer_ratio), 4),
        "original_image": f"data:image/jpeg;base64,{img_base64}",
        "blended_image": f"data:image/jpeg;base64,{blended_base64}"
    }

# =========================
# ENDPOINTS
# =========================
@app.get("/")
async def root():
    return {"message": "Diabetic Foot Ulcer Monitoring API is running"}

@app.post("/predict")
async def predict_ulcer(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    contents = await file.read()
    try:
        result = process_image(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
