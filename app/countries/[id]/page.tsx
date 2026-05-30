"use client";

import { useAuthStore } from "../../../store/authStore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTheme } from "next-themes";
import api from "../../../lib/api";
import ProgramCard from "../../../components/ProgramCard";
import { useLangStore } from "../../../store/langStore";
import { translations } from "../../../locales/translations";
import { getLocalizedField } from "../../../utils/langHelper";

interface Country {
  id: number;
  slug: string;
  name_ru: string;
  name_en: string;
  flag_emoji: string;
  description_ru: string;
}

interface Program {
  id: number;
  slug: string;
  title: string;
  category: string;
  level: string;
  short_description: string;
}

interface FAQ {
  id: number;
  question: string;
  answer?: string; // Optional because unauthenticated users don't get the answer
}

export default function CountryPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const countryId = params.id;

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { lang } = useLangStore();
  const text = translations[lang]?.countryDetail || translations.ru.countryDetail;
  const navText = translations[lang]?.nav || translations.ru.nav;

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [country, setCountry] = useState<Country | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only fetch once auth status is known (authLoading is false)
    if (authLoading) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [countryRes, programsRes, faqRes] = await Promise.all([
          api.get(`/countries/${countryId}`),
          api.get(`/countries/${countryId}/programs`),
          api.get(`/countries/${countryId}/faq`),
        ]);
        setCountry(countryRes.data);
        setPrograms(programsRes.data.items);
        setFaqs(faqRes.data);
      } catch (error) {
        console.error("Error fetching country data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [countryId, authLoading, isAuthenticated]); // Refetch if auth changes so FAQs update

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 dark:border-white/20 border-t-[#3B82F6]"></div>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6 bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white">
        <div>
          <h1 className="text-4xl font-bold mb-4">{text.notFound || "Страна не найдена"}</h1>
          <Link href="/home" className="text-[#3B82F6] hover:underline">{navText.home}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white font-sans transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-[#0F172A]/60 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.05] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/home" className="flex items-center gap-2 text-gray-500 hover:text-[#3B82F6] transition-colors font-medium">
              <ArrowBackIcon fontSize="small" /> {navText.back}
            </Link>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>
            <Link href="/" className="hidden sm:flex items-center gap-3 group">
              <div className="bg-[#0F172A] dark:bg-white/10 p-1 rounded-md text-white border border-transparent dark:border-white/10 group-hover:bg-[#3B82F6] transition-all shadow-sm">
                <PublicIcon fontSize="small" />
              </div>
              <span className="text-lg font-bold text-[#0F172A] dark:text-white">WorldBridge</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {mounted && (
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300"
              >
                {theme === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </button>
            )}
            {!isAuthenticated && (
              <Link href="/register" className="bg-[#3B82F6] text-white px-4 py-1.5 rounded-full hover:bg-blue-600 transition-colors shadow-md text-sm font-medium">
                {navText.signup}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-32 pb-16 px-6 max-w-4xl mx-auto text-center">
        <div className="inline-block p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm mb-6 text-6xl">
          {country.flag_emoji}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          <span className="text-[#3B82F6]">{getLocalizedField(country, 'name', lang)}</span>
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          {getLocalizedField(country, 'description', lang)}
        </p>
      </div>

      {/* Programs Section */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <h2 className="text-2xl font-bold mb-8">{text.programs}</h2>
        {programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map(program => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">{text.noPrograms}</p>
        )}
      </section>

      {/* FAQ Section */}
      <main className="max-w-4xl mx-auto px-6 pb-24 space-y-6">
        <h2 className="text-2xl font-bold mb-8">{text.faqTitle}</h2>
        
        {faqs.map((item, index) => (
          <div key={index} className="bg-white dark:bg-[#1E293B]/50 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-white/5 transition-colors">
            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-4 leading-snug">
              {item.question}
            </h3>
            
            <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed text-sm sm:text-base">
              {item.answer}
            </div>
          </div>
        ))}

        {/* AI Consultant Banner */}
        <div className="bg-gradient-to-br from-[#0F172A] to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/10 text-center relative overflow-hidden mt-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6] rounded-full blur-[100px] opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {text.aiTitle}
            </h3>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              {text.aiSubtitle}
            </p>
            
            {isAuthenticated ? (
              <Link href="/ai-consultant" className="inline-flex items-center justify-center gap-2 mx-auto bg-white text-[#0F172A] font-bold py-4 px-8 rounded-full hover:scale-105 hover:bg-gray-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <AutoAwesomeIcon className="text-[#3B82F6]" />
                {text.aiBtnAuth}
              </Link>
            ) : (
              <Link href="/register" className="inline-flex items-center justify-center gap-2 mx-auto bg-[#3B82F6] text-white font-bold py-4 px-8 rounded-full hover:scale-105 hover:bg-blue-600 transition-all shadow-lg">
                <LockIcon fontSize="small" />
                {text.aiBtnGuest}
              </Link>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
