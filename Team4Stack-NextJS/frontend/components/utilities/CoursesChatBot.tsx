'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Message = { id: string; role: 'user' | 'assistant'; text: string; time: string };

const PLACEHOLDER_REPLIES = [
  "I'm your courses assistant. Ask me about course content, enrollment, or schedules.",
  "You can browse courses from the list and apply using the Apply button. Need help with a specific course?",
  "For payment or enrollment queries, you can also contact us on WhatsApp from the contact section.",
  "I'm here to help with course-related questions. What would you like to know?",
];

function getPlaceholderReply(): string {
  return PLACEHOLDER_REPLIES[Math.floor(Math.random() * PLACEHOLDER_REPLIES.length)];
}

function formatTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const CoursesChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi! I'm your courses assistant. How can I help you today?",
      time: formatTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const closePanel = () => {
    setIsOpen(false);
    // Prevent blinking cursor after close: blur so focus doesn't stay on body
    requestAnimationFrame(() => {
      const el = document.activeElement as HTMLElement;
      if (el?.blur) el.blur();
    });
  };

  // Close when clicking outside the chatbox
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      time: formatTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: getPlaceholderReply(),
        time: formatTime(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Backdrop when open - click to close (tabIndex -1 so it doesn't take focus / show cursor) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            role="presentation"
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[55] bg-black/20 dark:bg-black/30 cursor-default"
            onClick={closePanel}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Chatbox - opens in same space as button (bottom-right), button hides when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            key="chat-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[60] w-[min(calc(100vw-2rem),392px)] md:w-[min(calc(100vw-4rem),392px)] flex flex-col overflow-hidden rounded-2xl bg-slate-900/95 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl"
            style={{ maxHeight: 'min(72vh, 440px)' }}
          >
            {/* Header */}
            <div className="relative flex items-center justify-between px-4 md:px-5 py-3 md:py-4 shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-t-2xl" />
              <div className="absolute inset-0 rounded-t-2xl bg-black/10" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-inner">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Courses AI Assistant</p>
                  <p className="text-xs text-white/80">Online · Here to help</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closePanel}
                className="relative rounded-xl bg-red-500 text-white p-2 md:p-2.5 shadow-md focus:outline-none focus:ring-2 focus:ring-white/40 hover:bg-red-500"
                aria-label="Close chat"
              >
                <svg className="h-5 w-5 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 min-h-[200px] chat-panel-scroll">
              <div className="space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`group relative max-w-[88%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug ${
                        m.role === 'user'
                          ? 'rounded-br-md bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-purple-500/25'
                          : 'rounded-bl-md bg-slate-800/90 text-slate-100 shadow-sm border border-white/10'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <span className={`mt-1.5 block text-[11px] ${m.role === 'user' ? 'text-white/70' : 'text-white/60'}`}>
                        {m.time}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input area */}
            <div className="shrink-0 border-t border-white/10 bg-slate-900/80 px-3 md:px-4 py-3 rounded-b-2xl">
              <div className="flex gap-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about courses..."
                  className="flex-1 min-w-0 rounded-xl border border-white/10 bg-slate-800/90 text-slate-100 placeholder:text-slate-400 px-3 md:px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 transition-shadow"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 px-4 py-3 text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-[0.98]"
                  aria-label="Send message"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button - same position as chatbox anchor; hidden when chatbox open. WhatsApp-style: no X, no glow, same animation */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="chat-button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-bounce-slow w-12 h-12 md:w-14 md:h-14 flex items-center justify-center overflow-clip focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Open AI chat"
              title="AI Courses Assistant"
            >
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CoursesChatBot;
