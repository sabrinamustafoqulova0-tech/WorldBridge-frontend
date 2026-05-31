"use client";

import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import api from "../../lib/api";
import {
  ArrowLeft,
  Globe,
  Sparkles,
  Moon,
  Sun,
  CheckCircle2,
  ArrowRight,
  Loader2,
  BrainCircuit,
  Trophy,
  MapPin,
} from "lucide-react";

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

const inputCls =
  "w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all";

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

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "age" || name === "work_experience" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const payload = { ...formData };
      if (payload.desired_country === "any") delete (payload as any).desired_country;
      const res = await api.post("/ai/recommend", payload);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка при получении рекомендаций. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col pb-24">

      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-5 md:px-8 glass border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft size={14} /> Назад
          </button>
          <div className="h-4 w-px bg-[var(--border)] hidden sm:block" />
          <Link href="/" className="hidden sm:flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center transition-transform group-hover:scale-110">
              <Globe size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-[14px] tracking-tight">WorldBridge</span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)]"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}
        </div>
      </nav>

      {/* ─── Hero Header — LEFT-ALIGNED ────────────────────────── */}
      <div className="pt-24 pb-8 px-5 md:px-8">
        <div className="max-w-6xl mx-auto space-y-3">
          <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] flex items-center gap-1.5">
            <BrainCircuit size={12} />
            Персональный AI-анализ
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight">
            AI Консультант
          </h1>
          <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed max-w-[55ch]">
            Умный алгоритм подберёт лучшие страны и программы для релокации на основе ваших данных.
          </p>
        </div>
      </div>

      {/* ─── Main Grid ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 md:px-8 w-full mt-4 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 items-start flex-1">

        {/* ── Form Panel ───────────────────────────────────────── */}
        <div className="glass border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm h-fit">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-[var(--border)]">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-dim)] border border-[var(--accent)]/20 flex items-center justify-center">
              <Sparkles size={14} className="text-[var(--accent)]" />
            </div>
            <h2 className="font-bold text-sm tracking-tight">Заполните профиль</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Age & Experience */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--muted)]">Возраст</label>
                <input
                  type="number" name="age" value={formData.age}
                  onChange={handleChange} min={16} max={70} required
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--muted)]">Опыт работы (лет)</label>
                <input
                  type="number" name="work_experience" value={formData.work_experience}
                  onChange={handleChange} min={0} max={50} required
                  className={inputCls}
                />
              </div>
            </div>

            {/* Education */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--muted)]">Образование</label>
              <select name="education" value={formData.education} onChange={handleChange} className={inputCls}>
                <option value="school">Школа (11 классов)</option>
                <option value="college">Колледж / Техникум</option>
                <option value="bachelor">Бакалавриат (или студент)</option>
                <option value="master">Магистратура</option>
                <option value="phd">Аспирантура (PhD)</option>
              </select>
            </div>

            {/* Languages */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--muted)]">Английский</label>
                <select name="english_level" value={formData.english_level} onChange={handleChange} className={inputCls}>
                  <option value="none">Нет (А0)</option>
                  <option value="a1">A1 — Начальный</option>
                  <option value="a2">A2 — Базовый</option>
                  <option value="b1">B1 — Средний</option>
                  <option value="b2">B2 — Выше среднего</option>
                  <option value="c1">C1 — Продвинутый</option>
                  <option value="c2">C2 — Свободный</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--muted)]">Немецкий</label>
                <select name="german_level" value={formData.german_level} onChange={handleChange} className={inputCls}>
                  <option value="none">Нет (А0)</option>
                  <option value="a1">A1 — Начальный</option>
                  <option value="a2">A2 — Базовый</option>
                  <option value="b1">B1 — Средний</option>
                  <option value="b2">B2 — Выше среднего</option>
                  <option value="c1">C1 — Продвинутый</option>
                </select>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--muted)]">Стартовый бюджет</label>
              <select name="budget" value={formData.budget} onChange={handleChange} className={inputCls}>
                <option value="low">Низкий (менее 1 000€)</option>
                <option value="medium">Средний (1 000 – 3 000€)</option>
                <option value="high">Высокий (более 3 000€)</option>
              </select>
            </div>

            {/* Desired Country */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--muted)]">Желаемая страна (опционально)</label>
              <select name="desired_country" value={formData.desired_country} onChange={handleChange} className={inputCls}>
                <option value="any">Любая страна — доверьтесь AI</option>
                <option value="de">🇩🇪 Германия</option>
                <option value="fr">🇫🇷 Франция</option>
                <option value="ch">🇨🇭 Швейцария</option>
                <option value="at">🇦🇹 Австрия</option>
                <option value="ca">🇨🇦 Канада</option>
                <option value="us">🇺🇸 США</option>
                <option value="cn">🇨🇳 Китай</option>
                <option value="tr">🇹🇷 Турция</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl border border-rose-500/20 bg-rose-500/8 text-rose-500 text-xs">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full mt-2 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[var(--accent)]/20"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Анализируем...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Анализировать профиль
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Results Panel ─────────────────────────────────────── */}
        <div>
          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Success Score Card */}
              <div className="relative overflow-hidden glass border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--accent)] rounded-full blur-[60px] opacity-10 pointer-events-none" />
                <div className="relative space-y-3">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
                    <Trophy size={12} />
                    Шанс успешной релокации
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-[var(--accent)]">
                      {result.success_chance}%
                    </span>
                    <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] rounded-full transition-all duration-1000"
                        style={{ width: `${result.success_chance}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{result.summary}</p>
                </div>
              </div>

              {/* Country Recommendations */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-1.5">
                  <MapPin size={11} /> Рекомендуемые направления
                </h3>

                {result.recommended_countries.map((country, idx) => (
                  <Link href={`/countries/${country.slug}`} key={country.slug}>
                    <div className="group glass border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--accent)]/30 hover:bg-[var(--card)] transition-all duration-200 relative overflow-hidden cursor-pointer">
                      {/* Rank stripe */}
                      <div
                        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
                        style={{ background: idx === 0 ? "var(--accent)" : "var(--border)" }}
                      />

                      <div className="pl-3 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{country.flag}</span>
                            <div>
                              <h4 className="font-bold text-sm group-hover:text-[var(--accent)] transition-colors">
                                {country.name}
                              </h4>
                              <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-dim)] px-2 py-0.5 rounded-full">
                                {country.match_score}% совпадение
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
                            {country.reason}
                          </p>

                          {country.top_programs.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {country.top_programs.map((prog, i) => (
                                <span key={i} className="text-[10px] font-semibold bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] px-2 py-0.5 rounded-md">
                                  {prog}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-dim)] transition-all mt-0.5">
                          <ArrowRight size={13} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Next Steps */}
              <div className="glass border border-[var(--border)] rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  Ваши следующие шаги
                </h3>
                <ul className="space-y-3">
                  {result.next_steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--muted)] leading-relaxed">
                      <CheckCircle2 size={13} className="text-[var(--accent)] shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            /* Empty state */
            <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-[var(--border)] rounded-3xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-dim)] border border-[var(--accent)]/20 flex items-center justify-center">
                <BrainCircuit size={28} className="text-[var(--accent)] opacity-60" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-sm">Ожидание данных</h3>
                <p className="text-xs text-[var(--muted)] max-w-[32ch] leading-relaxed">
                  Заполните форму и нажмите «Анализировать профиль», чтобы получить персональные рекомендации.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
