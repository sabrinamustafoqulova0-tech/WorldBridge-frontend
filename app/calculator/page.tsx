"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  Plane,
  Home as HomeIcon,
  Utensils,
  Activity,
  Lightbulb,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  BookOpen,
  Globe,
  Shield,
  X,
} from "lucide-react";
import api from "../../lib/api";

interface CalculatorResult {
  visa_and_documents: number;
  flight_total: number;
  one_time_total: number;
  housing_monthly: number;
  language_course_monthly: number;
  health_insurance_monthly: number;
  misc_monthly: number;
  monthly_total: number;
  language_course_total: number;
  savings_buffer: number;
  grand_total: number;
  tips: string[];
  city: string;
}

interface Program {
  slug: string;
  title: string;
  category: string;
  duration_months: number | null;
  language_requirement: string | null;
  salary_range: string | null;
}

const COUNTRIES = [
  { code: "de", flag: "🇩🇪", name: "Германия" },
  { code: "fr", flag: "🇫🇷", name: "Франция" },
  { code: "be", flag: "🇧🇪", name: "Бельгия" },
  { code: "ch", flag: "🇨🇭", name: "Швейцария" },
  { code: "at", flag: "🇦🇹", name: "Австрия" },
  { code: "pl", flag: "🇵🇱", name: "Польша" },
  { code: "cz", flag: "🇨🇿", name: "Чехия" },
  { code: "se", flag: "🇸🇪", name: "Швеция" },
  { code: "no", flag: "🇳🇴", name: "Норвегия" },
  { code: "fi", flag: "🇫🇮", name: "Финляндия" },
  { code: "tr", flag: "🇹🇷", name: "Турция" },
  { code: "cn", flag: "🇨🇳", name: "Китай" },
  { code: "ca", flag: "🇨🇦", name: "Канада" },
  { code: "us", flag: "🇺🇸", name: "США" },
];

const CATEGORY_LABELS: Record<string, string> = {
  AUSBILDUNG: "Аусбильдунг",
  FSJ: "FSJ",
  AU_PAIR: "Au Pair",
  SCHULE: "Школа",
  ARBEIT: "Работа",
  STUDIUM: "Учёба",
  VOLUNTEERING: "Волонтёрство",
  INTERNSHIP: "Стажировка",
  LANGUAGE: "Языковые курсы",
  IMMIGRATION: "Иммиграция",
};

const inputCls =
  "w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-[var(--muted)]";

function fmt(n: number) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
}

export default function CalculatorPage() {
  // ── Form state ──────────────────────────────────────────────────────────
  const [country, setCountry] = useState("de");
  const [city, setCity] = useState("");
  const [monthlyRent, setMonthlyRent] = useState(700);
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);
  const [miscMonthly, setMiscMonthly] = useState(300);
  const [healthInsurance, setHealthInsurance] = useState(0);
  const [visaFee, setVisaFee] = useState(75);
  const [docCost, setDocCost] = useState(0);
  const [flightCost, setFlightCost] = useState(0);
  const [langMonths, setLangMonths] = useState(0);
  const [langPrice, setLangPrice] = useState(200);
  const [monthsBuffer, setMonthsBuffer] = useState(3);

  // ── API state ────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculatorResult | null>(null);

  // ── Modal state ──────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPrograms, setModalPrograms] = useState<Program[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === country)!;

  const handleCalculate = async (overrides?: {
    visa_fee?: number;
    flight_cost?: number;
    language_course_months?: number;
  }) => {
    if (monthlyRent <= 0) {
      setError("Укажите стоимость аренды жилья.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/calculator/preview", {
        country,
        city,
        monthly_rent: monthlyRent,
        utilities_included: utilitiesIncluded,
        misc_monthly: miscMonthly,
        health_insurance_monthly: healthInsurance,
        visa_fee: overrides?.visa_fee ?? visaFee,
        document_legalisation_cost: docCost,
        flight_cost: overrides?.flight_cost ?? flightCost,
        language_course_months: overrides?.language_course_months ?? langMonths,
        language_course_price_per_month: langPrice,
        months_of_savings: monthsBuffer,
      });
      setResult(data);
    } catch {
      setError("Ошибка при расчёте. Проверьте введённые данные и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (code: string) => {
    setCountry(code);
    setSelectedProgram(null);
    setModalOpen(true);
    setModalLoading(true);
    setModalPrograms([]);
    try {
      const { data } = await api.get(`/programs?country_slug=${code}&size=20`);
      setModalPrograms(data.items ?? []);
    } catch {
      setModalPrograms([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleProgramSelect = (program: Program) => {
    const hasLang = Boolean(program.language_requirement?.trim());
    const newVisaFee = 75;
    const newFlightCost = 300;
    const newLangMonths = hasLang ? 3 : langMonths;

    setVisaFee(newVisaFee);
    setFlightCost(newFlightCost);
    setLangMonths(newLangMonths);
    setSelectedProgram(program);
    setModalOpen(false);
    handleCalculate({ visa_fee: newVisaFee, flight_cost: newFlightCost, language_course_months: newLangMonths });
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col pb-24">

      {/* Hero */}
      <div className="pt-24 pb-8 px-4 md:px-6">
        <div className="max-w-[1440px] mx-auto space-y-3">
          <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] flex items-center gap-1.5">
            <Calculator size={12} />
            Калькулятор расходов
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight text-balance">
            Рассчитайте стоимость переезда
          </h1>
          <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed max-w-[55ch]">
            Введите реальные данные — бэкенд рассчитает точные расходы с учётом вашего города и страны.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 w-full mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">

        {/* ── LEFT: FORM ──────────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-5">

          {/* Selected program banner */}
          {selectedProgram && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent)]">Выбранная программа</p>
                <p className="text-xs font-semibold truncate mt-0.5">{selectedProgram.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-all text-sm"
              >×</button>
            </div>
          )}

          {/* Destination */}
          <div className="card rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold tracking-tight">Страна и город</h2>

            {/* Country dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Страна *</label>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => openModal(e.target.value)}
                  className={inputCls + " appearance-none pr-9"}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
              </div>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Город <span className="normal-case font-normal opacity-60">(необязательно)</span></label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Berlin, Paris, Stockholm..."
                className={inputCls}
              />
              <p className="text-[10px] text-[var(--muted)]">Влияет на коэффициент аренды — крупные города дороже</p>
            </div>
          </div>

          {/* Housing */}
          <div className="card rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
              <HomeIcon size={14} className="text-blue-500" /> Жильё
            </h2>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Аренда в месяц, € *</label>
              <input
                type="number"
                min={0}
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                placeholder="700"
                className={inputCls}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <div>
                <p className="text-xs font-bold">Коммунальные включены в аренду</p>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">Если нет — добавим ~80€/чел. в месяц</p>
              </div>
              <button
                type="button"
                onClick={() => setUtilitiesIncluded(!utilitiesIncluded)}
                className={`relative w-10 h-5 rounded-full transition-all shrink-0 ${utilitiesIncluded ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${utilitiesIncluded ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          </div>

          {/* Monthly expenses */}
          <div className="card rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
              <Utensils size={14} className="text-emerald-500" /> Ежемесячные расходы
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Еда, транспорт, прочее, €</label>
                <input
                  type="number"
                  min={0}
                  value={miscMonthly}
                  onChange={(e) => setMiscMonthly(Number(e.target.value))}
                  placeholder="300"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Страховка, €</label>
                <input
                  type="number"
                  min={0}
                  value={healthInsurance}
                  onChange={(e) => setHealthInsurance(Number(e.target.value))}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* One-time costs */}
          <div className="card rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
              <Plane size={14} className="text-amber-500" /> Одноразовые расходы
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Визовый сбор, €</label>
                <input
                  type="number"
                  min={0}
                  value={visaFee}
                  onChange={(e) => setVisaFee(Number(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Апостиль / нотариус, €</label>
                <input
                  type="number"
                  min={0}
                  value={docCost}
                  onChange={(e) => setDocCost(Number(e.target.value))}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Перелёт (на человека), €</label>
                <input
                  type="number"
                  min={0}
                  value={flightCost}
                  onChange={(e) => setFlightCost(Number(e.target.value))}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Advanced options */}
          <div className="card rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
              <BookOpen size={14} className="text-violet-500" /> Дополнительно
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Языковые курсы, мес.</label>
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={langMonths}
                  onChange={(e) => setLangMonths(Number(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Стоимость курса, €/мес</label>
                <input
                  type="number"
                  min={0}
                  value={langPrice}
                  onChange={(e) => setLangPrice(Number(e.target.value))}
                  disabled={langMonths === 0}
                  className={inputCls + (langMonths === 0 ? " opacity-40" : "")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Резервный буфер (месяцев)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 6].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonthsBuffer(m)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      monthsBuffer === m
                        ? "bg-[var(--accent)] text-white border-transparent"
                        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
                    }`}
                  >
                    {m} мес.
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[var(--muted)]">Минимальная финансовая подушка = ежемесячные расходы × буфер</p>
            </div>
          </div>

          {/* Calculate button */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => handleCalculate()}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-white font-bold text-sm hover:bg-emerald-500 transition-all disabled:opacity-60 shadow-[0_4px_14px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Рассчитываем...
              </>
            ) : (
              <>
                <Calculator size={15} />
                Рассчитать стоимость
              </>
            )}
          </button>
        </div>

        {/* ── RIGHT: RESULT ────────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-5">

          {/* Empty / loading state */}
          {!result && (
            <div className="card rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[220px]">
              {loading ? (
                <>
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                  <p className="text-sm text-[var(--muted)] font-medium">Запрашиваем расчёт...</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center">
                    <Calculator size={22} className="text-[var(--accent)]" />
                  </div>
                  <p className="text-sm font-semibold">Здесь появится результат</p>
                  <p className="text-xs text-[var(--muted)]">Заполните форму и нажмите «Рассчитать»</p>
                </>
              )}
            </div>
          )}

          {result && (
            <>
              {/* Grand total hero card */}
              <div className="rounded-2xl p-6 text-white relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20 shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
                <div className="relative space-y-1">
                  <p className="text-white/80 font-bold uppercase tracking-widest text-[9px] flex items-center gap-1">
                    <Globe size={10} />
                    {selectedCountry.flag} {selectedCountry.name}{result.city ? `, ${result.city}` : ""}
                  </p>
                  <h3 className="text-3xl font-extrabold tracking-tight">
                    {fmt(result.grand_total)} €
                  </h3>
                  <p className="text-[11px] text-white/70 font-semibold">
                    Общие вложения = разовые + курсы + буфер {monthsBuffer} мес.
                  </p>
                </div>
              </div>

              {/* Monthly breakdown */}
              <div className="card rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold tracking-wider uppercase text-[var(--muted)]">Ежемесячные расходы</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center border text-blue-500 bg-blue-500/10 border-blue-500/20 shrink-0">
                        <HomeIcon size={13} />
                      </div>
                      <span className="font-semibold">Жильё {!utilitiesIncluded && <span className="text-[var(--muted)] font-normal">(+ ком. услуги)</span>}</span>
                    </div>
                    <span className="font-bold">{fmt(result.housing_monthly)} €</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center border text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shrink-0">
                        <Utensils size={13} />
                      </div>
                      <span className="font-semibold">Питание, транспорт, прочее</span>
                    </div>
                    <span className="font-bold">{fmt(result.misc_monthly)} €</span>
                  </div>

                  {result.health_insurance_monthly > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center border text-rose-500 bg-rose-500/10 border-rose-500/20 shrink-0">
                          <Activity size={13} />
                        </div>
                        <span className="font-semibold">Страховка</span>
                      </div>
                      <span className="font-bold">{fmt(result.health_insurance_monthly)} €</span>
                    </div>
                  )}

                  {result.language_course_monthly > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center border text-violet-500 bg-violet-500/10 border-violet-500/20 shrink-0">
                          <BookOpen size={13} />
                        </div>
                        <span className="font-semibold">Языковые курсы</span>
                      </div>
                      <span className="font-bold">{fmt(result.language_course_monthly)} €</span>
                    </div>
                  )}

                  <div className="pt-3 mt-1 border-t border-[var(--border)] flex items-center justify-between">
                    <span className="font-bold text-xs">Итого в месяц</span>
                    <span className="text-base font-extrabold text-[var(--accent)]">{fmt(result.monthly_total)} €</span>
                  </div>
                </div>
              </div>

              {/* One-time costs */}
              {result.one_time_total > 0 && (
                <div className="card rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-[var(--muted)]">Одноразовые расходы</h3>

                  <div className="space-y-3 text-xs">
                    {result.visa_and_documents > 0 && (
                      <div className="flex justify-between font-semibold">
                        <div className="flex items-center gap-2">
                          <Shield size={13} className="text-amber-500" />
                          <span>Виза + документы</span>
                        </div>
                        <span>{fmt(result.visa_and_documents)} €</span>
                      </div>
                    )}
                    {result.flight_total > 0 && (
                      <div className="flex justify-between font-semibold">
                        <div className="flex items-center gap-2">
                          <Plane size={13} className="text-sky-500" />
                          <span>Перелёт</span>
                        </div>
                        <span>{fmt(result.flight_total)} €</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center">
                      <span className="font-bold">Итого разово</span>
                      <span className="font-extrabold text-sm">{fmt(result.one_time_total)} €</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Buffer summary */}
              <div className="card rounded-2xl p-5 space-y-3 text-xs">
                <h3 className="text-xs font-bold tracking-wider uppercase text-[var(--muted)]">Финансовая подушка</h3>
                <div className="flex justify-between font-semibold">
                  <span className="text-[var(--muted)]">Буфер {monthsBuffer} мес. × {fmt(result.monthly_total)} €</span>
                  <span>{fmt(result.savings_buffer)} €</span>
                </div>
                <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center">
                  <span className="font-bold text-xs">Итог (без учёта дохода)</span>
                  <span className="font-extrabold text-sm text-[var(--accent)]">{fmt(result.grand_total)} €</span>
                </div>
              </div>

              {/* Tips from backend */}
              {result.tips.length > 0 && (
                <div className="card rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-[var(--muted)]">Советы</h3>
                  <ul className="space-y-2.5">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--muted)]">
                        <Lightbulb size={13} className="text-[var(--accent)] mt-0.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link
                href="/programs"
                className="flex items-center justify-center gap-1.5 w-full bg-[var(--foreground)] text-[var(--background)] font-bold py-3 px-4 rounded-xl text-xs hover:opacity-90 transition-all shadow-sm"
              >
                Найти программы в {selectedCountry.name} <ArrowRight size={13} />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── PROGRAMS MODAL ──────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="card rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] shrink-0">
              <div>
                <h3 className="font-bold text-sm">
                  Программы — {selectedCountry.flag} {selectedCountry.name}
                </h3>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">Выберите программу для автозаполнения формы</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {modalLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-7 h-7 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                </div>
              )}
              {!modalLoading && modalPrograms.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                  <Globe size={28} className="text-[var(--muted)]" />
                  <p className="text-sm font-semibold">Программ не найдено</p>
                  <p className="text-xs text-[var(--muted)]">Попробуйте другую страну или введите данные вручную</p>
                </div>
              )}
              {!modalLoading && modalPrograms.map((prog) => (
                <button
                  key={prog.slug}
                  type="button"
                  onClick={() => handleProgramSelect(prog)}
                  className="w-full text-left p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5 transition-all group"
                >
                  <p className="text-xs font-bold leading-snug group-hover:text-[var(--accent)] transition-colors">
                    {prog.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                      {CATEGORY_LABELS[prog.category] ?? prog.category}
                    </span>
                    {prog.salary_range && (
                      <span className="text-[10px] text-[var(--muted)] font-medium">{prog.salary_range}</span>
                    )}
                    {prog.duration_months && (
                      <span className="text-[10px] text-[var(--muted)]">{prog.duration_months} мес.</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--border)] shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full py-2.5 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30 transition-all"
              >
                Ввести вручную
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
