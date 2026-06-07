"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  X,
  ExternalLink,
  Calendar,
  MapPin,
  Globe,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import api from "../../lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Scholarship {
  id: number;
  title: string;
  description: string | null;
  deadline: string | null;
  url: string;
  source: string;
  country: string | null;
  category: string;
  published_at: string | null;
}

// ── Config ────────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; colorClass: string }> = {
  SCHOLARSHIP: { label: "Стипендия",   emoji: "🎓", colorClass: "text-blue-600 bg-blue-500/10 border-blue-500/20"   },
  INTERNSHIP:  { label: "Стажировка",  emoji: "💼", colorClass: "text-purple-600 bg-purple-500/10 border-purple-500/20" },
  EXCHANGE:    { label: "Обмен",       emoji: "🌍", colorClass: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
  FELLOWSHIP:  { label: "Грант",       emoji: "⭐", colorClass: "text-amber-600 bg-amber-500/10 border-amber-500/20"  },
  CONFERENCE:  { label: "Конференция", emoji: "🎤", colorClass: "text-rose-600 bg-rose-500/10 border-rose-500/20"    },
};

const CATEGORIES = ["ALL", ...Object.keys(CATEGORY_CONFIG)];

const COUNTRY_FLAGS: Record<string, string> = {
  Germany: "🇩🇪", USA: "🇺🇸", UK: "🇬🇧", Canada: "🇨🇦",
  Australia: "🇦🇺", China: "🇨🇳", Japan: "🇯🇵", France: "🇫🇷",
  Sweden: "🇸🇪", Norway: "🇳🇴", Turkey: "🇹🇷", Netherlands: "🇳🇱",
  Switzerland: "🇨🇭", Austria: "🇦🇹", "South Korea": "🇰🇷", Singapore: "🇸🇬",
  Finland: "🇫🇮",
};

const SOURCE_COLORS: Record<string, string> = {
  "Opportunity Desk": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "Scholarships365":  "bg-sky-500/10 text-sky-600 border-sky-500/20",
  "UN Jobs":          "bg-blue-500/10 text-blue-700 border-blue-500/20",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return null;
  }
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="card rounded-2xl overflow-hidden animate-pulse">
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-5 w-24 bg-[var(--border)] rounded-full" />
          <div className="h-5 w-16 bg-[var(--border)] rounded-full" />
        </div>
        <div className="h-4 bg-[var(--border)] rounded w-full" />
        <div className="h-4 bg-[var(--border)] rounded w-4/5" />
        <div className="h-3 bg-[var(--border)] rounded w-3/4" />
        <div className="h-3 bg-[var(--border)] rounded w-2/3" />
        <div className="pt-2 flex justify-between items-center">
          <div className="h-4 w-20 bg-[var(--border)] rounded" />
          <div className="h-8 w-24 bg-[var(--border)] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ScholarshipsPage() {
  const [items, setItems]               = useState<Scholarship[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(false);
  const [search, setSearch]             = useState("");
  const [activeCategory, setCategory]   = useState("ALL");
  const [filtersOpen, setFiltersOpen]   = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(false);
    api.get("/scholarships", { params: { size: 100 } })
      .then(res => setItems(res.data?.items ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // Client-side filtering
  const filtered = useMemo(() => {
    return items.filter(s => {
      const matchCat = activeCategory === "ALL" || s.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q
        || s.title.toLowerCase().includes(q)
        || (s.description || "").toLowerCase().includes(q)
        || (s.country || "").toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [items, activeCategory, search]);

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="pt-14 bg-[var(--card)] border-b border-[var(--border)]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)] flex items-center gap-1.5">
                <GraduationCap size={12} />
                {loading ? "Загрузка..." : `${filtered.length} возможност${filtered.length === 1 ? "ь" : "ей"}`}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
                Стипендии и гранты
              </h1>
              <p className="text-sm text-[var(--muted)] max-w-[52ch] leading-relaxed">
                Актуальные стипендии, гранты и обменные программы со всего мира.
                Данные обновляются автоматически из открытых источников.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <p className="text-[10px] text-[var(--muted)] hidden md:block">Источники:</p>
              {["Opportunity Desk", "Scholarships365", "UN Jobs"].map(src => (
                <span
                  key={src}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${SOURCE_COLORS[src] ?? "bg-[var(--card)] border-[var(--border)] text-[var(--muted)]"}`}
                >
                  {src}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky filter bar ────────────────────────────────────────────── */}
      <div className="sticky top-14 z-40 bg-[var(--card)] border-b border-[var(--border)] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">

            {/* Search */}
            <div className="relative flex-1 min-w-0 max-w-xs">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по стипендиям..."
                className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Mobile filter toggle */}
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
            >
              <SlidersHorizontal size={12} />
              Фильтры {activeCategory !== "ALL" && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] ml-0.5" />}
            </button>

            {/* Category pills — desktop always visible, mobile toggleable */}
            <div className={`${filtersOpen ? "flex" : "hidden"} sm:flex flex-wrap gap-1.5`}>
              {CATEGORIES.map(cat => {
                const cfg = CATEGORY_CONFIG[cat];
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setCategory(cat); setFiltersOpen(false); }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap border transition-all flex items-center gap-1.5 ${
                      active
                        ? "bg-[var(--accent)] text-white border-transparent shadow-[0_2px_8px_rgba(16,185,129,0.25)]"
                        : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border)]"
                    }`}
                  >
                    {cfg && <span className="text-[11px] leading-none">{cfg.emoji}</span>}
                    {cat === "ALL" ? "Все" : cfg?.label ?? cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-8">

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <Globe size={24} className="text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">Не удалось загрузить стипендии</p>
              <p className="text-xs text-[var(--muted)] mt-1">Проверьте подключение к интернету</p>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:bg-emerald-500 transition-all"
            >
              <RefreshCw size={12} /> Попробовать снова
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center">
              <GraduationCap size={24} className="text-[var(--accent)]" />
            </div>
            <div>
              <p className="font-semibold text-sm">Стипендии не найдены</p>
              <p className="text-xs text-[var(--muted)] mt-1">
                {items.length === 0
                  ? "Источники ещё не синхронизированы или временно недоступны"
                  : "Попробуйте изменить фильтры или поисковый запрос"}
              </p>
            </div>
            {(search || activeCategory !== "ALL") && (
              <button
                type="button"
                onClick={() => { setSearch(""); setCategory("ALL"); }}
                className="text-xs font-bold text-[var(--accent)] hover:underline"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        )}

        {/* Cards grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(s => {
              const cfg = CATEGORY_CONFIG[s.category];
              const flag = s.country ? COUNTRY_FLAGS[s.country] : null;
              const srcColor = SOURCE_COLORS[s.source] ?? "bg-[var(--card)] border-[var(--border)] text-[var(--muted)]";
              const publishedStr = formatDate(s.published_at);

              return (
                <article
                  key={s.id}
                  className="card-interactive rounded-2xl overflow-hidden flex flex-col group"
                >
                  {/* Card header strip */}
                  <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                    {/* Category badge */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border shrink-0 ${cfg?.colorClass ?? "bg-[var(--card)] border-[var(--border)] text-[var(--muted)]"}`}>
                      {cfg && <span>{cfg.emoji}</span>}
                      {cfg?.label ?? s.category}
                    </span>

                    {/* Source badge */}
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border truncate ${srcColor}`}>
                      {s.source}
                    </span>
                  </div>

                  {/* Title + description */}
                  <div className="px-5 flex-1 space-y-2">
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                      {s.title}
                    </h3>
                    {s.description && (
                      <p className="text-[12px] text-[var(--muted)] leading-relaxed line-clamp-3">
                        {s.description}
                      </p>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="px-5 pt-3 pb-2 flex items-center gap-3 flex-wrap">
                    {flag && s.country && (
                      <span className="flex items-center gap-1 text-[11px] text-[var(--muted)]">
                        <MapPin size={11} />
                        {flag} {s.country}
                      </span>
                    )}
                    {s.deadline && (
                      <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                        <Calendar size={11} />
                        Дедлайн: {s.deadline}
                      </span>
                    )}
                    {!s.deadline && publishedStr && (
                      <span className="flex items-center gap-1 text-[11px] text-[var(--muted)]">
                        <Calendar size={11} />
                        {publishedStr}
                      </span>
                    )}
                  </div>

                  {/* Footer: Apply button */}
                  <div className="px-5 pb-5">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:bg-emerald-500 transition-all shadow-[0_2px_8px_rgba(16,185,129,0.2)]"
                    >
                      Подать заявку <ExternalLink size={11} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Disclaimer */}
        {!loading && !error && items.length > 0 && (
          <p className="text-center text-[11px] text-[var(--muted)] mt-10">
            Данные агрегируются из открытых RSS-источников. WorldBridge не несёт ответственности
            за актуальность и условия сторонних программ.{" "}
            <Link href="/programs" className="text-[var(--accent)] hover:underline font-medium">
              Также смотрите наш каталог программ →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
