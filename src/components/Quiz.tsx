import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface Question {
  question: string;
  type: "multiple-choice" | "fill-in-the-blank";
  options?: string[];
  answer: string;
  explanation: string;
}

interface QuizProps {
  questions: Question[];
  onRestart: () => void;
}

export default function Quiz({ questions, onRestart }: QuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [fillAnswer, setFillAnswer] = useState("");
  const [incorrectAnswers, setIncorrectAnswers] = useState<{ question: string; userAnswer: string; correctAnswer: string; explanation: string }[]>([]);

  const currentQuestion = questions[currentIdx];

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();
    if (isCorrect) {
      setScore(score + 1);
    } else {
      setIncorrectAnswers(prev => [...prev, {
        question: currentQuestion.question,
        userAnswer: answer,
        correctAnswer: currentQuestion.answer,
        explanation: currentQuestion.explanation
      }]);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setFillAnswer("");
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-3xl shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">Quiz Completed!</h2>
          <p className="text-zinc-500">You scored {score} out of {questions.length}</p>
        </div>

        {incorrectAnswers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Review Incorrect Answers
            </h3>
            <div className="space-y-6">
              {incorrectAnswers.map((item, i) => (
                <div key={i} className="p-5 bg-rose-50 rounded-2xl border border-rose-100">
                  <div className="font-semibold text-zinc-900 mb-2">
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {item.question}
                    </Markdown>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="p-3 bg-white rounded-xl border border-rose-200">
                      <span className="block text-xs font-bold text-rose-500 uppercase mb-1">Your Answer</span>
                      <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {item.userAnswer || "(No answer)"}
                      </Markdown>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <span className="block text-xs font-bold text-emerald-600 uppercase mb-1">Correct Answer</span>
                      <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {item.correctAnswer}
                      </Markdown>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-600 bg-white/50 p-3 rounded-xl">
                    <span className="font-bold text-zinc-900 block mb-1">Why?</span>
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {item.explanation}
                    </Markdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={onRestart}
            className="w-full py-4 bg-white border-2 border-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-50 transition-all"
          >
            New Quiz with Custom Focus
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 px-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
            Question {currentIdx + 1} of {questions.length}
          </span>
        </div>
        <div className="text-sm font-medium text-zinc-400">
          Score: {score}
        </div>
      </div>

      <motion.div
        key={currentIdx}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100"
      >
        <div className="text-xl font-semibold text-zinc-800 mb-8 leading-relaxed">
          <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {currentQuestion.question}
          </Markdown>
        </div>

        <div className="space-y-3">
          {currentQuestion.type === "multiple-choice" ? (
            currentQuestion.options?.map((option, i) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.answer;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-2xl text-left transition-all border-2 flex items-center justify-between group ${
                    showCorrect 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                      : showWrong
                      ? "bg-rose-50 border-rose-500 text-rose-700"
                      : isSelected
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <div className="font-medium">
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {option}
                    </Markdown>
                  </div>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {showWrong && <XCircle className="w-5 h-5 text-rose-500" />}
                </button>
              );
            })
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                value={fillAnswer}
                onChange={(e) => setFillAnswer(e.target.value)}
                disabled={showResult}
                placeholder="Type your answer here..."
                className={`w-full p-4 rounded-2xl border-2 focus:outline-none transition-all ${
                  showResult 
                    ? fillAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-rose-50 border-rose-500 text-rose-700"
                    : "border-zinc-100 focus:border-indigo-500"
                }`}
              />
              {!showResult && (
                <button
                  onClick={() => handleAnswer(fillAnswer)}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all"
                >
                  Submit Answer
                </button>
              )}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-8 pt-8 border-t border-zinc-100"
            >
              <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <AlertCircle className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-zinc-900 mb-1">Explanation</p>
                  <div className="text-sm text-zinc-600 leading-relaxed">
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {currentQuestion.explanation}
                    </Markdown>
                  </div>
                </div>
              </div>
              
              <button
                onClick={nextQuestion}
                className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                {currentIdx + 1 < questions.length ? "Next Question" : "Finish Quiz"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
