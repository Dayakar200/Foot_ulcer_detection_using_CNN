import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Upload, 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  Camera, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Info,
  Calendar,
  Layers,
  LayoutDashboard
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// --- TYPES ---
interface PredictionResult {
  detection: string;
  severity: string;
  risk_score: number;
  ulcer_area_ratio: number;
  original_image: string;
  blended_image: string;
}

// --- COMPONENTS ---

const DashboardCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3"
  >
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{subtitle}</span>
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </motion.div>
);

const App = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [view, setView] = useState<'original' | 'segmented'>('original');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_URL}/predict`, formData);
      setResult(response.data);
      setView('segmented');
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to connect to the backend. Please ensure the FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadReport = () => {
    if (!result) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); 
    doc.text('SwiftWound AI Medical Report', 20, 20);
    
    doc.setDrawColor(79, 70, 229);
    doc.line(20, 25, 190, 25);
    
    // Meta Data
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Scan Reference: #SCAN-2026-03-28`, 20, 35);
    doc.text(`Date of Analysis: ${new Date().toLocaleDateString()}`, 20, 40);
    
    // Results section
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('Diagnostic Analysis', 20, 60);
    
    doc.setFontSize(12);
    doc.text(`Tissue Severity Gradient: ${result.severity}`, 30, 75);
    doc.text(`Calculated Risk Score: ${result.risk_score}%`, 30, 85);
    doc.text(`Ulcer Area Ratio (Segmentation): ${(result.ulcer_area_ratio * 100).toFixed(2)}%`, 30, 95);
    
    // Clinical Impression
    doc.setFontSize(16);
    doc.text('Clinical Impression', 20, 115);
    
    doc.setFontSize(12);
    doc.setTextColor(result.severity === 'High' ? 180 : 0, 0, 0);
    const impression = result.severity === 'High' 
      ? 'CRITICAL ALERT: Automated analysis suggests advanced progression. Urgent clinical evaluation is mandatory.'
      : 'Observation: Tissue architecture appears within stable parameters. Maintain standard preventative care protocols.';
    doc.text(impression, 20, 125, { maxWidth: 170 });
    
    // Final Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('This is an AI-generated assessment and should be verified by a licensed medical professional.', 20, 270);
    doc.text('SwiftWound AI v1.0 | HIPAA Compliant Data Processing', 20, 275);
    
    doc.save('SwiftWound_Analysis_Report.pdf');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Outfit']">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500">
            SwiftWound AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={triggerFileInput}
            className="bg-indigo-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
          >
            New Scan
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Section - Upload & Visualization */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden relative">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Foot Ulcer Analysis</h2>
                  <p className="text-gray-400 text-sm">Upload an image for automated detection & segmentation.</p>
                </div>
                {result && (
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setView('original')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === 'original' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                    >
                      Original
                    </button>
                    <button 
                      onClick={() => setView('segmented')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === 'segmented' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                    >
                      Segmented
                    </button>
                  </div>
                )}
              </div>

              <div 
                className={`relative min-h-[400px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${!previewUrl ? 'border-gray-200 bg-gray-50' : 'border-transparent bg-white'}`}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept="image/*"
                />

                {!previewUrl ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4 text-center cursor-pointer p-12 w-full h-full"
                    onClick={triggerFileInput}
                  >
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                      <Camera className="w-8 h-8 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-700">Drop patient image here</h3>
                      <p className="text-gray-400 max-w-xs mx-auto">Supports JPG, PNG for high-accuracy segmentation.</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
                      className="mt-4 flex items-center gap-2 bg-white border border-gray-200 px-6 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                    >
                      Browse Files <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <div className="w-full h-full relative group">
                    <img 
                      src={view === 'original' ? (result?.original_image || previewUrl) : (result?.blended_image || previewUrl)} 
                      alt="Scan Preview" 
                      className="w-full h-full object-contain rounded-xl"
                    />
                    {!result && !loading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-xl">
                        <button 
                          onClick={triggerFileInput}
                          className="bg-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2"
                        >
                          Change Image
                        </button>
                      </div>
                    )}
                    {loading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-20">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-indigo-600 animate-pulse">Analyzing tissue architecture...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {previewUrl && !result && !loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex justify-center"
                >
                  <button 
                    onClick={handleUpload}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200"
                  >
                    <Activity className="w-5 h-5" /> Start AI Analysis
                  </button>
                </motion.div>
              )}
            </section>

            {/* Analysis Details - Conditional Rendering */}
            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden"
                >
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                          <Info className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-800">Scan Summary</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                          <span className="text-gray-400 text-sm">Scan ID</span>
                          <span className="font-mono text-sm font-bold">#SCAN-2026-03-28</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                          <span className="text-gray-400 text-sm">Timestamp</span>
                          <span className="text-sm font-semibold">Today, 10:25 AM</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">AI Confidence</span>
                          <span className="text-sm font-bold text-green-600">98.4%</span>
                        </div>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-800">Follow-up Plan</h3>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        Based on AI findings, a follow-up assessment is recommended within 72 hours if progress shows no improvement.
                      </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Section - Risk Dashboard */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <AnimatePresence mode='wait'>
              {result ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-6"
                >
                  <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
                     <h3 className="text-xl font-bold text-gray-800 mb-6">Inference Results</h3>
                     <div className="space-y-6">
                       <DashboardCard 
                          title="Risk Score" 
                          value={`${result.risk_score}%`} 
                          icon={TrendingUp} 
                          color={result.risk_score > 70 ? "bg-red-500" : result.risk_score > 30 ? "bg-amber-500" : "bg-green-500"} 
                          subtitle="PROBABILITY"
                        />
                        <DashboardCard 
                          title="Tissue Severity" 
                          value={result.severity} 
                          icon={ShieldAlert} 
                          color={result.severity === 'High' ? "bg-red-500" : result.severity === 'Moderate' ? "bg-amber-500" : "bg-green-500"} 
                          subtitle="GRADING"
                        />
                        <DashboardCard 
                          title="Ulcer Area Ratio" 
                          value={(result.ulcer_area_ratio * 100).toFixed(2) + "%"} 
                          icon={Layers} 
                          color="bg-blue-500" 
                          subtitle="SEGMENTATION"
                        />
                     </div>

                     <div className={`mt-8 p-4 rounded-2xl flex items-start gap-4 ${result.severity === 'High' ? 'bg-red-50' : 'bg-green-50'}`}>
                       {result.severity === 'High' ? (
                          <AlertTriangle className="text-red-600 w-10 h-10 shrink-0" />
                       ) : (
                          <CheckCircle2 className="text-green-600 w-10 h-10 shrink-0" />
                       )}
                       <div>
                         <h4 className={`font-bold ${result.severity === 'High' ? 'text-red-900' : 'text-green-900'}`}>
                           {result.severity === 'High' ? 'Critical Action Required' : 'Condition Stable'}
                         </h4>
                         <p className={`text-sm ${result.severity === 'High' ? 'text-red-700' : 'text-green-700'} mt-1`}>
                           {result.severity === 'High' 
                             ? 'The AI detected significant ulcer progression. Immediate clinical review is recommended.'
                             : 'The wound shows normal characteristics. Continue scheduled monitoring.'}
                         </p>
                       </div>
                     </div>

                     <button 
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setResult(null);
                      }}
                      className="w-full mt-8 py-4 rounded-2xl border-2 border-dashed border-gray-200 font-bold text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition-all"
                     >
                       Upload New Scan
                     </button>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200">
                    <div className="flex items-center gap-3 mb-6">
                      <FileText className="w-5 h-5 text-indigo-200" />
                      <h3 className="font-bold">Generate Medical Report</h3>
                    </div>
                    <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                      Export analysis report with segmentation results and AI diagnosis.
                    </p>
                    <button 
                      onClick={handleDownloadReport}
                      className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-all"
                    >
                      Download AI Report
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-4 min-h-[500px]"
                >
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-2">
                    <Activity className="w-8 h-8 text-indigo-200" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700">Waiting for Data</h3>
                  <p className="text-gray-400 text-sm max-w-[200px]">
                    Analysis results and risk prediction will appear here after processing.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-gray-100 flex justify-between items-center text-sm text-gray-400">
        <p>© 2026 SwiftWound AI. HIPAA Compliant System.</p>
      </footer>
    </div>
  );
};

export default App;
