"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { useAIConsultantStore } from "../store/aiConsultantStore";
import { Sparkles, MessageSquare, X, Send, RotateCcw, Bot, User } from "lucide-react";
import api from "../lib/api";
import { useScrollLock } from "../utils/useScrollLock";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
}

export default function AIConsultantWidget() {
  const { isAuthenticated } = useAuthStore();
  const { isOpen, chatType, setIsOpen, setChatType } = useAIConsultantStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useScrollLock(isOpen);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    setHistoryLoading(true);
    api.get(`/ai/history?chat_type=${chatType}`)
      .then((res) => {
        const msgs = res.data.messages || [];
        if (msgs.length > 0) {
          setMessages(msgs);
          setSessionId(msgs[0].session_id);
        } else {
          return api.post(`/ai/session?chat_type=${chatType}`).then((r) => {
            setSessionId(r.data.session_id);
            setMessages([{ role: "assistant", content: r.data.message }]);
          });
        }
      })
      .catch(console.error)
      .finally(() => setHistoryLoading(false));
  }, [isOpen, chatType, isAuthenticated]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading || !sessionId) return;
    const userText = inputText;
    setInputText("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);
    try {
      const endpoint = chatType === "consultation" ? "/ai/consultation" : "/ai/chat";
      const res = await api.post(endpoint, { session_id: sessionId, content: userText });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.content }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Ошибка соединения. Попробуйте позже." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Сбросить историю диалога?")) return;
    await api.delete(`/ai/reset?chat_type=${chatType}`).catch(console.error);
    setMessages([]);
    setSessionId(null);
    setHistoryLoading(true);
    api.post(`/ai/session?chat_type=${chatType}`).then((r) => {
      setSessionId(r.data.session_id);
      setMessages([{ role: "assistant", content: r.data.message }]);
    }).finally(() => setHistoryLoading(false));
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* ─── FAB ────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[80] w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95 ${
          isOpen
            ? "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            : "bg-[var(--accent)] text-white hover:bg-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.35)]"
        }`}
        style={{ width: "52px", height: "52px" }}
      >
        {isOpen ? <X size={18} /> : <Sparkles size={18} />}

        {/* Online indicator */}
        {!isOpen && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
        )}
      </button>

      {/* ─── Panel ──────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-end md:justify-end p-0 md:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>

          <div data-lenis-prevent className="w-full md:w-[420px] h-[85dvh] md:h-[580px] flex flex-col bg-[var(--background)] md:rounded-3xl border-t md:border border-[var(--border)] shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center">
                  <Bot size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-bold tracking-tight">WorldBridge AI</p>
                  <p className="text-[10px] text-[var(--accent)] font-semibold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse-dot" />
                    online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={handleReset}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors">
                  <RotateCcw size={13} />
                </button>
                <button onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors">
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Mode tabs */}
            <div className="px-4 py-2.5 border-b border-[var(--border)] shrink-0">
              <div className="grid grid-cols-2 gap-1 bg-[var(--card)] p-1 rounded-xl border border-[var(--border)]">
                {(["consultation", "chat"] as const).map((type) => (
                  <button key={type} onClick={() => setChatType(type)}
                    className={`py-1.5 px-3 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      chatType === type
                        ? "bg-[var(--accent)] text-white shadow-sm"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}>
                    {type === "consultation" ? <Sparkles size={11} /> : <MessageSquare size={11} />}
                    {type === "consultation" ? "Консультация" : "Чат"}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-3 scrollbar-none">
              {historyLoading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`flex gap-2.5 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
                      <div className="w-6 h-6 rounded-full skeleton shrink-0 mt-0.5" />
                      <div className={`skeleton h-12 rounded-2xl ${i % 2 === 0 ? "w-2/3" : "w-1/2"}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => {
                    const isAI = msg.role === "assistant";
                    return (
                      <div key={i} className={`flex items-start gap-2.5 ${isAI ? "" : "flex-row-reverse"}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isAI ? "bg-[var(--accent-dim)] border border-[var(--accent)]/20" : "bg-[var(--border)]"}`}>
                          {isAI ? <Bot size={12} className="text-[var(--accent)]" /> : <User size={12} className="text-[var(--muted)]" />}
                        </div>
                        <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed border ${
                          isAI
                            ? "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-tl-sm"
                            : "bg-[var(--foreground)] text-[var(--background)] border-transparent rounded-tr-sm"
                        }`}>
                          <p className="whitespace-pre-line">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent-dim)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot size={12} className="text-[var(--accent)]" />
                      </div>
                      <div className="bg-[var(--card)] border border-[var(--border)] px-3.5 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse-dot"
                            style={{ animationDelay: `${i * 200}ms` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[var(--border)] shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={chatType === "consultation" ? "Ответьте на вопрос..." : "Задайте вопрос..."}
                  disabled={loading || historyLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all disabled:opacity-50"
                />
                <button type="submit" disabled={!inputText.trim() || loading || historyLoading}
                  className="w-10 h-10 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0">
                  <Send size={15} className="ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
