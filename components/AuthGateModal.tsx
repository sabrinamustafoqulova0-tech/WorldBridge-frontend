"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, LogIn, UserPlus, Globe, Lock } from "lucide-react";
import { useScrollLock } from "../utils/useScrollLock";

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The path user was trying to reach — passed through as ?next= query param */
  redirectTo?: string;
}

export default function AuthGateModal({ isOpen, onClose, redirectTo }: AuthGateModalProps) {
  useScrollLock(isOpen);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const nextParam = redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : "";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ touchAction: "none" }}
      />

      {/* Modal Panel */}
      <div data-lenis-prevent className="relative z-10 w-full max-w-sm max-h-[90dvh] flex flex-col bg-[var(--background)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--accent)] rounded-full blur-[60px] opacity-10 pointer-events-none" />

        {/* Header */}
        <div className="shrink-0 relative px-6 pt-6 pb-4 flex items-start justify-between border-b border-[var(--border)]/30">
          <div className="flex items-center gap-3">
            {/* Lock icon badge */}
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-dim)] border border-[var(--accent)]/20 flex items-center justify-center">
              <Lock size={16} className="text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight">Доступ ограничен</h2>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">
                Войдите или создайте аккаунт
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/30 transition-all"
          >
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-6 py-5 space-y-4">
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Для просмотра подробной информации о программе и подачи заявки необходимо авторизоваться на платформе WorldBridge.
          </p>

          {/* Divider */}
          <div className="space-y-2 pt-1">
            {/* Primary: Register */}
            <Link
              href={`/register${nextParam}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs transition-all active:scale-[0.98] shadow-sm"
            >
              <UserPlus size={14} />
              Создать аккаунт — бесплатно
            </Link>

            {/* Secondary: Login */}
            <Link
              href={`/login${nextParam}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-[var(--border)] hover:bg-[var(--card)] text-[var(--foreground)] font-bold text-xs transition-all active:scale-[0.98]"
            >
              <LogIn size={14} />
              Уже есть аккаунт — войти
            </Link>
          </div>

          {/* Footer note */}
          <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
            <Globe size={12} className="text-[var(--muted)] shrink-0" />
            <p className="text-[10px] text-[var(--muted)] leading-snug">
              Более 18,400 человек уже используют WorldBridge для переезда за рубеж.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
