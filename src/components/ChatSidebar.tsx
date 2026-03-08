import React, { useState, useRef, useEffect } from "react";
import { Send, X, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { chatWithAssistant } from "../services/gemini";

interface Message {
  role: "user" | "model";
  text: string;
}

interface ChatSidebarProps {
  onClose?: () => void;
  initialMessage?: string;
  context?: string;
}

export default function ChatSidebar({ onClose, initialMessage, context }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessage) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));
      
      const response = await chatWithAssistant(text, history);
      if (response) {
        setMessages((prev) => [...prev, { role: "model", text: response }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "model", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-zinc-200 shadow-xl w-80 md:w-96">
      <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-zinc-800">Study Assistant</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-10 px-4">
            <Bot className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm italic">
              Highlight text to explain it, or ask me anything about your notes!
            </p>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-zinc-100 text-zinc-800 rounded-tl-none border border-zinc-200"
                }`}
              >
                <div className="markdown-body">
                  <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {msg.text}
                  </Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-zinc-100 p-3 rounded-2xl rounded-tl-none border border-zinc-200">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            </div>
          </motion.div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-4 border-t border-zinc-100 bg-zinc-50"
      >
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm shadow-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
