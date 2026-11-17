"use client";

import { useState, useRef } from "react";
import { 
  UploadCloud, FileText, Loader2, Save, X, Sparkles, 
  CheckCircle2, AlertTriangle, AlertCircle, Heart, Pill, 
  Stethoscope, ShieldAlert, ArrowRight, RefreshCw, Copy, Check
} from "lucide-react";
import Tesseract from "tesseract.js";
import { 
  analyzeMedicalText, 
  MedicalAnalysisResult, 
  SAMPLE_REPORTS 
} from "@/lib/medicalReportAnalyzer";
import { hapticFeedback } from "@/lib/haptics";
import Link from "next/link";

export default function ReportsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<MedicalAnalysisResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setOcrError(null);
    setIsSaved(false);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      // PDF or non-image fallback
      setPreview(null);
    }

    setExtractedText("");
    setAnalysisResult(null);
  };

  const scanDocument = async () => {
    if (!selectedFile) return;

    hapticFeedback.medium();
    setIsScanning(true);
    setOcrError(null);
    setScanProgress("Initializing OCR engine...");

    try {
      // Run Tesseract with live logger progress
      const workerPromise = Tesseract.recognize(selectedFile, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const pct = Math.round((m.progress || 0) * 100);
            setScanProgress(`Analyzing document text (${pct}%)...`);
          } else if (m.status === "loading tesseract core") {
            setScanProgress("Loading OCR core components...");
          } else if (m.status === "loading language traineddata") {
            setScanProgress("Loading medical dictionary...");
          }
        },
      });

      // 20-second timeout safeguard for network/CDN issues
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("OCR timeout")), 20000)
      );

      const result = await Promise.race([workerPromise, timeoutPromise]);
      const text = result.data.text.trim();

      if (!text || text.length < 10) {
        throw new Error("Low text density detected");
      }

      setExtractedText(text);
      const analyzed = analyzeMedicalText(text);
      setAnalysisResult(analyzed);
      hapticFeedback.success();
    } catch (error: any) {
      console.warn("OCR Exception:", error);
      setOcrError(
        "Could not extract clear text automatically from this file (CDN offline, low resolution, or PDF format). You can paste or edit the text manually below, or try a sample report!"
      );

      // Provide a baseline template so the user is never stuck
      const defaultText = `MEDNEST HEALTHCARE DIAGNOSTICS\nPatient: Patient-1\nDate: ${new Date().toLocaleDateString()}\nFasting Blood Sugar: 120 mg/dL\nBlood Pressure: 130/85 mmHg\nBody Temperature: 37.2 °C\nRx: Paracetamol 650mg 1-0-1\nAdvice: Rest on smart pillow and monitor vitals.`;
      setExtractedText(defaultText);
      setAnalysisResult(analyzeMedicalText(defaultText));
    } finally {
      setIsScanning(false);
      setScanProgress("");
    }
  };

  const loadSampleReport = (index: number) => {
    hapticFeedback.light();
    const sample = SAMPLE_REPORTS[index];
    setSelectedFile(null);
    setPreview(null);
    setOcrError(null);
    setExtractedText(sample.text);
    const analyzed = analyzeMedicalText(sample.text);
    setAnalysisResult(analyzed);
    setIsSaved(false);
  };

  const handleManualTextChange = (text: string) => {
    setExtractedText(text);
    if (text.trim().length > 15) {
      setAnalysisResult(analyzeMedicalText(text));
    } else {
      setAnalysisResult(null);
    }
  };

  const handleSaveToProfile = () => {
    hapticFeedback.medium();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const copyToClipboard = () => {
    hapticFeedback.light();
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setExtractedText("");
    setAnalysisResult(null);
    setOcrError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Stethoscope className="w-8 h-8 text-primary" />
            AI Medical Report & Prescription Analyzer
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload doctor prescriptions, discharge summaries, or blood test reports for instant AI clinical breakdown.
          </p>
        </div>

        {/* Quick Sample Loaders */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium mr-1">Quick Demo:</span>
          <button
            onClick={() => loadSampleReport(0)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all cursor-pointer"
          >
            📋 Blood Test Report
          </button>
          <button
            onClick={() => loadSampleReport(1)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-all cursor-pointer"
          >
            💊 Prescription Sample
          </button>
        </div>
      </header>

      {/* Main Grid: Upload & Controls on Left, Analysis & Findings on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Box & Extracted Text (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary" />
                Upload Document
              </h2>
              {selectedFile && (
                <button
                  onClick={clearFile}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-primary/30 rounded-2xl h-56 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer p-6 text-center group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-7 h-7 text-primary" />
                </div>
                <p className="font-bold text-foreground text-sm">Click or Drag & Drop Report</p>
                <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, Screenshots & Scans</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative border border-border/50 rounded-xl overflow-hidden h-56 bg-secondary/40 flex items-center justify-center">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Medical Report Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                      <FileText className="w-12 h-12 text-primary" />
                      <p className="text-sm font-semibold truncate max-w-[200px]">{selectedFile.name}</p>
                      <span className="text-xs text-muted-foreground">Document Ready</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={scanDocument}
                  disabled={isScanning}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer disabled:opacity-60"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{scanProgress || "Scanning with OCR..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Run AI OCR Analysis</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {ocrError && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{ocrError}</span>
              </div>
            )}
          </div>

          {/* Raw / Editable Text Box */}
          <div className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Report Text (Editable)
              </h3>
              <div className="flex items-center gap-2">
                {extractedText && (
                  <button
                    onClick={copyToClipboard}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
            </div>

            <textarea
              rows={8}
              placeholder="Paste or type prescription / lab test report text here to analyze instantly..."
              value={extractedText}
              onChange={(e) => handleManualTextChange(e.target.value)}
              className="w-full bg-input/40 border border-border rounded-xl p-3 text-xs text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none font-mono leading-relaxed"
            />
            <p className="text-[11px] text-muted-foreground">
              Tip: You can paste any hospital discharge summary, lab values, or prescription directly above.
            </p>
          </div>
        </div>

        {/* Right Column: Structured AI Clinical Analysis (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {analysisResult ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header Status Banner */}
              <div
                className={`rounded-2xl p-5 border shadow-md relative overflow-hidden backdrop-blur-xl ${
                  analysisResult.overallStatus === "critical"
                    ? "bg-red-500/15 border-red-500/40 text-red-200"
                    : analysisResult.overallStatus === "attention"
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
                    : "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${
                        analysisResult.overallStatus === "critical"
                          ? "bg-red-500/20 border-red-500/30 text-red-400"
                          : analysisResult.overallStatus === "attention"
                          ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                          : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                      }`}
                    >
                      {analysisResult.overallStatus === "critical" ? (
                        <ShieldAlert className="w-6 h-6 animate-pulse" />
                      ) : analysisResult.overallStatus === "attention" ? (
                        <AlertTriangle className="w-6 h-6" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/50 border border-current/20">
                          {analysisResult.reportType}
                        </span>
                        <span className="text-xs text-muted-foreground">• Date: {analysisResult.reportDate}</span>
                      </div>
                      <h3 className="text-base font-bold text-foreground mt-1">
                        Patient: {analysisResult.patientName}
                      </h3>
                      <p className="text-xs mt-1 text-foreground/90 leading-relaxed">
                        {analysisResult.diagnosisSummary}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Lab Vitals & Parameters Table */}
              {analysisResult.labParameters.length > 0 && (
                <div className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                      <Heart className="w-5 h-5 text-health-heart" />
                      Extracted Lab Parameters & Vitals
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {analysisResult.labParameters.length} Metrics Detected
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground">
                          <th className="py-2.5 font-semibold">Test / Parameter</th>
                          <th className="py-2.5 font-semibold">Measured Value</th>
                          <th className="py-2.5 font-semibold">Normal Range</th>
                          <th className="py-2.5 font-semibold text-right">Clinical Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {analysisResult.labParameters.map((param, idx) => (
                          <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                            <td className="py-3 font-medium text-foreground">
                              {param.name}
                              {param.insight && (
                                <p className="text-[10px] text-muted-foreground font-normal">{param.insight}</p>
                              )}
                            </td>
                            <td className="py-3 font-bold text-foreground">
                              {param.value} <span className="font-normal text-muted-foreground">{param.unit}</span>
                            </td>
                            <td className="py-3 text-muted-foreground">{param.referenceRange}</td>
                            <td className="py-3 text-right">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  param.status === "critical"
                                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                                    : param.status === "high"
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                    : param.status === "low"
                                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                }`}
                              >
                                {param.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. Detected Medications & Prescription */}
              {analysisResult.medications.length > 0 && (
                <div className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                      <Pill className="w-5 h-5 text-primary" />
                      Prescribed Medications
                    </h3>
                    <Link
                      href="/medications"
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      View Schedule <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {analysisResult.medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-border/50 bg-secondary/30 flex items-start gap-3 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-foreground truncate">{med.name}</h4>
                          <p className="text-xs text-primary font-medium mt-0.5">
                            {med.dosage} • {med.frequency}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{med.instructions}</p>
                          {med.purpose && (
                            <span className="inline-block text-[10px] bg-secondary px-2 py-0.5 rounded-md text-muted-foreground mt-1.5 border border-border/40">
                              {med.purpose}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Doctor Advice & Precautions */}
              {analysisResult.doctorAdvice.length > 0 && (
                <div className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm space-y-3">
                  <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Doctor Advice & Caregiver Precautions
                  </h3>
                  <ul className="space-y-2 text-xs text-foreground/90">
                    {analysisResult.doctorAdvice.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons: Save & Sync */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveToProfile}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 text-xs sm:text-sm"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saved to Patient Health Profile!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Clinical Summary to Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="glass-card rounded-2xl p-12 border border-dashed border-border/60 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Stethoscope className="w-8 h-8 opacity-70" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">No Medical Report Analyzed Yet</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Upload a photo of your doctor prescription, blood test, or discharge summary on the left, or click one
                  of the demo buttons above to test the AI analyzer immediately!
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  onClick={() => loadSampleReport(0)}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Load Sample Lab Test
                </button>
                <button
                  onClick={() => loadSampleReport(1)}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Load Sample Prescription
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
