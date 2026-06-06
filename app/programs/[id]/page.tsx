"use client";

import { useAuthStore } from "../../../store/authStore";
import { useLangStore } from "../../../store/langStore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { useTheme } from "next-themes";
import api from "../../../lib/api";
import {
  ArrowLeft,
  Globe,
  Moon,
  Sun,
  Check,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  DollarSign,
  Calendar,
  Hourglass,
  CheckCircle2,
  Bookmark,
  ShieldCheck,
  Building2,
  MapPin,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  BadgeCheck,
  Image as ImageIcon,
  X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProgramImage {
  id: number;
  url: string;
  caption_ru?: string;
  caption_en?: string;
  image_type?: string;
  display_order: number;
}

interface University {
  id: number;
  slug: string;
  name_ru: string;
  name_en?: string;
  city?: string;
  address?: string;
  website_url?: string;
  logo_url?: string;
  email?: string;
  phone?: string;
  lat?: number;
  lon?: number;
}

interface FAQItem {
  q: string;
  a: string;
}

interface ProgramDetail {
  id: number;
  slug: string;
  title: string;
  category: string;
  level: string;
  description: string;
  full_description?: string;
  min_age: number;
  max_age: number | null;
  duration_months: number | null;
  language_requirement: string;
  salary_range: string;
  cost?: string;
  documents?: string;
  deadline?: string;
  official_url?: string;
  residence_permit?: boolean;
  pros?: string;
  cons?: string;
  career_opportunities?: string;
  // Enrichment fields
  university_name?: string;
  city?: string;
  university_address?: string;
  tuition_fee?: string;
  tuition_currency?: string;
  accommodation_cost?: string;
  language_course_cost?: string;
  scholarship_available?: boolean;
  scholarship_amount?: string;
  contact_email?: string;
  contact_phone?: string;
  program_page_url?: string;
  application_steps?: string;
  program_faq?: string;
  data_source?: string;
  last_synced_at?: string;
  images?: ProgramImage[];
  university?: University | null;
  cover_image_url?: string;
}

// ── Styles ────────────────────────────────────────────────────────────────────

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

// ── Sub-components ────────────────────────────────────────────────────────────

function ImageGallery({ images, coverUrl, coverUrl2, coverUrl3 }: { 
  images: ProgramImage[]; 
  coverUrl?: string;
  coverUrl2?: string;
  coverUrl3?: string;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  const allImages = [
    ...(coverUrl ? [{ id: -1, url: coverUrl, caption_ru: "Фото 1", display_order: -1 }] : []),
    ...(coverUrl2 ? [{ id: -2, url: coverUrl2, caption_ru: "Фото 2", display_order: -2 }] : []),
    ...(coverUrl3 ? [{ id: -3, url: coverUrl3, caption_ru: "Фото 3", display_order: -3 }] : []),
    ...images,
  ];

  if (allImages.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
        <ImageIcon size={18} className="text-[var(--accent)]" /> Фотографии
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {allImages.slice(0, 6).map((img) => (
          <button
            key={img.id}
            onClick={() => setLightbox(img.url)}
            className="relative aspect-video rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-colors group"
          >
            <img
              src={img.url}
              alt={img.caption_ru || ""}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </button>
        ))}
      </div>
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-[var(--accent)] transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X size={28} />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

function CostBreakdownCard({ program }: { program: ProgramDetail }) {
  const hasCosts =
    program.tuition_fee ||
    program.accommodation_cost ||
    program.language_course_cost ||
    program.scholarship_available;

  if (!hasCosts) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
        <DollarSign size={18} className="text-[var(--accent)]" /> Финансы
      </h2>
      <div className="border border-[var(--border)] rounded-2xl bg-[var(--card)] p-6 space-y-4">
        {program.tuition_fee && (
          <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--muted)]">Стоимость обучения</span>
            <span className="text-sm font-semibold">{program.tuition_fee}</span>
          </div>
        )}
        {program.accommodation_cost && (
          <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--muted)]">Проживание</span>
            <span className="text-sm font-semibold">{program.accommodation_cost}</span>
          </div>
        )}
        {program.language_course_cost && (
          <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--muted)]">Языковые курсы</span>
            <span className="text-sm font-semibold">{program.language_course_cost}</span>
          </div>
        )}
        {program.scholarship_available && (
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-[var(--muted)] flex items-center gap-1.5">
              <BadgeCheck size={14} className="text-emerald-500" /> Стипендия доступна
            </span>
            <span className="text-sm font-semibold text-emerald-500">
              {program.scholarship_amount || "Да"}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function UniversityCard({ program }: { program: ProgramDetail }) {
  const uni = program.university;
  const hasUniversityData = uni?.name_ru || program.university_name;
  if (!hasUniversityData) return null;

  const name = uni?.name_ru || program.university_name;
  const city = uni?.city || program.city;
  const address = uni?.address || program.university_address;
  const website = uni?.website_url || program.official_url;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
        <Building2 size={18} className="text-[var(--accent)]" /> Учебное заведение
      </h2>
      <div className="border border-[var(--border)] rounded-2xl bg-[var(--card)] p-6 space-y-3">
        {uni?.logo_url && (
          <img src={uni.logo_url} alt={name || ""} className="h-10 object-contain mb-2" />
        )}
        <p className="text-sm font-semibold">{name}</p>
        {city && (
          <p className="text-sm text-[var(--muted)] flex items-center gap-1.5">
            <MapPin size={13} className="text-[var(--accent)]" /> {city}
          </p>
        )}
        {address && (
          <p className="text-xs text-[var(--muted)] pl-5">{address}</p>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline mt-1"
          >
            <Globe size={12} /> Сайт университета
          </a>
        )}
      </div>
    </section>
  );
}

function ApplicationStepsSection({ steps }: { steps?: string }) {
  if (!steps) return null;
  const items = steps.split('\n').filter(Boolean);
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
        <GraduationCap size={18} className="text-[var(--accent)]" /> Этапы поступления
      </h2>
      <div className="border border-[var(--border)] rounded-2xl bg-[var(--card)] p-6 space-y-0">
        {items.map((step, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-[var(--border)] last:border-0">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] text-xs font-bold">
              {i + 1}
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed pt-0.5">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProgramFAQSection({ faqJson }: { faqJson?: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (!faqJson) return null;

  let items: FAQItem[] = [];
  try {
    items = JSON.parse(faqJson);
  } catch {
    return null;
  }
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold tracking-tight">Часто задаваемые вопросы</h2>
      <div className="border border-[var(--border)] rounded-2xl bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden">
        {items.map((item, i) => (
          <div key={i}>
            <button
              className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--border)]/20 transition-colors"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <span className="text-sm font-semibold pr-4">{item.q}</span>
              {openIdx === i ? (
                <ChevronUp size={16} className="shrink-0 text-[var(--accent)]" />
              ) : (
                <ChevronDown size={16} className="shrink-0 text-[var(--muted)]" />
              )}
            </button>
            {openIdx === i && (
              <div className="px-5 pb-5 text-sm text-[var(--muted)] leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactsCard({ program }: { program: ProgramDetail }) {
  const hasContacts = program.contact_email || program.contact_phone || program.program_page_url;
  if (!hasContacts) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold tracking-tight">Контакты</h2>
      <div className="border border-[var(--border)] rounded-2xl bg-[var(--card)] p-6 space-y-3">
        {program.contact_email && (
          <a
            href={`mailto:${program.contact_email}`}
            className="flex items-center gap-2.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <Mail size={14} className="text-[var(--accent)] shrink-0" />
            {program.contact_email}
          </a>
        )}
        {program.contact_phone && (
          <a
            href={`tel:${program.contact_phone}`}
            className="flex items-center gap-2.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <Phone size={14} className="text-[var(--accent)] shrink-0" />
            {program.contact_phone}
          </a>
        )}
        {program.program_page_url && (
          <a
            href={program.program_page_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            <ExternalLink size={14} className="shrink-0" />
            Страница программы
          </a>
        )}
      </div>
    </section>
  );
}

// ── JSON-LD for SEO ───────────────────────────────────────────────────────────

function ProgramJsonLd({ program }: { program: ProgramDetail }) {
  const universityName = program.university?.name_ru || program.university_name;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: program.title,
    description: program.description,
    ...(program.duration_months && {
      timeToComplete: `P${program.duration_months}M`,
    }),
    ...(universityName && {
      provider: {
        "@type": "CollegeOrUniversity",
        name: universityName,
        ...(program.university?.city && { address: { "@type": "PostalAddress", addressLocality: program.university.city } }),
        ...(program.university?.website_url && { url: program.university.website_url }),
      },
    }),
    ...(program.tuition_fee && {
      offers: {
        "@type": "Offer",
        price: program.tuition_fee,
        priceCurrency: program.tuition_currency || "EUR",
      },
    }),
    ...(program.deadline && { applicationDeadline: program.deadline }),
    ...(program.official_url && { url: program.official_url }),
    ...(program.language_requirement && { inLanguage: program.language_requirement }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProgramPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const programId = params.id;
  const router = useRouter();

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { lang } = useLangStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push(`/login?next=/programs/${programId}`);
      return;
    }

    const fetchProgram = async () => {
      setLoading(true);
      setFetchError("");
      try {
        const res = await api.get(`/programs/${programId}`);
        setProgram(res.data);
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          router.push(`/login?next=/programs/${programId}`);
        } else {
          setFetchError("not_found");
        }
        console.error("Error fetching program data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId, authLoading, isAuthenticated, router, lang]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (fetchError === "not_found" || !program) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-center p-6 bg-[var(--background)] text-[var(--foreground)]">
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Программа не найдена</h1>
          <button
            onClick={() => router.push("/programs")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            <ArrowLeft size={14} /> К списку программ
          </button>
        </div>
      </div>
    );
  }

  const catStyle = CATEGORY_STYLE[program.category] || { bg: "bg-[var(--border)]", text: "text-[var(--muted)]", border: "border-[var(--border)]" };
  const images = program.images || [];
  const applyUrl = program.program_page_url || program.official_url;

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <ProgramJsonLd program={program} />

      <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans pb-24">

        {/* ─── Hero Header Area ────────────────────────────────────── */}
        <div className="pt-24 pb-12 px-4 md:px-6 border-b border-[var(--border)] bg-[var(--card)]/40">
          <div className="max-w-[1440px] mx-auto space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                {program.category}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)]">
                Уровень: {LEVEL_LABELS[program.level] || program.level}
              </span>
              {program.residence_permit && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1">
                  <ShieldCheck size={11} /> Даёт ВНЖ
                </span>
              )}
              {program.scholarship_available && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <BadgeCheck size={11} /> Стипендия
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-balance">
              {program.title}
            </h1>

            {/* University + city subtitle */}
            {(program.university_name || program.university?.name_ru || program.city || program.university?.city) && (
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <Building2 size={14} className="shrink-0" />
                <span>{program.university?.name_ru || program.university_name}</span>
                {(program.city || program.university?.city) && (
                  <>
                    <span className="text-[var(--border)]">·</span>
                    <MapPin size={13} className="shrink-0" />
                    <span>{program.university?.city || program.city}</span>
                  </>
                )}
              </div>
            )}

            <p className="text-base text-[var(--muted)] leading-relaxed max-w-[62ch]">
              {program.description}
            </p>

            {/* Apply CTA */}
            {applyUrl && (
              <div>
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 btn btn-primary text-sm font-bold px-5 py-2.5 rounded-xl"
                >
                  Подать заявку <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ─── Main Columns ─────────────────────────────────────────── */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 mt-12 w-full grid grid-cols-1 md:grid-cols-[1.7fr_1.3fr] gap-12 items-start">

          {/* Left Column */}
          <div className="space-y-10">

            {/* Image Gallery (only if images exist) */}
<ImageGallery 
  images={images} 
  coverUrl={program.cover_image_url || undefined}
  coverUrl2={(program as any).cover_image_url_2 || undefined}
  coverUrl3={(program as any).cover_image_url_3 || undefined}
/>
            {/* Main Description */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-tight">Описание программы</h2>
              <div className="border border-[var(--border)] rounded-2xl bg-[var(--card)] p-6 md:p-8">
                <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed whitespace-pre-line font-light">
                  {program.full_description || program.description}
                </p>
              </div>
            </section>

            {/* University Info */}
            <UniversityCard program={program} />

            {/* Cost Breakdown */}
            <CostBreakdownCard program={program} />

            {/* Application Steps */}
            <ApplicationStepsSection steps={program.application_steps} />

            {/* Pros & Cons */}
            {(program.pros || program.cons) && (
              <section className="grid grid-cols-1 gap-6">
                {program.pros && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle2 size={15} /> Преимущества
                    </h3>
                    <div className="border border-emerald-500/20 rounded-2xl bg-emerald-500/[0.03] p-6 space-y-4">
                      <ul className="space-y-3">
                        {program.pros.split('\n').map((pro, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                            <Check size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {program.cons && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-rose-500 flex items-center gap-1.5">
                      <AlertTriangle size={15} /> Сложности
                    </h3>
                    <div className="border border-rose-500/20 rounded-2xl bg-rose-500/[0.03] p-6 space-y-4">
                      <ul className="space-y-3">
                        {program.cons.split('\n').map((con, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                            <AlertTriangle size={13} className="text-rose-500 shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Career Section */}
            {program.career_opportunities && (
              <section className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight">Карьерные перспективы</h2>
                <div className="border border-[var(--border)] rounded-2xl bg-[var(--accent-dim)]/30 p-6 md:p-8">
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    {program.career_opportunities}
                  </p>
                </div>
              </section>
            )}

            {/* Required Docs */}
            {program.documents && (
              <section className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight">Необходимые документы</h2>
                <div className="border border-[var(--border)] rounded-2xl bg-[var(--card)] p-6 md:p-8">
                  <ul className="space-y-3 pl-1">
                    {program.documents.split(', ').map((doc, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--muted)]">
                        <Bookmark size={13} className="text-[var(--accent)] shrink-0 mt-1" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Program FAQ */}
            <ProgramFAQSection faqJson={program.program_faq} />

            {/* Contacts */}
            <ContactsCard program={program} />

          </div>

          {/* Right Column: Summary Sidebar */}
          <aside className="sticky top-20 space-y-6">
            <div className="border border-[var(--border)] rounded-3xl bg-[var(--card)] p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--accent)] rounded-full blur-[70px] opacity-10 pointer-events-none" />

              <h3 className="text-base font-bold tracking-tight border-b border-[var(--border)] pb-4">
                Краткая сводка
              </h3>

              <div className="space-y-5 text-[13px]">
                <div className="space-y-1">
                  <span className="text-[var(--muted)] text-[11px] block">Требование к языку</span>
                  <span className="font-semibold flex items-center gap-1.5">
                    <BookOpen size={13} className="text-[var(--accent)]" />
                    {program.language_requirement}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[var(--muted)] text-[11px] block">Зарплата / Стипендия</span>
                  <span className="font-semibold text-emerald-500 flex items-center gap-1.5">
                    <DollarSign size={13} />
                    {program.salary_range}
                  </span>
                </div>

                {program.cost && (
                  <div className="space-y-1">
                    <span className="text-[var(--muted)] text-[11px] block">Расходы (оценка)</span>
                    <span className="font-semibold flex items-center gap-1.5">
                      <DollarSign size={13} className="text-red-500/80" />
                      {program.cost}
                    </span>
                  </div>
                )}

                {program.tuition_fee && (
                  <div className="space-y-1">
                    <span className="text-[var(--muted)] text-[11px] block">Стоимость обучения</span>
                    <span className="font-semibold flex items-center gap-1.5">
                      <GraduationCap size={13} className="text-sky-500" />
                      {program.tuition_fee}
                    </span>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[var(--muted)] text-[11px] block">Возраст</span>
                  <span className="font-semibold flex items-center gap-1.5">
                    <Hourglass size={13} className="text-amber-500" />
                    {program.min_age} - {program.max_age ? `${program.max_age} лет` : "без ограничений"}
                  </span>
                </div>

                {program.duration_months && (
                  <div className="space-y-1">
                    <span className="text-[var(--muted)] text-[11px] block">Длительность</span>
                    <span className="font-semibold flex items-center gap-1.5">
                      <Calendar size={13} className="text-blue-500" />
                      {program.duration_months} мес.
                    </span>
                  </div>
                )}

                {program.deadline && (
                  <div className="space-y-1">
                    <span className="text-[var(--muted)] text-[11px] block">Дедлайны / Сроки</span>
                    <span className="font-semibold flex items-center gap-1.5">
                      <Calendar size={13} className="text-rose-500/80" />
                      {program.deadline}
                    </span>
                  </div>
                )}
              </div>

              {applyUrl && (
                <div className="pt-2">
                  <a
                    href={applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-3 px-4 rounded-xl bg-[var(--accent)] text-white font-bold text-xs hover:bg-emerald-500 transition-all active:scale-[0.98]"
                  >
                    {program.program_page_url ? "Подать заявку" : "Официальный сайт"} <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {program.official_url && program.program_page_url && (
                <a
                  href={program.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                >
                  <Globe size={11} /> Сайт университета
                </a>
              )}
            </div>

            {/* Data source notice */}
            {program.data_source && program.data_source !== "manual" && (
              <p className="text-[10px] text-[var(--muted)] text-center">
                Источник: {program.data_source}
                {program.last_synced_at && (
                  <> · Обновлено: {new Date(program.last_synced_at).toLocaleDateString("ru")}</>
                )}
              </p>
            )}
          </aside>

        </div>

      </div>
    </>
  );
}
