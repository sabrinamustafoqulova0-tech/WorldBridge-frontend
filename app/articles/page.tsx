"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useLangStore } from "../../store/langStore";
import { translations } from "../../locales/translations";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  Eye,
  ArrowRight,
  BookOpen,
  Clock,
} from "lucide-react";

interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  views_count: number;
  created_at: string;
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=800&q=80",
];

export default function ArticlesListPage() {
  const { lang } = useLangStore();
  const navText = translations[lang]?.nav || translations.ru.nav;
  const text = (translations[lang] as any)?.articlesList || (translations.ru as any).articlesList;

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await api.get("/articles");
        setArticles(res.data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [lang]);

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col pb-24 relative overflow-hidden">

      {/* Ambient lighting */}
      <div className="absolute top-0 left-[20%] w-[50dvw] h-[40dvw] bg-[var(--accent)] rounded-full blur-[160px] opacity-[0.04] pointer-events-none z-0" />

      {/* ─── Editorial Hero ────────────────────────────────────── */}
      <div className="relative z-10 pt-28 pb-16 px-4 md:px-6">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl space-y-5"
          >
            <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] flex items-center gap-2">
              <BookOpen size={12} />
              {navText.insights || "Статьи"}
            </p>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.0] text-balance">
              {text.title1}{" "}
              <span className="text-[var(--accent)]">{text.title2}</span>
            </h1>

            <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed max-w-[55ch] font-light">
              {text.subtitle}
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-md w-full mt-8"
          >
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder={text.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-[var(--muted)]"
            />
          </motion.div>
        </div>
      </div>

      {/* ─── Article Grid ─────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 w-full flex-1 relative z-10">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Featured first article — big editorial card */}
            {filteredArticles.length > 0 && !search && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8"
              >
                <Link href={`/articles/${filteredArticles[0].slug}`}>
                  <div className="group relative h-[400px] md:h-[480px] rounded-3xl overflow-hidden border border-[var(--border)] cursor-pointer">
                    <img
                      src={filteredArticles[0].cover_image_url || FALLBACK_IMAGES[0]}
                      alt={filteredArticles[0].title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-[0.6]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-8 space-y-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-dim)] border border-[var(--accent)]/30 px-3 py-1 rounded-full backdrop-blur-sm">
                        <BookOpen size={9} /> {text.featuredBadge}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight group-hover:text-[var(--accent)] transition-colors max-w-2xl text-balance">
                        {filteredArticles[0].title}
                      </h2>
                      <p className="text-sm text-white/70 leading-relaxed max-w-xl line-clamp-2">
                        {filteredArticles[0].excerpt}
                      </p>
                      <div className="flex items-center gap-4 pt-1 text-white/50 text-[11px]">
                        <span className="flex items-center gap-1"><Eye size={11} /> {filteredArticles[0].views_count}</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(filteredArticles[0].created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1.5 font-semibold text-white group-hover:text-[var(--accent)] transition-colors">
                          {text.readMore} <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Rest of articles — 3-column grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {(search ? filteredArticles : filteredArticles.slice(1)).map((article, idx) => (
                <motion.div key={article.id} variants={itemVariants}>
                  <Link href={`/articles/${article.slug}`}>
                    <div className="group card-interactive overflow-hidden flex flex-col h-full cursor-pointer">

                      {/* Cover */}
                      <div className="relative h-48 overflow-hidden bg-[var(--border)]/10 shrink-0">
                        <img
                          src={article.cover_image_url || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-[0.85] dark:brightness-[0.7]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/60 to-transparent" />
                        <span className="absolute top-3 left-3 text-[9px] font-bold px-2.5 py-1 rounded-full bg-[var(--background)]/90 border border-[var(--border)] text-[var(--accent)] backdrop-blur-sm">
                          {text.articleBadge}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-bold text-sm leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3">
                            {article.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--border)]/60 pt-3 text-[11px] text-[var(--muted)]">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Eye size={10} /> {article.views_count}</span>
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {Math.max(1, Math.ceil(article.excerpt.split(" ").length / 40))} мин
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(article.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 font-semibold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                            {text.readMore} <ArrowRight size={10} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-20 text-[var(--muted)] text-sm font-light">
                {text.nothingFound}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}