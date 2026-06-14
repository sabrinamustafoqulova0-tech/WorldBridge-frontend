"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { useLangStore } from "../../store/langStore";
import api from "../../lib/api";
import {
  Search, X, Heart, Clock, Languages, UserCheck,
  ArrowRight, SlidersHorizontal, CheckCircle2,
  CalendarDays, Banknote, MapPin, AlertCircle, Plus, Send, CheckCircle,
} from "lucide-react";
import AuthGateModal from "../../components/AuthGateModal";
import { CountryFlag } from "../../components/CountryFlag";
import { translations } from "../../locales/translations";
import { useScrollLock } from "../../utils/useScrollLock";
import { getLocalizedField } from "../../utils/langHelper";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Program {
  id: number;
  slug: string;
  country_slug: string | null;
  title: string;
  category: string;
  level: string;
  short_description: string;
  salary_range: string | null;
  deadline: string | null;
  residence_permit: boolean;
  pros: string | null;
  cost: string | null;
  min_age: number | null;
  max_age: number | null;
  duration_months: number | null;
  language_requirement: string | null;
  cover_image_url: string | null;
}

// ─── Static maps ────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, {
  label: string;
  color: string;
  dot: string;
  placeholder: string;
  emoji: string;
}> = {
  STUDIUM:     { label: "Обучение",        color: "text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950 dark:border-sky-800",                          dot: "bg-sky-500",     placeholder: "bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-950 dark:to-sky-900",          emoji: "🎓" },
  ARBEIT:      { label: "Работа",          color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800",  dot: "bg-emerald-500", placeholder: "bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-950 dark:to-emerald-900", emoji: "💼" },
  AUSBILDUNG:  { label: "Аусбильдунг",     color: "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950 dark:border-violet-800",       dot: "bg-violet-500",  placeholder: "bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-950 dark:to-violet-900",  emoji: "🔧" },
  AU_PAIR:     { label: "Au Pair",         color: "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950 dark:border-rose-800",                   dot: "bg-rose-500",    placeholder: "bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-950 dark:to-rose-900",          emoji: "🏠" },
  INTERNSHIP:  { label: "Стажировка",      color: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800",       dot: "bg-orange-500",  placeholder: "bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950 dark:to-orange-900",  emoji: "📋" },
  VOLUNTEERING:{ label: "Волонтерство",    color: "text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950 dark:border-teal-800",                   dot: "bg-teal-500",    placeholder: "bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-950 dark:to-teal-900",          emoji: "🌱" },
  FSJ:         { label: "FSJ",             color: "text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950 dark:border-teal-800",                   dot: "bg-teal-500",    placeholder: "bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-950 dark:to-teal-900",          emoji: "🤝" },
  IMMIGRATION: { label: "Иммиграция",      color: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800",                         dot: "bg-red-500",     placeholder: "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-950 dark:to-red-900",              emoji: "✈️" },
  SCHULE:      { label: "Школьный обмен",  color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950 dark:border-indigo-800",      dot: "bg-indigo-500",  placeholder: "bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-950 dark:to-indigo-900",  emoji: "📚" },
  LANGUAGE:    { label: "Языковые курсы",  color: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800",             dot: "bg-amber-500",   placeholder: "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-950 dark:to-amber-900",      emoji: "🗣️" },
};

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[(cat || "").toUpperCase()] ?? {
    label: cat,
    color: "text-[var(--muted)] bg-[var(--card)] border-[var(--border)]",
    dot: "bg-[var(--muted)]",
    placeholder: "bg-gradient-to-br from-[var(--border)] to-[var(--card)]",
    emoji: "🌍",
  };
}

function formatDuration(months: number | null, t: any, lang: string) {
  if (!months) return null;
  if (months < 12) return `${months} ${t?.months ?? "мес."}`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  let yearWord = t?.yearUnit ?? "лет";
  if (lang === "ru") yearWord = y === 1 ? "год" : y < 5 ? "года" : "лет";
  if (m === 0) return `${y} ${yearWord}`;
  return `${y} ${t?.yearShort ?? "г."} ${m} ${t?.monthShort ?? "м."}`;
}

function formatAge(min: number | null, max: number | null, t: any) {
  if (!min && !max) return null;
  if (!max) return `${t?.ageFrom ?? "от"} ${min}`;
  return `${min}–${max} ${t?.ageSuffix ?? "лет"}`;
}

function getTopPros(pros: string | null, max = 2): string[] {
  if (!pros) return [];
  return pros.split("\n").map(s => s.trim()).filter(Boolean).slice(0, max);
}

function shortenDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  const s = deadline.trim();
  if (s.length <= 30) return s;
  const dot = s.indexOf(".");
  if (dot > 0 && dot < 40) return s.slice(0, dot + 1);
  return s.slice(0, 30) + "…";
}

function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-44 skeleton rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 skeleton rounded-full" />
          <div className="h-5 w-16 skeleton rounded-full" />
        </div>
        <div className="h-5 w-3/4 skeleton" />
        <div className="space-y-2">
          <div className="h-3.5 w-full skeleton" />
          <div className="h-3.5 w-5/6 skeleton" />
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-5 py-3 flex justify-between">
        <div className="h-4 w-24 skeleton" />
        <div className="h-4 w-20 skeleton" />
      </div>
    </div>
  );
}

function ProgramCard({
  program,
  isFav,
  isAuthenticated,
  onCardClick,
  onToggleFav,
  catLabel,
  clarifyConditions,
  lang,
  programsT,
}: {
  program: Program;
  isFav: boolean;
  isAuthenticated: boolean;
  onCardClick: (slug: string) => void;
  onToggleFav: (e: React.MouseEvent, id: number) => void;
  catLabel?: string;
  clarifyConditions?: string;
  lang?: string;
  programsT?: any;
}) {
  const cat = getCategoryConfig(program.category);
  const pros = getTopPros(program.pros, 2);
  const duration = formatDuration(program.duration_months, programsT, lang ?? "ru");
  const age = formatAge(program.min_age, program.max_age, programsT);
  const deadline = shortenDeadline(program.deadline);

  return (
    <article
      onClick={() => onCardClick(program.slug)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onCardClick(program.slug); }}
      className="group card-interactive overflow-hidden cursor-pointer flex flex-col"
    >
      <div className="relative h-48 overflow-hidden shrink-0 bg-[var(--background-subtle)]">
        {program.cover_image_url ? (
          <img
            src={program.cover_image_url}
            alt={program.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`absolute inset-0 ${cat.placeholder} flex items-center justify-center`}>
            <span className="text-7xl opacity-20 select-none">{cat.emoji}</span>
          </div>
        )}

        {isAuthenticated && (
          <button
            onClick={e => onToggleFav(e, program.id)}
            aria-label={isFav ? "Убрать из избранного" : "В избранное"}
            className={`absolute top-3 right-3 w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-all
              ${isFav
                ? "border-rose-200 text-rose-500 bg-white dark:bg-rose-950/80 dark:border-rose-900"
                : "border-[var(--border)] text-[var(--muted)] bg-white/80 dark:bg-black/30 hover:text-rose-500 hover:border-rose-200"
              }`}
          >
            <Heart size={13} fill={isFav ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      <div className="px-4 pt-3.5 pb-0 flex items-center justify-between gap-2">
        <span className="badge badge-neutral text-[10px] font-semibold">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cat.dot}`} />
          {catLabel || cat.label}
        </span>
        {program.country_slug && (
          <CountryFlag slug={program.country_slug} showName size="sm" lang={(lang as "ru" | "en" | "tj") || "ru"} />
        )}
      </div>

      <div className="px-4 pt-2.5 pb-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors leading-snug mb-1.5 line-clamp-2">
          {getLocalizedField(program, 'title', (lang as any) || 'ru')}
        </h3>
        <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
          {getLocalizedField(program, 'short_description', (lang as any) || 'ru')}
        </p>
      </div>

      {pros.length > 0 && (
        <div className="px-4 pb-3 space-y-1.5">
          {pros.map((p, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-[var(--muted)]">
              <CheckCircle2 size={11} className="text-[var(--accent)] shrink-0 mt-0.5" />
              <span className="line-clamp-1">{p}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto border-t border-[var(--border)] px-4 py-2.5 flex flex-wrap gap-x-3 gap-y-1">
        {duration && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
            <Clock size={10} className="text-[var(--accent)]" />
            {duration}
          </span>
        )}
        {program.language_requirement && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
            <Languages size={10} className="text-[var(--accent)]" />
            {program.language_requirement}
          </span>
        )}
        {age && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
            <UserCheck size={10} className="text-[var(--accent)]" />
            {age}
          </span>
        )}
        {program.residence_permit && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
            <MapPin size={10} />
            ВНЖ
          </span>
        )}
      </div>

      <div className="border-t border-[var(--border)] px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {program.salary_range ? (
            <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
              <Banknote size={12} className="shrink-0" />
              {program.salary_range}
            </span>
          ) : program.cost ? (
            <span className="text-xs font-medium text-[var(--foreground)] truncate">{program.cost}</span>
          ) : (
            <span className="text-xs text-[var(--muted)]">{clarifyConditions || "Уточняйте условия"}</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {deadline && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] hidden sm:inline-flex">
              <CalendarDays size={10} />
              <span className="truncate max-w-[100px]">{deadline}</span>
            </span>
          )}
          <div className="w-6 h-6 rounded-md border border-[var(--border)] flex items-center justify-center text-[var(--muted)]
            group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-dim)]
            transition-colors shrink-0">
            <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </article>
  );
}

const SUGGEST_COUNTRIES = [
  "Германия", "Франция", "Бельгия", "Швейцария", "Австрия",
  "Польша", "Чехия", "Швеция", "Норвегия", "Финляндия",
  "Китай", "Канада", "США", "Другая",
];

function SuggestProgramModal({ onClose }: { onClose: () => void }) {
  const inputCls =
    "w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--foreground)] " +
    "focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-[var(--muted)]";

  useScrollLock(true);

  const [form, setForm] = useState({
    submitter_name: "",
    submitter_email: "",
    submitter_phone: "",
    program_title: "",
    country: "",
    description: "",
    official_url: "",
    extra_info: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.submitter_name.trim().length < 2) errs.submitter_name = "Минимум 2 символа";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submitter_email)) errs.submitter_email = "Неверный email";
    if (!/^\+?[0-9\s\-\(\)]{7,30}$/.test(form.submitter_phone.trim())) errs.submitter_phone = "Неверный формат";
    if (form.program_title.trim().length < 3) errs.program_title = "Минимум 3 символа";
    if (!form.country) errs.country = "Выберите страну";
    if (form.description.trim().length < 50) errs.description = "Минимум 50 символов";
    if (form.official_url && !/^https?:\/\//.test(form.official_url.trim()))
      errs.official_url = "URL должен начинаться с http:// или https://";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setServerError("");
    try {
      await api.post("/suggestions", {
        submitter_name: form.submitter_name.trim(),
        submitter_email: form.submitter_email.trim(),
        submitter_phone: form.submitter_phone.trim(),
        program_title: form.program_title.trim(),
        country: form.country,
        description: form.description.trim(),
        official_url: form.official_url.trim() || null,
        extra_info: form.extra_info.trim() || null,
      });
      setSuccess(true);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") setServerError(detail);
      else if (Array.isArray(detail)) setServerError(detail.map((d: any) => d.msg).join("; "));
      else setServerError("Ошибка при отправке. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-[200] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" style={{ touchAction: "none" }} />

        <div className="relative w-full max-w-lg bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--background)] z-10">
            <div>
              <h2 className="text-base font-bold">Предложить программу</h2>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">Знаете интересную программу? Расскажите нам!</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)]"
            >
              <X size={15} />
            </button>
          </div>

          <div className="px-6 py-5">
            {success ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <CheckCircle size={32} className="text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Спасибо!</h3>
                  <p className="text-sm text-[var(--muted)] max-w-xs">
                    Ваше предложение отправлено на рассмотрение. Мы изучим его и свяжемся с вами при необходимости.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-emerald-500 transition-all"
                >
                  Закрыть
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} id="suggest-form" className="space-y-4">
                {serverError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                    {serverError}
                  </div>
                )}

                <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">Ваши контакты</p>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">Имя и фамилия *</label>
                  <input
                    type="text" value={form.submitter_name} onChange={set("submitter_name")}
                    placeholder="Иван Иванов" className={inputCls} />
                  {errors.submitter_name && <p className="text-[11px] text-red-500">{errors.submitter_name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--muted)]">Email *</label>
                    <input
                      type="email" value={form.submitter_email} onChange={set("submitter_email")}
                      placeholder="you@example.com" className={inputCls} />
                    {errors.submitter_email && <p className="text-[11px] text-red-500">{errors.submitter_email}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--muted)]">Телефон *</label>
                    <input
                      type="tel" value={form.submitter_phone} onChange={set("submitter_phone")}
                      placeholder="+992 XX XXX XXXX" className={inputCls} />
                    {errors.submitter_phone && <p className="text-[11px] text-red-500">{errors.submitter_phone}</p>}
                  </div>
                </div>

                <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] pt-2">О программе</p>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">Название программы *</label>
                  <input
                    type="text" value={form.program_title} onChange={set("program_title")}
                    placeholder="Например: Ausbildung — Informatikkaufmann" className={inputCls} />
                  {errors.program_title && <p className="text-[11px] text-red-500">{errors.program_title}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">Страна *</label>
                  <select value={form.country} onChange={set("country")} className={inputCls}>
                    <option value="">— Выберите страну —</option>
                    {SUGGEST_COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.country && <p className="text-[11px] text-red-500">{errors.country}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">
                    Описание программы * <span className="font-normal opacity-60">(мин. 50 симв.)</span>
                  </label>
                  <textarea
                    rows={4} value={form.description} onChange={set("description")}
                    placeholder="Расскажите, что это за программа, каковы требования, что она даёт участникам..."
                    className={inputCls} />
                  <p className="text-[10px] text-[var(--muted)] text-right">{form.description.length}/5000</p>
                  {errors.description && <p className="text-[11px] text-red-500">{errors.description}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">Ссылка на официальный сайт</label>
                  <input
                    type="url" value={form.official_url} onChange={set("official_url")}
                    placeholder="https://..." className={inputCls} />
                  {errors.official_url && <p className="text-[11px] text-red-500">{errors.official_url}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">Дополнительная информация</label>
                  <textarea
                    rows={3} value={form.extra_info} onChange={set("extra_info")}
                    placeholder="Любые дополнительные сведения о программе..."
                    className={inputCls} />
                </div>
              </form>
            )}
          </div>

          {!success && (
            <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between sticky bottom-0 bg-[var(--background)] z-10">
              <button
                type="button" onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold hover:bg-[var(--card)] transition-all"
              >
                Отмена
              </button>
              <button
                type="submit" form="suggest-form" disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-emerald-500 transition-all disabled:opacity-50 shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
              >
                {submitting ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Отправка...</>
                ) : (
                  <><Send size={14} /> Отправить</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProgramsListClient({ initialPrograms }: { initialPrograms: Program[] }) {
  const { isAuthenticated } = useAuthStore();
  const { lang } = useLangStore();
  const router = useRouter();
  const text = (translations[lang] as any)?.programsList || (translations.ru as any).programsList;

  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [filtered, setFiltered] = useState<Program[]>(initialPrograms);
  const [loading, setLoading] = useState(initialPrograms.length === 0);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [categories, setCategories] = useState<string[]>(() => {
    const cats = Array.from(new Set(initialPrograms.map(p => (p.category || "").toUpperCase()).filter(Boolean)));
    return ["ALL", ...cats];
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [authGate, setAuthGate] = useState<{ open: boolean; target: string }>({ open: false, target: "" });
  const [suggestOpen, setSuggestOpen] = useState(false);

  useEffect(() => {
    if (initialPrograms.length > 0) return;
    setLoading(true);
    setError(false);
    api.get("/programs", { params: { size: 100 } })
      .then(res => {
        const list: Program[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.items)
          ? res.data.items
          : [];
        setPrograms(list);
        setFiltered(list);
        const cats = Array.from(new Set(list.map(p => (p.category || "").toUpperCase()).filter(Boolean)));
        setCategories(["ALL", ...cats]);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lang, initialPrograms]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/favorites")
      .then(res => {
        const ids = new Set<number>((res.data.items || []).map((f: any) => f.program_id as number));
        setFavoriteIds(ids);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    let res = programs;
    if (selectedCategory !== "ALL") {
      res = res.filter(p => (p.category || "").toUpperCase() === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.short_description || "").toLowerCase().includes(q)
      );
    }
    setFiltered(res);
  }, [search, selectedCategory, programs]);

  const handleCardClick = useCallback((slug: string) => {
    if (isAuthenticated) router.push(`/programs/${slug}`);
    else setAuthGate({ open: true, target: `/programs/${slug}` });
  }, [isAuthenticated, router]);

  const toggleFavorite = useCallback(async (e: React.MouseEvent, programId: number) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (favoriteIds.has(programId)) {
      await api.delete(`/favorites/${programId}`).catch(() => {});
      setFavoriteIds(prev => { const s = new Set(prev); s.delete(programId); return s; });
    } else {
      await api.post(`/favorites/${programId}`).catch(() => {});
      setFavoriteIds(prev => new Set(prev).add(programId));
    }
  }, [isAuthenticated, favoriteIds]);

  return (
    <div className="min-h-[100dvh] bg-[var(--background-subtle)] text-[var(--foreground)]">
      <div className="pt-14 bg-[var(--card)] border-b border-[var(--border)]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <p className="section-label">
                {loading ? "загружаем…" : `${filtered.length} ${text.count}`}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                {text.title}
              </h1>
              <p className="text-sm text-[var(--muted)] max-w-[52ch] leading-relaxed font-light">
                {text.subtitle}
              </p>
            </div>
            <button
              onClick={() => setSuggestOpen(true)}
              className="btn btn-secondary btn-sm shrink-0 mt-1"
            >
              <Plus size={13} />
              {text.suggestBtn}
            </button>
          </div>
        </div>
      </div>

      <div className="sticky top-14 z-40 bg-[var(--card)] border-b border-[var(--border)] shadow-[var(--shadow-xs)]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-shrink-0 w-full sm:w-60">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
            <input
              type="text"
              placeholder={text.searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background-subtle)] text-sm
                placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2
                focus:ring-[var(--accent)]/10 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                <X size={12} />
              </button>
            )}
          </div>

          <button
            onClick={() => setFiltersOpen(v => !v)}
            className="sm:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm font-medium justify-center"
          >
            <SlidersHorizontal size={13} />
            {text.categoriesToggle}
          </button>

          <div className={`${filtersOpen ? "flex" : "hidden"} sm:flex flex-wrap gap-1.5`}>
            {categories.map(cat => {
              const label = (text.categories as Record<string, string>)?.[cat] ?? cat;
              const active = selectedCategory === cat;
              const cfg = CATEGORY_CONFIG[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap border transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-[var(--accent)] text-white border-transparent shadow-[0_2px_8px_rgba(16,185,129,0.25)]"
                      : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border)] bg-[var(--background-subtle)]"
                  }`}
                >
                  {cfg && cat !== "ALL" && <span className="text-[11px] leading-none">{cfg.emoji}</span>}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8 pb-24">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-3">
            <AlertCircle size={32} className="text-[var(--muted)]" />
            <p className="font-semibold">{text.errorTitle}</p>
            <p className="text-sm text-[var(--muted)]">{text.errorSub}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-5 py-2 rounded-xl border border-[var(--border)] text-sm font-medium
                hover:border-[var(--accent)]/40 hover:bg-[var(--accent-dim)] transition-all"
            >
              {text.errorBtn}
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-3 border border-dashed border-[var(--border)] rounded-2xl">
            <Search size={28} className="text-[var(--muted)]" strokeWidth={1.5} />
            <div>
              <p className="font-semibold mb-1">{text.emptyTitle}</p>
              <p className="text-sm text-[var(--muted)] max-w-xs">{text.emptySub}</p>
            </div>
            <button
              onClick={() => { setSearch(""); setSelectedCategory("ALL"); }}
              className="px-5 py-2 rounded-xl border border-[var(--border)] text-sm font-medium
                hover:border-[var(--accent)]/40 hover:bg-[var(--accent-dim)] transition-all"
            >
              {text.emptyBtn}
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(program => (
              <ProgramCard
                key={program.id}
                program={program}
                isFav={favoriteIds.has(program.id)}
                isAuthenticated={isAuthenticated}
                onCardClick={handleCardClick}
                onToggleFav={toggleFavorite}
                catLabel={(text.categories as Record<string, string>)?.[(program.category || "").toUpperCase()]}
                clarifyConditions={text.clarifyConditions}
                lang={lang}
                programsT={(translations[lang] as any)?.programs || (translations.ru as any).programs}
              />
            ))}
          </div>
        )}
      </div>

      <AuthGateModal
        isOpen={authGate.open}
        onClose={() => setAuthGate({ open: false, target: "" })}
        redirectTo={authGate.target}
      />

      {suggestOpen && <SuggestProgramModal onClose={() => setSuggestOpen(false)} />}
    </div>
  );
}
