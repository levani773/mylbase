import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Bot, User, Loader2, Maximize2, Minimize2, Terminal } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AuraAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am Aura, your AI Infrastructure Assistant. How can I help you manage your AuraDB ecosystem today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, { role: 'user', content: userMsg }].map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are Aura, the official AI assistant for AuraDB, a high-performance NoSQL cloud database platform. Your voice is professional, technical, yet helpful. You help users with Firestore queries, security rules, data architecture, and general platform management. Keep responses concise and use technical terminology where appropriate. If asked for code, use TypeScript and valid JSON for Firestore structures.",
        }
      });

      const assistantMsg = response.text || "I apologize, but I encountered an issue processing your request.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to AI Engine. Please check your network or API configuration." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-[60] bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-full shadow-2xl shadow-blue-500/30 border border-white/10 group"
      >
        <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed ${isMaximized ? 'inset-6' : 'bottom-20 left-6 w-[400px] h-[600px]'} bg-[#0A0A0C] border border-[#1F1F23] rounded-2xl shadow-2xl z-[70] flex flex-col overflow-hidden shadow-black/80`}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#1F1F23] bg-[#111116] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest">Aura Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                    <span className="text-[9px] text-emerald-500 uppercase font-black">AI Engine Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                      m.role === 'user' ? 'bg-zinc-800 border-zinc-700' : 'bg-blue-600/10 border-blue-500/20'
                    }`}>
                      {m.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#16161A] border border-[#1F1F23] text-zinc-300 rounded-tl-none'
                    }`}>
                      {m.content.split('\n').map((line, li) => (
                        <p key={li} className={li > 0 ? 'mt-2' : ''}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="flex gap-3 max-w-[85%] items-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    </div>
                    <div className="flex gap-1.5 px-3 py-2 bg-[#16161A] border border-[#1F1F23] rounded-2xl">
                       <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                       <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                       <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#1F1F23] bg-[#0A0A0C]">
              <div className="relative flex items-center gap-2 bg-[#111116] border border-[#1F1F23] p-1.5 rounded-xl group focus-within:border-blue-600/50 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about queries, rules, or schemas..."
                  className="flex-1 bg-transparent px-3 py-1.5 text-sm text-zinc-300 outline-none placeholder:text-zinc-600"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-6">
                 <button className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-600 uppercase tracking-widest hover:text-zinc-400">
                    <Terminal className="w-3 h-3" /> Aura CLI
                 </button>
                 <div className="w-px h-2 bg-zinc-800"></div>
                 <button className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-600 uppercase tracking-widest hover:text-zinc-400">
                    Help Docs
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
