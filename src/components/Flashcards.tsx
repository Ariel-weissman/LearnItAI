import React, { useState, useEffect } from "react";
import { RefreshCw, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardsProps {
  cards: Flashcard[];
}

export default function Flashcards({ cards: initialCards }: FlashcardsProps) {
  const [cards, setCards] = useState(initialCards);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIdx(0);
    setIsFlipped(false);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold text-zinc-900">Flashcards</h2>
        </div>
        <button
          onClick={shuffleCards}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Shuffle
        </button>
      </div>

      <div className="relative h-96 perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full h-full cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? "rotate-y-180" : ""}`}>
              {/* Front */}
              <div className="absolute inset-0 w-full h-full backface-hidden bg-white border-2 border-zinc-100 rounded-[2.5rem] shadow-xl flex items-center justify-center p-12 text-center">
                <div className="text-2xl font-bold text-zinc-800 leading-tight">
                  <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {cards[currentIdx].front}
                  </Markdown>
                </div>
                <div className="absolute bottom-8 text-xs font-bold text-zinc-300 uppercase tracking-widest">
                  Click to flip
                </div>
              </div>

              {/* Back */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-indigo-600 rounded-[2.5rem] shadow-xl flex items-center justify-center p-12 text-center text-white">
                <div className="text-xl font-medium leading-relaxed">
                  <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {cards[currentIdx].back}
                  </Markdown>
                </div>
                <div className="absolute bottom-8 text-xs font-bold text-white/40 uppercase tracking-widest">
                  Click to flip back
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex items-center justify-center gap-8">
        <button
          onClick={prevCard}
          className="p-4 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-600" />
        </button>
        <span className="text-sm font-bold text-zinc-400">
          {currentIdx + 1} / {cards.length}
        </span>
        <button
          onClick={nextCard}
          className="p-4 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-colors shadow-sm"
        >
          <ChevronRight className="w-6 h-6 text-zinc-600" />
        </button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
