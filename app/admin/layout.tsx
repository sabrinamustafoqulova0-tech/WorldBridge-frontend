"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { LogoMark } from "../../components/LogoMark";
import { FileText, Layers, ArrowLeft, LayoutDashboard, Users, Lightbulb } from "lucide-react";
import api from "../../lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [ready, setReady] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    checkAuth().finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated || !user || !user.is_admin) {
      router.push("/login");
      return;
    }
    api.get("/suggestions/admin/pending-count")
      .then(res => setPendingCount(res.data.pending_count ?? 0))
      .catch(() => {});
  }, [ready, isAuthenticated, user, router]);

  if (!ready || !isAuthenticated || !user?.is_admin) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const NAV_ITEMS = [
    { href: "/admin",             label: "Дашборд",       icon: LayoutDashboard, badge: 0 },
    { href: "/admin/articles",    label: "Статьи",         icon: FileText, badge: 0 },
    { href: "/admin/programs",    label: "Программы",      icon: Layers, badge: 0 },
    { href: "/admin/users",       label: "Пользователи",   icon: Users, badge: 0 },
    { href: "/admin/suggestions", label: "Предложения",    icon: Lightbulb, badge: pendingCount },
  ];

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] font-sans flex">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-[var(--border)] flex flex-col glass">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-[var(--border)] shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <LogoMark size={14} className="text-white" />
          </div>
          <span className="font-bold text-[13px] tracking-tight">WorldBridge</span>
          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 shrink-0">
            CMS
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] px-3 pt-2 pb-1.5">
            Контент
          </p>
          {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
            const isActive = href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)]"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--accent)] rounded-r-full" />
                )}
                <Icon size={14} />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="p-3 border-t border-[var(--border)] shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/10 transition-colors"
          >
            <ArrowLeft size={13} />
            На сайт
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 overflow-auto min-h-[100dvh]">
        {children}
      </main>
    </div>
  );
}
