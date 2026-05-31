"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "next-themes";
import { useLangStore } from "../store/langStore";
import { translations } from "../locales/translations";
import { ArrowRight, Globe, Moon, Sun, Languages, MapPin, TrendingUp, Shield, Zap } from "lucide-react";

const DESTINATIONS = [
  "Berlin", "Munich", "Paris", "Warsaw", "Zurich", "Vienna",
  "Toronto", "Prague", "Istanbul", "Oslo", "Helsinki", "Stockholm",
  "Brussels", "Amsterdam", "Lisbon", "Madrid", "Budapest", "Lyon",
];

const STATS = [
  { value: "47", label: "стран", sub: "на 4 континентах" },
  { value: "2,341", label: "программ", sub: "проверено и обновлено" },
  { value: "18.4K", label: "заявок", sub: "успешно обработано" },
  { value: "91.3%", label: "успешных кейсов", sub: "данные 2024 года" },
];

const GLOBE_NODES = [
  { cx: "50%", cy: "30%", r: 3 },
  { cx: "65%", cy: "42%", r: 2.5 },
  { cx: "38%", cy: "55%", r: 2 },
  { cx: "72%", cy: "60%", r: 3.5 },
  { cx: "28%", cy: "38%", r: 2 },
  { cx: "55%", cy: "68%", r: 2.5 },
  { cx: "80%", cy: "35%", r: 2 },
  { cx: "20%", cy: "62%", r: 3 },
  { cx: "60%", cy: "22%", r: 2 },
  { cx: "44%", cy: "75%", r: 2 },
];

const GLOBE_LINES = [
  ["50%,30%", "65%,42%"],
  ["65%,42%", "72%,60%"],
  ["50%,30%", "28%,38%"],
  ["28%,38%", "38%,55%"],
  ["72%,60%", "55%,68%"],
  ["38%,55%", "55%,68%"],
  ["65%,42%", "80%,35%"],
  ["80%,35%", "60%,22%"],
  ["20%,62%", "38%,55%"],
];

function GlobeViz() {
  return (
    <div className="relative w-full h-full min-h-[420px] select-none">
      {/* Outer ring */}
      <div className="absolute inset-8 rounded-full border border-[var(--accent)]/10 animate-spin-slow" />
      <div className="absolute inset-16 rounded-full border border-[var(--accent)]/06" />

      {/* Central glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-[var(--accent)]/8 blur-2xl" />
      </div>

      {/* SVG network */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {GLOBE_LINES.map(([a, b], i) => {
          const [x1, y1] = a.split(",");
          const [x2, y2] = b.split(",");
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(16,185,129,0.2)" strokeWidth="0.4"
              strokeDasharray="1 0.5" />
          );
        })}
        {GLOBE_NODES.map((n, i) => (
          <g key={i}>
            <circle cx={n.cx} cy={n.cy} r={n.r + 3} fill="rgba(16,185,129,0.04)" />
            <circle cx={n.cx} cy={n.cy} r={n.r}
              fill="rgba(16,185,129,0.7)"
              className="animate-pulse-dot"
              style={{ animationDelay: `${i * 240}ms` }} />
          </g>
        ))}
      </svg>

      {/* Floating location chips */}
      {[
        { label: "Berlin, DE", style: "top-[18%] right-[12%]", delay: "0ms" },
        { label: "Toronto, CA", style: "top-[55%] right-[4%]", delay: "300ms" },
        { label: "Prague, CZ", style: "bottom-[20%] left-[10%]", delay: "600ms" },
      ].map(({ label, style, delay }) => (
        <div key={label}
          className={`absolute ${style} glass rounded-full px-3 py-1.5 flex items-center gap-1.5 animate-float`}
          style={{ animationDelay: delay }}>
          <MapPin size={10} className="text-[var(--accent)]" />
          <span className="text-[11px] font-medium text-[var(--foreground)]/70">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { lang, setLang } = useLangStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const text = translations[lang]?.landing || translations.ru.landing;
  const navText = translations[lang]?.nav || translations.ru.nav;

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--background)] text-[var(--foreground)]">

      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 glass dark:glass border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center transition-transform group-hover:scale-110">
            <Globe size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[15px] tracking-tight">WorldBridge</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--muted)]">
          <Link href="/home" className="hover:text-[var(--foreground)] transition-colors">{navText.home}</Link>
          <Link href="/countries" className="hover:text-[var(--foreground)] transition-colors">{navText.destinations}</Link>
          <Link href="/programs" className="hover:text-[var(--foreground)] transition-colors">{navText.programs}</Link>
        </nav>

        <div className="flex items-center gap-3">
          {mounted && (
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="bg-transparent text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] focus:outline-none cursor-pointer transition-colors appearance-none"
            >
              <option value="ru">RU</option>
              <option value="en">EN</option>
              <option value="tg">TG</option>
            </select>
          )}

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)]"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}

          {isAuthenticated ? (
            <Link href="/home"
              className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold hover:bg-emerald-500 transition-all active:scale-95">
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"
                className="px-4 py-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                {navText.login}
              </Link>
              <Link href="/register"
                className="px-4 py-1.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold hover:opacity-85 transition-all active:scale-95">
                {navText.signup}
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section className="flex-1 flex items-center pt-16 min-h-[100dvh]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 xl:gap-20 items-center py-24">

          {/* Left: Copy */}
          <div className="space-y-8">
            {/* Eyebrow */}
            <div className="reveal-up flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-dim)] text-[var(--accent)] text-xs font-semibold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse-dot" />
                47 стран — 2,341 программа
              </span>
            </div>

            {/* H1 — left aligned, NOT centered */}
            <h1 className="reveal-up delay-100 text-5xl md:text-6xl xl:text-7xl font-bold tracking-tighter leading-[1.02] text-balance">
              {text.title}
            </h1>

            <p className="reveal-up delay-200 text-base md:text-lg text-[var(--muted)] leading-relaxed max-w-[52ch] font-light">
              {text.subtitle}
            </p>

            {/* CTA row */}
            <div className="reveal-up delay-300 flex flex-wrap items-center gap-4">
              <Link href={isAuthenticated ? "/home" : "/register"}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:bg-emerald-500 transition-all duration-200 active:scale-[0.97] shadow-[0_4px_14px_rgba(16,185,129,0.25)]">
                {isAuthenticated ? text.home : text.register}
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              {!isAuthenticated && (
                <Link href="/countries"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-semibold text-sm hover:border-[var(--accent)]/40 hover:bg-[var(--accent-dim)] transition-all duration-200">
                  {navText.destinations}
                </Link>
              )}
            </div>

            {/* Mini stats under CTA */}
            <div className="reveal-up delay-400 flex flex-wrap gap-6 pt-2">
              {STATS.slice(0, 3).map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold tracking-tight">{s.value}</div>
                  <div className="text-xs text-[var(--muted)] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Globe visualization */}
          <div className="hidden lg:block reveal-fade delay-200 h-[480px] relative">
            <GlobeViz />
          </div>
        </div>
      </section>

      {/* ─── Destinations Marquee ─────────────────────────────── */}
      <div className="border-y border-[var(--border)] overflow-hidden py-4 bg-[var(--card)]">
        <div className="flex animate-marquee whitespace-nowrap gap-0 will-change-transform">
          {[...DESTINATIONS, ...DESTINATIONS].map((d, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-6 text-sm font-medium text-[var(--muted)]">
              <span className="w-1 h-1 rounded-full bg-[var(--accent)] shrink-0" />
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Features — 2-column zig-zag, NO 3-column grid ────── */}
      <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto w-full">
        <div className="mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-3">Возможности</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
            {text.programs}
          </h2>
        </div>

        <div className="space-y-6">
          {/* Row 1: 2-col left emphasis */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
            <div className="spotlight glass dark:bg-[var(--card)] rounded-3xl p-8 border border-[var(--border)] hover:border-[var(--accent)]/25 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-dim)] flex items-center justify-center mb-6">
                <TrendingUp size={18} className="text-[var(--accent)]" />
              </div>
              <h3 className="text-xl font-bold mb-3">{text.program1}</h3>
              <p className="text-[var(--muted)] leading-relaxed text-sm max-w-[55ch]">{text.desc1}</p>
            </div>

            <div className="spotlight glass dark:bg-[var(--card)] rounded-3xl p-8 border border-[var(--border)] hover:border-[var(--accent)]/25 transition-all duration-300 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-dim)] flex items-center justify-center mb-6">
                <Shield size={18} className="text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">{text.program2}</h3>
                <p className="text-[var(--muted)] text-sm leading-relaxed">{text.desc2}</p>
              </div>
            </div>
          </div>

          {/* Row 2: 2-col right emphasis */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
            <div className="spotlight glass dark:bg-[var(--card)] rounded-3xl p-8 border border-[var(--border)] hover:border-[var(--accent)]/25 transition-all duration-300 flex flex-col justify-center items-center text-center">
              <div className="text-5xl font-bold tracking-tighter text-[var(--accent)] mb-2">91.3%</div>
              <div className="text-sm text-[var(--muted)]">{STATS[3].sub}</div>
            </div>

            <div className="spotlight glass dark:bg-[var(--card)] rounded-3xl p-8 border border-[var(--border)] hover:border-[var(--accent)]/25 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-dim)] flex items-center justify-center mb-6">
                <Zap size={18} className="text-[var(--accent)]" />
              </div>
              <h3 className="text-xl font-bold mb-3">{text.program3}</h3>
              <p className="text-[var(--muted)] leading-relaxed text-sm max-w-[55ch]">{text.desc3}</p>
              <Link href={isAuthenticated ? "/home" : "/register"}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:gap-3 transition-all duration-200">
                {text.detailedInfo} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] py-8 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center">
              <Globe size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm">WorldBridge</span>
          </div>
          <p className="text-xs text-[var(--muted)]">
            &copy; {new Date().getFullYear()} WorldBridge. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-[var(--muted)]">
            <Link href="/countries" className="hover:text-[var(--foreground)] transition-colors">Страны</Link>
            <Link href="/programs" className="hover:text-[var(--foreground)] transition-colors">Программы</Link>
            <Link href="/calculator" className="hover:text-[var(--foreground)] transition-colors">Калькулятор</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
