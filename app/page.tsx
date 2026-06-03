"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "next-themes";
import { useLangStore } from "../store/langStore";
import { translations } from "../locales/translations";
import api from "../lib/api";
import { motion, useScroll, useTransform } from "framer-motion";
import { LogoMark } from "../components/LogoMark";
import {
  ArrowRight,
  MapPin,
  TrendingUp,
  Shield,
  Zap,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Languages,
  CheckCircle
} from "lucide-react";

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

const POPULAR_COUNTRIES = [
  {
    id: "de",
    name: "Германия",
    flag: "🇩🇪",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80",
    programs: "Ausbildung, Студенты, Blue Card",
    description: "Первоклассное бесплатное образование и надежная социальная система.",
  },
  {
    id: "ca",
    name: "Канада",
    flag: "🇨🇦",
    image: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=600&q=80",
    programs: "Express Entry, Студенты",
    description: "Лояльные иммиграционные программы и высокий уровень жизни.",
  },
  {
    id: "fr",
    name: "Франция",
    flag: "🇫🇷",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
    programs: "Паспорт-талант, Студенты",
    description: "Идеально для деятелей культуры, науки и стартап-предпринимателей.",
  },
  {
    id: "ch",
    name: "Швейцария",
    flag: "🇨🇭",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
    programs: "Работа, Бизнес, Обучение",
    description: "Премиальное качество жизни, стабильная валюта и надежность.",
  },
];

const HERO_SLIDES = [
  "https://studinter.ru/img/own_images/USA/f2decbfef34d89cf57364f9e6385e269.jpeg",
  "https://dvke.ru/wp-content/uploads/2016/06/photo.jpg",
  "https://img.7ya.ru/pub/img/25736/depositphotos_63073591_s-2019.jpg",
  "https://wucheba.ru/zh-content/uploads/2023/11/16c0597f08676fdc1fe1948d2e4abb11.jpg",
  "https://alvi-consult.com/images/news/graduation-caps-in-air.jpg",
  "https://migronium.com/wp-content/uploads/2023/10/obuchenie-za-graniczej-2100x1400.jpg",
  "https://vlfin.ru/upload/iblock/d7b/d7bb6756fd55d87310196de6aa7c533b.jpg",
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
  const { lang } = useLangStore();
  const [mounted, setMounted] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [dbStats, setDbStats] = useState({ countries: 14, programs: 65 });

  const { scrollY } = useScroll();
  
  // Parallax properties for the background grid and light spots
  const bgY = useTransform(scrollY, [0, 800], [0, 200]);
  const bgOpacity = useTransform(scrollY, [0, 800], [0.15, 0.05]);
  const spotY = useTransform(scrollY, [0, 800], [0, -100]);

  useEffect(() => { setMounted(true); }, []);

  // Fetch real database counts dynamically on mount
  useEffect(() => {
    api.get("/countries")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setDbStats((prev) => ({ ...prev, countries: res.data.length }));
        }
      })
      .catch(() => {});

    api.get("/programs")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setDbStats((prev) => ({ ...prev, programs: res.data.length }));
        }
      })
      .catch(() => {});
  }, []);

  // Auto-cycle hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const text = translations[lang]?.landing || translations.ru.landing;
  const navText = translations[lang]?.nav || translations.ru.nav;

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--background)] text-[var(--foreground)] overflow-hidden relative">
      
      {/* ─── Parallax Background Elements ───────────────────────── */}
      {mounted && (
        <>
          {/* Subtle Grid Backdrop */}
          <motion.div 
            style={{ 
              y: bgY,
              opacity: bgOpacity,
              backgroundImage: "radial-gradient(circle at 1px 1px, var(--accent) 1px, transparent 0)"
            }}
            className="absolute inset-0 bg-[size:32px_32px] pointer-events-none z-0"
          />
          {/* Ambient Lighting Spots */}
          <motion.div
            style={{ y: spotY }}
            className="absolute top-[-10%] left-[5%] w-[40dvw] h-[40dvw] bg-[var(--accent)] rounded-full blur-[140px] opacity-10 pointer-events-none z-0"
          />
          <motion.div
            style={{ y: bgY }}
            className="absolute bottom-[20%] right-[-10%] w-[35dvw] h-[35dvw] bg-emerald-500 rounded-full blur-[160px] opacity-[0.07] pointer-events-none z-0"
          />
        </>
      )}

      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="flex-1 flex items-center pt-16 min-h-[100dvh] relative z-10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 xl:gap-20 items-center py-24">

          {/* Left Column: Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Eyebrow badge */}
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-dim)] text-[var(--accent)] text-xs font-semibold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse-dot" />
                {dbStats.countries} стран — {dbStats.programs} программ
              </span>
            </motion.div>

            {/* H1 Heading - Custom Slide Up */}
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-6xl xl:text-7xl font-bold tracking-tighter leading-[1.02] text-balance text-[var(--foreground)]"
            >
              {text.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={itemVariants}
              className="text-base md:text-lg text-[var(--muted)] leading-relaxed max-w-[52ch] font-light"
            >
              {text.subtitle}
            </motion.p>

            {/* CTA action buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link href={isAuthenticated ? "/home" : "/register"}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:bg-emerald-500 transition-all duration-300 active:scale-[0.97] shadow-[0_4px_20px_rgba(16,185,129,0.25)] cursor-pointer">
                {isAuthenticated ? text.home : text.register}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              {!isAuthenticated && (
                <Link href="/countries"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 backdrop-blur-md text-[var(--foreground)] font-semibold text-sm hover:border-[var(--accent)]/40 hover:bg-[var(--accent-dim)] transition-all duration-300">
                  {navText.destinations}
                </Link>
              )}
            </motion.div>

            {/* Micro stats grid */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap gap-8 pt-4 border-t border-[var(--border)] max-w-lg"
            >
              {STATS.slice(0, 3).map((s, idx) => {
                let value = s.value;
                if (idx === 0) value = String(dbStats.countries);
                if (idx === 1) value = String(dbStats.programs);
                return (
                  <div key={s.label} className="space-y-1">
                    <div className="text-3xl font-black tracking-tight text-[var(--foreground)]">{value}</div>
                    <div className="text-xs text-[var(--muted)] font-medium tracking-wide">{s.label}</div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right Column: Auto-cycling hero slideshow */}
          <div className="hidden lg:flex h-[480px] relative z-10 rounded-3xl overflow-hidden border border-[var(--border)] items-end">
            {/* Slides stacked, cross-fade via opacity */}
            {HERO_SLIDES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt="Travel"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.55] transition-opacity duration-1000"
                style={{ opacity: i === slideIndex ? 1 : 0 }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {/* Floating city chips */}
            {[].map(({ label, pos }) => (
              <div key={label} className={`absolute ${pos} glass rounded-full px-3 py-1.5 flex items-center gap-1.5`}>
                <MapPin size={10} className="text-[var(--accent)]" />
                <span className="text-[11px] font-medium text-white/80">{label}</span>
              </div>
            ))}
            {/* Slide dots */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === slideIndex
                      ? "w-5 h-1.5 bg-[var(--accent)]"
                      : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
            <div className="relative z-10 p-8 space-y-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--accent)]">47 направлений</p>
              <p className="text-xl font-black text-white tracking-tight">Твой мир без границ</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Country Showcase Section — visual-centric ────────── */}
      <section className="py-24 px-4 md:px-6 max-w-[1440px] mx-auto w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-3 flex items-center gap-1.5">
              <Sparkles size={12} className="animate-pulse-dot" />
              Новый старт
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
              Популярные направления релокации
            </h2>
          </div>
          <Link href="/countries" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)] hover:opacity-85 transition-opacity">
            Смотреть все страны <ChevronRight size={14} />
          </Link>
        </div>

        {/* Premium Grid of country cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {POPULAR_COUNTRIES.map((c, idx) => (
            <Link href={`/countries/${c.id}`} key={c.id}>
              <div 
                className="group relative h-[360px] rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-sm hover:shadow-xl hover:border-[var(--accent)]/30 transition-all duration-300 flex flex-col justify-end p-6 cursor-pointer"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Background image container */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img 
                    src={c.image} 
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-[0.7] dark:brightness-[0.55]" 
                  />
                  {/* Subtle Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/20 to-transparent opacity-90" />
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{c.flag}</span>
                    <h3 className="font-bold text-lg text-white group-hover:text-[var(--accent)] transition-colors">
                      {c.name}
                    </h3>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2">
                    {c.description}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-dim)] px-2 py-0.5 rounded-full">
                      {c.programs.split(",")[0]}
                    </span>
                    <span className="text-white text-[10px] font-medium opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex items-center gap-1">
                      Подробнее <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Features — Editorial Bento ──────────────────────── */}
      <section className="py-24 px-4 md:px-6 max-w-[1440px] mx-auto w-full relative z-10 border-t border-[var(--border)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-3">Возможности</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
              {text.programs}
            </h2>
          </div>
          <Link href={isAuthenticated ? "/home" : "/register"}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)] hover:opacity-85 transition-opacity shrink-0">
            {text.detailedInfo} <ArrowRight size={13} />
          </Link>
        </div>

        {/* Bento grid: 3 rows, asymmetric */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* Card 1 — WIDE photo card: Education abroad → /countries */}
          <Link href="/countries" className="md:col-span-7 group relative h-[320px] rounded-3xl overflow-hidden border border-[var(--border)] block">
            <img
              src="https://d-msso.udsu.ru/files/kartinki-dlya-novostej/002366-obrazovanie_za_rubejom.jpg"
              alt="Education abroad"
              className="absolute inset-0 w-full h-full object-cover brightness-[0.45] transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-between">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-[var(--accent)] transition-colors">{text.program1}</h3>
                <p className="text-sm text-white/65 leading-relaxed max-w-[44ch]">{text.desc1}</p>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                  Выбрать страну <ArrowRight size={11} />
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2 — NARROW stat card: success rate → /programs */}
          <Link href="/programs" className="md:col-span-5 group relative rounded-3xl overflow-hidden border border-[var(--accent)]/20 bg-[var(--accent-dim)] flex flex-col justify-between p-8 h-[320px] block">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--accent)] rounded-full blur-[80px] opacity-20 pointer-events-none" />
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)]">Успешность</p>
              <p className="text-xs text-[var(--muted)] max-w-[30ch]">проверенная статистика зачислений</p>
            </div>
            <div>
              <div className="text-[80px] font-black leading-none tracking-tighter text-[var(--accent)]">91<span className="text-4xl">.3%</span></div>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  "Прямая подача документов без посредников",
                  `${dbStats.programs} активных программ в каталоге`,
                  "Полное юридическое и визовое сопровождение"
                ].map(s => (
                  <div key={s} className="flex items-center gap-2 text-xs text-[var(--muted)] animate-fade-in">
                    <CheckCircle size={11} className="text-[var(--accent)] shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                Смотреть программы <ArrowRight size={11} />
              </span>
            </div>
          </Link>

          {/* Card 3 — MEDIUM photo card: Work & Internships → /programs */}
          <Link href="/programs" className="md:col-span-5 group relative h-[280px] rounded-3xl overflow-hidden border border-[var(--border)] block">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=700&q=80"
              alt="Work abroad"
              className="absolute inset-0 w-full h-full object-cover brightness-[0.4] transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-0 p-7 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center">
                <Briefcase size={17} className="text-white" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-white tracking-tight group-hover:text-[var(--accent)] transition-colors">{text.program2}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{text.desc2}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                  К программам <ArrowRight size={10} />
                </span>
              </div>
            </div>
          </Link>

          {/* Card 4 — MEDIUM photo card: Language Courses → /language-courses */}
          <Link href="/language-courses" className="md:col-span-4 group relative h-[280px] rounded-3xl overflow-hidden border border-[var(--border)] block">
            <img
              src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=700&q=80"
              alt="Languages"
              className="absolute inset-0 w-full h-full object-cover brightness-[0.4] transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-0 p-7 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center">
                <Languages size={17} className="text-white" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-white tracking-tight group-hover:text-[var(--accent)] transition-colors">Языковые курсы</h3>
                <p className="text-xs text-white/60 leading-relaxed">Английский, немецкий, турецкий, китайский — курсы в Душанбе</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                  Выбрать курс <ArrowRight size={10} />
                </span>
              </div>
            </div>
          </Link>

          {/* Card 5 — NARROW CTA card */}
          <div className="md:col-span-3 relative rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--card)] p-7 h-[280px] flex flex-col justify-between">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--accent)] rounded-full blur-[60px] opacity-10 pointer-events-none" />
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent-dim)] flex items-center justify-center">
                <MapPin size={17} className="text-[var(--accent)]" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] pt-2">47 стран</p>
              <h3 className="text-lg font-black tracking-tight text-balance leading-snug">Найди своё направление</h3>
            </div>
            <Link href="/countries"
              className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white font-bold text-xs hover:bg-emerald-500 transition-all active:scale-[0.97] w-fit">
              Смотреть страны <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] py-8 px-4 md:px-6 relative z-10">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center">
              <LogoMark size={12} className="text-white" />
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
