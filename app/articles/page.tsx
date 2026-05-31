"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuthStore } from "../../store/authStore";
import { useLangStore } from "../../store/langStore";
import { translations } from "../../locales/translations";
import { 
  ArrowLeft, 
  Globe, 
  Moon, 
  Sun, 
  Clock, 
  BookOpen, 
  ArrowRight,
  Bookmark
} from "lucide-react";

const ARTICLES = [
  {
    id: 1,
    category: "Карьера",
    tag: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    readTime: "6 мин",
    date: "28 мая 2026",
    title: "Как найти работу в Германии без знания языка",
    excerpt: "Пошаговое руководство по поиску работы через платформы Stepstone, LinkedIn и XING. Узнайте, какие отрасли открыты для англоязычных специалистов и как правильно оформить резюме по немецкому стандарту.",
    emoji: "🇩🇪",
  },
  {
    id: 2,
    category: "Образование",
    tag: "text-sky-500 bg-sky-500/10 border-sky-500/20",
    readTime: "8 мин",
    date: "25 мая 2026",
    title: "Обучение в Польше: полный гид для иностранных студентов 2026",
    excerpt: "Польша — один из самых доступных вариантов для получения европейского образования. Стоимость обучения, список университетов с бесплатными программами и советы по получению студенческой визы.",
    emoji: "🇵🇱",
  },
  {
    id: 3,
    category: "Виза и документы",
    tag: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    readTime: "5 мин",
    date: "22 мая 2026",
    title: "Как оформить ВНЖ в Европе через рабочую программу",
    excerpt: "Рабочая виза — самый быстрый путь к европейскому виду на жительство. Рассказываем о ключевых требованиях, сроках и частых ошибках, которые приводят к отказу.",
    emoji: "📄",
  },
  {
    id: 4,
    category: "Финансы",
    tag: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    readTime: "7 мин",
    date: "18 мая 2026",
    title: "Сколько реально стоит жизнь в Канаде в 2026 году",
    excerpt: "Подробный разбор расходов на жилье, еду, транспорт и медицину в Торонто, Ванкувере и Монреале. Реальные цифры от людей, которые уже переехали.",
    emoji: "🍁",
  },
  {
    id: 5,
    category: "Опыт",
    tag: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    readTime: "10 мин",
    date: "14 мая 2026",
    title: "История: как я получила Blue Card в Германии за 3 месяца",
    excerpt: "Личный опыт переезда из Душанбе в Берлин через программу Blaue Karte EU. Что нужно знать заранее, какие документы собирать и чего ожидать на собеседовании в посольстве.",
    emoji: "✈️",
  },
  {
    id: 6,
    category: "Советы",
    tag: "text-red-500 bg-red-500/10 border-red-500/20",
    readTime: "4 мин",
    date: "10 мая 2026",
    title: "5 ошибок при подаче заявки на рабочую программу",
    excerpt: "Разбираем самые частые причины отказа: неправильное оформление резюме, неподходящий уровень языка, отсутствие нострификации диплома и другие критические моменты.",
    emoji: "⚠️",
  },
];

const CATEGORIES = ["Все", "Карьера", "Образование", "Виза и документы", "Финансы", "Опыт", "Советы"];

export default function ArticlesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { lang } = useLangStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedCat, setSelectedCat] = useState("Все");

  const navText = translations[lang]?.nav || translations.ru.nav;

  useEffect(() => { setMounted(true); }, []);

  const filteredArticles = selectedCat === "Все"
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === selectedCat);

  const featured = filteredArticles[0];
  const rest = filteredArticles.slice(1);

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

        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[var(--muted)]">
          <Link href="/programs" className="hover:text-[var(--foreground)] transition-colors">{navText.programs}</Link>
          <Link href="/countries" className="hover:text-[var(--foreground)] transition-colors">{navText.destinations}</Link>
          <span className="font-semibold text-[var(--foreground)]">{navText.insights}</span>
          <Link href="/calculator" className="hover:text-[var(--foreground)] transition-colors">{navText.estimator}</Link>
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
          {!authLoading && (
            isAuthenticated ? (
              <Link href="/profile" className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Профиль</Link>
            ) : (
              <Link href="/login" className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">{navText.login}</Link>
            )
          )}
        </div>
      </nav>

      {/* ─── Hero header — LEFT-ALIGNED ────────────────────────── */}
      <div className="pt-24 pb-10 px-5 md:px-8">
        <div className="max-w-4xl mx-auto space-y-3">
          <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] flex items-center gap-1.5">
            <BookOpen size={12} />
            Полезные гайды и инсайты
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight text-balance">
            Статьи и инструкции
          </h1>
          <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed max-w-[55ch]">
            Практические советы, инструкции по документам и реальный опыт переехавших в Европу и мир.
          </p>
        </div>
      </div>

      {/* ─── Category Filter — Sticky Bar ──────────────────────── */}
      <div className="sticky top-14 z-40 bg-[var(--background)]/90 backdrop-blur-xl border-y border-[var(--border)] px-5 md:px-8 py-3">
        <div className="max-w-4xl mx-auto flex gap-1.5 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap border transition-all ${
                selectedCat === cat
                  ? "bg-[var(--foreground)] text-[var(--background)] border-transparent"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Articles Grid / Bento ────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-5 md:px-8 w-full mt-10 space-y-8 flex-1">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20 text-[var(--muted)] text-sm font-light">
            Статей не найдено.
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Featured Hero Article */}
            {featured && (
              <div className="group border border-[var(--border)] rounded-3xl bg-[var(--card)] hover:border-[var(--accent)]/20 transition-all duration-300 p-6 md:p-8 cursor-pointer relative overflow-hidden shadow-sm">
                {/* Ambient graphic blur */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] rounded-full blur-[60px] opacity-5 pointer-events-none" />

                <div className="absolute top-2 right-4 text-8xl opacity-10 select-none pointer-events-none">{featured.emoji}</div>
                
                <div className="relative z-10 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${featured.tag}`}>
                      {featured.category}
                    </span>
                    <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                      <Clock size={11} /> {featured.readTime}
                    </span>
                    <span className="text-[11px] text-[var(--muted)]">•</span>
                    <span className="text-[11px] text-[var(--muted)]">{featured.date}</span>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight group-hover:text-[var(--accent)] transition-colors leading-tight max-w-[45ch]">
                    {featured.title}
                  </h2>
                  
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-[65ch]">
                    {featured.excerpt}
                  </p>
                  
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)]">
                    Читать гайд <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )}

            {/* Sub-grid Articles */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rest.map((article) => (
                  <div
                    key={article.id}
                    className="group border border-[var(--border)] rounded-2xl bg-[var(--card)] hover:border-[var(--accent)]/20 transition-all duration-300 p-6 cursor-pointer flex flex-col justify-between relative overflow-hidden shadow-sm"
                  >
                    <div className="absolute top-2 right-4 text-5xl opacity-10 select-none pointer-events-none">{article.emoji}</div>
                    
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${article.tag}`}>
                          {article.category}
                        </span>
                        <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                          <Clock size={10} /> {article.readTime}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-sm sm:text-base group-hover:text-[var(--accent)] transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-[12px] sm:text-xs text-[var(--muted)] leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between text-[10px] sm:text-[11px] text-[var(--muted)]">
                      <span>{article.date}</span>
                      <span className="font-semibold text-[var(--accent)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Читать <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
