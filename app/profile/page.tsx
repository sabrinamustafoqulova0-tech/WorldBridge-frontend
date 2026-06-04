"use client";

import { useAuthStore } from "../../store/authStore";
import { useLangStore } from "../../store/langStore";
import { translations } from "../../locales/translations";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import {
  Heart, CheckCircle2, ClipboardList, ArrowRight, LogOut,
  Globe, Calculator, Sparkles, BookOpen, Star,
  TrendingUp, Award, Zap, Shield, Target, ChevronRight, Check,
} from "lucide-react";
import { CountryFlag } from "../../components/CountryFlag";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FavoriteProgram {
  id: number;
  program_id: number;
  program: {
    id: number;
    slug: string;
    title: string;
    category: string;
    level: string;
    short_description: string;
    country_slug?: string;
  };
}

// ─── Static maps ─────────────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, string> = {
  STUDIUM:     "text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950 dark:border-sky-800",
  ARBEIT:      "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800",
  AUSBILDUNG:  "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950 dark:border-violet-800",
  AU_PAIR:     "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950 dark:border-rose-800",
  INTERNSHIP:  "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800",
  VOLUNTEERING:"text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950 dark:border-teal-800",
  FSJ:         "text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950 dark:border-teal-800",
  IMMIGRATION: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800",
  LANGUAGE:    "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800",
};

const CATEGORY_LABEL: Record<string, string> = {
  STUDIUM: "Обучение", ARBEIT: "Работа", AUSBILDUNG: "Аусбильдунг",
  AU_PAIR: "Au Pair", INTERNSHIP: "Стажировка", VOLUNTEERING: "Волонтерство",
  FSJ: "FSJ", IMMIGRATION: "Иммиграция", LANGUAGE: "Языковые курсы",
};

// ─── Achievements config ──────────────────────────────────────────────────────

interface Achievement {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  unlocked: (data: AchievementData) => boolean;
  color: string;
}

interface AchievementData {
  favCount: number;
  checklistTotal: number;
  doneCount: number;
  isAdmin: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_step",
    icon: <Zap size={16} />,
    title: "Первый шаг",
    desc: "Зарегистрировался в WorldBridge",
    unlocked: () => true,
    color: "text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
  },
  {
    id: "explorer",
    icon: <Globe size={16} />,
    title: "Исследователь",
    desc: "Добавил первую программу в избранное",
    unlocked: ({ favCount }) => favCount >= 1,
    color: "text-sky-500 bg-sky-50 border-sky-200 dark:bg-sky-950 dark:border-sky-800",
  },
  {
    id: "collector",
    icon: <Star size={16} />,
    title: "Коллекционер",
    desc: "Сохранил 5 и более программ",
    unlocked: ({ favCount }) => favCount >= 5,
    color: "text-violet-500 bg-violet-50 border-violet-200 dark:bg-violet-950 dark:border-violet-800",
  },
  {
    id: "planner",
    icon: <ClipboardList size={16} />,
    title: "Планировщик",
    desc: "Создал первый чеклист",
    unlocked: ({ checklistTotal }) => checklistTotal >= 1,
    color: "text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800",
  },
  {
    id: "achiever",
    icon: <Target size={16} />,
    title: "Целеустремлённый",
    desc: "Выполнил 3 и более задачи в чеклисте",
    unlocked: ({ doneCount }) => doneCount >= 3,
    color: "text-teal-500 bg-teal-50 border-teal-200 dark:bg-teal-950 dark:border-teal-800",
  },
  {
    id: "admin",
    icon: <Shield size={16} />,
    title: "Администратор",
    desc: "Управляет платформой WorldBridge",
    unlocked: ({ isAdmin }) => isAdmin,
    color: "text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950 dark:border-rose-800",
  },
];

// ─── Progress helpers ─────────────────────────────────────────────────────────

function getProgressItems(data: AchievementData & { hasFav: boolean }) {
  return [
    {
      done: true,
      text: "Создать аккаунт",
    },
    {
      done: data.hasFav,
      text: "Сохранить первую программу в избранное",
    },
    {
      done: data.checklistTotal > 0,
      text: "Создать чеклист для подготовки документов",
    },
    {
      done: data.doneCount > 0,
      text: "Выполнить первую задачу",
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const { lang } = useLangStore();
  const router = useRouter();
  const text = (translations[lang] as any)?.profile || (translations.ru as any).profile;

  const [favorites, setFavorites] = useState<FavoriteProgram[]>([]);
  const [checklistTotal, setChecklistTotal] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([
      api.get("/favorites"),
      api.get("/checklists"),
    ]).then(([favRes, checkRes]) => {
      setFavorites(favRes.data.items || []);
      setChecklistTotal(checkRes.data.total || 0);
      setDoneCount((checkRes.data.items || []).filter((i: any) => i.is_done).length);
    }).catch(() => {}).finally(() => setDataLoading(false));
  }, [isAuthenticated]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const initials = user.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "WB";
  const firstName = user.full_name?.split(" ")[0] || "Пользователь";

  const achData: AchievementData = {
    favCount: favorites.length,
    checklistTotal,
    doneCount,
    isAdmin: user.is_admin,
  };

  const rawProgressItems = getProgressItems({ ...achData, hasFav: favorites.length > 0 });
  const progressItems = rawProgressItems.map((item, i) => ({
    ...item,
    text: [
      text.progressItems.createAccount,
      text.progressItems.saveFav,
      text.progressItems.createChecklist,
      text.progressItems.doTask,
    ][i] || item.text,
  }));
  const progressPercent = Math.round((progressItems.filter(i => i.done).length / progressItems.length) * 100);

  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.unlocked(achData));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !a.unlocked(achData));

  // Рекомендации — на основе избранных категорий
  const favCategories = favorites
    .map(f => (f.program?.category || "").toUpperCase())
    .filter(Boolean);
  const topCategory = favCategories.length > 0
    ? Object.entries(
        favCategories.reduce((acc, c) => ({ ...acc, [c]: (acc[c] || 0) + 1 }), {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 pt-20 pb-24 space-y-6">

        {/* ─── Profile header ──────────────────────────── */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {/* Gradient banner strip */}
          <div className="h-20 bg-gradient-to-r from-[var(--accent-dim)] via-[var(--accent)]/5 to-[var(--background-subtle)]" />
          <div className="px-6 md:px-8 pb-6 -mt-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-3xl bg-[var(--accent)] flex items-center justify-center text-white text-2xl font-black shrink-0 select-none border-4 border-[var(--card)] shadow-[var(--shadow-md)]">
                {initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight truncate">{user.full_name}</h1>
                    <p className="mt-0.5">
                      <span className="font-mono text-xs bg-[var(--background-subtle)] text-[var(--muted)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                        {user.email}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => { logout(); router.push("/login"); }}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors shrink-0 mt-0.5"
                  >
                    <LogOut size={13} />
                    {text.logoutBtn}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {user.is_admin && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full">
                      <Sparkles size={10} /> Администратор
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-dim)] border border-[var(--accent)]/20 px-2.5 py-1 rounded-full">
                    <Award size={10} /> {unlockedAchievements.length} достижений
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Stats row ───────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              value: favorites.length,
              label: text.favorites,
              icon: <Heart size={16} className="text-rose-500" />,
              accent: "rose",
            },
            {
              value: checklistTotal,
              label: text.checklistTasks,
              icon: <ClipboardList size={16} className="text-[var(--accent)]" />,
              accent: "accent",
            },
            {
              value: doneCount,
              label: text.completed,
              icon: <CheckCircle2 size={16} className="text-emerald-500" />,
              accent: "emerald",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-2 overflow-hidden relative"
            >
              <div className="flex items-center justify-between">
                {stat.icon}
              </div>
              <span className="text-3xl font-black tracking-tight tabular-nums text-[var(--foreground)]">
                {dataLoading ? "—" : stat.value}
              </span>
              <p className="text-xs font-medium text-[var(--muted)] leading-tight">
                {stat.label}
              </p>
              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                stat.accent === "rose" ? "bg-rose-400" :
                stat.accent === "emerald" ? "bg-emerald-400" :
                "bg-[var(--accent)]"
              } opacity-60`} />
            </div>
          ))}
        </div>

        {/* ─── Journey progress ────────────────────────── */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold flex items-center gap-1.5">
                <TrendingUp size={15} className="text-[var(--accent)]" />
                {text.progressTitle}
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {progressPercent}% {text.progressSub}
              </p>
            </div>
            <span className="text-3xl font-black text-[var(--accent)] tabular-nums">{progressPercent}%</span>
          </div>

          {/* Progress bar with markers */}
          <div className="relative mb-6">
            <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Milestone dots */}
            <div className="absolute inset-0 flex items-center justify-between px-0">
              {progressItems.map((item, i) => {
                const pct = ((i + 1) / progressItems.length) * 100;
                return (
                  <div
                    key={i}
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-colors duration-500"
                    style={{ left: `${pct}%`, transform: "translate(-50%, -50%)" }}
                    title={item.text}
                  >
                    <div className={`w-full h-full rounded-full ${item.done ? "bg-[var(--accent)] border-[var(--accent)]" : "bg-[var(--card)] border-[var(--border)]"}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {progressItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  item.done
                    ? "bg-[var(--accent)] text-white"
                    : "border-2 border-[var(--border)]"
                }`}>
                  {item.done && <CheckCircle2 size={12} fill="currentColor" />}
                </div>
                <span className={`text-[12px] ${item.done ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Achievements ─────────────────────────────── */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-base font-bold flex items-center gap-1.5 mb-4">
            <Award size={15} className="text-[var(--accent)]" />
            {text.achievementsTitle}
            <span className="ml-auto text-xs font-semibold text-[var(--muted)]">
              {unlockedAchievements.length} / {ACHIEVEMENTS.length}
            </span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ACHIEVEMENTS.map(a => {
              const unlocked = a.unlocked(achData);
              return (
                <div
                  key={a.id}
                  className={`relative rounded-xl border p-3 flex items-start gap-3 transition-all ${
                    unlocked
                      ? a.color
                      : "opacity-35 border-dashed border-[var(--border)] text-[var(--muted)] bg-transparent"
                  }`}
                >
                  {unlocked && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-current opacity-25 flex items-center justify-center">
                      <Check size={9} className="opacity-100" />
                    </div>
                  )}
                  <div className={`shrink-0 mt-0.5 ${unlocked ? "" : "grayscale"}`}>
                    {a.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight">{(text.achievements as any)?.[a.id]?.title || a.title}</p>
                    <p className="text-[11px] opacity-70 leading-snug mt-0.5">{(text.achievements as any)?.[a.id]?.desc || a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Saved programs ───────────────────────────── */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-[13px] font-bold flex items-center gap-1.5">
              <Heart size={14} className="text-rose-500" />
              {text.favSection}
              {favorites.length > 0 && (
                <span className="ml-1 text-[11px] font-semibold text-[var(--muted)]">({favorites.length})</span>
              )}
            </h2>
            <Link href="/programs" className="text-[12px] text-[var(--accent)] hover:underline font-semibold flex items-center gap-0.5">
              Все <ChevronRight size={12} />
            </Link>
          </div>

          {dataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6 gap-3">
              <div className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted)]">
                <Heart size={18} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold">Пока пусто</p>
                <p className="text-[12px] text-[var(--muted)] mt-0.5">Сохраняйте программы, чтобы вернуться к ним позже</p>
              </div>
              <Link
                href="/programs"
                className="px-4 py-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-[12px] font-semibold hover:opacity-85 transition-all"
              >
                {text.browseProgramsBtn}
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {favorites.slice(0, 6).map(fav => {
                const catStyle = CATEGORY_STYLE[(fav.program?.category || "").toUpperCase()] || "text-[var(--muted)] bg-transparent border-[var(--border)]";
                const catLabel = CATEGORY_LABEL[(fav.program?.category || "").toUpperCase()] || fav.program?.category;
                return (
                  <li key={fav.id} className="group">
                    <Link
                      href={`/programs/${fav.program?.slug}`}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--background)] transition-colors"
                    >
                      {fav.program?.country_slug && (
                        <CountryFlag slug={fav.program.country_slug} size="lg" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${catStyle}`}>
                            {catLabel}
                          </span>
                        </div>
                        <p className="text-[13px] font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                          {fav.program?.title}
                        </p>
                        <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                          {fav.program?.short_description}
                        </p>
                      </div>
                      <ArrowRight size={13} className="text-[var(--muted)] group-hover:text-[var(--accent)] shrink-0 transition-colors" />
                    </Link>
                  </li>
                );
              })}
              {favorites.length > 6 && (
                <li>
                  <Link
                    href="/programs"
                    className="flex items-center justify-center gap-1 px-5 py-3 text-[12px] text-[var(--accent)] font-semibold hover:bg-[var(--background)] transition-colors"
                  >
                    Ещё {favorites.length - 6} программ <ChevronRight size={12} />
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>

        {/* ─── Personalized recommendations ────────────── */}
        {topCategory && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
            <h2 className="text-[13px] font-bold flex items-center gap-1.5 mb-3">
              <Sparkles size={14} className="text-[var(--accent)]" />
              Рекомендуем для вас
            </h2>
            <p className="text-[12px] text-[var(--muted)] mb-4">
              На основе ваших избранных — больше программ категории{" "}
              <span className="font-semibold text-[var(--foreground)]">
                «{CATEGORY_LABEL[topCategory] || topCategory}»
              </span>
            </p>
            <Link
              href={`/programs?category=${topCategory}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-dim)] border border-[var(--accent)]/20 text-[13px] font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-all"
            >
              Смотреть похожие <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* ─── Quick links ─────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/countries",    icon: <Globe size={16} />,        label: "Страны",      desc: "Обзор 13 стран" },
            { href: "/checklist",    icon: <ClipboardList size={16} />, label: "Чеклист",     desc: "Подготовка" },
            { href: "/calculator",   icon: <Calculator size={16} />,    label: "Калькулятор", desc: "Расчёт бюджета" },
            { href: "/ai-consultant",icon: <Sparkles size={16} />,      label: "AI советник", desc: "Персонально" },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="card-interactive p-4 flex flex-col gap-2 group"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-dim)] flex items-center justify-center text-[var(--accent)]">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold group-hover:text-[var(--accent)] transition-colors">{item.label}</p>
                <p className="text-xs text-[var(--muted)]">{item.desc}</p>
              </div>
              <ArrowRight size={12} className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all mt-auto" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
