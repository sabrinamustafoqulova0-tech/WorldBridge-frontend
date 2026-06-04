"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAuthStore } from "../store/authStore";
import { useLangStore } from "../store/langStore";
import { useAIConsultantStore } from "../store/aiConsultantStore";
import { translations } from "../locales/translations";
import { Moon, Sun, User, LogOut, Sparkles, Menu, X, Settings, ChevronDown } from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  const isNoNavbar = pathname === "/login" || pathname === "/register" || pathname.startsWith("/admin");
  if (isNoNavbar) return null;

  const navText = translations[lang]?.nav || translations.ru.nav;

  const handleLogout = () => { logout(); router.push("/login"); };

  const isActive = (path: string) =>
    path === "/home" ? pathname === "/home" : pathname.startsWith(path);

  const links = [
    { href: "/home",       label: navText.home        },
    { href: "/programs",   label: navText.programs    },
    { href: "/countries",  label: navText.destinations },
    { href: "/articles",   label: navText.insights    },
    { href: "/calculator", label: navText.estimator   },
  ];

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-4 md:px-6 bg-[var(--card)] border-b border-[var(--border)] transition-shadow duration-200 ${scrolled ? "shadow-[var(--shadow-sm)]" : ""}`}>

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-[10px] bg-[var(--accent)] flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.35)] transition-transform group-hover:scale-105">
            <LogoMark size={16} className="text-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-[var(--foreground)]">WorldBridge</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-0.5">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">

          {/* Language */}
          {mounted && (
            <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--background-subtle)] p-0.5 gap-0.5">
              {(["ru", "en", "tg"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase transition-all ${
                    lang === l
                      ? "bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow-xs)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}

          {/* Theme */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] transition-colors"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}

          {/* AI */}
          {mounted && (
            <button
              onClick={() => openAIConsultant("consultation")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-[12px] font-semibold hover:bg-emerald-500 transition-colors shadow-[0_2px_6px_rgba(16,185,129,0.3)]"
            >
              <Sparkles size={11} className="animate-pulse-dot" />
              AI
            </button>
          )}

          {/* User */}
          {mounted && (
            <>
              {isAuthenticated ? (
                <div className="flex items-center gap-1">
                  {user?.is_admin && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                    >
                      <Settings size={12} />
                      <span className="hidden sm:inline">Admin</span>
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px] font-bold ring-1 ring-[var(--accent)]/20 shrink-0">
                      {user?.full_name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:inline">{user?.full_name?.split(" ")[0] || navText.profile}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-[13px] font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]"
                >
                  {navText.signup}
                </Link>
              )}
            </>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] transition-colors ml-0.5"
          >
            {isOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu — full overlay drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute top-14 left-0 right-0 bg-[var(--card)] border-b border-[var(--border)] shadow-[var(--shadow-lg)] animate-slide-up">
            <div className="px-4 py-3 space-y-1">
              {links.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            {isAuthenticated && (
              <div className="px-4 pb-4 pt-1 border-t border-[var(--border)] mt-1 flex items-center gap-3">
                <Link href="/profile" onClick={() => setIsOpen(false)} className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
                  {navText.profile}
                </Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-sm font-medium text-red-500">
                  {navText.logout}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
