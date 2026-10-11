"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, Loader2, Save, X } from "lucide-react";
import Tesseract from "tesseract.js";

export default function ReportsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setExtractedText("");
  };

  const scanDocument = async () => {
    if (!selectedFile) return;
    
    setIsScanning(true);
    try {
      const result = await Tesseract.recognize(selectedFile, 'eng');
      setExtractedText(result.data.text);
    } catch (error) {
      console.error("OCR Error:", error);
      setExtractedText("Failed to extract text. Please try again or type manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setExtractedText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Medical Reports</h1>
        <p className="text-muted-foreground mt-1">Upload prescriptions and reports for AI-powered OCR scanning.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="glass-card rounded-2xl p-6 border border-border/50">
          <h2 className="text-xl font-bold mb-4">Upload Document</h2>
          
          {!selectedFile ? (
            <div 
              className="border-2 border-dashed border-primary/30 rounded-xl h-64 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-12 h-12 text-primary mb-3" />
              <p className="font-medium text-foreground">Click to upload report</p>
              <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, PDF</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative border border-border/50 rounded-xl overflow-hidden h-64 bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview || ""} alt="Preview" className="w-full h-full object-contain" />
                <button 
                  onClick={clearFile}
                  className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-destructive text-foreground hover:text-white rounded-lg transition-colors backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={scanDocument}
                disabled={isScanning}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scanning Document...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Extract Data (OCR)
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
        </div>

        {/* Results Section */}
        <div className="glass-card rounded-2xl p-6 border border-border/50 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Extracted Information</h2>
          
          {extractedText ? (
            <div className="flex-1 flex flex-col gap-4">
              <div className="p-3 bg-health-temp/10 text-health-temp rounded-lg text-sm border border-health-temp/20">
                <strong>Important:</strong> Never automatically assume extracted OCR information is medically correct. Please verify extracted information before saving.
              </div>
              <textarea 
                className="flex-1 w-full bg-input/50 border border-border rounded-xl p-4 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none font-mono"
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
              />
              <button className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-border">
                <Save className="w-5 h-5" />
                Save to Profile
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border/50 rounded-xl bg-secondary/30">
              <FileText className="w-12 h-12 mb-3 opacity-20" />
              <p>Upload and scan a document to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
