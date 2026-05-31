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
  User, 
  LogOut, 
  FileText, 
  CheckCircle2, 
  Clock, 
  MapPin,
  Sparkles,
  ChevronRight
} from "lucide-react";
import api from "../../lib/api";

interface Application {
  id: number;
  program_id: number;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  APPROVED: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  REJECTED: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  REVIEWING: "text-sky-500 bg-sky-500/10 border-sky-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "На рассмотрении",
  APPROVED: "Одобрена",
  REJECTED: "Отклонена",
  REVIEWING: "Проверяется",
};

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchApplications = async () => {
      try {
        const res = await api.get("/applications/my");
        setApplications(res.data);
      } catch {
        setApplications([]);
      } finally {
        setAppsLoading(false);
      }
    };
    fetchApplications();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "WB";

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

      {/* ─── Profile Header / Hero ──────────────────────────────── */}
      <main className="pt-24 px-5 md:px-8 max-w-4xl mx-auto w-full space-y-6 flex-1">
        
        <div className="relative glass border border-[var(--border)] rounded-3xl p-6 md:p-8 overflow-hidden shadow-sm">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)] rounded-full blur-[60px] opacity-10 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 z-10">
            {/* Avatar */}
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

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Всего заявок", value: applications.length, icon: <FileText size={14} className="text-[var(--accent)]" />, bg: "bg-[var(--accent-dim)]" },
            { label: "Одобрено", value: applications.filter(a => a.status === "APPROVED").length, icon: <CheckCircle2 size={14} className="text-emerald-500" />, bg: "bg-emerald-500/10" },
            { label: "На рассмотрении", value: applications.filter(a => a.status === "PENDING").length, icon: <Clock size={14} className="text-amber-500" />, bg: "bg-amber-500/10" },
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

        {/* Applications List */}
        <div className="glass border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
              <FileText size={14} className="text-[var(--accent)]" /> Мои заявки
            </h2>
            <Link href="/programs" className="text-xs text-[var(--accent)] hover:underline font-semibold flex items-center gap-0.5">
              Все программы <ChevronRight size={12} />
            </Link>
          </div>

          {appsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-5 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--border)]/20 flex items-center justify-center text-[var(--muted)]">
                <FileText size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold">У вас пока нет заявок</p>
                <p className="text-xs text-[var(--muted)]">Подайте заявку на интересующую вас программу переезда</p>
              </div>
              <Link href="/programs" className="bg-[var(--foreground)] text-[var(--background)] text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all">
                Просмотреть программы
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {applications.map((app) => (
                <li key={app.id} className="px-5 py-4 flex items-center justify-between hover:bg-[var(--card)] transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs sm:text-sm">Заявка на программу #{app.program_id}</p>
                    <p className="text-[11px] text-[var(--muted)]">
                      Создана: {new Date(app.created_at).toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${STATUS_COLORS[app.status] || "bg-[var(--border)] text-[var(--muted)]"}`}>
                    {STATUS_LABELS[app.status] || app.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
