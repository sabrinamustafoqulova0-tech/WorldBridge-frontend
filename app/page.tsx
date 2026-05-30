"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "next-themes";
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PublicIcon from '@mui/icons-material/Public';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExploreIcon from '@mui/icons-material/Explore';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuthStore();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<"ru" | "en">("ru");

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = {
    ru: {
      title: "Твой мост в новую жизнь",
      subtitle: "WorldBridge — это умная платформа для планирования переезда, учебы и работы за рубежом. Мы помогаем найти лучшие программы в Европе, Азии и Северной Америке.",
      programs: "Популярные направления",
      login: "Войти",
      register: "Начать бесплатно",
      home: "Каталог программ",
      program1: "Образование за рубежом",
      desc1: "Поступление в лучшие университеты мира. Гранты, стипендии и бесплатное обучение.",
      program2: "Работа и стажировки",
      desc2: "От Ausbildung до Blue Card. Актуальные вакансии и стажировки с релокацией.",
      program3: "Языковые курсы и Au-Pair",
      desc3: "Учите языки с полным погружением и путешествуйте по миру по обмену.",
      detailedInfo: "Подробная (поглубже) информация о странах и программах"
    },
    en: {
      title: "Your bridge to a new life",
      subtitle: "WorldBridge is a smart platform for planning your relocation, studies, and work abroad. We help you find the best programs in Europe, Asia, and North America.",
      programs: "Popular Destinations",
      login: "Log In",
      register: "Start for Free",
      home: "Program Catalog",
      program1: "Study Abroad",
      desc1: "Admission to top global universities. Grants, scholarships, and free education.",
      program2: "Work and Internships",
      desc2: "From Ausbildung to Blue Card. Latest vacancies and internships with relocation.",
      program3: "Language Courses & Au-Pair",
      desc3: "Learn languages with full immersion and travel the world on exchange programs.",
      detailedInfo: "Detailed (deeper) information about countries and programs"
    }
  };

  const text = t[lang];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3B82F6] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      {/* HEADER */}
      <header className="w-full px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-[#3B82F6] p-2 rounded-xl text-white group-hover:scale-105 transition-transform">
            <PublicIcon />
          </div>
          <span className="font-extrabold text-2xl text-[#0F172A] dark:text-white tracking-tight">WorldBridge</span>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 font-medium text-sm text-[#0F172A] dark:text-gray-300">
            <Link href="/home" className="hover:text-[#3B82F6] transition-colors">{text.home}</Link>
            <Link href="/countries" className="hover:text-[#3B82F6] transition-colors">Страны</Link>
          </nav>

          <select
            className="bg-transparent border-none text-sm font-medium text-[#0F172A] dark:text-white outline-none cursor-pointer hover:text-[#3B82F6] transition-colors"
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
          >
            <option value="ru" className="text-black">RU</option>
            <option value="en" className="text-black">EN</option>
          </select>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-[#0F172A] dark:text-gray-200"
              title="Toggle Dark Mode"
            >
              {theme === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </button>
          )}

          <div className="hidden md:flex gap-3">
            {isAuthenticated ? (
              <Link
                href="/home"
                className="px-5 py-2 rounded-lg font-medium bg-[#0F172A] text-white hover:bg-gray-800 dark:bg-white dark:text-[#0F172A] dark:hover:bg-gray-100 transition shadow-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-lg font-medium text-[#0F172A] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {text.login}
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 rounded-lg font-medium bg-[#3B82F6] text-white hover:bg-blue-600 transition shadow-md shadow-blue-500/20"
                >
                  {text.register}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#3B82F6] rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 max-w-4xl mx-auto mt-16 mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#3B82F6] text-sm font-semibold mb-6 border border-blue-100 dark:border-blue-800/50">
            <ExploreIcon fontSize="small" />
            <span>AI-Powered Relocation Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-[#0F172A] dark:text-white tracking-tight leading-tight">
            {text.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {text.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/home"
              className="px-8 py-4 rounded-xl font-bold bg-[#3B82F6] text-white hover:bg-blue-600 hover:-translate-y-1 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              {text.home} <ArrowForwardIcon fontSize="small" />
            </Link>
            {!isAuthenticated && (
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl font-bold bg-white text-[#0F172A] border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-1 transition-all shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
              >
                {text.register}
              </Link>
            )}
          </div>
        </div>

        {/* DETAILED INFO SECTION HEADER */}
        <div className="w-full max-w-6xl text-left mb-12 relative z-10 px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] dark:text-white mb-4">
              {text.programs}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg border-l-4 border-[#3B82F6] pl-4">
              {text.detailedInfo}
            </p>
        </div>

        {/* PROGRAMS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4 mb-24 relative z-10">
          <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all group text-left">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-[#3B82F6] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <SchoolIcon fontSize="large" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[#0F172A] dark:text-white">{text.program1}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {text.desc1}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all group text-left">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-[#3B82F6] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <WorkIcon fontSize="large" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[#0F172A] dark:text-white">{text.program2}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {text.desc2}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all group text-left">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-[#3B82F6] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FlightTakeoffIcon fontSize="large" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[#0F172A] dark:text-white">{text.program3}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {text.desc3}
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-8 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-[#0F172A] border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <PublicIcon fontSize="small" className="text-[#3B82F6]" />
            <span className="font-bold text-[#0F172A] dark:text-white">WorldBridge</span>
          </div>
          <p>© {new Date().getFullYear()} WorldBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
