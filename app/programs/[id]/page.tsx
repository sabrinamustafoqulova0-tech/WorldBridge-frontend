"use client";

import { useAuthStore } from "../../../store/authStore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { useTheme } from "next-themes";
import api from "../../../lib/api";
import { 
  ArrowLeft, 
  Globe, 
  Moon, 
  Sun, 
  Check, 
  AlertTriangle, 
  ExternalLink,
  BookOpen,
  DollarSign,
  Calendar,
  Hourglass,
  CheckCircle2,
  Bookmark,
  ShieldCheck
} from "lucide-react";

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

const CATEGORY_STYLE: Record<string, { bg: string, text: string, border: string }> = {
  STUDIUM:     { bg: "bg-sky-500/10", text: "text-sky-500", border: "border-sky-500/20" },
  ARBEIT:      { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  AUSBILDUNG:  { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/20" },
  AU_PAIR:     { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
  INTERNSHIP:  { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20" },
  VOLUNTEERING:{ bg: "bg-teal-500/10", text: "text-teal-500", border: "border-teal-500/20" },
  IMMIGRATION: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Новичок",
  INTERMEDIATE: "Средний",
  ADVANCED: "Продвинутый",
};

export default function ProgramPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const programId = params.id;
  const router = useRouter();

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (authLoading) return;

    // Redirect to login if not authenticated (direct URL access)
    if (!isAuthenticated) {
      router.push(`/login?next=/programs/${programId}`);
      return;
    }

    const fetchProgram = async () => {
      setLoading(true);
      setFetchError("");
      try {
        const res = await api.get(`/programs/${programId}`);
        setProgram(res.data);
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          router.push(`/login?next=/programs/${programId}`);
        } else {
          setFetchError("not_found");
        }
        console.error("Error fetching program data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId, authLoading, isAuthenticated, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (fetchError === "not_found" || !program) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-center p-6 bg-[var(--background)] text-[var(--foreground)]">
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Программа не найдена</h1>
          <button 
            onClick={() => router.push("/programs")} 
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            <ArrowLeft size={14} /> К списку программ
          </button>
        </div>
      </div>
    );
  }

  const catStyle = CATEGORY_STYLE[program.category] || { bg: "bg-[var(--border)]", text: "text-[var(--muted)]", border: "border-[var(--border)]" };

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans pb-24">
      
      {/* ─── Hero Header Area ────────────────────────────────────── */}
      <div className="pt-24 pb-12 px-4 md:px-6 border-b border-[var(--border)] bg-[var(--card)]/40">
        <div className="max-w-[1440px] mx-auto space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
              {program.category}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)]">
              Уровень: {LEVEL_LABELS[program.level] || program.level}
            </span>
            {program.residence_permit && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1">
                <ShieldCheck size={11} /> Даёт ВНЖ
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-balance">
            {program.title}
          </h1>
          
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-[62ch]">
            {program.description}
          </p>
        </div>
      </div>

      {/* ─── Main Columns Asymmetric Bento ───────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 mt-12 w-full grid grid-cols-1 md:grid-cols-[1.7fr_1.3fr] gap-12 items-start">
        
        {/* Left Column: Description & Pros/Cons */}
        <div className="space-y-10">
          
          {/* Main Description */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight">Описание программы</h2>
            <div className="border border-[var(--border)] rounded-2xl bg-[var(--card)] p-6 md:p-8">
              <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed whitespace-pre-line font-light">
                {program.full_description || program.description}
              </p>
            </div>
          </section>

          {/* Pros & Cons (Modern Split) */}
          {(program.pros || program.cons) && (
            <section className="grid grid-cols-1 gap-6">
              {program.pros && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
                    <CheckCircle2 size={15} /> Преимущества
                  </h3>
                  <div className="border border-emerald-500/20 rounded-2xl bg-emerald-500/[0.03] p-6 space-y-4">
                    <ul className="space-y-3">
                      {program.pros.split('\n').map((pro, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                          <Check size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {program.cons && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-rose-500 flex items-center gap-1.5">
                    <AlertTriangle size={15} /> Сложности
                  </h3>
                  <div className="border border-rose-500/20 rounded-2xl bg-rose-500/[0.03] p-6 space-y-4">
                    <ul className="space-y-3">
                      {program.cons.split('\n').map((con, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                          <AlertTriangle size={13} className="text-rose-500 shrink-0 mt-0.5" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Career Section */}
          {program.career_opportunities && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-tight">Карьерные перспективы</h2>
              <div className="border border-[var(--border)] rounded-2xl bg-[var(--accent-dim)]/30 p-6 md:p-8">
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  {program.career_opportunities}
                </p>
              </div>
            </section>
          )}

          {/* Required Docs */}
          {program.documents && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-tight">Необходимые документы</h2>
              <div className="border border-[var(--border)] rounded-2xl bg-[var(--card)] p-6 md:p-8">
                <ul className="space-y-3 pl-1">
                  {program.documents.split(', ').map((doc, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--muted)]">
                      <Bookmark size={13} className="text-[var(--accent)] shrink-0 mt-1" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Glass Summary Bento Block */}
        <aside className="sticky top-20 space-y-6">
          <div className="border border-[var(--border)] rounded-3xl bg-[var(--card)] p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
            {/* Soft Ambient Sparkle */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--accent)] rounded-full blur-[70px] opacity-10 pointer-events-none" />

            <h3 className="text-base font-bold tracking-tight border-b border-[var(--border)] pb-4">
              Краткая сводка
            </h3>
            
            <div className="space-y-5 text-[13px]">
              <div className="space-y-1">
                <span className="text-[var(--muted)] text-[11px] block">Требование к языку</span>
                <span className="font-semibold flex items-center gap-1.5">
                  <BookOpen size={13} className="text-[var(--accent)]" />
                  {program.language_requirement}
                </span>
              </div>
              
              <div className="space-y-1">
                <span className="text-[var(--muted)] text-[11px] block">Зарплата / Стипендия</span>
                <span className="font-semibold text-emerald-500 flex items-center gap-1.5">
                  <DollarSign size={13} />
                  {program.salary_range}
                </span>
              </div>
              
              {program.cost && (
                <div className="space-y-1">
                  <span className="text-[var(--muted)] text-[11px] block">Расходы (оценка)</span>
                  <span className="font-semibold flex items-center gap-1.5">
                    <DollarSign size={13} className="text-red-500/80" />
                    {program.cost}
                  </span>
                </div>
              )}
              
              <div className="space-y-1">
                <span className="text-[var(--muted)] text-[11px] block">Возраст</span>
                <span className="font-semibold flex items-center gap-1.5">
                  <Hourglass size={13} className="text-amber-500" />
                  {program.min_age} - {program.max_age ? `${program.max_age} лет` : "без ограничений"}
                </span>
              </div>

              {program.duration_months && (
                <div className="space-y-1">
                  <span className="text-[var(--muted)] text-[11px] block">Длительность</span>
                  <span className="font-semibold flex items-center gap-1.5">
                    <Calendar size={13} className="text-blue-500" />
                    {program.duration_months} мес.
                  </span>
                </div>
              )}

              {program.deadline && (
                <div className="space-y-1">
                  <span className="text-[var(--muted)] text-[11px] block">Дедлайны / Сроки</span>
                  <span className="font-semibold flex items-center gap-1.5">
                    <Calendar size={13} className="text-rose-500/80" />
                    {program.deadline}
                  </span>
                </div>
              )}
            </div>

            {program.official_url && (
              <div className="pt-2">
                <a 
                  href={program.official_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-3 px-4 rounded-xl bg-[var(--accent)] text-white font-bold text-xs hover:bg-emerald-500 transition-all active:scale-[0.98]"
                >
                  Официальный сайт <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </aside>

      </div>

    </div>
  );
}
