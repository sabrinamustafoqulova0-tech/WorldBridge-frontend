"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, Globe, BookOpen, Clock, Share2, CornerDownRight } from "lucide-react";
import { useTheme } from "next-themes";
import api from "../../../lib/api";
import { useLangStore } from "../../../store/langStore";
import { translations } from "../../../locales/translations";
import { useAuthStore } from "../../../store/authStore";
import { useAIConsultantStore } from "../../../store/aiConsultantStore";

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url?: string;
  is_published: boolean;
  views_count: number;
  created_at: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLangStore();
  const { isAuthenticated } = useAuthStore();
  const openAIConsultant = useAIConsultantStore((s) => s.openWith);
  const navText = translations[lang]?.nav || translations.ru.nav;
  const t = (translations[lang] as any)?.articleDetail || (translations.ru as any).articleDetail;

  const [article, setArticle] = useState<Article | null>(null);
  const [suggested, setSuggested] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!params?.slug) return;

    const fetchArticleAndSuggestions = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Fetch current article
        const res = await api.get(`/articles/${params.slug}`);
        setArticle(res.data);

        // Fetch suggestions (other articles)
        const listRes = await api.get("/articles");
        if (listRes.data && listRes.data.items) {
          const others = listRes.data.items.filter(
            (a: Article) => a.slug !== params.slug
          );
          setSuggested(others.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch article details:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleAndSuggestions();
  }, [params?.slug, lang]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        <p className="text-xs text-[var(--muted)] mt-4 tracking-wider">Загрузка статьи...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-center items-center px-4">
        <div className="card border-[var(--border)] p-8 rounded-2xl max-w-md w-full text-center space-y-4">
          <BookOpen className="w-12 h-12 mx-auto text-[var(--muted)] opacity-50" />
          <h2 className="text-xl font-bold">{t.notFound}</h2>
          <p className="text-xs text-[var(--muted)]">
            {t.notFoundDesc}
          </p>
          <button
            onClick={() => router.push("/articles")}
            className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:bg-emerald-500 transition-colors"
          >
            {t.backBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col pb-24">

      {/* Main Content Area */}
      <main className="pt-24 px-4 md:px-6 max-w-[1440px] mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Article Container */}
          <article className="lg:col-span-2 space-y-8">
            
            {/* Header Metadata */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted)] font-medium">
                <span className="px-2 py-0.5 rounded-full border border-[var(--accent)]/20 text-[var(--accent)] bg-[var(--accent)]/5">
                  {t.badge}
                </span>
                <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {new Date(article.created_at).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </span>
                <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                <span className="flex items-center gap-1">
                  <Eye size={11} /> {article.views_count}
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                {article.title}
              </h1>

              <p className="text-sm md:text-base text-[var(--muted)] italic leading-relaxed border-l-2 border-[var(--accent)]/40 pl-4 py-1">
                {article.excerpt}
              </p>
            </div>

            {/* Premium Cover Image */}
            {article.cover_image_url && (
              <div className="w-full h-56 md:h-96 rounded-2xl overflow-hidden border border-[var(--border)] relative bg-[var(--border)]/10">
                <img
                  src={article.cover_image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Rich Text Body Content */}
            <div className="card border-[var(--border)] rounded-2xl p-6 md:p-8 space-y-6">
              <div
                className="article-content text-sm md:text-base leading-relaxed text-[var(--foreground)] opacity-95 space-y-4"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </article>

          {/* Sidebar / Recommended Articles */}
          <aside className="space-y-6">
            <div className="card border-[var(--border)] rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                <BookOpen size={14} />
                {t.readAlso}
              </h3>
              
              <div className="divide-y divide-[var(--border)]/60">
                {suggested.length > 0 ? (
                  suggested.map((item) => (
                    <Link
                      key={item.id}
                      href={`/articles/${item.slug}`}
                      className="group block py-4 first:pt-0 last:pb-0"
                    >
                      <span className="text-[10px] text-[var(--muted)] flex items-center gap-1 mb-1">
                        <Clock size={10} />
                        {new Date(item.created_at).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short"
                        })}
                      </span>
                      <h4 className="font-bold text-xs md:text-sm group-hover:text-[var(--accent)] transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[var(--muted)] line-clamp-2 mt-1 leading-relaxed">
                        {item.excerpt}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-[var(--muted)] py-2">
                    {t.noSuggested}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Consultation Promo Box */}
            <div className="glass border border-[var(--accent)]/15 bg-gradient-to-br from-[var(--card)] to-[var(--accent-dim)] rounded-2xl p-6 text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)] rounded-full blur-[35px] opacity-10 pointer-events-none" />
              <Globe className="w-10 h-10 mx-auto text-[var(--accent)]" />
              <h4 className="font-bold text-sm">{t.helpTitle}</h4>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                {t.helpDesc}
              </p>
              {isAuthenticated ? (
                <button
                  onClick={() => openAIConsultant("chat")}
                  className="block w-full py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
                >
                  {t.aiBtn}
                </button>
              ) : (
                <Link
                  href="/register"
                  className="block w-full py-2 rounded-xl border border-[var(--border)] text-[var(--foreground)] text-xs font-semibold hover:border-[var(--accent)]/40 hover:bg-[var(--accent-dim)] transition-colors shadow-sm"
                >
                  {t.loginBtn}
                </Link>
              )}
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
