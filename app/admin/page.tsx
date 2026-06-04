"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";
import {
  Layers, FileText, Users, Eye, Plus, TrendingUp,
  CheckCircle, XCircle, ArrowRight, Lightbulb,
} from "lucide-react";
import { CountryFlag } from "../../components/CountryFlag";

interface StatsData {
  totalPrograms: number;
  publishedPrograms: number;
  totalArticles: number;
  publishedArticles: number;
  totalUsers: number;
  totalViews: number;
  pendingSuggestions: number;
  totalSuggestions: number;
}

interface RecentProgram {
  id: number;
  slug: string;
  title: string;
  country_slug: string | null;
  category: string;
  is_published: boolean;
  views_count: number;
}

interface RecentArticle {
  id: number;
  slug: string;
  title: string;
  is_published: boolean;
  views_count: number;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  ausbildung: "Аусбильдунг", fsj: "FSJ", au_pair: "Au Pair",
  schule: "Школа", arbeit: "Работа", studium: "Обучение",
  volunteering: "Волонтерство", internship: "Стажировка",
  language: "Языковые курсы", immigration: "Иммиграция",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentPrograms, setRecentPrograms] = useState<RecentProgram[]>([]);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [progRes, artRes, usersRes, suggestRes] = await Promise.all([
          api.get("/programs/admin/all", { params: { page: 1, size: 100 } }),
          api.get("/articles", { params: { admin_view: true, page: 1, size: 100 } }),
          api.get("/users"),
          api.get("/suggestions/admin/all", { params: { page: 1, size: 1 } }),
        ]);

        const programs: RecentProgram[] = progRes.data.items;
        const articles: RecentArticle[] = artRes.data.items;
        const users = usersRes.data.items ?? usersRes.data ?? [];

        const publishedProgs = programs.filter((p) => p.is_published).length;
        const publishedArts = articles.filter((a) => a.is_published).length;
        const totalViews = programs.reduce((s, p) => s + (p.views_count || 0), 0)
          + articles.reduce((s, a) => s + (a.views_count || 0), 0);

        setStats({
          totalPrograms: progRes.data.total,
          publishedPrograms: publishedProgs,
          totalArticles: artRes.data.total,
          publishedArticles: publishedArts,
          totalUsers: Array.isArray(users) ? users.length : (usersRes.data.total ?? 0),
          totalViews,
          pendingSuggestions: suggestRes.data.pending_count ?? 0,
          totalSuggestions: suggestRes.data.total ?? 0,
        });

        setRecentPrograms(programs.slice(0, 5));
        setRecentArticles(articles.slice(0, 5));
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const STAT_CARDS = stats ? [
    {
      label: "Программы",
      value: stats.totalPrograms,
      sub: `${stats.publishedPrograms} опубликовано`,
      icon: Layers,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      href: "/admin/programs",
      badge: 0,
    },
    {
      label: "Статьи",
      value: stats.totalArticles,
      sub: `${stats.publishedArticles} опубликовано`,
      icon: FileText,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      href: "/admin/articles",
      badge: 0,
    },
    {
      label: "Пользователи",
      value: stats.totalUsers,
      sub: "зарегистрировано",
      icon: Users,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      href: "/admin/users",
      badge: 0,
    },
    {
      label: "Просмотры",
      value: stats.totalViews.toLocaleString("ru-RU"),
      sub: "всего по контенту",
      icon: Eye,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      href: null,
      badge: 0,
    },
    {
      label: "Предложения",
      value: stats.totalSuggestions,
      sub: stats.pendingSuggestions > 0
        ? `${stats.pendingSuggestions} на рассмотрении`
        : "предложений программ",
      icon: Lightbulb,
      color: stats.pendingSuggestions > 0 ? "text-amber-500" : "text-orange-500",
      bg: stats.pendingSuggestions > 0 ? "bg-amber-500/10" : "bg-orange-500/10",
      href: "/admin/suggestions",
      badge: stats.pendingSuggestions,
    },
  ] : [];

  return (
    <div className="min-h-full pb-16">
      <main className="pt-8 px-6 md:px-8 max-w-5xl mx-auto w-full space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Добро пожаловать, {user?.full_name?.split(" ")[0] || "Admin"} 👋
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Обзор платформы WorldBridge — программы, статьи и пользователи.
          </p>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card border-[var(--border)] rounded-2xl p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {STAT_CARDS.map((card) => {
              const Icon = card.icon;
              const inner = (
                <div className="card border border-[var(--border)] rounded-2xl p-5 space-y-3 hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-md)] transition-all">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-2xl ${card.bg} flex items-center justify-center`}>
                      <Icon size={16} className={card.color} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {card.badge > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none flex items-center justify-center">
                          {card.badge}
                        </span>
                      )}
                      {card.href && <ArrowRight size={12} className="text-[var(--muted)]" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black tracking-tight">{card.value}</p>
                    <p className="text-xs text-[var(--muted)] font-semibold mt-0.5">
                      {card.label}
                    </p>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">{card.sub}</p>
                  </div>
                </div>
              );
              return card.href ? (
                <Link key={card.label} href={card.href}>{inner}</Link>
              ) : (
                <div key={card.label}>{inner}</div>
              );
            })}
          </div>
        )}

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/programs" className="btn btn-primary btn-sm">
            <Plus size={13} /> Добавить программу
          </Link>
          <Link href="/admin/articles" className="btn btn-secondary btn-sm">
            <Plus size={13} /> Добавить статью
          </Link>
        </div>

        {/* Recent content */}
        {!loading && (
          <div className="grid md:grid-cols-2 gap-6">

            {/* Recent programs */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="text-sm font-bold">Последние программы</h2>
                <Link href="/admin/programs" className="text-[11px] text-[var(--accent)] font-semibold hover:underline">
                  Все →
                </Link>
              </div>
              <ul className="divide-y divide-[var(--border)]/60">
                {recentPrograms.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--border)]/5 transition-colors">
                    {p.country_slug && <CountryFlag slug={p.country_slug} size="sm" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate">{p.title}</p>
                      <p className="text-[10px] text-[var(--muted)]">
                        {CATEGORY_LABELS[p.category?.toLowerCase()] || p.category}
                      </p>
                    </div>
                    {p.is_published ? (
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={13} className="text-[var(--muted)] shrink-0" />
                    )}
                  </li>
                ))}
                {recentPrograms.length === 0 && (
                  <li className="px-5 py-8 text-center text-xs text-[var(--muted)]">Нет программ</li>
                )}
              </ul>
            </div>

            {/* Recent articles */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="text-sm font-bold">Последние статьи</h2>
                <Link href="/admin/articles" className="text-[11px] text-[var(--accent)] font-semibold hover:underline">
                  Все →
                </Link>
              </div>
              <ul className="divide-y divide-[var(--border)]/60">
                {recentArticles.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--border)]/5 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                      <FileText size={12} className="text-sky-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate">{a.title}</p>
                      <p className="text-[10px] text-[var(--muted)]">
                        <Eye size={9} className="inline mr-0.5" />{a.views_count} · {formatDate(a.created_at)}
                      </p>
                    </div>
                    {a.is_published ? (
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={13} className="text-[var(--muted)] shrink-0" />
                    )}
                  </li>
                ))}
                {recentArticles.length === 0 && (
                  <li className="px-5 py-8 text-center text-xs text-[var(--muted)]">Нет статей</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Growth hint */}
        <div className="card border-[var(--border)] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-sm font-bold">Платформа растёт</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Добавляйте новые программы и статьи — они появятся на сайте сразу после публикации.
            </p>
          </div>
          <Link
            href="/admin/programs"
            className="ml-auto shrink-0 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:bg-emerald-500 transition-all"
          >
            Добавить
          </Link>
        </div>

      </main>
    </div>
  );
}
