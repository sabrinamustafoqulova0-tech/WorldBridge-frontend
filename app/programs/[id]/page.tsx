"use client";

import { useAuthStore } from "../../../store/authStore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WarningIcon from '@mui/icons-material/Warning';
import { useTheme } from "next-themes";
import api from "../../../lib/api";

interface ProgramDetail {
  id: number;
  slug: string;
  title: string;
  category: string;
  level: string;
  description: string;
  full_description?: string;
  min_age: number;
  max_age: number | null;
  duration_months: number | null;
  language_requirement: string;
  salary_range: string;
  cost?: string;
  documents?: string;
  deadline?: string;
  official_url?: string;
  residence_permit?: boolean;
  pros?: string;
  cons?: string;
  career_opportunities?: string;
}

export default function ProgramPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const programId = params.id;
  const router = useRouter();

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login"); // Redirect if not authenticated since this is a protected route in theory, though backend might handle it differently.
      return;
    }

    const fetchProgram = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/programs/${programId}`);
        setProgram(res.data);
      } catch (error) {
        console.error("Error fetching program data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId, authLoading, isAuthenticated, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 dark:border-white/20 border-t-[#3B82F6]"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6 bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white">
        <div>
          <h1 className="text-4xl font-bold mb-4">Программа не найдена</h1>
          <button onClick={() => router.back()} className="text-[#3B82F6] hover:underline">Вернуться назад</button>
        </div>
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    STUDIUM: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    ARBEIT: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    AUSBILDUNG: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    AU_PAIR: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
    INTERNSHIP: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    VOLUNTEERING: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    IMMIGRATION: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white font-sans transition-colors duration-300 pb-20">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-[#0F172A]/60 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.05] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-[#3B82F6] transition-colors font-medium">
              <ArrowBackIcon fontSize="small" /> Назад
            </button>
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-white/5 pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${categoryColors[program.category] || "bg-gray-100 text-gray-800"}`}>
              {program.category}
            </span>
            <span className="text-sm font-medium text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-3 py-1.5 rounded-md">
              Уровень: {program.level}
            </span>
            {program.residence_permit && (
              <span className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1.5 rounded-md flex items-center gap-1">
                <CheckCircleIcon fontSize="small" /> Даёт ВНЖ
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            {program.title}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            {program.description}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-10">
          
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <InfoIcon className="text-[#3B82F6]" /> Описание программы
            </h2>
            <div className="bg-white dark:bg-[#1E293B]/50 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-white/5">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg">
                {program.full_description || program.description}
              </p>
            </div>
          </section>

          {(program.pros || program.cons) && (
            <section className="grid sm:grid-cols-2 gap-6">
              {program.pros && (
                <div>
                  <h3 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400">Преимущества</h3>
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl p-6 border border-green-100 dark:border-green-900/20 h-full">
                    <ul className="space-y-3">
                      {program.pros.split('\n').map((pro, i) => (
                        <li key={i} className="flex items-start gap-3 text-green-800 dark:text-green-300">
                          <CheckCircleIcon fontSize="small" className="mt-0.5 shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {program.cons && (
                <div>
                  <h3 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Сложности</h3>
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/20 h-full">
                    <ul className="space-y-3">
                      {program.cons.split('\n').map((con, i) => (
                        <li key={i} className="flex items-start gap-3 text-red-800 dark:text-red-300">
                          <WarningIcon fontSize="small" className="mt-0.5 shrink-0" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </section>
          )}

          {program.career_opportunities && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Карьерные перспективы</h2>
              <div className="bg-blue-50 dark:bg-[#1E293B] rounded-2xl p-6 sm:p-8 border border-blue-100 dark:border-white/5">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {program.career_opportunities}
                </p>
              </div>
            </section>
          )}

          {program.documents && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Необходимые документы</h2>
              <div className="bg-white dark:bg-[#1E293B]/50 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-white/5">
                <ul className="space-y-3 list-disc pl-5">
                  {program.documents.split(', ').map((doc, i) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300 pl-1">
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E293B]/80 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-white/5 sticky top-24">
            <h3 className="text-lg font-bold mb-6 border-b border-gray-100 dark:border-white/10 pb-4">Краткая сводка</h3>
            
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400 mb-1">Требование к языку</dt>
                <dd className="font-semibold">{program.language_requirement}</dd>
              </div>
              
              <div>
                <dt className="text-gray-500 dark:text-gray-400 mb-1">Зарплата / Стипендия</dt>
                <dd className="font-semibold text-green-600 dark:text-green-400">{program.salary_range}</dd>
              </div>
              
              {program.cost && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400 mb-1">Расходы (оценка)</dt>
                  <dd className="font-semibold">{program.cost}</dd>
                </div>
              )}
              
              <div>
                <dt className="text-gray-500 dark:text-gray-400 mb-1">Возраст</dt>
                <dd className="font-semibold">
                  {program.min_age} - {program.max_age ? `${program.max_age} лет` : "без ограничений"}
                </dd>
              </div>

              {program.duration_months && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400 mb-1">Длительность</dt>
                  <dd className="font-semibold">{program.duration_months} мес.</dd>
                </div>
              )}

              {program.deadline && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400 mb-1">Дедлайны / Сроки</dt>
                  <dd className="font-semibold">{program.deadline}</dd>
                </div>
              )}
            </dl>

            {program.official_url && (
              <a 
                href={program.official_url} 
                target="_blank" 
                rel="noreferrer"
                className="mt-8 flex items-center justify-center gap-2 w-full bg-[#3B82F6] text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-all shadow-md"
              >
                Официальный сайт <OpenInNewIcon fontSize="small" />
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
