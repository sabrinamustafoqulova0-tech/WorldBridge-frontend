"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Lock, LogIn, UserPlus } from "lucide-react";
import { useScrollLock } from "../utils/useScrollLock";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} style={{ touchAction: "none" }} />

      <div data-lenis-prevent className="relative z-10 w-full max-w-sm max-h-[90dvh] flex flex-col bg-[var(--background)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--accent)] rounded-full blur-[60px] opacity-10 pointer-events-none" />

        {/* Header */}
        <div className="shrink-0 relative px-6 pt-6 pb-4 flex items-start justify-between border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-dim)] border border-[var(--accent)]/20 flex items-center justify-center">
              <Lock size={16} className="text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight">Доступ закрыт</h2>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">Войдите или создайте аккаунт</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/30 transition-all"
          >
            <X size={13} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-6 py-5 space-y-4">
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Чтобы посмотреть полную информацию о программе, включая расходы, список документов, шансы на ВНЖ и официальные ссылки — войдите или зарегистрируйтесь.
          </p>

          <div className="space-y-2">
            <Link
              href="/register"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs transition-all active:scale-[0.98] shadow-sm"
            >
              <UserPlus size={14} />
              Зарегистрироваться бесплатно
            </Link>
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-[var(--border)] hover:bg-[var(--card)] text-[var(--foreground)] font-bold text-xs transition-all active:scale-[0.98]"
            >
              <LogIn size={14} />
              Уже есть аккаунт — войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
