import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Navigation, Ticket, FileText, Bell, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({ societyName: 'Morya CHS Ltd' });
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "Namaste! I'm your society assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSettings({ societyName: data.societyName || 'Morya CHS Ltd' });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const SYSTEM_PROMPT = `You are the AI Assistant for ${settings.societyName}. Your goal is to help society members navigate this transparency portal and perform quick actions.
Be helpful, professional, and friendly.

Pages available:
- /: Home (${settings.societyName} Overview)
- /notices: Society Notices & Announcements
- /documents: Archive of Bye-laws, Certificates, and Legal Docs
- /rfps: Tenders and RFPs for vendors
- /financials: Audit reports and monthly accounts
- /minutes: Meeting minutes transcripts
- /service-tickets: Raising maintenance or service requests
- /contact: Communication with the committee

Available Actions via tools:
1. navigateTo(path): Redirects the user to a specific page.

If a user asks about a topic, explain what it is and suggest navigating to the relevant page.`;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
            { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [
            {
              functionDeclarations: [
                {
                  name: "navigateTo",
                  description: "Navigate to a specific page on the website.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      path: {
                        type: Type.STRING,
                        description: "The path to navigate to, e.g. /notices, /documents, etc."
                      }
                    },
                    required: ["path"]
                  }
                }
              ]
            }
          ],
          toolConfig: { includeServerSideToolInvocations: true }
        }
      });

      const functionCalls = response.functionCalls;
      let finalContent = response.text || "I'm here to help!";

      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === 'navigateTo') {
            const { path } = call.args as { path: string };
            navigate(path);
            finalContent = `Sure, taking you to ${path.replace('/', '') || 'the home page'}...`;
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: finalContent }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having a bit of trouble connecting. Can you try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Latest Notices', path: '/notices', icon: Bell },
    { label: 'Raise Ticket', path: '/service-tickets', icon: Ticket },
    { label: 'Audit Reports', path: '/financials', icon: FileCheck },
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 transition-all hover:scale-110 active:scale-95"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold">
          AI
        </span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[60] flex h-[500px] w-[380px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-300 ring-1 ring-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-indigo-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{settings.societyName} AI</h3>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[10px] font-medium text-indigo-100">AI Powered • Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-white/10 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-4 p-4 scroll-smooth"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col gap-1 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                      msg.role === 'user'
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-100 text-slate-800 rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Sparkles className="h-3 w-3 animate-spin" />
                  <span className="text-[10px] font-medium uppercase tracking-widest">Assistant is thinking...</span>
                </div>
              )}
            </div>

            {/* Quick Actions Bar */}
            <div className="flex gap-2 p-3 overflow-x-auto border-t border-slate-50 bg-slate-50/50 no-scrollbar">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                >
                  <action.icon className="h-3 w-3" />
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
