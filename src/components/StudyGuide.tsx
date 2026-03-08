import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import { generateExplanatoryImage } from "../services/gemini";
import { motion, AnimatePresence } from "motion/react";

interface StudyGuideProps {
  content: string;
  onTextSelect: (text: string) => void;
}

export default function StudyGuide({ content, onTextSelect }: StudyGuideProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ [key: string]: string }>({});

  const handleGenerateImage = async () => {
    const selection = window.getSelection()?.toString();
    if (!selection || selection.length < 3) {
      alert("Please highlight a concept or term to generate an image for it.");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateExplanatoryImage(selection);
      if (imageUrl) {
        setGeneratedImages((prev) => ({ ...prev, [selection]: imageUrl }));
      }
    } catch (error) {
      console.error("Image generation error:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handlePointerUp = () => {
    // Small timeout to allow the selection to be finalized on some mobile browsers
    setTimeout(() => {
      const selection = window.getSelection()?.toString();
      if (selection && selection.trim().length > 0) {
        onTextSelect(selection.trim());
      } else {
        onTextSelect("");
      }
    }, 10);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white min-h-screen shadow-sm relative">
      <div className="sticky top-4 z-10 flex justify-end mb-4 pointer-events-none">
        <button
          onClick={handleGenerateImage}
          disabled={isGeneratingImage}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 group"
          title="Highlight text then click to generate an image"
        >
          {isGeneratingImage ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-sm font-medium">Visualize Concept</span>
        </button>
      </div>

      <div 
        onPointerUp={handlePointerUp}
        className="prose prose-indigo max-w-none selection:bg-indigo-100 selection:text-indigo-900 touch-manipulation"
      >
        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {content}
        </Markdown>
      </div>

      {Object.keys(generatedImages).length > 0 && (
        <div className="mt-12 border-t border-zinc-100 pt-8">
          <h3 className="text-lg font-semibold text-zinc-800 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Visual Explanations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(generatedImages).map(([concept, url]) => (
              <motion.div
                key={concept}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm"
              >
                <img src={url} alt={concept} className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
                <div className="p-4 bg-white border-t border-zinc-100">
                  <p className="text-sm font-medium text-zinc-700">Concept: {concept}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
