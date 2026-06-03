"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { useLangStore } from "../../store/langStore";
import api from "../../lib/api";
import {
  Search, X, Heart, Clock, Languages, UserCheck,
  ArrowRight, SlidersHorizontal, CheckCircle2,
  CalendarDays, Banknote, MapPin, AlertCircle,
} from "lucide-react";
import AuthGateModal from "../../components/AuthGateModal";
import { CountryFlag } from "../../components/CountryFlag";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Program {
  id: number;
  slug: string;
  country_slug: string | null;
  title: string;
  category: string;
  level: string;
  short_description: string;
  salary_range: string | null;
  deadline: string | null;
  residence_permit: boolean;
  pros: string | null;
  cost: string | null;
  min_age: number | null;
  max_age: number | null;
  duration_months: number | null;
  language_requirement: string | null;
  cover_image_url: string | null;
}

// ─── Static maps ────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, {
  label: string;
  color: string;
  dot: string;
  placeholder: string;
  emoji: string;
}> = {
  STUDIUM:     { label: "Обучение",        color: "text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950 dark:border-sky-800",                          dot: "bg-sky-500",     placeholder: "bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-950 dark:to-sky-900",          emoji: "🎓" },
  ARBEIT:      { label: "Работа",          color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800",  dot: "bg-emerald-500", placeholder: "bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-950 dark:to-emerald-900", emoji: "💼" },
  AUSBILDUNG:  { label: "Аусбильдунг",     color: "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950 dark:border-violet-800",       dot: "bg-violet-500",  placeholder: "bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-950 dark:to-violet-900",  emoji: "🔧" },
  AU_PAIR:     { label: "Au Pair",         color: "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950 dark:border-rose-800",                   dot: "bg-rose-500",    placeholder: "bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-950 dark:to-rose-900",          emoji: "🏠" },
  INTERNSHIP:  { label: "Стажировка",      color: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800",       dot: "bg-orange-500",  placeholder: "bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950 dark:to-orange-900",  emoji: "📋" },
  VOLUNTEERING:{ label: "Волонтерство",    color: "text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950 dark:border-teal-800",                   dot: "bg-teal-500",    placeholder: "bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-950 dark:to-teal-900",          emoji: "🌱" },
  FSJ:         { label: "FSJ",             color: "text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950 dark:border-teal-800",                   dot: "bg-teal-500",    placeholder: "bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-950 dark:to-teal-900",          emoji: "🤝" },
  IMMIGRATION: { label: "Иммиграция",      color: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800",                         dot: "bg-red-500",     placeholder: "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-950 dark:to-red-900",              emoji: "✈️" },
  SCHULE:      { label: "Школьный обмен",  color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950 dark:border-indigo-800",      dot: "bg-indigo-500",  placeholder: "bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-950 dark:to-indigo-900",  emoji: "📚" },
  LANGUAGE:    { label: "Языковые курсы",  color: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800",             dot: "bg-amber-500",   placeholder: "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-950 dark:to-amber-900",      emoji: "🗣️" },
};

const CATEGORY_LABELS_RU: Record<string, string> = {
  ALL: "Все",
  STUDIUM: "Обучение",
  ARBEIT: "Работа",
  AUSBILDUNG: "Аусбильдунг",
  AU_PAIR: "Au Pair",
  INTERNSHIP: "Стажировка",
  VOLUNTEERING: "Волонтерство",
  FSJ: "FSJ",
  IMMIGRATION: "Иммиграция",
  SCHULE: "Школьный обмен",
  LANGUAGE: "Языковые курсы",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[(cat || "").toUpperCase()] ?? {
    label: cat,
    color: "text-[var(--muted)] bg-[var(--card)] border-[var(--border)]",
    dot: "bg-[var(--muted)]",
    placeholder: "bg-gradient-to-br from-[var(--border)] to-[var(--card)]",
    emoji: "🌍",
  };
}

function formatDuration(months: number | null) {
  if (!months) return null;
  if (months < 12) return `${months} мес.`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `${y} ${y === 1 ? "год" : y < 5 ? "года" : "лет"}`;
  return `${y} г. ${m} м.`;
}

function formatAge(min: number | null, max: number | null) {
  if (!min && !max) return null;
  if (!max) return `от ${min}`;
  return `${min}–${max} лет`;
}

function getTopPros(pros: string | null, max = 2): string[] {
  if (!pros) return [];
  return pros.split("\n").map(s => s.trim()).filter(Boolean).slice(0, max);
}

function shortenDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  const s = deadline.trim();
  if (s.length <= 30) return s;
  // Берём первое предложение
  const dot = s.indexOf(".");
  if (dot > 0 && dot < 40) return s.slice(0, dot + 1);
  return s.slice(0, 30) + "…";
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden animate-pulse">
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-[var(--border)] rounded-full" />
          <div className="h-5 w-16 bg-[var(--border)] rounded-full" />
        </div>
        <div className="h-5 w-3/4 bg-[var(--border)] rounded" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-full bg-[var(--border)] rounded" />
          <div className="h-3.5 w-5/6 bg-[var(--border)] rounded" />
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-5 py-3 space-y-2">
        <div className="h-3 w-2/3 bg-[var(--border)] rounded" />
        <div className="h-3 w-1/2 bg-[var(--border)] rounded" />
      </div>
      <div className="border-t border-[var(--border)] px-5 py-3 flex justify-between">
        <div className="h-5 w-24 bg-[var(--border)] rounded" />
        <div className="h-5 w-20 bg-[var(--border)] rounded" />
      </div>
    </div>
  );
}

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({
  program,
  isFav,
  isAuthenticated,
  onCardClick,
  onToggleFav,
}: {
  program: Program;
  isFav: boolean;
  isAuthenticated: boolean;
  onCardClick: (slug: string) => void;
  onToggleFav: (e: React.MouseEvent, id: number) => void;
}) {
  const cat = getCategoryConfig(program.category);
  const pros = getTopPros(program.pros, 2);
  const duration = formatDuration(program.duration_months);
  const age = formatAge(program.min_age, program.max_age);
  const deadline = shortenDeadline(program.deadline);

  return (
    <article
      onClick={() => onCardClick(program.slug)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onCardClick(program.slug); }}
      className="group relative bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden cursor-pointer
        hover:border-[var(--accent)]/40 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]
        dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)]
        transition-all duration-200 flex flex-col"
    >
      {/* ── Cover image ──────────────────────────────── */}
      <div className="relative h-44 overflow-hidden shrink-0">
        {program.cover_image_url ? (
          <img
            src={program.cover_image_url}
            alt={program.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${cat.placeholder}`}>
            <span className="text-4xl opacity-60">{cat.emoji}</span>
          </div>
        )}

        {/* Gradient overlay at bottom for readability */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Category badge overlaid on image */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm bg-[var(--card)]/80 truncate ${cat.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cat.dot}`} />
            {cat.label}
          </span>
        </div>

        {/* Favourite button overlaid on image */}
        {isAuthenticated && (
          <button
            onClick={e => onToggleFav(e, program.id)}
            aria-label={isFav ? "Убрать из избранного" : "В избранное"}
            className={`absolute top-3 right-3 w-8 h-8 rounded-xl border backdrop-blur-sm flex items-center justify-center shrink-0 transition-colors
              ${isFav
                ? "border-rose-400/50 text-rose-500 bg-rose-50/90 dark:bg-rose-950/90"
                : "border-white/20 text-white bg-black/20 hover:bg-black/40"
              }`}
          >
            <Heart size={13} fill={isFav ? "currentColor" : "none"} />
          </button>
        )}

        {/* Country flag overlaid bottom-left */}
        {program.country_slug && (
          <div className="absolute bottom-3 left-3">
            <CountryFlag slug={program.country_slug} showName size="sm"
              className="bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5 [&_span]:text-white/90" />
          </div>
        )}
      </div>

      {/* ── Header ───────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3">
        {/* Title */}
        <h3 className="text-[15px] font-bold tracking-tight text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors leading-snug mb-2 line-clamp-2">
          {program.title}
        </h3>

        {/* Short description */}
        <p className="text-[13px] text-[var(--muted)] leading-relaxed line-clamp-2">
          {program.short_description}
        </p>
      </div>

      {/* ── Key benefits ─────────────────────────────── */}
      {pros.length > 0 && (
        <div className="px-5 pb-4 space-y-1.5">
          {pros.map((p, i) => (
            <div key={i} className="flex items-start gap-2 text-[12px] text-[var(--muted)]">
              <CheckCircle2 size={12} className="text-[var(--accent)] shrink-0 mt-0.5" />
              <span className="line-clamp-1">{p}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Meta row ─────────────────────────────────── */}
      <div className="mt-auto border-t border-[var(--border)] px-5 py-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {duration && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
            <Clock size={11} className="text-[var(--accent)]" />
            {duration}
          </span>
        )}
        {program.language_requirement && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
            <Languages size={11} className="text-[var(--accent)]" />
            {program.language_requirement}
          </span>
        )}
        {age && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
            <UserCheck size={11} className="text-[var(--accent)]" />
            {age}
          </span>
        )}
        {program.residence_permit && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
            <MapPin size={11} />
            ВНЖ
          </span>
        )}
      </div>

      {/* ── Footer: salary + deadline ─────────────────── */}
      <div className="border-t border-[var(--border)] px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          {program.salary_range ? (
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
              <Banknote size={12} className="shrink-0" />
              {program.salary_range}
            </span>
          ) : program.cost ? (
            <span className="text-[12px] text-[var(--muted)] truncate">{program.cost}</span>
          ) : (
            <span className="text-[12px] text-[var(--muted)]">Уточняйте условия</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {deadline && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] hidden sm:inline-flex">
              <CalendarDays size={11} />
              <span className="truncate max-w-[120px]">{deadline}</span>
            </span>
          )}
          <div className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)]
            group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-dim)]
            transition-colors shrink-0">
            <ArrowRight size={13} />
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProgramsPage() {
  const { isAuthenticated } = useAuthStore();
  const { lang } = useLangStore();
  const router = useRouter();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [filtered, setFiltered] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [categories, setCategories] = useState<string[]>(["ALL"]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [authGate, setAuthGate] = useState<{ open: boolean; target: string }>({ open: false, target: "" });

  // Fetch programs
  useEffect(() => {
    api.get("/programs", { params: { size: 100 } })
      .then(res => {
        const list: Program[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.items)
          ? res.data.items
          : [];
        setPrograms(list);
        setFiltered(list);
        const cats = Array.from(new Set(list.map(p => (p.category || "").toUpperCase()).filter(Boolean)));
        setCategories(["ALL", ...cats]);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Fetch favorites
  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/favorites")
      .then(res => {
        const ids = new Set<number>((res.data.items || []).map((f: any) => f.program_id as number));
        setFavoriteIds(ids);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // Filter
  useEffect(() => {
    let res = programs;
    if (selectedCategory !== "ALL") {
      res = res.filter(p => (p.category || "").toUpperCase() === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.short_description || "").toLowerCase().includes(q)
      );
    }
    setFiltered(res);
  }, [search, selectedCategory, programs]);

  const handleCardClick = useCallback((slug: string) => {
    if (isAuthenticated) router.push(`/programs/${slug}`);
    else setAuthGate({ open: true, target: `/programs/${slug}` });
  }, [isAuthenticated, router]);

  const toggleFavorite = useCallback(async (e: React.MouseEvent, programId: number) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (favoriteIds.has(programId)) {
      await api.delete(`/favorites/${programId}`).catch(() => {});
      setFavoriteIds(prev => { const s = new Set(prev); s.delete(programId); return s; });
    } else {
      await api.post(`/favorites/${programId}`).catch(() => {});
      setFavoriteIds(prev => new Set(prev).add(programId));
    }
  }, [isAuthenticated, favoriteIds]);

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">

      {/* ─── Hero ──────────────────────────────────────── */}
      <div className="pt-14 border-b border-[var(--border)]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] mb-2">
                {loading ? "Загрузка…" : `${filtered.length} программ`}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Все программы
              </h1>
              <p className="mt-2 text-sm text-[var(--muted)] max-w-[50ch] leading-relaxed">
                Образование, работа, стажировки и иммиграция в 13 странах — реальные программы с актуальными требованиями.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filter bar ─────────────────────────────────── */}
      <div className="sticky top-14 z-40 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск программ…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm
                placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1
                focus:ring-[var(--accent)]/20 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className="sm:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] text-sm font-medium justify-center"
          >
            <SlidersHorizontal size={13} />
            Категории
          </button>

          {/* Category pills */}
          <div className={`${filtersOpen ? "flex" : "hidden"} sm:flex flex-wrap gap-1.5`}>
            {categories.map(cat => {
              const label = CATEGORY_LABELS_RU[cat] ?? cat;
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap border transition-all ${
                    active
                      ? "bg-[var(--foreground)] text-[var(--background)] border-transparent"
                      : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30 bg-transparent"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Content ────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8 pb-24">

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-3">
            <AlertCircle size={32} className="text-[var(--muted)]" />
            <p className="font-semibold">Не удалось загрузить программы</p>
            <p className="text-sm text-[var(--muted)]">Проверьте соединение и обновите страницу</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-5 py-2 rounded-xl border border-[var(--border)] text-sm font-medium
                hover:border-[var(--accent)]/40 hover:bg-[var(--accent-dim)] transition-all"
            >
              Обновить
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-3 border border-dashed border-[var(--border)] rounded-2xl">
            <Search size={28} className="text-[var(--muted)]" strokeWidth={1.5} />
            <div>
              <p className="font-semibold mb-1">Ничего не найдено</p>
              <p className="text-sm text-[var(--muted)] max-w-xs">
                Попробуйте другой запрос или сбросьте фильтры
              </p>
            </div>
            <button
              onClick={() => { setSearch(""); setSelectedCategory("ALL"); }}
              className="px-5 py-2 rounded-xl border border-[var(--border)] text-sm font-medium
                hover:border-[var(--accent)]/40 hover:bg-[var(--accent-dim)] transition-all"
            >
              Сбросить
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(program => (
              <ProgramCard
                key={program.id}
                program={program}
                isFav={favoriteIds.has(program.id)}
                isAuthenticated={isAuthenticated}
                onCardClick={handleCardClick}
                onToggleFav={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      <AuthGateModal
        isOpen={authGate.open}
        onClose={() => setAuthGate({ open: false, target: "" })}
        redirectTo={authGate.target}
      />
    </div>
  );
}
