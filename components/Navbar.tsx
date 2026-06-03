"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAuthStore } from "../store/authStore";
import { useLangStore } from "../store/langStore";
import { useAIConsultantStore } from "../store/aiConsultantStore";
import { translations } from "../locales/translations";
import { Moon, Sun, User, LogOut, Sparkles, Menu, X, Settings } from "lucide-react";
import { LogoMark } from "./LogoMark";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { lang, setLang } = useLangStore();
  const openAIConsultant = useAIConsultantStore((s) => s.openWith);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render main navbar on login, register, and admin routes
  const isNoNavbar = pathname === "/login" || pathname === "/register" || pathname.startsWith("/admin");
  if (isNoNavbar) return null;

  const navText = translations[lang]?.nav || translations.ru.nav;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (path: string) => {
    if (path === "/home") {
      return pathname === "/home";
    }
    return pathname.startsWith(path);
  };

  const linkClass = (path: string) =>
    `relative text-[13px] font-semibold tracking-tight transition-all duration-200 ${
      isActive(path)
        ? "text-[var(--accent)] font-bold"
        : "text-[var(--muted)] hover:text-[var(--foreground)]"
    }`;

  const links = [
    { href: "/home", label: navText.home },
    { href: "/programs", label: navText.programs },
    { href: "/countries", label: navText.destinations },
    { href: "/articles", label: navText.insights },
    { href: "/calculator", label: navText.estimator },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-4 md:px-6 glass border-b border-[var(--border)] dark:glass light:glass-light transition-all duration-300">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2 group shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center transition-transform group-hover:scale-110">
          <LogoMark size={14} className="text-white" />
        </div>
        <span className="font-bold text-[14px] tracking-tight">WorldBridge</span>
      </Link>

      {/* Desktop Navigation Links */}
      <div className="hidden lg:flex items-center gap-7">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={linkClass(link.href)}>
            {link.label}
            {isActive(link.href) && (
              <span className="absolute -bottom-[18px] inset-x-0 h-0.5 bg-[var(--accent)] rounded-full" />
            )}
          </Link>
        ))}
      </div>

      {/* Controls & Actions */}
      <div className="flex items-center gap-2.5">
        {/* Language selector */}
        {mounted && (
          <div className="relative flex items-center">
            <select
              className="bg-transparent text-[12px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] focus:outline-none cursor-pointer transition-colors appearance-none pr-1"
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
            >
              <option value="ru">RU</option>
              <option value="en">EN</option>
              <option value="tg">TG</option>
            </select>
          </div>
        )}

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        )}

        {/* AI Consultant Trigger */}
        {mounted && (
          <button
            onClick={() => openAIConsultant("consultation")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-dim)] border border-[var(--accent)]/20 text-[var(--accent)] text-[12px] font-bold hover:bg-[var(--accent)]/15 transition-all"
          >
            <Sparkles size={11} className="animate-pulse-dot" />
            AI
          </button>
        )}

        {/* User Auth Info / Navigation */}
        {mounted && (
          <>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Admin panel button — only for admins */}
                {user?.is_admin && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-[12px] font-bold hover:bg-violet-500/15 transition-all"
                  >
                    <Settings size={11} />
                    Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <User size={13} />
                  <span className="hidden sm:inline">{user?.full_name?.split(" ")[0] || navText.profile}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)] hover:text-red-500"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-[12px] font-bold hover:opacity-95 transition-all active:scale-[0.98]"
              >
                {navText.signup}
              </Link>
            )}
          </>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          {isOpen ? <X size={15} /> : <Menu size={15} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="absolute top-14 left-0 right-0 glass border-b border-[var(--border)] dark:glass light:glass-light flex flex-col p-4 gap-3 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive(link.href)
                  ? "bg-[var(--accent-dim)] text-[var(--accent)] font-bold"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
