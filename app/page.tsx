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
import { useLangStore } from "../store/langStore";
import { translations } from "../locales/translations";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { lang, setLang } = useLangStore();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const text = translations[lang]?.landing || translations.ru.landing;
  const navText = translations[lang]?.nav || translations.ru.nav;

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
            <Link href="/home" className="hover:text-[#3B82F6] transition-colors">{navText.home}</Link>
            <Link href="/countries" className="hover:text-[#3B82F6] transition-colors">{navText.destinations}</Link>
          </nav>

          <select
            className="bg-transparent border-none text-sm font-medium text-[#0F172A] dark:text-white outline-none cursor-pointer hover:text-[#3B82F6] transition-colors"
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
          >
            <option value="ru" className="text-black">Русский</option>
            <option value="en" className="text-black">English</option>
            <option value="tg" className="text-black">Тоҷикӣ</option>
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
                  {navText.login}
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 rounded-lg font-medium bg-[#3B82F6] text-white hover:bg-blue-600 transition shadow-md shadow-blue-500/20"
                >
                  {navText.signup}
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
