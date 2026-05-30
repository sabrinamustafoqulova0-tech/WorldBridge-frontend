"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LockIcon from "@mui/icons-material/Lock";
import CloseIcon from "@mui/icons-material/Close";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl p-8 transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <CloseIcon />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
            <LockIcon className="text-[#3B82F6]" fontSize="large" />
          </div>

          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-2">
            Доступ закрыт
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Чтобы посмотреть полную информацию о программе, включая расходы, список документов, шансы на ВНЖ и официальные ссылки, пожалуйста, войдите или зарегистрируйтесь.
          </p>

          <div className="w-full flex flex-col gap-3">
            <Link
              href="/register"
              className="w-full bg-[#3B82F6] text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/30"
            >
              Зарегистрироваться бесплатно
            </Link>
            <Link
              href="/login"
              className="w-full bg-gray-100 dark:bg-gray-800 text-[#0F172A] dark:text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
