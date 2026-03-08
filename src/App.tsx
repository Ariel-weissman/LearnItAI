import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, BookOpen, Sparkles, BrainCircuit, CreditCard, Loader2, FileCheck, RefreshCw } from "lucide-react";
import UploadZone from "./components/UploadZone";
import StudyGuide from "./components/StudyGuide";
import ChatSidebar from "./components/ChatSidebar";
import Quiz from "./components/Quiz";
import Flashcards from "./components/Flashcards";
import WorksheetMode from "./components/WorksheetMode";
import { processNotes, generateQuiz, generateFlashcards, extractWorksheetProblems, generateWorksheet } from "./services/gemini";

type Tab = "guide" | "quiz" | "flashcards" | "worksheet";

export default function App() {
  const [notes, setNotes] = useState<string | null>(null);
  const [processedContent, setProcessedContent] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[] | null>(null);
  const [quizInstructions, setQuizInstructions] = useState("");
  const [flashcards, setFlashcards] = useState<any[] | null>(null);
  const [worksheetProblems, setWorksheetProblems] = useState<any[] | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState(false);
  const [isExtractingWorksheet, setIsExtractingWorksheet] = useState(false);
  
  const [activeTab, setActiveTab] = useState<Tab>("guide");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>();
  const [selectedText, setSelectedText] = useState<string | null>(null);

  const handleUpload = async (text: string) => {
    setNotes(text);
    setIsProcessing(true);
    setActiveTab("guide");
    try {
      const result = await processNotes(text);
      if (result) {
        setProcessedContent(result);
      }
    } catch (error) {
      console.error("Processing error:", error);
      alert("Failed to process notes. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!notes) return;
    setIsGeneratingQuiz(true);
    try {
      const questions = await generateQuiz(notes, quizInstructions);
      setQuizQuestions(questions);
      setActiveTab("quiz");
    } catch (error) {
      console.error("Quiz generation error:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleGenerateWorksheet = async () => {
    if (!notes) return;
    setIsGeneratingWorksheet(true);
    try {
      const problems = await generateWorksheet(notes);
      setWorksheetProblems(problems);
      setActiveTab("worksheet");
    } catch (error) {
      console.error("Worksheet generation error:", error);
      alert("Failed to generate worksheet. Please try again.");
    } finally {
      setIsGeneratingWorksheet(false);
    }
  };

  const handleWorksheetUpload = async (text: string) => {
    setIsExtractingWorksheet(true);
    try {
      const problems = await extractWorksheetProblems(text);
      setWorksheetProblems(problems);
      setActiveTab("worksheet");
    } catch (error) {
      console.error("Worksheet extraction error:", error);
      alert("Failed to extract problems from worksheet.");
    } finally {
      setIsExtractingWorksheet(false);
    }
  };

  const handleTabChange = async (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "quiz" && !quizQuestions && notes && !isGeneratingQuiz) {
      // We'll show a setup screen instead of auto-generating
    } else if (tab === "flashcards" && !flashcards && notes) {
      setIsGeneratingFlashcards(true);
      try {
        const cards = await generateFlashcards(notes);
        setFlashcards(cards);
      } catch (error) {
        console.error("Flashcard generation error:", error);
      } finally {
        setIsGeneratingFlashcards(false);
      }
    }
  };

  const handleTextSelect = (text: string) => {
    setSelectedText(text);
  };

  const handleExplain = async () => {
    if (!selectedText) return;
    setIsChatOpen(true);
    setChatInitialMessage(`Can you explain this part of my notes: "${selectedText}"?`);
    setSelectedText(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setProcessedContent(null); setNotes(null); setQuizQuestions(null); setFlashcards(null); setWorksheetProblems(null); }}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Learn It AI</span>
        </div>
        
        {processedContent && (
          <nav className="hidden md:flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <button
              onClick={() => handleTabChange("guide")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "guide" ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Guide
            </button>
            <button
              onClick={() => handleTabChange("quiz")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "quiz" ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              Quiz
            </button>
            <button
              onClick={() => handleTabChange("flashcards")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "flashcards" ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Flashcards
            </button>
            <button
              onClick={() => handleTabChange("worksheet")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "worksheet" ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              Worksheet
            </button>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {processedContent && (
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2 rounded-full transition-all ${
                isChatOpen ? "bg-indigo-100 text-indigo-600" : "hover:bg-zinc-100 text-zinc-500"
              }`}
            >
              <MessageSquare className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>

      <main className="pt-16 min-h-screen">
        <AnimatePresence mode="wait">
          {!processedContent ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <UploadZone onUpload={handleUpload} isLoading={isProcessing} />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex h-[calc(100vh-64px)] overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto bg-white">
                {activeTab === "guide" && (
                  <StudyGuide 
                    content={processedContent} 
                    onTextSelect={handleTextSelect} 
                  />
                )}
                
                {activeTab === "quiz" && (
                  <div className="py-12">
                    {isGeneratingQuiz ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                        <p className="text-zinc-500 font-medium">Generating your personalized quiz...</p>
                      </div>
                    ) : quizQuestions ? (
                      <div className="relative">
                        <div className="max-w-2xl mx-auto px-6 mb-4 flex justify-end">
                          <button
                            onClick={() => setQuizQuestions(null)}
                            className="text-sm font-medium text-zinc-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Regenerate with new focus
                          </button>
                        </div>
                        <Quiz questions={quizQuestions} onRestart={() => setQuizQuestions(null)} />
                      </div>
                    ) : (
                      <div className="max-w-xl mx-auto px-6">
                        <div className="text-center mb-10">
                          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BrainCircuit className="w-8 h-8" />
                          </div>
                          <h2 className="text-3xl font-bold text-zinc-900 mb-2">Quiz Setup</h2>
                          <p className="text-zinc-500">
                            Tell us what to focus on or how to structure your quiz.
                          </p>
                        </div>
                        
                        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                          <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">
                            Custom Focus (Optional)
                          </label>
                          <textarea
                            value={quizInstructions}
                            onChange={(e) => setQuizInstructions(e.target.value)}
                            placeholder="e.g., Focus on the historical dates, make it mostly multiple choice, or emphasize the scientific formulas..."
                            className="w-full h-32 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-zinc-700 resize-none mb-6"
                          />
                          
                          <button
                            onClick={handleGenerateQuiz}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                          >
                            <Sparkles className="w-5 h-5" />
                            Generate Quiz
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "flashcards" && (
                  <div className="py-12">
                    {isGeneratingFlashcards ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                        <p className="text-zinc-500 font-medium">Creating your flashcards...</p>
                      </div>
                    ) : flashcards ? (
                      <Flashcards cards={flashcards} />
                    ) : null}
                  </div>
                )}

                {activeTab === "worksheet" && (
                  <div className="py-12">
                    {isGeneratingWorksheet ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                        <p className="text-zinc-500 font-medium">Generating your custom worksheet...</p>
                      </div>
                    ) : !worksheetProblems ? (
                      <div className="max-w-xl mx-auto px-6">
                        <div className="text-center mb-10">
                          <h2 className="text-3xl font-bold text-zinc-900 mb-4">Worksheet Mode</h2>
                          <p className="text-zinc-500">
                            Practice your knowledge with a custom worksheet or upload an existing one.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                              <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Generate from Notes</h3>
                            <p className="text-zinc-500 text-sm mb-6">
                              Create a brand new worksheet based on your study materials.
                            </p>
                            <button
                              onClick={handleGenerateWorksheet}
                              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                            >
                              Create Worksheet
                            </button>
                          </div>

                          <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                              <div className="w-full border-t border-zinc-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-zinc-50 text-zinc-400 font-medium uppercase tracking-widest">or</span>
                            </div>
                          </div>

                          <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-zinc-100 text-zinc-600 rounded-xl flex items-center justify-center mb-4">
                              <FileCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Upload Worksheet</h3>
                            <p className="text-zinc-500 text-sm mb-6">
                              Upload an existing worksheet to solve it with AI guidance.
                            </p>
                            <UploadZone 
                              onUpload={handleWorksheetUpload} 
                              isLoading={isExtractingWorksheet} 
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <WorksheetMode 
                        problems={worksheetProblems} 
                        onRestart={() => setWorksheetProblems(null)} 
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Selection Tooltip/Action */}
              <AnimatePresence>
                {selectedText && activeTab === "guide" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50"
                  >
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      "{selectedText}"
                    </span>
                    <div className="h-4 w-[1px] bg-zinc-700"></div>
                    <button
                      onClick={handleExplain}
                      className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Explain
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Sidebar */}
              <AnimatePresence>
                {isChatOpen && (
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="h-full z-40"
                  >
                    <ChatSidebar 
                      onClose={() => setIsChatOpen(false)} 
                      initialMessage={chatInitialMessage}
                      context={notes || undefined}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
