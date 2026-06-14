"use client";

import { useAuthStore } from "../../../store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import api from "../../../lib/api";
import { useLangStore } from "../../../store/langStore";
import { translations } from "../../../locales/translations";
import { getLocalizedField } from "../../../utils/langHelper";
import { useAIConsultantStore } from "../../../store/aiConsultantStore";
import AuthGateModal from "../../../components/AuthGateModal";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Lock,
  ChevronDown,
  ArrowRight,
  Compass,
  MapPin,
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

const CATEGORY_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  STUDIUM:     { bg: "bg-sky-500/10",    text: "text-sky-500",    border: "border-sky-500/20" },
  ARBEIT:      { bg: "bg-emerald-500/10",text: "text-emerald-500",border: "border-emerald-500/20" },
  AUSBILDUNG:  { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/20" },
  AU_PAIR:     { bg: "bg-rose-500/10",   text: "text-rose-500",   border: "border-rose-500/20" },
  INTERNSHIP:  { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20" },
  VOLUNTEERING:{ bg: "bg-teal-500/10",   text: "text-teal-500",   border: "border-teal-500/20" },
  IMMIGRATION: { bg: "bg-red-500/10",    text: "text-red-500",    border: "border-red-500/20" },
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER:     "Новичок",
  INTERMEDIATE: "Средний",
  ADVANCED:     "Продвинутый",
};

const COUNTRY_IMAGES: Record<string, string> = {
  de: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
  ca: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=1200&q=80",
  fr: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
  ch: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  at: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1200&q=80",
  be: "https://images.unsplash.com/photo-1561490497-43bc9ff57b79?auto=format&fit=crop&w=1200&q=80",
  cn: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80",
  cz: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80",
  fi: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
  no: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1200&q=80",
  pl: "https://images.unsplash.com/photo-1589625900595-c2f83d95a98a?auto=format&fit=crop&w=1200&q=80",
  se: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
  tr: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
  us: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
};

export default function CountryPageClient({
  countryId,
  initialData,
}: {
  countryId: string;
  initialData: { country: Country | null; programs: Program[]; faqs: FAQ[] };
}) {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const openAIConsultant = useAIConsultantStore((s) => s.openWith);
  const { lang } = useLangStore();
  const text = translations[lang]?.countryDetail || translations.ru.countryDetail;
  const navText = translations[lang]?.nav || translations.ru.nav;

  const [country, setCountry] = useState<Country | null>(initialData.country);
  const [programs, setPrograms] = useState<Program[]>(initialData.programs);
  const [faqs, setFaqs] = useState<FAQ[]>(initialData.faqs);
  const [loading, setLoading] = useState(initialData.country === null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [authGate, setAuthGate] = useState<{ open: boolean; target: string }>({ open: false, target: "" });
  const router = useRouter();

  const isFirstMount = useRef(true);

  const handleProgramClick = (programSlug: string) => {
    if (isAuthenticated) {
      router.push(`/programs/${programSlug}`);
    } else {
      setAuthGate({ open: true, target: `/programs/${programSlug}` });
    }
  };

  useEffect(() => {
    if (authLoading) return;

    // Skip initial fetch on first render if we already have initialData
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (initialData.country) {
        return;
      }
    }

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
  }, [countryId, authLoading, isAuthenticated, lang, initialData]);

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

  const countryName = getLocalizedField(country, "name", lang);
  const countryDesc = getLocalizedField(country, "description", lang);
  const heroBg = COUNTRY_IMAGES[country.slug] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans">

      {/* ─── Full-bleed Hero Image Banner ─────────────────────── */}
      <div className="relative h-[55vh] min-h-[380px] max-h-[520px] overflow-hidden">
        <img
          src={heroBg}
          alt={countryName}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.55]"
        />
        {/* Gradient fade into page background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[var(--background)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />

        {/* Back button overlay */}
        <div className="absolute top-0 left-0 right-0 pt-20 px-4 md:px-6">
          <div className="max-w-[1440px] mx-auto">
            <Link
              href="/countries"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-xs font-semibold backdrop-blur-sm bg-white/10 border border-white/15 px-3 py-1.5 rounded-full transition-all hover:bg-white/20"
            >
              <ArrowLeft size={12} /> Все страны
            </Link>
          </div>
        </div>

        {/* Country identity — centered on image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-16 left-0 right-0 px-4 md:px-6"
        >
          <div className="max-w-[1440px] mx-auto flex items-end gap-5">
            {/* Flag bubble */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shrink-0 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://flagcdn.com/w160/${country.slug.toLowerCase()}.png`}
                alt={country.name_en}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1.5 pb-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--accent)] flex items-center gap-1.5">
                <MapPin size={9} /> {programs.length} {text.programs}
              </p>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                {countryName}
              </h1>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Main Content ──────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 pb-24 w-full">

        {/* Description strip */}
        {countryDesc && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-sm md:text-base text-[var(--muted)] leading-relaxed max-w-[70ch] pt-4 pb-12 pl-5 font-light border-l-4 border-[var(--accent)] border-b border-b-[var(--border)] ml-0"
          >
            {countryDesc}
          </motion.p>
        )}

        {/* Two-column layout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 xl:gap-20 items-start pt-12"
        >

          {/* Left Column: Programs */}
          <section className="space-y-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-1.5">{text.programs}</h2>
              <p className="text-xs text-[var(--muted)]">Выберите подходящий для вас способ легализации</p>
            </div>

            {programs.length > 0 ? (
              <div className="space-y-3">
                {programs.map((program) => {
                  const style = CATEGORY_STYLE[program.category] || {
                    bg: "bg-[var(--border)]",
                    text: "text-[var(--muted)]",
                    border: "border-[var(--border)]",
                  };
                  return (
                    <button
                      key={program.id}
                      onClick={() => handleProgramClick(program.slug)}
                      className={`group w-full text-left flex items-start justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] py-5 px-5 border-l-4 ${style.border} hover:border-l-[var(--accent)] hover:shadow-[var(--shadow-md)] transition-all duration-200`}
                    >
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                            {program.category}
                          </span>
                          {program.level && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)]">
                              {(text as any)?.levelLabels?.[program.level] || (translations[lang] as any)?.programs?.levels?.[program.level] || LEVEL_LABELS[program.level] || program.level}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-semibold tracking-tight group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                          {getLocalizedField(program, 'title', lang)}
                        </h3>
                        <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-2 max-w-[55ch]">
                          {getLocalizedField(program, 'short_description', lang)}
                        </p>
                      </div>
                      <div className="shrink-0 w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-dim)] transition-all mt-1">
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

          {/* Right Column: FAQ + AI Banner */}
          <section className="space-y-12">

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
                          className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-sm transition-colors ${isOpen ? "bg-[var(--accent-dim)] text-[var(--accent)]" : "hover:text-[var(--accent)]"}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-[11px] font-bold text-[var(--muted)] w-5 shrink-0 mt-0.5">{index + 1}.</span>
                            <span className="line-clamp-2">{faq.question}</span>
                          </div>
                          <div className={`shrink-0 text-[var(--muted)] transition-transform duration-300 ${isOpen ? "rotate-180 text-[var(--accent)]" : ""}`}>
                            <ChevronDown size={15} />
                          </div>
                        </button>
                        <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[300px] border-t border-[var(--border)]" : "max-h-0"} overflow-hidden`}>
                          <div className="px-5 py-4 text-xs sm:text-sm text-[var(--muted)] leading-relaxed whitespace-pre-line bg-[var(--background-subtle)]">
                            {faq.answer || "Войдите для просмотра ответа на данный вопрос."}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--card)] to-[var(--accent-dim)] p-8 shadow-[var(--shadow-md)]">

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-dim)] border border-[var(--accent)]/20 text-[var(--accent)] text-[11px] font-semibold">
                  <Sparkles size={11} className="animate-pulse-dot" />
                  AI Consultant
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight text-balance">{text.aiTitle}</h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed max-w-[45ch]">{text.aiSubtitle}</p>
                </div>
                <div className="pt-2">
                  {isAuthenticated ? (
                    <button
                      onClick={() => openAIConsultant("chat")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold text-xs hover:bg-emerald-500 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Sparkles size={12} />
                      {text.aiBtnAuth}
                    </button>
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
        </motion.div>
      </div>

      <AuthGateModal
        isOpen={authGate.open}
        onClose={() => setAuthGate({ open: false, target: "" })}
        redirectTo={authGate.target}
      />
    </div>
  );
}
