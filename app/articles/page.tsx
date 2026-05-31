"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuthStore } from "../../store/authStore";
import { useLangStore } from "../../store/langStore";
import { translations } from "../../locales/translations";
import api from "../../lib/api";
import {
  ArrowLeft,
  Globe,
  Moon,
  Sun,
  Clock,
  BookOpen,
  ArrowRight,
  Eye,
} from "lucide-react";

interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  is_published: boolean;
  views_count: number;
  created_at: string;
}

export default function ArticlesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { lang } = useLangStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const navText = translations[lang]?.nav || translations.ru.nav;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    api.get("/articles?page=1&size=20")
      .then((res) => setArticles(res.data.items || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col pb-24">

      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-5 md:px-8 glass border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <Link href="/home" className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            <ArrowLeft size={14} /> Назад
          </Link>
          <div className="h-4 w-px bg-[var(--border)] hidden sm:block"></div>
          <Link href="/" className="hidden sm:flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center transition-transform group-hover:scale-110">
              <Globe size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-[14px] tracking-tight">WorldBridge</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[var(--muted)]">
          <Link href="/programs" className="hover:text-[var(--foreground)] transition-colors">{navText.programs}</Link>
          <Link href="/countries" className="hover:text-[var(--foreground)] transition-colors">{navText.destinations}</Link>
          <span className="font-semibold text-[var(--foreground)]">{navText.insights}</span>
          <Link href="/calculator" className="hover:text-[var(--foreground)] transition-colors">{navText.estimator}</Link>
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
          {!authLoading && (
            isAuthenticated ? (
              <Link href="/profile" className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Профиль</Link>
            ) : (
              <Link href="/login" className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">{navText.login}</Link>
            )
          )}
        </div>
      </nav>

      {/* ─── Hero header ────────────────────────────────────────── */}
      <div className="pt-24 pb-10 px-5 md:px-8">
        <div className="max-w-4xl mx-auto space-y-3">
          <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] flex items-center gap-1.5">
            <BookOpen size={12} />
            Полезные гайды и инсайты
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight text-balance">
            Статьи и инструкции
          </h1>
          <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed max-w-[55ch]">
            Практические советы, инструкции по документам и реальный опыт переехавших в Европу и мир.
          </p>
        </div>
      </div>

      {/* ─── Content ────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-5 md:px-8 w-full flex-1">

        {loading ? (
          <div className="space-y-4">
            {/* Featured skeleton */}
            <div className="border border-[var(--border)] rounded-3xl p-6 md:p-8 space-y-4">
              <div className="skeleton h-3 w-20 rounded-full" />
              <div className="skeleton h-7 w-3/4 rounded-xl" />
              <div className="skeleton h-4 w-full rounded-lg" />
              <div className="skeleton h-4 w-2/3 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-[var(--border)] rounded-2xl p-6 space-y-3">
                  <div className="skeleton h-3 w-16 rounded-full" />
                  <div className="skeleton h-5 w-4/5 rounded-lg" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-dim)] border border-[var(--accent)]/20 flex items-center justify-center">
              <BookOpen size={24} className="text-[var(--accent)] opacity-60" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">Статей пока нет</p>
              <p className="text-xs text-[var(--muted)]">Скоро здесь появятся полезные материалы</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Featured Hero Article */}
            {featured && (
              <Link href={`/articles/${featured.slug}`}>
                <div className="group border border-[var(--border)] rounded-3xl bg-[var(--card)] hover:border-[var(--accent)]/20 transition-all duration-300 p-6 md:p-8 cursor-pointer relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] rounded-full blur-[60px] opacity-5 pointer-events-none" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border text-[var(--accent)] bg-[var(--accent-dim)] border-[var(--accent)]/20">
                        Главная статья
                      </span>
                      <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                        <Eye size={11} /> {featured.views_count} просмотров
                      </span>
                      <span className="text-[11px] text-[var(--muted)]">•</span>
                      <span className="text-[11px] text-[var(--muted)]">
                        {new Date(featured.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold tracking-tight group-hover:text-[var(--accent)] transition-colors leading-tight max-w-[45ch]">
                      {featured.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-[65ch]">
                      {featured.excerpt}
                    </p>

                    <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)]">
                      Читать гайд <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Sub-grid Articles */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rest.map((article) => (
                  <Link href={`/articles/${article.slug}`} key={article.id}>
                    <div className="group border border-[var(--border)] rounded-2xl bg-[var(--card)] hover:border-[var(--accent)]/20 transition-all duration-300 p-6 cursor-pointer flex flex-col justify-between relative overflow-hidden shadow-sm h-full">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                            <Eye size={10} /> {article.views_count}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm sm:text-base group-hover:text-[var(--accent)] transition-colors leading-snug line-clamp-2">
                          {article.title}
                        </h3>

                        <p className="text-[12px] sm:text-xs text-[var(--muted)] leading-relaxed line-clamp-3">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between text-[10px] sm:text-[11px] text-[var(--muted)]">
                        <span>{new Date(article.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</span>
                        <span className="font-semibold text-[var(--accent)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Читать <ArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}