"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  BookOpen,
  Star,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
} from "lucide-react";

interface Course {
  lang: string;
  flag: string;
  color: string;
  accent: string;
  image: string;
  tagline: string;
  centers: Center[];
}

interface Center {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  note?: string;
  rating: number;
  schedule: string;
  price: string;
}

const COURSES: Course[] = [
  {
    lang: "Английский язык",
    flag: "🇬🇧",
    color: "from-blue-900/80",
    accent: "text-blue-400",
    image:
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=900&q=80",
    tagline: "Самый востребованный язык для учёбы и карьеры за рубежом",
    centers: [
      {
        name: "British Council Tajikistan",
        address: "ул. Айни, 14, Душанбе",
        phone: "+992 37 221 85 00",
        website: "https://www.britishcouncil.tj",
        note: "Официальный центр IELTS, Cambridge English",
        rating: 5,
        schedule: "Пн–Пт 09:00–19:00, Сб 10:00–16:00",
        price: "от 350 сомони/мес",
      },
      {
        name: "American Language Center",
        address: "пр. Рудаки, 22, Душанбе",
        phone: "+992 37 224 00 11",
        note: "TOEFL подготовка, разговорные клубы",
        rating: 5,
        schedule: "Пн–Сб 08:00–20:00",
        price: "от 280 сомони/мес",
      },
      {
        name: "Lingua Academy",
        address: "ул. Бохтар, 8, Душанбе",
        phone: "+992 90 777 11 22",
        note: "Интенсивные курсы, малые группы",
        rating: 4,
        schedule: "Пн–Пт 10:00–20:00",
        price: "от 200 сомони/мес",
      },
    ],
  },
  {
    lang: "Немецкий язык",
    flag: "🇩🇪",
    color: "from-yellow-900/80",
    accent: "text-yellow-400",
    image:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80",
    tagline: "Открой дверь в Германию, Австрию и Швейцарию",
    centers: [
      {
        name: "Goethe-Institut Duschanbe",
        address: "ул. Айни, 37, Душанбе",
        phone: "+992 37 221 39 22",
        website: "https://www.goethe.de/ins/tj/ru",
        note: "Официальный центр Goethe-Zertifikat, TestDaF",
        rating: 5,
        schedule: "Пн–Пт 09:00–18:00",
        price: "от 400 сомони/мес",
      },
      {
        name: "DEX Language Center",
        address: "пр. Рудаки, 105, Душанбе",
        phone: "+992 92 000 55 66",
        note: "Специализация на немецком для эмиграции, A1–C1",
        rating: 5,
        schedule: "Пн–Сб 09:00–21:00",
        price: "от 300 сомони/мес",
      },
      {
        name: "Euro Lingua Dushanbe",
        address: "ул. Сино, 4, Душанбе",
        phone: "+992 93 500 77 88",
        note: "Мини-группы до 8 человек, онлайн-формат",
        rating: 4,
        schedule: "Гибкое расписание",
        price: "от 250 сомони/мес",
      },
    ],
  },
  {
    lang: "Турецкий язык",
    flag: "🇹🇷",
    color: "from-red-900/80",
    accent: "text-red-400",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80",
    tagline: "Турецкий открывает путь в Стамбул, Анкару и весь тюркский мир",
    centers: [
      {
        name: "Yunus Emre Enstitüsü",
        address: "ул. Айни, 78, Душанбе",
        phone: "+992 37 233 77 77",
        website: "https://www.yee.org.tr",
        note: "Официальный культурный центр Турции, бесплатные курсы",
        rating: 5,
        schedule: "Пн–Сб 09:00–18:00",
        price: "Бесплатно / от 150 сомони",
      },
      {
        name: "TurkDil Academy",
        address: "пр. Рудаки, 55, Душанбе",
        phone: "+992 90 111 22 33",
        note: "Бизнес-турецкий, подготовка к YTÖ",
        rating: 4,
        schedule: "Пн–Пт 10:00–20:00",
        price: "от 220 сомони/мес",
      },
    ],
  },
  {
    lang: "Китайский язык",
    flag: "🇨🇳",
    color: "from-orange-900/80",
    accent: "text-orange-400",
    image:
      "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=900&q=80",
    tagline: "Мандаринский — ключ к 1.4 миллиарду возможностей",
    centers: [
      {
        name: "Confucius Institute at TNU",
        address: "Таджикский нац. университет, ул. Рудаки, 17",
        phone: "+992 37 227 10 10",
        note: "Официальный институт Конфуция, HSK подготовка, стипендии",
        rating: 5,
        schedule: "Пн–Пт 09:00–17:00",
        price: "Субсидированно — от 100 сомони",
      },
      {
        name: "ChinaLang Dushanbe",
        address: "ул. Бохтар, 22, Душанбе",
        phone: "+992 93 700 66 55",
        note: "Интенсивный разговорный китайский, HSK 1–4",
        rating: 4,
        schedule: "Пн–Сб 10:00–19:00",
        price: "от 200 сомони/мес",
      },
    ],
  },
];

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={11}
          className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-[var(--border)]"}
        />
      ))}
    </div>
  );
}

export default function LanguageCoursesPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] font-sans pb-24 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-0 right-[10%] w-[50dvw] h-[40dvw] bg-blue-500 rounded-full blur-[180px] opacity-[0.03] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[-5%] w-[40dvw] h-[40dvw] bg-[var(--accent)] rounded-full blur-[160px] opacity-[0.04] pointer-events-none z-0" />

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <div className="relative h-[42vh] min-h-[280px] max-h-[380px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1400&q=80"
          alt="Language courses"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

        {/* Back */}
        <div className="absolute top-0 left-0 right-0 pt-20 px-4 md:px-6">
          <div className="max-w-[1440px] mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-xs font-semibold backdrop-blur-sm bg-white/10 border border-white/15 px-3 py-1.5 rounded-full transition-all hover:bg-white/20"
            >
              <ArrowLeft size={12} /> На главную
            </Link>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-12 left-0 right-0 px-4 md:px-6"
        >
          <div className="max-w-[1440px] mx-auto space-y-2">
            <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] flex items-center gap-1.5">
              <Globe size={11} /> Душанбе · 4 языка
            </p>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">
              Языковые курсы
            </h1>
            <p className="text-sm text-white/65 max-w-[55ch]">
              Рекомендуемые языковые школы и центры в Душанбе — проверенные, с реальными адресами и контактами.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ─── Content ──────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 relative z-10 mt-16 space-y-20">
        {COURSES.map((course, ci) => (
          <motion.section
            key={course.lang}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ staggerChildren: 0.08 }}
            className="space-y-8"
          >
            {/* Section header */}
            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <div className="relative h-[120px] w-[220px] rounded-2xl overflow-hidden shrink-0 hidden sm:block">
                <img
                  src={course.image}
                  alt={course.lang}
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.6]"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${course.color} to-transparent`} />
                <span className="absolute bottom-3 left-3 text-4xl">{course.flag}</span>
              </div>
              <div>
                <span className="text-3xl sm:hidden mb-1 block">{course.flag}</span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">{course.lang}</h2>
                <p className={`text-sm mt-1 font-medium ${course.accent}`}>{course.tagline}</p>
              </div>
            </motion.div>

            {/* Centers grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {course.centers.map((center) => (
                <motion.div
                  key={center.name}
                  variants={itemVariants}
                  className="border border-[var(--border)] rounded-2xl bg-[var(--card)] p-6 hover:border-[var(--accent)]/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base leading-snug">{center.name}</h3>
                      <StarRating rating={center.rating} />
                    </div>
                    {center.note && (
                      <p className="text-xs text-[var(--accent)] font-medium leading-relaxed bg-[var(--accent-dim)] px-2.5 py-1.5 rounded-lg border border-[var(--accent)]/20">
                        {center.note}
                      </p>
                    )}
                    <div className="space-y-1.5 text-xs text-[var(--muted)]">
                      <div className="flex items-start gap-2">
                        <MapPin size={11} className="shrink-0 mt-0.5 text-[var(--accent)]" />
                        <span>{center.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={11} className="shrink-0 text-[var(--accent)]" />
                        <span>{center.schedule}</span>
                      </div>
                      {center.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={11} className="shrink-0 text-[var(--accent)]" />
                          <a href={`tel:${center.phone}`} className="hover:text-[var(--foreground)] transition-colors">
                            {center.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <span className="text-xs font-bold text-[var(--accent)]">{center.price}</span>
                    {center.website ? (
                      <a
                        href={center.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                      >
                        Сайт <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-[10px] text-[var(--border)]">Только офлайн</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}

        {/* CTA bottom */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center space-y-5"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)] rounded-full blur-[100px] opacity-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full blur-[100px] opacity-[0.06] pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)]">
              <BookOpen className="inline mr-1.5" size={11} />
              Следующий шаг
            </p>
            <h3 className="text-2xl font-black tracking-tight text-balance">
              Выучил язык? Выбери страну для переезда
            </h3>
            <p className="text-sm text-[var(--muted)] max-w-[50ch] mx-auto">
              WorldBridge поможет найти программу эмиграции, учёбы или работы под твой уровень языка.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/countries"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-bold text-sm hover:bg-emerald-500 transition-all active:scale-[0.97]"
              >
                Смотреть страны <ArrowRight size={14} />
              </Link>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-bold text-sm hover:border-[var(--accent)]/40 hover:bg-[var(--accent-dim)] transition-all"
              >
                Программы переезда
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
