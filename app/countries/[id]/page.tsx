"use client";

import { useAuthStore } from "../../../store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { useTheme } from "next-themes";
import api from "../../../lib/api";
import { useLangStore } from "../../../store/langStore";
import { translations } from "../../../locales/translations";
import { getLocalizedField } from "../../../utils/langHelper";
import AuthGateModal from "../../../components/AuthGateModal";
import { 
  ArrowLeft, 
  Globe, 
  Moon, 
  Sun, 
  Sparkles, 
  Lock, 
  ChevronDown,
  ArrowRight,
  Compass
} from "lucide-react";

interface Country {
  id: number;
  slug: string;
  name_ru: string;
  name_en: string;
  flag_emoji: string;
  description_ru: string;
  description_en: string;
}

interface Program {
  id: number;
  slug: string;
  title: string;
  category: string;
  level: string;
  short_description: string;
}

interface FAQ {
  id: number;
  question: string;
  answer?: string;
}

const CATEGORY_STYLE: Record<string, { bg: string, text: string, border: string }> = {
  STUDIUM:     { bg: "bg-sky-500/10", text: "text-sky-500", border: "border-sky-500/20" },
  ARBEIT:      { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  AUSBILDUNG:  { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/20" },
  AU_PAIR:     { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
  INTERNSHIP:  { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20" },
  VOLUNTEERING:{ bg: "bg-teal-500/10", text: "text-teal-500", border: "border-teal-500/20" },
  IMMIGRATION: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Новичок",
  INTERMEDIATE: "Средний",
  ADVANCED: "Продвинутый",
};

export default function CountryPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const countryId = params.id;

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { lang } = useLangStore();
  const text = translations[lang]?.countryDetail || translations.ru.countryDetail;
  const navText = translations[lang]?.nav || translations.ru.nav;

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [country, setCountry] = useState<Country | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [authGate, setAuthGate] = useState<{ open: boolean; target: string }>({ open: false, target: "" });

  const handleProgramClick = (programSlug: string) => {
    if (isAuthenticated) {
      router.push(`/programs/${programSlug}`);
    } else {
      setAuthGate({ open: true, target: `/programs/${programSlug}` });
    }
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (authLoading) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [countryRes, programsRes, faqRes] = await Promise.all([
          api.get(`/countries/${countryId}`),
          api.get(`/countries/${countryId}/programs`),
          api.get(`/countries/${countryId}/faq`),
        ]);
        setCountry(countryRes.data);
        setPrograms(programsRes.data.items || []);
        setFaqs(faqRes.data || []);
      } catch (error) {
        console.error("Error fetching country data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [countryId, authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!country) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-center p-6 bg-[var(--background)] text-[var(--foreground)]">
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {translations[lang]?.countries?.notFound || "Страна не найдена"}
          </h1>
          <Link href="/home" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline">
            <ArrowLeft size={14} /> {navText.home}
          </Link>
        </div>
      </div>
    );
  }

  const countryName = getLocalizedField(country, 'name', lang);
  const countryDesc = getLocalizedField(country, 'description', lang);

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans">
      
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-5 md:px-8 glass border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <Link href="/home" className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            <ArrowLeft size={14} /> {navText.back}
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
          {!isAuthenticated && (
            <Link href="/register" className="px-3 py-1.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-[13px] font-semibold hover:opacity-85 transition-all">
              {navText.signup}
            </Link>
          )}
        </div>
      </nav>

      {/* ─── Header Section — matching home's premium accent style ──── */}
      <div className="pt-24 pb-12 px-5 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Circular Glass Bezel for flag */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full glass border border-[var(--border)] text-5xl shadow-xl select-none animate-float">
            {country.flag_emoji}
          </div>
          
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)]">
              {programs.length} {text.programs}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-balance">
              {countryName}
            </h1>
            <p className="text-base text-[var(--muted)] leading-relaxed max-w-[62ch] mx-auto font-light">
              {countryDesc}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Main Content — split asymmetric layout ────────────────── */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 pb-24 w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 xl:gap-20 items-start">
        
        {/* Left Column: Programs (Non-boring layout) */}
        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1.5">{text.programs}</h2>
            <p className="text-xs text-[var(--muted)]">Выберите подходящий для вас способ легализации</p>
          </div>

          {programs.length > 0 ? (
            <div className="border-t border-[var(--border)]">
              {programs.map((program) => {
                const style = CATEGORY_STYLE[program.category] || { bg: "bg-[var(--border)]", text: "text-[var(--muted)]", border: "border-[var(--border)]" };
                return (
                  <button
                    key={program.id}
                    onClick={() => handleProgramClick(program.slug)}
                    className="group w-full text-left flex items-start justify-between gap-6 border-b border-[var(--border)] py-6 hover:bg-[var(--card)] -mx-5 px-5 transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Tags */}
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                          {program.category}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)]">
                          {LEVEL_LABELS[program.level] || program.level}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base md:text-lg font-semibold tracking-tight group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                        {program.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-2 max-w-[55ch]">
                        {program.short_description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="shrink-0 w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-dim)] transition-all mt-1">
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center border border-dashed border-[var(--border)] rounded-2xl">
              <Compass size={24} className="mx-auto text-[var(--muted)] mb-3 animate-spin-slow" />
              <p className="text-sm text-[var(--muted)] italic">{text.noPrograms}</p>
            </div>
          )}
        </section>

        {/* Right Column: FAQ & AI Guidance (Modern refitted look) */}
        <section className="space-y-12">
          
          {/* FAQ Segment (Disclosure block) */}
          {faqs.length > 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-1.5">{text.faqTitle}</h2>
                <p className="text-xs text-[var(--muted)]">Ответы на самые популярные вопросы</p>
              </div>

              <div className="space-y-2.5">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div 
                      key={faq.id} 
                      className="border border-[var(--border)] rounded-2xl bg-[var(--card)] overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-sm hover:text-[var(--accent)] transition-colors"
                      >
                        <span className="line-clamp-2">{faq.question}</span>
                        <div className={`shrink-0 text-[var(--muted)] transition-transform duration-300 ${isOpen ? "rotate-180 text-[var(--accent)]" : ""}`}>
                          <ChevronDown size={15} />
                        </div>
                      </button>
                      
                      <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[300px] border-t border-[var(--border)]" : "max-h-0"} overflow-hidden`}>
                        <div className="px-5 py-4 text-xs sm:text-sm text-[var(--muted)] leading-relaxed whitespace-pre-line bg-[var(--background)]/30">
                          {faq.answer || "Войдите для просмотра ответа на данный вопрос."}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Banner — premium matching style */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl">
            {/* Ambient gradients */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)] rounded-full blur-[80px] opacity-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500 rounded-full blur-[80px] opacity-10 pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-dim)] border border-[var(--accent)]/20 text-[var(--accent)] text-[11px] font-semibold">
                <Sparkles size={11} className="animate-pulse-dot" />
                AI Consultant
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold tracking-tight text-balance">
                  {text.aiTitle}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed max-w-[45ch]">
                  {text.aiSubtitle}
                </p>
              </div>

              <div className="pt-2">
                {isAuthenticated ? (
                  <Link 
                    href="/ai-consultant" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold text-xs hover:bg-emerald-500 transition-all active:scale-[0.98]"
                  >
                    <Sparkles size={12} />
                    {text.aiBtnAuth}
                  </Link>
                ) : (
                  <Link 
                    href="/register" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-semibold text-xs hover:border-[var(--accent)]/40 hover:bg-[var(--accent-dim)] transition-all active:scale-[0.98]"
                  >
                    <Lock size={12} />
                    {text.aiBtnGuest}
                  </Link>
                )}
              </div>
            </div>
          </div>

        </section>

      </div>

      {/* Auth Gate Modal */}
      <AuthGateModal
        isOpen={authGate.open}
        onClose={() => setAuthGate({ open: false, target: "" })}
        redirectTo={authGate.target}
      />

    </div>
  );
}
