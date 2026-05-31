"use client";

import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Globe,
  Moon,
  Sun,
  ArrowLeft,
  LogOut,
  Heart,
  CheckCircle2,
  MapPin,
  Sparkles,
  ChevronRight,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import api from "../../lib/api";

interface FavoriteProgram {
  id: number;
  program_id: number;
  program: {
    id: number;
    slug: string;
    title: string;
    category: string;
    level: string;
    short_description: string;
  };
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

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteProgram[]>([]);
  const [checklistCount, setChecklistCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [favLoading, setFavLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const [favRes, checkRes] = await Promise.all([
          api.get("/favorites"),
          api.get("/checklists"),
        ]);
        setFavorites(favRes.data.items || []);
        setChecklistCount(checkRes.data.total || 0);
        const done = (checkRes.data.items || []).filter((i: any) => i.is_done).length;
        setDoneCount(done);
      } catch {
        setFavorites([]);
      } finally {
        setFavLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleRemoveFavorite = async (programId: number) => {
    try {
      await api.delete(`/favorites/${programId}`);
      setFavorites((prev) => prev.filter((f) => f.program_id !== programId));
    } catch { }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "WB";

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
        <div className="flex items-center space-x-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)]"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-400 transition-colors"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </nav>

      <main className="pt-24 px-5 md:px-8 max-w-4xl mx-auto w-full space-y-6 flex-1">

        {/* ─── Profile Hero ───────────────────────────────────────── */}
        <div className="relative glass border border-[var(--border)] rounded-3xl p-6 md:p-8 overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)] rounded-full blur-[60px] opacity-10 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-teal-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[var(--accent)]/20">
              {initials}
            </div>
            <div className="flex-1 space-y-2">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{user.full_name}</h1>
                <p className="text-xs sm:text-sm text-[var(--muted)]">{user.email}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider bg-[var(--border)]/20 px-2.5 py-1 rounded-md">
                  <MapPin size={9} className="text-[var(--accent)]" />
                  {user.country || "Не указана страна"}
                </span>
                {user.is_admin && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                    <Sparkles size={9} />
                    Администратор
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Stats grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Избранных программ",
              value: favorites.length,
              icon: <Heart size={14} className="text-rose-500" />,
              bg: "bg-rose-500/10",
            },
            {
              label: "Пунктов в чеклисте",
              value: checklistCount,
              icon: <ClipboardList size={14} className="text-[var(--accent)]" />,
              bg: "bg-[var(--accent-dim)]",
            },
            {
              label: "Выполнено задач",
              value: doneCount,
              icon: <CheckCircle2 size={14} className="text-emerald-500" />,
              bg: "bg-emerald-500/10",
            },
          ].map((stat, i) => (
            <div key={i} className="glass border border-[var(--border)] rounded-2xl p-4 flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  {stat.icon}
                </div>
                <span className="text-2xl font-black tracking-tight">{stat.value}</span>
              </div>
              <p className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ─── Favourites ─────────────────────────────────────────── */}
        <div className="glass border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
              <Heart size={14} className="text-rose-500" /> Избранные программы
            </h2>
            <Link href="/programs" className="text-xs text-[var(--accent)] hover:underline font-semibold flex items-center gap-0.5">
              Все программы <ChevronRight size={12} />
            </Link>
          </div>

          {favLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-5 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--border)]/20 flex items-center justify-center text-[var(--muted)]">
                <Heart size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold">Нет избранных программ</p>
                <p className="text-xs text-[var(--muted)]">Добавляйте программы в избранное чтобы быстро находить их</p>
              </div>
              <Link href="/programs" className="bg-[var(--foreground)] text-[var(--background)] text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all">
                Просмотреть программы
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {favorites.map((fav) => {
                const style = CATEGORY_ACCENT[fav.program?.category] || "text-[var(--muted)] bg-[var(--border)] border-[var(--border)]";
                return (
                  <li key={fav.id} className="group px-5 py-4 flex items-center justify-between gap-4 hover:bg-[var(--card)] transition-colors">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style}`}>
                          {fav.program?.category}
                        </span>
                      </div>
                      <p className="font-bold text-xs sm:text-sm truncate group-hover:text-[var(--accent)] transition-colors">
                        {fav.program?.title}
                      </p>
                      <p className="text-[11px] text-[var(--muted)] line-clamp-1">
                        {fav.program?.short_description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRemoveFavorite(fav.program_id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted)] opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                        title="Удалить из избранного"
                      >
                        <Heart size={12} />
                      </button>
                      <Link
                        href={`/programs/${fav.program?.slug}`}
                        className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all"
                      >
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Checklist link */}
          <Link
            href="/checklist"
            className="flex items-center justify-between px-5 py-4 hover:bg-[var(--card)] transition-colors border-t border-[var(--border)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent-dim)] border border-[var(--accent)]/20 flex items-center justify-center">
                <ClipboardList size={14} className="text-[var(--accent)]" />
              </div>
              <span className="text-sm font-bold">Мой чеклист</span>
            </div>
            <ChevronRight size={14} className="text-[var(--muted)]" />
          </Link>
        </div>

      </main>
    </div>
  );
}