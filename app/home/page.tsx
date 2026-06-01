"use client";

import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useLangStore } from "../../store/langStore";
import { useAIConsultantStore } from "../../store/aiConsultantStore";
import { translations } from "../../locales/translations";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { Globe, Moon, Sun, User, LogOut, Sparkles, Plus, Minus, RotateCcw, MapPin, Search, X, CheckCircle2, Building, ExternalLink, FileText } from "lucide-react";

const COUNTRIES = [
  { id: "de", name: "Germany", programs: 142, x: 51.5, y: 31, labelClass: "bottom-3 left-1/2 -translate-x-1/2 items-center flex-col-reverse" },
  { id: "fr", name: "France", programs: 89, x: 48, y: 35, labelClass: "top-3 right-3 items-end" },
  { id: "be", name: "Belgium", programs: 58, x: 49.5, y: 32, labelClass: "bottom-3 right-3 items-end flex-col-reverse" },
  { id: "ch", name: "Switzerland", programs: 64, x: 50.3, y: 35.5, labelClass: "top-3 right-3 items-end" },
  { id: "at", name: "Austria", programs: 47, x: 52.8, y: 34.8, labelClass: "top-3 left-3 items-start" },
  { id: "pl", name: "Poland", programs: 112, x: 54.5, y: 31, labelClass: "bottom-3 left-3 items-start flex-col-reverse" },
  { id: "cz", name: "Czechia", programs: 38, x: 53.2, y: 33, labelClass: "top-3 left-1/2 -translate-x-1/2 items-center" },
  { id: "se", name: "Sweden", programs: 76, x: 53.5, y: 20, labelClass: "bottom-3 left-1/2 -translate-x-1/2 items-center flex-col-reverse" },
  { id: "no", name: "Norway", programs: 41, x: 50.5, y: 19, labelClass: "bottom-3 right-3 items-end flex-col-reverse" },
  { id: "fi", name: "Finland", programs: 53, x: 57.5, y: 19, labelClass: "bottom-3 left-3 items-start flex-col-reverse" },
  { id: "tr", name: "Turkey", programs: 125, x: 59.5, y: 39, labelClass: "top-3 left-1/2 -translate-x-1/2 items-center" },
  { id: "cn", name: "China", programs: 215, x: 77.5, y: 41, labelClass: "top-3 left-1/2 -translate-x-1/2 items-center" },
  { id: "ca", name: "Canada", programs: 184, x: 19, y: 25, labelClass: "top-3 left-1/2 -translate-x-1/2 items-center" },
  { id: "us", name: "USA", programs: 342, x: 20, y: 38, labelClass: "top-3 left-1/2 -translate-x-1/2 items-center" },
];

const CONNECTIONS = [
  ["us", "ca"], ["ca", "fr"], ["us", "fr"], ["fr", "be"], ["be", "de"],
  ["fr", "ch"], ["ch", "at"], ["de", "ch"], ["de", "at"], ["de", "cz"],
  ["cz", "pl"], ["pl", "de"], ["de", "se"], ["se", "no"], ["se", "fi"],
  ["fi", "cn"], ["pl", "cn"], ["at", "cn"], ["at", "tr"], ["tr", "cn"], ["tr", "pl"]
];

const PROJECTS: Record<string, any[]> = {
  de: [
    { id: "p1", slug: "de-ausbildung", name: "Ausbildung", description: "Профессиональное обучение", city: "Германия", x: 52.5, y: 31.5 },
    { id: "p2", slug: "de-study", name: "Studium", description: "Высшее образование", city: "Германия", x: 51.5, y: 33.5 },
  ],
  fr: [
    { id: "p3", slug: "fr-erasmus", name: "Erasmus+", description: "Академический обмен", city: "Франция", x: 47.5, y: 38 }
  ],
  us: [
    { id: "p4", slug: "us-work-travel", name: "Work & Travel", description: "Летняя работа для студентов", city: "США", x: 15, y: 38 },
    { id: "p5", slug: "us-au-pair", name: "Au Pair", description: "Культурный обмен и уход за детьми", city: "США", x: 28, y: 37 },
  ],
  ca: [
    { id: "p6", slug: "ca-express-entry", name: "Express Entry", description: "Система иммиграции и ПМЖ", city: "Канада", x: 26, y: 30 }
  ],
  pl: [
    { id: "p7", slug: "pl-work-visa", name: "Work Visa", description: "Работа на заводах и складах", city: "Польша", x: 57.5, y: 31 }
  ],
  tr: [
    { id: "p8", slug: "tr-turkiye-burslari", name: "Türkiye Bursları", description: "Государственная стипендия", city: "Турция", x: 61, y: 43.5 }
  ],
  ch: [
    { id: "p9", slug: "ch-hotel-internship", name: "Hotel Internship", description: "Стажировка в отелях 5*", city: "Швейцария", x: 50.3, y: 36.5 }
  ],
  at: [
    { id: "p10", slug: "at-ausbildung", name: "Lehre / Ausbildung", description: "Дуальное обучение в Австрии", city: "Австрия", x: 53.5, y: 35.5 }
  ],
  se: [
    { id: "p11", slug: "se-study", name: "Studium / Master", description: "Учёба на английском", city: "Швеция", x: 54.5, y: 22 }
  ],
  no: [
    { id: "p12", slug: "no-fish-industry", name: "Fish Industry", description: "Рыбные заводы Норвегии", city: "Норвегия", x: 49.5, y: 21 }
  ],
  fi: [
    { id: "p13", slug: "fi-berry-picking", name: "Berry Picking", description: "Сезонный сбор диких ягод", city: "Финляндия", x: 58.5, y: 21 }
  ],
  cn: [
    { id: "p14", slug: "cn-csc-scholarship", name: "CSC Scholarship", description: "Стипендия правительства КНР", city: "Китай", x: 75.5, y: 43 },
    { id: "p15", slug: "cn-teaching-english", name: "Teaching English", description: "Преподавание английского языка", city: "Китай", x: 79.5, y: 40 }
  ]
};


const COUNTRY_TRANSLATIONS: Record<string, Record<string, string>> = {
  de: { ru: "Германия", en: "Germany" },
  fr: { ru: "Франция", en: "France" },
  be: { ru: "Бельгия", en: "Belgium" },
  ch: { ru: "Швейцария", en: "Switzerland" },
  at: { ru: "Австрия", en: "Austria" },
  pl: { ru: "Польша", en: "Poland" },
  cz: { ru: "Чехия", en: "Czechia" },
  se: { ru: "Швеция", en: "Sweden" },
  no: { ru: "Норвегия", en: "Norway" },
  fi: { ru: "Финляндия", en: "Finland" },
  tr: { ru: "Турция", en: "Turkey" },
  cn: { ru: "Китай", en: "China" },
  ca: { ru: "Канада", en: "Canada" },
  us: { ru: "США", en: "USA" },
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
  }
};

export default function HomePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const { lang, setLang } = useLangStore();
  const openAIConsultant = useAIConsultantStore((s) => s.openWith);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const mapRef = useRef<ReactZoomPanPinchRef>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedEmbassy, setSelectedEmbassy] = useState<string>("de");
  const [checkedItems, setCheckedItems] = useState<Record<string, Record<number, boolean>>>({
    de: {}, fr: {}, ca: {}, us: {}, tr: {}
  });

  const text = translations[lang]?.home || translations.ru.home;
  const navText = translations[lang]?.nav || translations.ru.nav;

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

    const container = document.getElementById("map-container");
    if (container && mapRef.current) {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const scale = 3.5;
      const tx = width / 2 - (width * (country.x / 100)) * scale;
      const ty = height / 2 - (height * (country.y / 100)) * scale;
      mapRef.current.setTransform(tx, ty, scale, 800, "easeOut");
      setHoveredCountry(country.id);
      setTimeout(() => setHoveredCountry(null), 4000);
    }
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
      <div className="pt-14 px-4 md:px-6">
        <div className="max-w-[1440px] mx-auto py-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] mb-2">
              {COUNTRIES.length} destinations
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter reveal-up">
              {text.title1}{" "}
              <span className="text-[var(--accent)]">{text.title2}</span>
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)] max-w-[52ch] reveal-up delay-100">{text.subtitle}</p>
          </div>
          <div className="flex items-center gap-3 text-[13px] font-medium reveal-up delay-200">
            <Link href="/programs"
              className="px-4 py-2 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/30 hover:bg-[var(--accent-dim)] transition-all text-[var(--muted)] hover:text-[var(--accent)]">
              {navText.programs}
            </Link>
            <Link href="/calculator"
              className="px-4 py-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-85 transition-all">
              {navText.estimator}
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Interactive Map ─────────────────────────────────────── */}
      <div className="flex-1 px-4 md:px-6 pb-8">
        <div className="max-w-[1440px] mx-auto">
          <div id="map-container" className="relative h-[60vh] md:h-[70vh] min-h-[480px] rounded-3xl border border-[var(--border)] overflow-hidden bg-[var(--card)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]">
            
            {/* Search Country Floating Widget */}
            <div className="absolute top-4 left-4 z-50 w-64 md:w-72">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input 
                  type="text"
                  placeholder="Поиск страны..."
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
                <div className="absolute top-full left-0 right-0 mt-1.5 py-1.5 rounded-2xl glass border border-[var(--border)] max-h-56 overflow-y-auto shadow-xl z-50 animate-in fade-in-50 slide-in-from-top-1 duration-200">
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
                        <span className="text-[10px] text-[var(--muted)]">{c.programs} программ</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <TransformWrapper
              ref={mapRef}
              initialScale={1} minScale={1} maxScale={6}
              centerZoomedOut doubleClick={{ disabled: false }} wheel={{ step: 0.1 }}
            >
              {({ zoomIn, zoomOut, resetTransform, state }) => {
                const scale = state.scale;
                return (
                  <>
                    {/* Zoom controls */}
                    <div className="absolute top-4 right-4 z-50 flex flex-col gap-1.5">
                      {[
                        { icon: <Plus size={14} />, action: zoomIn },
                        { icon: <Minus size={14} />, action: zoomOut },
                        { icon: <RotateCcw size={12} />, action: resetTransform },
                      ].map(({ icon, action }, i) => (
                        <button key={i} onClick={() => action()}
                          className="w-8 h-8 rounded-xl glass border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30 transition-all">
                          {icon}
                        </button>
                      ))}
                    </div>

                    {/* Scale hint */}
                    <div className="absolute bottom-4 left-4 z-50">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[var(--border)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse-dot" />
                        <span className="text-[11px] font-medium text-[var(--muted)]">
                          {scale > 1.8 ? "Видны проекты" : "Приблизьтесь для деталей"}
                        </span>
                      </div>
                    </div>

                    <TransformComponent
                      wrapperStyle={{ width: "100%", height: "100%" }}
                      contentStyle={{ width: "100%", height: "100%" }}
                    >
                      <div className="relative w-full h-full min-h-[480px] md:min-h-[600px]">
                        {/* World map bg */}
                        <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
                          style={{
                            opacity: scale > 1.8 ? 0 : (theme === "dark" ? 0.12 : 0.2),
                            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')`,
                            backgroundSize: "100% 100%", backgroundPosition: "center", backgroundRepeat: "no-repeat",
                            filter: theme === "dark" ? "invert(1)" : "none",
                          }} />

                        {/* Detailed map */}
                        <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
                          style={{
                            opacity: scale > 1.8 ? (theme === "dark" ? 0.2 : 0.3) : 0,
                            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')`,
                            backgroundSize: "100% 100%", backgroundPosition: "center", backgroundRepeat: "no-repeat",
                            filter: theme === "dark" ? "invert(1) hue-rotate(180deg)" : "none",
                          }} />

                        {/* SVG connection lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
                          {CONNECTIONS.map(([id1, id2], i) => {
                            const c1 = COUNTRIES.find((c) => c.id === id1);
                            const c2 = COUNTRIES.find((c) => c.id === id2);
                            if (!c1 || !c2) return null;
                            const isHot = hoveredCountry === id1 || hoveredCountry === id2;
                            return (
                              <line key={i}
                                x1={`${c1.x}%`} y1={`${c1.y}%`} x2={`${c2.x}%`} y2={`${c2.y}%`}
                                className="transition-all duration-400"
                                stroke={isHot ? "rgba(16,185,129,0.6)" : "rgba(107,114,128,0.18)"}
                                strokeWidth={isHot ? "1.5" : "0.8"}
                                style={{ filter: isHot ? "drop-shadow(0 0 4px rgba(16,185,129,0.4))" : "none" }}
                              />
                            );
                          })}
                        </svg>

                        {/* Country nodes */}
                        {COUNTRIES.map((country) => {
                          const isHov = hoveredCountry === country.id;
                          return (
                            <div key={country.id}
                              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group transition-all duration-300 ${scale > 2 ? "opacity-20 pointer-events-none" : "opacity-100"} ${isHov ? "z-50" : "z-20"}`}
                              style={{ left: `${country.x}%`, top: `${country.y}%` }}
                              onMouseEnter={() => setHoveredCountry(country.id)}
                              onMouseLeave={() => setHoveredCountry(null)}
                              onClick={(e) => { e.stopPropagation(); router.push(`/countries/${country.id}`); }}
                            >
                              {/* Hit area */}
                              <div className="absolute w-14 h-14 rounded-full z-30" />

                              {/* Glow ring */}
                              <div className={`absolute w-10 h-10 rounded-full bg-[var(--accent)]/15 blur-md transition-all duration-300 ${isHov ? "scale-150 opacity-100" : "scale-0 opacity-0"}`} />

                              {/* Node */}
                              <div className={`relative w-2.5 h-2.5 rounded-full border transition-all duration-300 ${isHov
                                ? "bg-[var(--accent)] border-[var(--accent)] scale-150 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                : "bg-[var(--muted)]/40 border-[var(--border)] group-hover:bg-[var(--muted)] group-hover:scale-125"}`} />

                              {/* Label + tooltip */}
                              <div className={`absolute flex flex-col ${country.labelClass || "top-5 items-center"} transition-all duration-300 ${isHov ? "opacity-100 scale-105" : "opacity-60"}`}>
                                <span className={`text-[11px] font-semibold whitespace-nowrap px-1.5 py-0.5 rounded bg-[var(--background)]/70 backdrop-blur-sm ${isHov ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                                  {country.name}
                                </span>
                                <div className={`px-2.5 py-1.5 rounded-xl glass border border-[var(--border)] flex flex-col gap-0.5 whitespace-nowrap transition-all duration-300 overflow-hidden ${isHov ? "max-h-16 opacity-100 mt-1" : "max-h-0 opacity-0 h-0"}`}>
                                  <span className="text-[10px] text-[var(--muted)] flex items-center justify-between gap-3">
                                    <strong className="text-[var(--foreground)]">{country.programs}</strong>
                                    {text.programsCount}
                                  </span>
                                  <span className="text-[10px] text-[var(--accent)]">
                                    {PROJECTS[country.id]?.length || 0} проектов
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Project nodes (zoomed) */}
                        {scale > 1.8 && Object.entries(PROJECTS).map(([countryId, projects]) =>
                          projects.map((proj) => {
                            const isHov = hoveredProject === proj.id;
                            return (
                              <div key={proj.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-40 transition-all duration-500"
                                style={{ left: `${proj.x}%`, top: `${proj.y}%`, opacity: scale > 2 ? 1 : 0 }}
                                onMouseEnter={() => setHoveredProject(proj.id)}
                                onMouseLeave={() => setHoveredProject(null)}
                                onClick={(e) => { e.stopPropagation(); router.push(`/programs/${proj.slug}`); }}
                              >
                                <div className="absolute w-10 h-10 rounded-full z-30" />
                                <div className={`relative w-2 h-2 rounded-full bg-[var(--accent)] border border-[var(--background)] transition-all duration-300 ${isHov ? "scale-175" : "animate-pulse-dot"}`} />
                                <div className={`absolute top-3.5 flex flex-col items-center transition-all duration-300 ${isHov ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                                  <div className="mt-1 p-2.5 rounded-xl glass border border-[var(--accent)]/20 flex flex-col gap-0.5 whitespace-nowrap z-50 shadow-xl">
                                    <span className="text-[11px] font-bold text-[var(--foreground)]">{proj.name}</span>
                                    <span className="text-[10px] text-[var(--muted)]">{proj.description}</span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent)] mt-0.5">
                                      <MapPin size={8} className="inline mr-0.5" />{proj.city}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </TransformComponent>
                  </>
                );
              }}
            </TransformWrapper>
          </div>
        </div>
      </div>

      {/* ─── Embassy Checklist & Visa Tracker ────────────────────── */}
      <div className="px-4 md:px-6 pb-20 relative z-10">
        <div className="max-w-[1440px] mx-auto mt-8">
          <div className="p-6 md:p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)]/30 backdrop-blur-xl shadow-xl">
            <div className="max-w-3xl mb-8">
              <span className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] mb-2.5 block">
                Инструменты WorldBridge
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                Подготовка документов в посольствах (г. Душанбе)
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                Интерактивный трекер и официальные требования к визам для граждан Таджикистана. Выберите страну назначения, чтобы увидеть актуальные финансовые лимиты, адреса посольств в Душанбе и отметить готовые документы.
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
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)] bg-[var(--card)]/40"
                  }`}
                >
                  {id === "de" ? "Германия 🇩🇪" :
                   id === "fr" ? "Франция 🇫🇷" :
                   id === "ca" ? "Канада 🇨🇦" :
                   id === "us" ? "США 🇺🇸" :
                   "Турция 🇹🇷"}
                </button>
              ))}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats column */}
              <div className="lg:col-span-1 space-y-4">
                <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/20">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Сроки рассмотрения</span>
                  <p className="text-xl font-bold text-[var(--foreground)] mt-1">{EMBASSY_DATA[selectedEmbassy].processingWeeks}</p>
                </div>
                <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/20">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Консульский сбор</span>
                  <p className="text-xl font-bold text-[var(--foreground)] mt-1">{EMBASSY_DATA[selectedEmbassy].visaFee}</p>
                </div>
                <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/20">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Финансовые требования</span>
                  <p className="text-xs font-semibold text-[var(--foreground)] mt-1 leading-relaxed">
                    {EMBASSY_DATA[selectedEmbassy].blockedAccountRequired}
                  </p>
                </div>
                <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/20 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Посольство в Душанбе</span>
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
                    Официальный сайт посольства <ExternalLink size={11} />
                  </a>
                </div>
              </div>

              {/* Checklist Column */}
              <div className="lg:col-span-2 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-3">
                    <span className="text-[13px] font-bold text-[var(--foreground)] flex items-center gap-1.5">
                      <FileText size={14} className="text-[var(--accent)]" />
                      Чек-лист необходимых документов
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {Object.values(checkedItems[selectedEmbassy] || {}).filter(Boolean).length} из {EMBASSY_DATA[selectedEmbassy].checklist.length} готово
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
