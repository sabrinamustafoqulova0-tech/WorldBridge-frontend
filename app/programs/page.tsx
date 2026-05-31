"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { useLangStore } from "../../store/langStore";
import { translations } from "../../locales/translations";
import api from "../../lib/api";
import { Globe, Moon, Sun, Search, ArrowRight, SlidersHorizontal, X } from "lucide-react";
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
  STUDIUM:     "text-sky-500 bg-sky-500/10 border-sky-500/20",
  ARBEIT:      "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  AUSBILDUNG:  "text-violet-500 bg-violet-500/10 border-violet-500/20",
  AU_PAIR:     "text-rose-500 bg-rose-500/10 border-rose-500/20",
  INTERNSHIP:  "text-orange-500 bg-orange-500/10 border-orange-500/20",
  VOLUNTEERING:"text-teal-500 bg-teal-500/10 border-teal-500/20",
  IMMIGRATION: "text-red-500 bg-red-500/10 border-red-500/20",
};

function ProgramSkeleton() {
  return (
    <div className="border-t border-[var(--border)] py-5 space-y-3">
      <div className="skeleton h-3.5 w-1/4" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  );
}

export default function ProgramsPage() {
  const { isAuthenticated } = useAuthStore();
  const { lang, setLang } = useLangStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
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

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">

      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-5 md:px-8 glass border-b border-[var(--border)]">
        <Link href="/home" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center transition-transform group-hover:scale-110">
            <Globe size={13} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[14px] tracking-tight">WorldBridge</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[var(--muted)]">
          <span className="font-semibold text-[var(--foreground)]">{navText.programs}</span>
          <Link href="/countries" className="hover:text-[var(--foreground)] transition-colors">{navText.destinations}</Link>
          <Link href="/articles" className="hover:text-[var(--foreground)] transition-colors">{navText.insights}</Link>
          <Link href="/calculator" className="hover:text-[var(--foreground)] transition-colors">{navText.estimator}</Link>
        </div>
        <div className="flex items-center gap-2">
          {mounted && (
            <select value={lang} onChange={(e) => setLang(e.target.value as any)}
              className="bg-transparent text-[13px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] focus:outline-none cursor-pointer appearance-none">
              <option value="ru">RU</option>
              <option value="en">EN</option>
              <option value="tg">TG</option>
            </select>
          )}
          {mounted && (
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)]">
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}
          {isAuthenticated
            ? <Link href="/profile" className="px-3 py-1.5 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Профиль</Link>
            : <Link href="/login" className="px-3 py-1.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-[13px] font-semibold hover:opacity-85 transition-all">{navText.login}</Link>
          }
        </div>
      </nav>

      {/* ─── Hero header — LEFT-ALIGNED ────────────────────────── */}
      <div className="pt-14">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 md:py-16">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] mb-3 reveal-up">
              {loading ? "Загрузка..." : `${filtered.length} программ доступно`}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight reveal-up delay-75">
              Все программы
            </h1>
            <p className="mt-3 text-[var(--muted)] leading-relaxed max-w-[52ch] reveal-up delay-150">
              Найдите идеальную программу для карьеры, учёбы или переезда за рубеж
            </p>
          </div>
        </div>
      </div>

      {/* ─── Search + filter bar ─────────────────────────────────── */}
      <div className="sticky top-14 z-40 border-y border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-xl px-5 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
            className="sm:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] text-sm font-medium">
            <SlidersHorizontal size={14} />
            Категории
          </button>

          {/* Category filters — desktop inline, mobile toggleable */}
          <div className={`${filtersOpen ? "flex" : "hidden"} sm:flex flex-wrap items-center gap-1.5`}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap border transition-all ${selectedCategory === cat
                  ? "bg-[var(--foreground)] text-[var(--background)] border-transparent"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Programs list — border-divided, no cards ─────────── */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 pb-20">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <ProgramSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-2xl font-bold tracking-tight mb-2">Не найдено</p>
            <p className="text-[var(--muted)] text-sm mb-6">Попробуйте изменить запрос или очистить фильтры</p>
            <button onClick={() => { setSearch(""); setSelectedCategory("Все"); }}
              className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--accent)]/30 hover:bg-[var(--accent-dim)] transition-all">
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div>
            {filtered.map((program, idx) => (
              <button
                key={program.id}
                onClick={() => handleProgramClick(program.slug)}
                className="group w-full text-left block border-t border-[var(--border)] py-6 hover:bg-[var(--card)] -mx-5 md:-mx-8 px-5 md:px-8 transition-all duration-200"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_ACCENT[program.category] || "text-[var(--muted)] bg-[var(--border)] border-[var(--border)]"}`}>
                        {program.category}
                      </span>
                      {program.residence_permit && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border text-sky-500 bg-sky-500/10 border-sky-500/20">
                          ВНЖ
                        </span>
                      )}
                      {program.duration_months && (
                        <span className="text-[11px] text-[var(--muted)]">{program.duration_months} мес.</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base md:text-lg font-semibold tracking-tight group-hover:text-[var(--accent)] transition-colors line-clamp-1 mb-1.5">
                      {program.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-2 max-w-[70ch]">
                      {program.description}
                    </p>

                    {/* Meta footer */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-[12px] text-[var(--muted)]">
                      {program.salary_range && (
                        <span className="font-semibold text-emerald-500">{program.salary_range}</span>
                      )}
                      {program.language_requirement && (
                        <span>{program.language_requirement}</span>
                      )}
                      <span>
                        {program.min_age}
                        {program.max_age ? `–${program.max_age}` : "+"} лет
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="shrink-0 w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-dim)] transition-all mt-1">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </button>
            ))}
            {/* Bottom border */}
            <div className="border-t border-[var(--border)]" />
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
