"use client";

import Link from "next/link";
import { useState } from "react";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAuthStore } from "../store/authStore";
import AuthModal from "./AuthModal";

interface Program {
  id: number;
  slug: string;
  title: string;
  category: string;
  level: string;
  short_description: string;
}

export default function ProgramCard({ program }: { program: Program }) {
  const { isAuthenticated } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categoryColors: Record<string, string> = {
    STUDIUM: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    ARBEIT: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    AUSBILDUNG: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    AU_PAIR: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
    INTERNSHIP: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    VOLUNTEERING: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    IMMIGRATION: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };

  const levelLabels: Record<string, string> = {
    BEGINNER: "Новичок",
    INTERMEDIATE: "Средний",
    ADVANCED: "Продвинутый",
  };

  return (
    <>
      <div className="bg-white dark:bg-[#1E293B]/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-white/5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[program.category] || "bg-gray-100 text-gray-800"}`}>
            {program.category}
          </span>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            {levelLabels[program.level] || program.level}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">
          {program.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow">
          {program.short_description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
          <Link
            href={`/programs/${program.slug}`}
            className="group flex items-center justify-between w-full text-sm font-bold text-[#3B82F6] hover:text-blue-700 transition-colors"
          >
            <span>Подробнее о программе</span>
            <ArrowForwardIcon fontSize="small" className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
      
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
