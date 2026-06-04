"use client";

import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useLangStore } from "../../store/langStore";
import { useAIConsultantStore } from "../../store/aiConsultantStore";
import { translations } from "../../locales/translations";
import { motion } from "framer-motion";
import { MapPin, Search, X, CheckCircle2, Building, ExternalLink, FileText } from "lucide-react";
import { COUNTRY_CENTERS, CITY_COORDS } from "../../utils/countryCoordinates";

const WorldGlobe = dynamic(() => import("../../components/WorldGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
    </div>
  ),
});

const COUNTRIES = [
  { id: "de", name: "Germany",     programs: 142, ...COUNTRY_CENTERS.de },
  { id: "fr", name: "France",      programs: 89,  ...COUNTRY_CENTERS.fr },
  { id: "be", name: "Belgium",     programs: 58,  ...COUNTRY_CENTERS.be },
  { id: "ch", name: "Switzerland", programs: 64,  ...COUNTRY_CENTERS.ch },
  { id: "at", name: "Austria",     programs: 47,  ...COUNTRY_CENTERS.at },
  { id: "pl", name: "Poland",      programs: 112, ...COUNTRY_CENTERS.pl },
  { id: "cz", name: "Czechia",     programs: 38,  ...COUNTRY_CENTERS.cz },
  { id: "se", name: "Sweden",      programs: 76,  ...COUNTRY_CENTERS.se },
  { id: "no", name: "Norway",      programs: 41,  ...COUNTRY_CENTERS.no },
  { id: "fi", name: "Finland",     programs: 53,  ...COUNTRY_CENTERS.fi },
  { id: "tr", name: "Turkey",      programs: 125, ...COUNTRY_CENTERS.tr },
  { id: "cn", name: "China",       programs: 215, ...COUNTRY_CENTERS.cn },
  { id: "ca", name: "Canada",      programs: 184, ...COUNTRY_CENTERS.ca },
  { id: "us", name: "USA",         programs: 342, ...COUNTRY_CENTERS.us },
];

const PROJECTS: Record<string, any[]> = {
  de: [
    { id: "p1",  slug: "de-ausbildung",      name: "Ausbildung",          description: "Профессиональное обучение",            city: "Берлин",       ...CITY_COORDS.berlin      },
    { id: "p2",  slug: "de-study",           name: "Studium",             description: "Высшее образование",                   city: "Мюнхен",       ...CITY_COORDS.munich      },
  ],
  fr: [
    { id: "p3",  slug: "fr-erasmus",         name: "Erasmus+",            description: "Академический обмен",                  city: "Париж",        ...CITY_COORDS.paris       },
  ],
  us: [
    { id: "p4",  slug: "us-work-travel",     name: "Work & Travel",       description: "Летняя работа для студентов",          city: "Нью-Йорк",     ...CITY_COORDS.new_york    },
    { id: "p5",  slug: "us-au-pair",         name: "Au Pair",             description: "Культурный обмен и уход за детьми",    city: "Лос-Анджелес", ...CITY_COORDS.los_angeles },
  ],
  ca: [
    { id: "p6",  slug: "ca-express-entry",   name: "Express Entry",       description: "Система иммиграции и ПМЖ",             city: "Торонто",      ...CITY_COORDS.toronto     },
  ],
  pl: [
    { id: "p7",  slug: "pl-work-visa",       name: "Work Visa",           description: "Работа на заводах и складах",          city: "Варшава",      ...CITY_COORDS.warsaw      },
  ],
  tr: [
    { id: "p8",  slug: "tr-turkiye-burslari", name: "Türkiye Bursları",   description: "Государственная стипендия",            city: "Анкара",       ...CITY_COORDS.ankara      },
  ],
  ch: [
    { id: "p9",  slug: "ch-hotel-internship", name: "Hotel Internship",   description: "Стажировка в отелях 5*",               city: "Женева",       ...CITY_COORDS.geneva      },
  ],
  at: [
    { id: "p10", slug: "at-ausbildung",       name: "Lehre / Ausbildung", description: "Дуальное обучение в Австрии",          city: "Вена",         ...CITY_COORDS.vienna      },
  ],
  se: [
    { id: "p11", slug: "se-study",            name: "Studium / Master",   description: "Учёба на английском",                 city: "Стокгольм",    ...CITY_COORDS.stockholm   },
  ],
  no: [
    { id: "p12", slug: "no-fish-industry",    name: "Fish Industry",      description: "Рыбные заводы Норвегии",               city: "Берген",       ...CITY_COORDS.bergen      },
  ],
  fi: [
    { id: "p13", slug: "fi-berry-picking",    name: "Berry Picking",      description: "Сезонный сбор диких ягод",             city: "Оулу",         ...CITY_COORDS.oulu        },
  ],
  cn: [
    { id: "p14", slug: "cn-csc-scholarship",  name: "CSC Scholarship",    description: "Стипендия правительства КНР",          city: "Пекин",        ...CITY_COORDS.beijing     },
    { id: "p15", slug: "cn-teaching-english", name: "Teaching English",   description: "Преподавание английского языка",       city: "Шанхай",       ...CITY_COORDS.shanghai    },
  ],
};

const COUNTRY_TRANSLATIONS: Record<string, Record<string, string>> = {
  de: { ru: "Германия",    en: "Germany"      },
  fr: { ru: "Франция",     en: "France"       },
  be: { ru: "Бельгия",     en: "Belgium"      },
  ch: { ru: "Швейцария",   en: "Switzerland"  },
  at: { ru: "Австрия",     en: "Austria"      },
  pl: { ru: "Польша",      en: "Poland"       },
  cz: { ru: "Чехия",       en: "Czechia"      },
  se: { ru: "Швеция",      en: "Sweden"       },
  no: { ru: "Норвегия",    en: "Norway"       },
  fi: { ru: "Финляндия",   en: "Finland"      },
  tr: { ru: "Турция",      en: "Turkey"       },
  cn: { ru: "Китай",       en: "China"        },
  ca: { ru: "Канада",      en: "Canada"       },
  us: { ru: "США",         en: "USA"          },
};

const EMBASSY_DATA: Record<string, {
  title: string;
  embassyName: string;
  address: string;
  processingWeeks: string;
  visaFee: string;
  blockedAccountRequired: string;
  officialSite: string;
  checklist: string[];
}> = {
  de: {
    title: "Германия (Германское Посольство в Душанбе)",
    embassyName: "Посольство Федеративной Республики Германия в Республике Таджикистан",
    address: "ул. Сомони 59/1, Душанбе",
    processingWeeks: "4-8 недель",
    visaFee: "75 EUR (оплата в сомони по курсу)",
    blockedAccountRequired: "11,904 EUR в год / 992 EUR в месяц (с 2025/2026 г.)",
    officialSite: "https://dushanbe.diplo.de/",
    checklist: [
      "Заграничный паспорт и 2 копии страницы с личными данными",
      "2 заполненные анкеты-заявления на национальную визу",
      "3 биометрические фотографии паспортного формата",
      "Подтверждение финансирования (Блокированный счет Sperrkonto на 11 904 евро / поручительство Verpflichtungserklärung)",
      "Документ о зачислении в вуз (Zulassungsbescheid) или контракт на Ausbildung",
      "Подтверждение языковых знаний (Сертификат Goethe-Institut / TestDaF / IELTS для английских программ)",
      "Мотивационное письмо на немецком/английском языке и автобиография (Lebenslauf)",
      "Медицинская страховка (Incoming-Versicherung) на первые 90 дней",
    ]
  },
  fr: {
    title: "Франция (Французское Посольство в Душанбе)",
    embassyName: "Посольство Французской Республики в Республике Таджикистан",
    address: "ул. Хувайдуллоева 2/1, Душанбе",
    processingWeeks: "2-4 недели",
    visaFee: "99 EUR (оплата картой или наличными)",
    blockedAccountRequired: "минимум 615 EUR в месяц (7,380 EUR в год)",
    officialSite: "https://tj.ambafrance.org/",
    checklist: [
      "Заполненная анкета на визу через портал France-Visas",
      "Заграничный паспорт, действительный минимум 3 месяца после окончания визы",
      "Справка о записи / зачислении во французский вуз (Attestation d'inscription)",
      "Финансовые гарантии: выписка с банковского счета или спонсорское письмо",
      "Подтверждение наличия жилья во Франции на первые 3 месяца",
      "Подтверждение знания французского языка (DELF/DALF) или английского (IELTS)",
      "Полис медицинского страхования с покрытием не менее 30 000 EUR",
    ]
  },
  ca: {
    title: "Канада (Подача онлайн через портал IRCC)",
    embassyName: "Посольство Канады (ближайший визовый центр для биометрии — Ташкент/Алматы)",
    address: "Онлайн подача, биометрия сдается в Ташкенте или Алматы",
    processingWeeks: "8-16 недель",
    visaFee: "150 CAD + 85 CAD (биометрия)",
    blockedAccountRequired: "20,635 CAD в год (GIC сертификат с января 2024 года)",
    officialSite: "https://www.canada.ca/en/immigration-refugees-citizenship.html",
    checklist: [
      "Письмо о зачислении от аккредитованного вуза (Letter of Acceptance from DLI)",
      "Квитанция об оплате обучения за первый год",
      "Guaranteed Investment Certificate (GIC) на сумму 20,635 CAD",
      "Справка о несудимости с переводом и апостилем",
      "Прохождение официального медицинского осмотра (Panel Physician)",
      "Мотивационное письмо (Study Plan) с обоснованием выбора Канады",
      "Заграничный паспорт и выписки о доходах спонсоров",
    ]
  },
  us: {
    title: "США (Студенческая виза F-1 в Душанбе)",
    embassyName: "Посольство США в Республике Таджикистан",
    address: "пр. Исмоила Сомони 109-А, Душанбе",
    processingWeeks: "3-10 дней после собеседования",
    visaFee: "185 USD (консульский сбор) + 350 USD (сбор SEVIS)",
    blockedAccountRequired: "Сумма, покрывающая 1 год обучения и проживания согласно форме I-20",
    officialSite: "https://tj.usembassy.gov/ru/",
    checklist: [
      "Официальная форма I-20 от американского колледжа или университета",
      "Подтверждение оплаты сбора SEVIS I-901 (350 USD)",
      "Подтверждение заполнения визовой анкеты DS-160 (страница со штрих-кодом)",
      "Запись на собеседование в посольстве США в Душанбе",
      "Выписка из банка с достаточным балансом для покрытия расходов по форме I-20",
      "Академические документы (диплом, транскрипты, результаты TOEFL/IELTS/SAT/GRE)",
      "Заграничный паспорт со сроком действия не менее 6 месяцев",
    ]
  },
  tr: {
    title: "Турция (Посольство Турции в Душанбе)",
    embassyName: "Посольство Турецкой Республики в Республике Таджикистан",
    address: "ул. Шевченко 15, Душанбе",
    processingWeeks: "2-4 недели",
    visaFee: "60-120 USD (в зависимости от кратности)",
    blockedAccountRequired: "Справка о наличии средств на проживание (минимум 3,000 USD)",
    officialSite: "http://dushanbe.emb.mfa.gov.tr/",
    checklist: [
      "Приглашение или документ о зачислении в турецкий вуз (Kabul Mektubu)",
      "Заполненная анкета на визу",
      "Оригинал и копия заграничного паспорта",
      "Подтверждение финансовой состоятельности (справка с баланса)",
      "Справка о несудимости с переводом на турецкий или английский",
      "Бронь авиабилетов и договор аренды жилья или общежития",
      "Две фотографии 5х6 на белом фоне",
    ]
  },
};

export default function HomePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const { lang, setLang } = useLangStore();
  const openAIConsultant = useAIConsultantStore((s) => s.openWith);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [focusCountryId, setFocusCountryId] = useState<string | null>(null);
  const [selectedEmbassy, setSelectedEmbassy] = useState<string>("de");
  const [checkedItems, setCheckedItems] = useState<Record<string, Record<number, boolean>>>({
    de: {}, fr: {}, ca: {}, us: {}, tr: {}
  });

  const text = translations[lang]?.home || translations.ru.home;
  const navText = translations[lang]?.nav || translations.ru.nav;
  const embassy = (translations[lang] as any)?.homeEmbassy || (translations.ru as any).homeEmbassy;

  const toggleChecklist = (countryId: string, idx: number) => {
    setCheckedItems(prev => {
      const countryChecks = { ...(prev[countryId] || {}) };
      countryChecks[idx] = !countryChecks[idx];
      return { ...prev, [countryId]: countryChecks };
    });
  };

  const handleSearchSelect = (country: typeof COUNTRIES[0]) => {
    setSearchQuery("");
    setSearchResults([]);
    setFocusCountryId(country.id);
    setTimeout(() => setFocusCountryId(null), 4500);
  };

  useEffect(() => { setMounted(true); }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleLogout = () => { logout(); router.push("/login"); };

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] flex flex-col overflow-x-hidden">

      {/* ─── Hero text ──────────────────────────────────────────── */}
      <div className="pt-14 px-4 md:px-6 relative overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute -top-20 right-0 w-[35vw] h-[35vw] bg-[var(--accent)] rounded-full blur-[160px] opacity-[0.04] pointer-events-none" />
        <div className="absolute top-10 left-[10%] w-[25vw] h-[25vw] bg-emerald-400 rounded-full blur-[140px] opacity-[0.03] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto py-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] mb-2">
              {COUNTRIES.length} destinations
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
              {text.title1}{" "}
              <span className="text-[var(--accent)]">{text.title2}</span>
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)] max-w-[52ch]">{text.subtitle}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 text-[13px] font-medium"
          >
            <Link href="/programs" className="btn btn-secondary btn-sm">
              {navText.programs}
            </Link>
            <Link href="/calculator" className="btn btn-primary btn-sm">
              {navText.estimator}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ─── Interactive 3D Globe ────────────────────────────────── */}
      <div className="flex-1 px-4 md:px-6 pb-8">
        <div className="max-w-[1440px] mx-auto">
          <div id="map-container" className="relative h-[60vh] md:h-[70vh] min-h-[480px] rounded-3xl border border-[var(--border)] overflow-hidden bg-[var(--card)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]">

            {/* Search Country Floating Widget */}
            <div className="absolute top-4 left-4 z-50 w-64 md:w-72">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder={embassy.searchGlobe}
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim()) {
                      const q = val.toLowerCase();
                      const matches = COUNTRIES.filter(c => {
                        const trans = COUNTRY_TRANSLATIONS[c.id];
                        return (
                          c.name.toLowerCase().includes(q) ||
                          (trans?.ru && trans.ru.toLowerCase().includes(q)) ||
                          (trans?.en && trans.en.toLowerCase().includes(q))
                        );
                      });
                      setSearchResults(matches);
                    } else {
                      setSearchResults([]);
                    }
                  }}
                  className="w-full pl-9 pr-8 py-2.5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-xl text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 transition-all shadow-lg"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Dropdown suggestions */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 py-1.5 rounded-2xl card border-[var(--border)] max-h-56 overflow-y-auto shadow-xl z-50 animate-in fade-in-50 slide-in-from-top-1 duration-200">
                  {searchResults.map((c) => {
                    const trans = COUNTRY_TRANSLATIONS[c.id];
                    const displayName = lang === "ru" ? trans?.ru || c.name : trans?.en || c.name;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSearchSelect(c)}
                        className="w-full text-left px-4 py-2 hover:bg-[var(--accent-dim)]/50 text-xs flex items-center justify-between text-[var(--foreground)] transition-colors"
                      >
                        <span className="font-semibold">{displayName}</span>
                        <span className="text-[10px] text-[var(--muted)]">{c.programs} {embassy.programsWord}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3D Globe */}
            {mounted && (
              <WorldGlobe
                countries={COUNTRIES}
                projects={PROJECTS}
                countryTranslations={COUNTRY_TRANSLATIONS}
                lang={lang}
                theme={theme}
                onCountryClick={(id) => router.push(`/countries/${id}`)}
                onProjectClick={(slug) => router.push(`/programs/${slug}`)}
                focusCountryId={focusCountryId}
                programsLabel={text.programsCount}
              />
            )}
          </div>
        </div>
      </div>

      {/* ─── Embassy Checklist & Visa Tracker ────────────────────── */}
      <div className="px-4 md:px-6 pb-20 relative z-10">
        <div className="max-w-[1440px] mx-auto mt-8">
          <div className="p-6 md:p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)]/30 backdrop-blur-xl shadow-xl">
            <div className="max-w-3xl mb-8">
              <span className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] mb-2.5 block">
                {embassy.badge}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                {embassy.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                {embassy.subtitle}
              </p>
            </div>

            {/* Country Selector Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--border)] pb-4">
              {Object.entries(EMBASSY_DATA).map(([id, data]) => (
                <button
                  key={id}
                  onClick={() => setSelectedEmbassy(id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedEmbassy === id
                      ? "bg-[var(--accent)] text-white shadow-[0_2px_8px_rgba(16,185,129,0.25)]"
                      : "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)] bg-[var(--card)]/40"
                  }`}
                >
                  {(embassy.countries as Record<string,string>)[id] || id.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats column */}
              <div className="lg:col-span-1 space-y-4">
                <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/20">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)]">{embassy.processing}</span>
                  <p className="text-xl font-bold text-[var(--foreground)] mt-1">{EMBASSY_DATA[selectedEmbassy].processingWeeks}</p>
                </div>
                <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/20">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)]">{embassy.consulFee}</span>
                  <p className="text-xl font-bold text-[var(--foreground)] mt-1">{EMBASSY_DATA[selectedEmbassy].visaFee}</p>
                </div>
                <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/20">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)]">{embassy.financialReq}</span>
                  <p className="text-xs font-semibold text-[var(--foreground)] mt-1 leading-relaxed">
                    {EMBASSY_DATA[selectedEmbassy].blockedAccountRequired}
                  </p>
                </div>
                <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/20 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">{embassy.embassyLabel}</span>
                  <div className="flex items-start gap-2">
                    <Building size={14} className="text-[var(--accent)] mt-0.5 shrink-0" />
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{EMBASSY_DATA[selectedEmbassy].embassyName}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-[var(--accent)] mt-0.5 shrink-0" />
                    <p className="text-xs text-[var(--muted)]">{EMBASSY_DATA[selectedEmbassy].address}</p>
                  </div>
                  <a
                    href={EMBASSY_DATA[selectedEmbassy].officialSite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline pt-2 font-medium"
                  >
                    {embassy.officialSite} <ExternalLink size={11} />
                  </a>
                </div>
              </div>

              {/* Checklist Column */}
              <div className="lg:col-span-2 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-3">
                    <span className="text-[13px] font-bold text-[var(--foreground)] flex items-center gap-1.5">
                      <FileText size={14} className="text-[var(--accent)]" />
                      {embassy.checklistTitle}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {Object.values(checkedItems[selectedEmbassy] || {}).filter(Boolean).length} {embassy.readyOf} {EMBASSY_DATA[selectedEmbassy].checklist.length} {embassy.ready}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden mb-6">
                    <div
                      className="bg-[var(--accent)] h-full transition-all duration-500"
                      style={{
                        width: `${(Object.values(checkedItems[selectedEmbassy] || {}).filter(Boolean).length / EMBASSY_DATA[selectedEmbassy].checklist.length) * 100}%`
                      }}
                    />
                  </div>

                  {/* Checklist items */}
                  <div className="space-y-2.5">
                    {EMBASSY_DATA[selectedEmbassy].checklist.map((item, idx) => {
                      const isChecked = !!(checkedItems[selectedEmbassy] && checkedItems[selectedEmbassy][idx]);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleChecklist(selectedEmbassy, idx)}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                            isChecked
                              ? "bg-[var(--accent-dim)]/20 border-[var(--accent)]/30 text-[var(--foreground)]"
                              : "border-[var(--border)] hover:border-[var(--accent)]/20 hover:bg-[var(--card)] text-[var(--muted)]"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0 transition-colors">
                            {isChecked ? (
                              <CheckCircle2 size={15} className="text-[var(--accent)] fill-[var(--accent)]/10" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-[var(--muted)]/50 group-hover:border-[var(--accent)]/50" />
                            )}
                          </div>
                          <span className="text-xs leading-relaxed">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
