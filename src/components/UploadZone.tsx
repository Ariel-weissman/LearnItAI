import React, { useState, useCallback } from "react";
import { Upload, FileText, Loader2, ArrowRight, File as FileIcon } from "lucide-react";
import { motion } from "motion/react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

// Set worker path for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface UploadZoneProps {
  onUpload: (text: string) => void;
  isLoading: boolean;
}

export default function UploadZone({ onUpload, isLoading }: UploadZoneProps) {
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const extractTextFromFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        fullText += strings.join(" ") + "\n";
      }
      return fullText;
    } 
    
    if (extension === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    if (extension === 'txt' || extension === 'md') {
      return await file.text();
    }

    throw new Error("Unsupported file type");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsParsing(true);
    try {
      const content = await extractTextFromFile(file);
      onUpload(content);
    } catch (error) {
      console.error("File parsing error:", error);
      alert("Failed to parse file. Please try another format.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setIsParsing(true);
      try {
        const content = await extractTextFromFile(file);
        onUpload(content);
      } catch (error) {
        console.error("File parsing error:", error);
        alert("Failed to parse file.");
      } finally {
        setIsParsing(false);
      }
    }
  }, [onUpload]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
          Your Personal AI Study Buddy
        </h1>
        <p className="text-zinc-500 text-lg">
          Upload notes, PDFs, or DOCX files. We'll make them organized, 
          visual, and easy to study.
        </p>
      </motion.div>

      <div className="space-y-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative group border-2 border-dashed rounded-3xl p-10 transition-all ${
            isDragging 
              ? "border-indigo-500 bg-indigo-50" 
              : "border-zinc-200 hover:border-indigo-300 hover:bg-zinc-50"
          }`}
        >
          <input
            type="file"
            accept=".txt,.md,.pdf,.docx"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-2xl transition-colors ${
              isDragging ? "bg-indigo-100 text-indigo-600" : "bg-zinc-100 text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
            }`}>
              <Upload className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-zinc-700 font-medium">Drop your notes here</p>
              <p className="text-zinc-400 text-sm mt-1">Supports PDF, DOCX, TXT, MD</p>
            </div>
          </div>
        </div>

        {(isParsing || isLoading) && (
          <div className="flex items-center justify-center gap-3 p-4 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">{isParsing ? "Extracting text..." : "Generating study guide..."}</span>
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-zinc-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-zinc-400 font-medium">OR PASTE TEXT</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your notes, lecture transcript, or study guide here..."
            className="w-full h-40 resize-none border-none focus:ring-0 text-zinc-700 placeholder:text-zinc-300"
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={() => onUpload(text)}
              disabled={isLoading || isParsing || !text.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 disabled:opacity-50 transition-all"
            >
              Generate Study Guide
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
