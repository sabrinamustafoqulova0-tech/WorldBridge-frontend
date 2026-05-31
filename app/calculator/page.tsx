"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuthStore } from "../../store/authStore";
import { useLangStore } from "../../store/langStore";
import { translations } from "../../locales/translations";
import { 
  Globe, 
  Moon, 
  Sun, 
  Calculator, 
  Plane, 
  Home as HomeIcon, 
  Utensils, 
  Bus, 
  Activity, 
  Wifi, 
  Sparkles, 
  X, 
  ArrowRight,
  DollarSign
} from "lucide-react";

interface Offer {
  id: string;
  name: string;
  description: string;
  salary: number;
  savings: number;
  duration: number;
  flight: boolean;
  visa: boolean;
}

const COUNTRIES_DATA: Record<string, { currency: string; rent: number; food: number; transport: number; insurance: number; internet: number; visa: number; flight: number }> = {
  "Германия": { currency: "EUR", rent: 900, food: 350, transport: 90, insurance: 100, internet: 35, visa: 80, flight: 350 },
  "Франция": { currency: "EUR", rent: 1000, food: 380, transport: 85, insurance: 100, internet: 30, visa: 80, flight: 320 },
  "Польша": { currency: "PLN", rent: 400, food: 200, transport: 40, insurance: 50, internet: 20, visa: 50, flight: 180 },
  "Канада": { currency: "CAD", rent: 1600, food: 500, transport: 120, insurance: 150, internet: 60, visa: 150, flight: 700 },
  "США": { currency: "USD", rent: 1800, food: 600, transport: 150, insurance: 300, internet: 70, visa: 200, flight: 800 },
  "Швеция": { currency: "SEK", rent: 800, food: 400, transport: 80, insurance: 90, internet: 30, visa: 80, flight: 300 },
  "Турция": { currency: "USD", rent: 350, food: 200, transport: 30, insurance: 50, internet: 15, visa: 30, flight: 200 },
  "Швейцария": { currency: "CHF", rent: 1500, food: 600, transport: 100, insurance: 300, internet: 50, visa: 100, flight: 280 },
};

const PROGRAMS_OFFERS: Record<string, Offer[]> = {
  "Германия": [
    { id: "o1", name: "Berlin IT Hub Internship", description: "Оплачиваемая IT-стажировка в Берлине", salary: 3200, savings: 2500, duration: 6, flight: true, visa: true },
    { id: "o2", name: "Munich Auto Engineering", description: "Инженерная практика в крупном автоконцерне", salary: 4500, savings: 5000, duration: 12, flight: true, visa: true },
    { id: "o3", name: "FSJ Social Volunteer", description: "Социальный год в Германии с бесплатным жильем и карманными расходами", salary: 1200, savings: 1000, duration: 12, flight: true, visa: true }
  ],
  "Франция": [
    { id: "o4", name: "Paris UI/UX Studio", description: "Дизайн-стажировка в престижной студии Парижа", salary: 3000, savings: 3000, duration: 6, flight: true, visa: true }
  ],
  "США": [
    { id: "o5", name: "Silicon Valley Tech J-1", description: "Профессиональная стажировка в Кремниевой Долине", salary: 7500, savings: 6000, duration: 12, flight: true, visa: true },
    { id: "o6", name: "NY Quant Finance Associate", description: "Младший аналитик в инвестиционном фонде Уолл-Стрит", salary: 8000, savings: 8000, duration: 12, flight: true, visa: true }
  ],
  "Канада": [
    { id: "o7", name: "Toronto AI Researcher Co-op", description: "Co-op практика по машинному обучению в Торонто", salary: 5500, savings: 4500, duration: 12, flight: true, visa: true }
  ],
  "Турция": [
    { id: "o8", name: "Istanbul Trade Specialist", description: "Консультант по ВЭД и международным цепочкам поставок", salary: 2000, savings: 2000, duration: 6, flight: true, visa: true }
  ],
  "Польша": [
    { id: "o9", name: "Warsaw Logistics Specialist", description: "Специалист по координации складов в Варшаве", salary: 1800, savings: 1500, duration: 12, flight: true, visa: true }
  ],
  "Чехия": [
    { id: "o10", name: "Prague Language & Study", description: "Обучение на подготовительном языковом курсе при вузе", salary: 1500, savings: 2000, duration: 12, flight: false, visa: true }
  ],
  "Швейцария": [
    { id: "o11", name: "Hotel Internship Zurich", description: "Практика в сфере премиального туризма в Цюрихе", salary: 3800, savings: 4000, duration: 6, flight: true, visa: true }
  ]
};

const EXCHANGE_TO_USD: Record<string, number> = {
  EUR: 1.08, PLN: 0.25, CAD: 0.73, USD: 1, SEK: 0.095, CHF: 1.1,
};

const DURATIONS = [3, 6, 12, 24];

export default function CalculatorPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { lang } = useLangStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState("Германия");
  const [duration, setDuration] = useState(12);
  const [salary, setSalary] = useState(2500);
  const [savings, setSavings] = useState(3000);
  const [includeFlight, setIncludeFlight] = useState(true);
  const [includeVisa, setIncludeVisa] = useState(true);

  // Offers integration state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCountry, setPendingCountry] = useState("");
  const [showOffersList, setShowOffersList] = useState(false);
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);

  const navText = translations[lang]?.nav || translations.ru.nav;

  useEffect(() => { setMounted(true); }, []);

  const country = COUNTRIES_DATA[selectedCountry] || COUNTRIES_DATA["Германия"];
  const rate = EXCHANGE_TO_USD[country.currency] || 1;

  const monthlyExpenses = (country.rent + country.food + country.transport + country.insurance + country.internet) * rate;
  const oneTimeCosts = (includeFlight ? country.flight : 0) + (includeVisa ? country.visa : 0);
  const totalExpenses = monthlyExpenses * duration + oneTimeCosts;
  const totalIncome = salary * duration;
  const surplus = savings + totalIncome - totalExpenses;
  const isPositive = surplus >= 0;

  const EXPENSE_ITEMS = [
    { label: "Жильё", icon: <HomeIcon size={14} />, amount: country.rent * rate, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { label: "Питание", icon: <Utensils size={14} />, amount: country.food * rate, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { label: "Транспорт", icon: <Bus size={14} />, amount: country.transport * rate, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    { label: "Страховка", icon: <Activity size={14} />, amount: country.insurance * rate, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
    { label: "Интернет", icon: <Wifi size={14} />, amount: country.internet * rate, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  ];

  const handleCountryClick = (c: string) => {
    if (c === selectedCountry && activeOffer) return;
    setPendingCountry(c);
    setIsModalOpen(true);
    setShowOffersList(false);
  };

  const applyOffer = (offer: Offer) => {
    setSelectedCountry(pendingCountry);
    setActiveOffer(offer);
    setDuration(offer.duration);
    setSalary(offer.salary);
    setSavings(offer.savings);
    setIncludeFlight(offer.flight);
    setIncludeVisa(offer.visa);
    setIsModalOpen(false);
  };

  const proceedWithoutOffer = () => {
    setSelectedCountry(pendingCountry);
    setActiveOffer(null);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col pb-24">
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-5 md:px-8 glass border-b border-[var(--border)]">
        <Link href="/home" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center transition-transform group-hover:scale-110">
            <Globe size={13} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[14px] tracking-tight">WorldBridge</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[var(--muted)]">
          <Link href="/programs" className="hover:text-[var(--foreground)] transition-colors">{navText.programs}</Link>
          <Link href="/countries" className="hover:text-[var(--foreground)] transition-colors">{navText.destinations}</Link>
          <Link href="/articles" className="hover:text-[var(--foreground)] transition-colors">{navText.insights}</Link>
          <span className="font-semibold text-[var(--foreground)]">{navText.estimator}</span>
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

      {/* ─── Hero Header — LEFT-ALIGNED ────────────────────────── */}
      <div className="pt-24 pb-8 px-5 md:px-8">
        <div className="max-w-6xl mx-auto space-y-3">
          <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] flex items-center gap-1.5">
            <Calculator size={12} />
            Интерактивный калькулятор
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight text-balance">
            Калькулятор расходов
          </h1>
          <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed max-w-[55ch]">
            Рассчитайте, сколько будет стоить жизнь за рубежом и хватит ли вам бюджета для комфортного переезда.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 md:px-8 w-full mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
        
        {/* INPUTS PANEL — 7 columns */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Offer Sync Banner */}
          {activeOffer && (
            <div className="bg-[var(--accent-dim)] border border-[var(--accent)]/30 rounded-2xl p-4 flex items-center justify-between animate-in fade-in duration-300">
              <div className="flex items-start gap-3 min-w-0">
                <div className="bg-[var(--accent)] text-white rounded-lg p-2 mt-0.5 shrink-0">
                  <Sparkles size={14} className="animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-[var(--accent)] mb-0.5">Применена программа</p>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] leading-tight truncate">{activeOffer.name}</h4>
                  <p className="text-[11px] text-[var(--muted)] truncate">{activeOffer.description}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveOffer(null)}
                className="text-[10px] font-bold text-rose-500 hover:text-white hover:bg-rose-500 border border-rose-500/20 px-2.5 py-1.5 rounded-lg transition-all ml-4 shrink-0"
              >
                Сбросить
              </button>
            </div>
          )}

          {/* Country Selection */}
          <div className="glass border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold tracking-tight">Страна назначения</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {Object.keys(COUNTRIES_DATA).map((c) => (
                <button
                  key={c}
                  onClick={() => handleCountryClick(c)}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all truncate ${
                    selectedCountry === c
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="glass border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold tracking-tight">Длительность пребывания</h2>
            <div className="grid grid-cols-4 gap-1.5">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDuration(d);
                    setActiveOffer(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                    duration === d
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]"
                  }`}
                >
                  {d} мес.
                </button>
              ))}
            </div>
          </div>

          {/* Salary & Savings Inputs */}
          <div className="glass border border-[var(--border)] rounded-2xl p-5 space-y-5">
            <h2 className="text-sm font-bold tracking-tight">Ваши финансы</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[var(--muted)]">Ежемесячная зарплата (USD)</span>
                <span className="text-[var(--accent)]">${salary.toLocaleString()}</span>
              </div>
              <input
                type="range" min={500} max={8000} step={100} value={salary}
                onChange={(e) => {
                  setSalary(Number(e.target.value));
                  setActiveOffer(null);
                }}
                className="w-full h-1 rounded-full accent-[var(--accent)] bg-[var(--border)] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-[var(--muted)] font-bold">
                <span>$500</span>
                <span>$8,000</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[var(--muted)]">Ваши стартовые накопления (USD)</span>
                <span className="text-[var(--accent)]">${savings.toLocaleString()}</span>
              </div>
              <input
                type="range" min={0} max={30000} step={500} value={savings}
                onChange={(e) => {
                  setSavings(Number(e.target.value));
                  setActiveOffer(null);
                }}
                className="w-full h-1 rounded-full accent-[var(--accent)] bg-[var(--border)] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-[var(--muted)] font-bold">
                <span>$0</span>
                <span>$30,000</span>
              </div>
            </div>
          </div>

          {/* One-time costs switches */}
          <div className="glass border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold tracking-tight">Разовые расходы</h2>
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                    <Plane size={14} />
                  </div>
                  <span>Авиаперелет (~${country.flight})</span>
                </div>
                <button 
                  onClick={() => {
                    setIncludeFlight(!includeFlight);
                    setActiveOffer(null);
                  }}
                  className={`w-10 h-5.5 rounded-full transition-all relative ${includeFlight ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                >
                  <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all ${includeFlight ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                    <Globe size={14} />
                  </div>
                  <span>Оформление визы (~${country.visa})</span>
                </div>
                <button 
                  onClick={() => {
                    setIncludeVisa(!includeVisa);
                    setActiveOffer(null);
                  }}
                  className={`w-10 h-5.5 rounded-full transition-all relative ${includeVisa ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                >
                  <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all ${includeVisa ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY PANEL — 5 columns */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Balance card */}
          <div className={`rounded-2xl p-6 text-white relative overflow-hidden shadow-sm transition-all duration-300 ${
            isPositive 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20' 
              : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="relative space-y-2">
              <p className="text-white/80 font-bold uppercase tracking-widest text-[9px]">
                {isPositive ? "Профицит бюджета 🎉" : "Недостаточно средств ⚠️"}
              </p>
              <h3 className="text-3xl font-extrabold tracking-tight">
                {isPositive ? "+" : ""}{surplus.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
              </h3>
              <p className="text-[11px] text-white/70 font-semibold leading-relaxed">
                Остаток бюджета за {duration} мес. в {selectedCountry} с учетом стартовых накоплений.
              </p>
            </div>
          </div>

          {/* Monthly Items */}
          <div className="glass border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold tracking-wider uppercase text-[var(--muted)]">Ежемесячные расходы</h3>
            
            <div className="space-y-3">
              {EXPENSE_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  <span className="font-bold text-[var(--foreground)]">${item.amount.toFixed(0)}</span>
                </div>
              ))}
              
              <div className="pt-3.5 mt-3.5 border-t border-[var(--border)] flex items-center justify-between">
                <span className="font-bold text-xs">Итого в месяц</span>
                <span className="text-base font-extrabold text-[var(--accent)]">${monthlyExpenses.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Full Summary Table */}
          <div className="glass border border-[var(--border)] rounded-2xl p-5 space-y-3 text-xs">
            <h3 className="text-xs font-bold tracking-wider uppercase text-[var(--muted)] mb-1">Итоговый расчёт</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-[var(--muted)]">Расходы за {duration} мес.</span>
                <span className="text-rose-500">-${(monthlyExpenses * duration).toFixed(0)}</span>
              </div>
              {oneTimeCosts > 0 && (
                <div className="flex justify-between font-semibold">
                  <span className="text-[var(--muted)]">Разовые расходы</span>
                  <span className="text-rose-500">-${oneTimeCosts}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span className="text-[var(--muted)]">Доход за {duration} мес.</span>
                <span className="text-emerald-500">+${totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-[var(--muted)]">Накопления</span>
                <span className="text-emerald-500">+${savings.toLocaleString()}</span>
              </div>
              
              <div className="pt-3 mt-3 border-t border-[var(--border)] flex justify-between items-center">
                <span className="font-bold text-xs">Итоговый баланс</span>
                <span className={`font-extrabold text-sm ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isPositive ? "+" : ""}{surplus.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/programs"
            className="flex items-center justify-center gap-1.5 w-full bg-[var(--foreground)] text-[var(--background)] font-bold py-3 px-4 rounded-xl text-xs hover:opacity-90 transition-all shadow-sm"
          >
            Найти программы в {selectedCountry} <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Modern High-End Offers Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          
          <div className="w-full max-w-md bg-[var(--background)] ring-1 ring-[var(--border)] p-5 rounded-2xl flex flex-col shadow-2xl relative overflow-hidden transition-all">
            
            {/* Ambient glows inside modal */}
            <div className="absolute top-0 right-1/4 w-[150px] h-[150px] bg-[var(--accent)]/10 rounded-full blur-[40px] pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="bg-[var(--accent)] text-white p-1.5 rounded-lg">
                  <Sparkles size={14} />
                </div>
                <h3 className="font-bold text-sm tracking-tight">WorldBridge Программы</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg border border-[var(--border)] hover:bg-[var(--border)]/20 transition flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X size={14} />
              </button>
            </div>

            <div className="relative z-10">
              {!showOffersList ? (
                // Choose Offer vs Continue Manually
                <div className="space-y-4">
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Вы выбрали страну: <strong className="text-[var(--foreground)]">{pendingCountry}</strong>.<br/><br/>
                    На нашей платформе есть готовые, проверенные программы стажировок и обучения для этого направления. 
                    Вы можете автоматически загрузить параметры программы в калькулятор или настроить все расходы вручную.
                  </p>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => setShowOffersList(true)}
                      className="w-full py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs transition"
                    >
                      🌟 Загрузить предложение
                    </button>
                    <button
                      onClick={proceedWithoutOffer}
                      className="w-full py-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--border)]/20 text-[var(--foreground)] font-bold text-xs transition"
                    >
                      Ввести вручную
                    </button>
                  </div>
                </div>
              ) : (
                // Offers list for country
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">
                    Доступные программы в стране {pendingCountry}:
                  </p>
                  
                  <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 scrollbar-none">
                    {PROGRAMS_OFFERS[pendingCountry] && PROGRAMS_OFFERS[pendingCountry].length > 0 ? (
                      PROGRAMS_OFFERS[pendingCountry].map((offer) => (
                        <div
                          key={offer.id}
                          onClick={() => applyOffer(offer)}
                          className="border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/40 p-3 rounded-xl cursor-pointer transition flex flex-col justify-between"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-[var(--foreground)] mb-0.5 truncate">
                              {offer.name}
                            </h4>
                            <p className="text-[10px] text-[var(--muted)] mb-2 line-clamp-1">
                              {offer.description}
                            </p>
                          </div>

                          <div className="flex justify-between items-center text-[9px] font-bold text-[var(--muted)] pt-1 border-t border-[var(--border)]">
                            <span className="text-[var(--accent)]">${offer.salary}/мес</span>
                            <span>{offer.duration} мес</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-[var(--muted)] text-[11px]">
                        Для этой страны пока нет готовых офферов. Но вы можете настроить все параметры вручную!
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
                    <button
                      onClick={() => setShowOffersList(false)}
                      className="flex-1 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] text-[11px] font-bold transition"
                    >
                      Назад
                    </button>
                    <button
                      onClick={proceedWithoutOffer}
                      className="flex-1 py-2 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-[11px] font-bold transition"
                    >
                      Ввод вручную
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
