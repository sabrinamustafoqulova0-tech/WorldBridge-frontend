"use client";

import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublicIcon from '@mui/icons-material/Public';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from "next-themes";
import api from "../../lib/api";

interface AIRequest {
  age: number;
  education: string;
  english_level: string;
  german_level: string;
  budget: string;
  work_experience: number;
  desired_country: string;
}

interface CountryRecommendation {
  slug: string;
  name: string;
  flag: string;
  match_score: number;
  reason: string;
  top_programs: string[];
}

interface AIResponse {
  recommended_countries: CountryRecommendation[];
  success_chance: number;
  next_steps: string[];
  summary: string;
}

export default function AIConsultantPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState<AIRequest>({
    age: 22,
    education: "bachelor",
    english_level: "b1",
    german_level: "none",
    budget: "medium",
    work_experience: 1,
    desired_country: "any",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AIResponse | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "age" || name === "work_experience" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = { ...formData };
      if (payload.desired_country === "any") {
        delete (payload as any).desired_country;
      }
      
      const res = await api.post("/ai/recommend", payload);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка при получении рекомендаций. Проверьте данные и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

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

      {/* Header */}
      <div className="pt-32 pb-12 px-6 max-w-3xl mx-auto text-center">
        <div className="inline-block p-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 mb-6 shadow-inner">
          <AutoAwesomeIcon style={{ fontSize: 48 }} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          AI Консультант
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Умный алгоритм подберёт лучшие страны и программы для релокации на основе ваших данных.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Form Section */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-white/5 h-fit">
          <h2 className="text-2xl font-bold mb-6 border-b border-gray-100 dark:border-white/10 pb-4">Заполните профиль</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Возраст</label>
                <input 
                  type="number" name="age" value={formData.age} onChange={handleChange} min={16} max={70} required
                  className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Опыт работы (лет)</label>
                <input 
                  type="number" name="work_experience" value={formData.work_experience} onChange={handleChange} min={0} max={50} required
                  className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Образование</label>
              <select 
                name="education" value={formData.education} onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="school">Школа (11 классов)</option>
                <option value="college">Колледж / Техникум</option>
                <option value="bachelor">Бакалавриат (или студент)</option>
                <option value="master">Магистратура</option>
                <option value="phd">Аспирантура (PhD)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Английский</label>
                <select 
                  name="english_level" value={formData.english_level} onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="none">Нет (А0)</option>
                  <option value="a1">A1 (Начальный)</option>
                  <option value="a2">A2 (Базовый)</option>
                  <option value="b1">B1 (Средний)</option>
                  <option value="b2">B2 (Выше среднего)</option>
                  <option value="c1">C1 (Продвинутый)</option>
                  <option value="c2">C2 (Свободный)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Немецкий</label>
                <select 
                  name="german_level" value={formData.german_level} onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="none">Нет (А0)</option>
                  <option value="a1">A1 (Начальный)</option>
                  <option value="a2">A2 (Базовый)</option>
                  <option value="b1">B1 (Средний)</option>
                  <option value="b2">B2 (Выше среднего)</option>
                  <option value="c1">C1 (Продвинутый)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Стартовый бюджет</label>
              <select 
                name="budget" value={formData.budget} onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="low">Низкий (менее 1000€)</option>
                <option value="medium">Средний (1000 - 3000€)</option>
                <option value="high">Высокий (более 3000€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Желаемая страна (опционально)</label>
              <select 
                name="desired_country" value={formData.desired_country} onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="any">Любая страна (Доверьтесь AI)</option>
                <option value="de">🇩🇪 Германия</option>
                <option value="fr">🇫🇷 Франция</option>
                <option value="ch">🇨🇭 Швейцария</option>
                <option value="at">🇦🇹 Австрия</option>
                <option value="ca">🇨🇦 Канада</option>
                <option value="us">🇺🇸 США</option>
                <option value="cn">🇨🇳 Китай</option>
                <option value="tr">🇹🇷 Турция</option>
                {/* Add others if needed */}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-xl text-sm mt-4">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : <><AutoAwesomeIcon /> Анализировать профиль</>}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div>
          {result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              {/* Overall Score */}
              <div className="bg-gradient-to-br from-[#0F172A] to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-[80px] opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
                <h3 className="text-xl font-bold text-white mb-2">Шанс успеха</h3>
                <div className="flex items-end gap-4 mb-4">
                  <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                    {result.success_chance}%
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Рекомендуемые страны</h3>
                <div className="space-y-4">
                  {result.recommended_countries.map((country, idx) => (
                    <Link href={`/countries/${country.slug}`} key={country.slug}>
                      <div className="bg-white dark:bg-[#1E293B]/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-white/5 group cursor-pointer block mb-4 relative overflow-hidden">
                        
                        {/* Score Indicator */}
                        <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-blue-400 to-purple-500"></div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{country.flag}</span>
                            <h4 className="text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {country.name}
                            </h4>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-bold text-sm">
                            {country.match_score}% Совпадение
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {country.reason}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {country.top_programs.map((prog, i) => (
                            <span key={i} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md">
                              {prog}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-white dark:bg-[#1E293B]/70 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-100 dark:border-white/10 pb-3">
                  Ваши следующие шаги
                </h3>
                <ul className="space-y-3">
                  {result.next_steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <CheckCircleIcon fontSize="small" className="text-green-500 mt-0.5 shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl">
              <AutoAwesomeIcon style={{ fontSize: 64 }} className="text-gray-300 dark:text-slate-700 mb-4" />
              <h3 className="text-xl font-bold text-gray-400 dark:text-slate-500 mb-2">Ожидание данных</h3>
              <p className="text-gray-400 dark:text-slate-600 text-sm">
                Заполните форму слева и нажмите "Анализировать профиль", чтобы получить персональные рекомендации.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
