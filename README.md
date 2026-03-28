# AI-Powered Diabetic Foot Ulcer (DFU) Monitoring System

## Overview
This project is an AI-powered system designed for early detection, segmentation, and risk progression prediction of diabetic foot ulcers using medical imaging. It leverages deep learning (U-Net) for precise wound segmentation and provides a modern medical dashboard for clinical monitoring.

## 🚀 Features
- **Wound Segmentation:** Automated U-Net based segmentation of ulcer areas.
- **Risk Prediction:** AI-driven severity grading (Low, Moderate, High) and risk scoring.
- **Medical Dashboard:** Premium React-based interface for visualizing scans and analysis.
- **Segmentation Overlay:** Dual-view system to toggle between original and segmented scans.
- **EHR Integration Ready:** Structured JSON outputs for medical records.

## 🛠️ Technology Stack
- **Backend:**
  - FastAPI (Python)
  - PyTorch (Deep Learning / U-Net)
  - OpenCV (Image Processing)
  - segmentation-models-pytorch (Inference)
- **Frontend:**
  - React.js (TypeScript)
  - Vite (Build Tool)
  - Tailwind CSS (Styling)
  - Framer Motion (Animations)
  - Lucide React (Icons)

## 📁 Project Structure
```
Yantraa_task/
├── backend/                # FastAPI Application
│   ├── app/                # Application Logic
│   │   └── main.py         # Main entry point & API endpoints
│   ├── weights/            # Model weights (ulcer_unet.pth)
│   └── requirements.txt    # Python dependencies
├── frontend/               # React + TypeScript Frontend
│   ├── src/                # Source code
│   │   ├── App.tsx         # Main Dashboard
│   │   └── index.css       # Tailwind & Global styles
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite configuration
├── DFU/                    # Mendeley/Kaggle Dataset (Source)
└── train.py                # Training script for U-Net
```

## ⚙️ Setup & Installation

### 1. Backend Setup
1. Navigate to the project root.
2. Ensure you have a virtual environment (`.venv`).
3. Install dependencies:
   ```bash
   .\.venv\Scripts\pip install -r backend/requirements.txt
   ```
4. Run the API server:
   ```bash
   .\.venv\Scripts\python backend/app/main.py
   ```
   *The API will be available at http://localhost:8000*

### 2. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The dashboard will be available at http://localhost:5173*

## 🧠 Model Training
To train the model from scratch using the provided dataset:
```bash
.\.venv\Scripts\python train.py
```
This will save `ulcer_unet.pth` which can be moved to `backend/weights/` for inference.

## 🩺 Clinical Workflow
1. **Upload:** Capture or upload a high-resolution image of the patient's foot.
2. **Analysis:** The AI segments the wound area and calculates the ulcer-to-surface ratio.
3. **Assessment:** The risk score and severity are displayed on the dashboard.
4. **Follow-up:** Schedule clinical interventions based on AI-suggested risk levels.

---
**Disclaimer:** This system is for research and demonstration purposes. Always consult a medical professional for clinical diagnosis.
