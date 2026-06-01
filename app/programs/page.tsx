"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { useLangStore } from "../../store/langStore";
import { translations } from "../../locales/translations";
import api from "../../lib/api";
import { 
  Search, 
  ArrowRight, 
  SlidersHorizontal, 
  X, 
  Heart, 
  Clock, 
  Languages, 
  UserCheck, 
  Calendar,
  Sparkles
} from "lucide-react";
import AuthGateModal from "../../components/AuthGateModal";

interface Program {
  id: number;
  slug: string;
  title: string;
  category: string;
  level: string;
  description: string;
  salary_range: string;
  min_age: number;
  max_age: number | null;
  duration_months: number | null;
  language_requirement: string;
  residence_permit?: boolean;
}

const CATEGORY_ACCENT: Record<string, string> = {
  STUDIUM: "text-sky-500 bg-sky-500/10 border-sky-500/20",
  ARBEIT: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  AUSBILDUNG: "text-violet-500 bg-violet-500/10 border-violet-500/20",
  AU_PAIR: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  INTERNSHIP: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  VOLUNTEERING: "text-teal-500 bg-teal-500/10 border-teal-500/20",
  IMMIGRATION: "text-red-500 bg-red-500/10 border-red-500/20",
};

function ProgramSkeleton() {
  return (
    <div className="bg-[var(--card)]/20 border border-[var(--border)] rounded-3xl p-6 space-y-4 h-[340px] flex flex-col justify-between animate-pulse">
      <div className="space-y-3">
        <div className="h-5 w-1/3 bg-[var(--border)] rounded-full" />
        <div className="h-6 w-3/4 bg-[var(--border)] rounded-lg" />
        <div className="h-4 w-full bg-[var(--border)] rounded" />
        <div className="h-4 w-5/6 bg-[var(--border)] rounded" />
      </div>
      <div className="border-t border-[var(--border)] pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="h-3 w-3/4 bg-[var(--border)] rounded" />
          <div className="h-3 w-2/3 bg-[var(--border)] rounded" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-6 w-24 bg-[var(--border)] rounded-lg" />
          <div className="h-8 w-8 bg-[var(--border)] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ProgramsPage() {
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const { isAuthenticated } = useAuthStore();
  const { lang } = useLangStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filtered, setFiltered] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [categories, setCategories] = useState<string[]>(["Все"]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [authGate, setAuthGate] = useState<{ open: boolean; target: string }>({ open: false, target: "" });

  const navText = translations[lang]?.nav || translations.ru.nav;

  const handleProgramClick = (programSlug: string) => {
    if (isAuthenticated) {
      router.push(`/programs/${programSlug}`);
    } else {
      setAuthGate({ open: true, target: `/programs/${programSlug}` });
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, programId: number) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (favoriteIds.has(programId)) {
      await api.delete(`/favorites/${programId}`);
      setFavoriteIds(prev => { const s = new Set(prev); s.delete(programId); return s; });
    } else {
      await api.post(`/favorites/${programId}`);
      setFavoriteIds(prev => new Set(prev).add(programId));
    }
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    api.get("/programs").then((res) => {
      const data = res.data;
      const list: Program[] = Array.isArray(data) ? data
        : Array.isArray(data?.items) ? data.items
          : Array.isArray(data?.results) ? data.results : [];
      setPrograms(list);
      setFiltered(list);
      const cats = Array.from(new Set(list.map((p) => p.category).filter(Boolean)));
      setCategories(["Все", ...cats]);
    }).catch(() => { setPrograms([]); setFiltered([]); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let res = programs;
    if (selectedCategory !== "Все") res = res.filter((p) => (p.category || "").toUpperCase() === selectedCategory.toUpperCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((p) => (p.title ?? "").toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q));
    }
    setFiltered(res);
  }, [search, selectedCategory, programs]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/favorites").then((res) => {
      const ids = new Set<number>((res.data.items || []).map((f: any) => f.program_id));
      setFavoriteIds(ids);
    }).catch(() => { });
  }, [isAuthenticated]);

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-[40dvw] h-[40dvw] bg-[var(--accent)] rounded-full blur-[140px] opacity-[0.05] pointer-events-none z-0" />

      {/* ─── Hero header ────────────────────────── */}
      <div className="pt-14 relative z-10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] mb-3 flex items-center gap-1.5">
              <Sparkles size={11} className="animate-pulse" />
              {loading ? "Загрузка..." : `${filtered.length} программ доступно`}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
              Все программы
            </h1>
            <p className="mt-3 text-[var(--muted)] leading-relaxed max-w-[52ch] text-sm md:text-base font-light">
              Найдите идеальную программу для карьеры, учёбы или переезда за рубеж с детальным анализом требований и условий.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Search + filter bar ─────────────────────────────────── */}
      <div className="sticky top-14 z-40 border-y border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl px-4 md:px-6 py-3 relative z-30">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Поиск программ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Mobile filter toggle */}
          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className="sm:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] text-sm font-medium justify-center">
            <SlidersHorizontal size={14} />
            Категории
          </button>

          {/* Category filters */}
          <div className={`${filtersOpen ? "flex" : "hidden"} sm:flex flex-wrap items-center gap-1.5`}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap border transition-all ${selectedCategory === cat
                  ? "bg-[var(--foreground)] text-[var(--background)] border-transparent shadow-sm"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)] bg-[var(--card)]/40"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Programs Grid Layout ─────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 pb-24 pt-8 relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <ProgramSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-[var(--border)] rounded-3xl bg-[var(--card)]/10">
            <p className="text-xl font-bold tracking-tight mb-2">Не найдено</p>
            <p className="text-[var(--muted)] text-sm mb-6 max-w-sm mx-auto">Попробуйте изменить запрос или выберите другую категорию фильтрации.</p>
            <button onClick={() => { setSearch(""); setSelectedCategory("Все"); }}
              className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--accent)]/30 hover:bg-[var(--accent-dim)] transition-all">
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((program, idx) => (
              <div
                key={program.id}
                onClick={() => handleProgramClick(program.slug)}
                className="group relative flex flex-col justify-between bg-[var(--card)]/30 hover:bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/40 rounded-3xl p-6 transition-all duration-300 cursor-pointer overflow-hidden min-h-[340px] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleProgramClick(program.slug);
                  }
                }}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Corner accent glow depending on category */}
                <div className={`absolute -top-12 -right-12 w-28 h-28 rounded-full blur-[40px] opacity-[0.08] group-hover:scale-150 transition-transform duration-500 pointer-events-none ${
                  program.category === "STUDIUM" ? "bg-sky-500" :
                  program.category === "ARBEIT" ? "bg-emerald-500" :
                  program.category === "AUSBILDUNG" ? "bg-violet-500" :
                  program.category === "AU_PAIR" ? "bg-rose-500" :
                  program.category === "INTERNSHIP" ? "bg-orange-500" :
                  "bg-teal-500"
                }`} />

                <div>
                  {/* Header tags and favorites */}
                  <div className="flex items-center justify-between gap-3 relative z-10 mb-4">
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${CATEGORY_ACCENT[program.category] || "text-[var(--muted)] bg-[var(--border)] border-[var(--border)]"}`}>
                      {program.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {program.residence_permit && (
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full border text-sky-500 bg-sky-500/10 border-sky-500/20">
                          ВНЖ
                        </span>
                      )}
                      {isAuthenticated && (
                        <button
                          onClick={(e) => toggleFavorite(e, program.id)}
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all relative z-20 ${favoriteIds.has(program.id)
                            ? "border-rose-500/30 text-rose-500 bg-rose-500/10"
                            : "border-[var(--border)] text-[var(--muted)] hover:border-rose-500/30 hover:text-rose-500 bg-[var(--card)]/20"
                            }`}
                        >
                          <Heart size={13} fill={favoriteIds.has(program.id) ? "currentColor" : "none"} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold tracking-tight text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors line-clamp-1 mb-2 relative z-10">
                    {program.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3 mb-6 relative z-10">
                    {program.description}
                  </p>
                </div>

                {/* Card footer details */}
                <div className="relative z-10 border-t border-[var(--border)]/70 pt-4 mt-auto">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {program.duration_months && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                        <Clock size={12} className="text-[var(--accent)] shrink-0" />
                        <span>{program.duration_months} месяцев</span>
                      </div>
                    )}
                    {program.language_requirement && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                        <Languages size={12} className="text-[var(--accent)] shrink-0" />
                        <span className="truncate">{program.language_requirement}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                      <UserCheck size={12} className="text-[var(--accent)] shrink-0" />
                      <span>{program.min_age}{program.max_age ? `–${program.max_age}` : "+"} лет</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    {program.salary_range ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
                        {program.salary_range}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">Стипендия / Оплата</span>
                    )}
                    <div className="w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-dim)] transition-all">
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auth Gate Modal */}
      <AuthGateModal
        isOpen={authGate.open}
        onClose={() => setAuthGate({ open: false, target: "" })}
        redirectTo={authGate.target}
      />
    </div>
  );
}
