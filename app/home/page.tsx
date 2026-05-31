"use client";

import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useLangStore } from "../../store/langStore";
import { useAIConsultantStore } from "../../store/aiConsultantStore";
import { translations } from "../../locales/translations";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Globe, Moon, Sun, User, LogOut, Sparkles, Plus, Minus, RotateCcw, MapPin } from "lucide-react";

const COUNTRIES = [
  { id: "de", name: "Germany", programs: 142, x: 52, y: 33 },
  { id: "fr", name: "France", programs: 89, x: 47, y: 40 },
  { id: "be", name: "Belgium", programs: 58, x: 49, y: 35 },
  { id: "ch", name: "Switzerland", programs: 64, x: 50, y: 42 },
  { id: "at", name: "Austria", programs: 47, x: 54, y: 39 },
  { id: "pl", name: "Poland", programs: 112, x: 57, y: 32 },
  { id: "cz", name: "Czechia", programs: 38, x: 54, y: 35 },
  { id: "se", name: "Sweden", programs: 76, x: 53, y: 22 },
  { id: "no", name: "Norway", programs: 41, x: 49, y: 20 },
  { id: "fi", name: "Finland", programs: 53, x: 58, y: 19 },
  { id: "tr", name: "Turkey", programs: 125, x: 62, y: 44 },
  { id: "cn", name: "China", programs: 215, x: 78, y: 45 },
  { id: "ca", name: "Canada", programs: 184, x: 22, y: 28 },
  { id: "us", name: "USA", programs: 342, x: 22, y: 42 },
];

const CONNECTIONS = [
  ["us", "ca"], ["ca", "fr"], ["us", "fr"], ["fr", "be"], ["be", "de"],
  ["fr", "ch"], ["ch", "at"], ["de", "ch"], ["de", "at"], ["de", "cz"],
  ["cz", "pl"], ["pl", "de"], ["de", "se"], ["se", "no"], ["se", "fi"],
  ["fi", "cn"], ["pl", "cn"], ["at", "cn"], ["at", "tr"], ["tr", "cn"], ["tr", "pl"]
];

const PROJECTS: Record<string, any[]> = {
  de: [
    { id: "p1", name: "Berlin IT Hub", description: "Software Engineering", city: "Berlin", x: 52.5, y: 31.5 },
    { id: "p2", name: "Munich Auto", description: "Mechanical Design", city: "Munich", x: 51.5, y: 33.5 },
  ],
  fr: [{ id: "p3", name: "Paris Design", description: "UI/UX Internship", city: "Paris", x: 47.5, y: 38 }],
  us: [
    { id: "p4", name: "SV Tech", description: "Backend Engineering", city: "San Francisco", x: 15, y: 38 },
    { id: "p5", name: "NY Finance", description: "Quantitative Analysis", city: "New York", x: 28, y: 37 },
  ],
  ca: [{ id: "p6", name: "Toronto AI", description: "Machine Learning", city: "Toronto", x: 26, y: 30 }],
  pl: [{ id: "p7", name: "Warsaw Logistics", description: "Supply Chain", city: "Warsaw", x: 57.5, y: 31 }],
  tr: [{ id: "p8", name: "Istanbul Trade", description: "Logistics", city: "Istanbul", x: 61, y: 43.5 }],
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

  const text = translations[lang]?.home || translations.ru.home;
  const navText = translations[lang]?.nav || translations.ru.nav;

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

      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-5 md:px-8 glass border-b border-[var(--border)] dark:glass light:glass-light">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center transition-transform group-hover:scale-110">
            <Globe size={13} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[14px] tracking-tight">WorldBridge</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[var(--muted)]">
          <Link href="/programs" className="hover:text-[var(--foreground)] transition-colors">{navText.programs}</Link>
          <Link href="/countries" className="font-semibold text-[var(--foreground)]">{navText.destinations}</Link>
          <Link href="/articles" className="hover:text-[var(--foreground)] transition-colors">{navText.insights}</Link>
          <Link href="/calculator" className="hover:text-[var(--foreground)] transition-colors">{navText.estimator}</Link>
        </div>

        <div className="flex items-center gap-2">
          {mounted && (
            <select
              className="bg-transparent text-[13px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] focus:outline-none cursor-pointer transition-colors appearance-none"
              value={lang} onChange={(e) => setLang(e.target.value as any)}
            >
              <option value="ru">RU</option>
              <option value="en">EN</option>
              <option value="tg">TG</option>
            </select>
          )}

          {mounted && (
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)]">
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}

          {mounted && (
            <button onClick={() => openAIConsultant("consultation")}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-dim)] border border-[var(--accent)]/20 text-[var(--accent)] text-[12px] font-semibold hover:bg-[var(--accent)]/15 transition-all">
              <Sparkles size={12} className="animate-pulse-dot" />
              AI
            </button>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2 ml-1">
              <Link href="/profile"
                className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                <User size={14} />
                <span className="hidden sm:inline">{user?.full_name?.split(" ")[0] || navText.profile}</span>
              </Link>
              <button onClick={handleLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)]">
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <Link href="/register"
              className="ml-1 px-3 py-1.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-[13px] font-semibold hover:opacity-85 transition-all">
              {navText.signup}
            </Link>
          )}
        </div>
      </nav>

      {/* ─── Hero text ──────────────────────────────────────────── */}
      <div className="pt-14 px-5 md:px-8">
        <div className="max-w-7xl mx-auto py-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
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
      <div className="flex-1 px-5 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-[60vh] md:h-[70vh] min-h-[480px] rounded-3xl border border-[var(--border)] overflow-hidden bg-[var(--card)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]">
            <TransformWrapper
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
                            backgroundSize: "105% auto", backgroundPosition: "center 45%", backgroundRepeat: "no-repeat",
                            filter: theme === "dark" ? "invert(1)" : "none",
                          }} />

                        {/* Detailed map */}
                        <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
                          style={{
                            opacity: scale > 1.8 ? (theme === "dark" ? 0.2 : 0.3) : 0,
                            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')`,
                            backgroundSize: "100% auto", backgroundPosition: "center 50%", backgroundRepeat: "no-repeat",
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
                              <div className={`absolute top-5 flex flex-col items-center transition-all duration-300 ${isHov ? "opacity-100 translate-y-0" : "opacity-60 -translate-y-0.5"}`}>
                                <span className={`text-[11px] font-semibold whitespace-nowrap ${isHov ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                                  {country.name}
                                </span>
                                <div className={`mt-1.5 px-2.5 py-1.5 rounded-xl glass border border-[var(--border)] flex flex-col gap-0.5 whitespace-nowrap transition-all duration-300 overflow-hidden ${isHov ? "max-h-16 opacity-100" : "max-h-0 opacity-0"}`}>
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
                                onClick={(e) => { e.stopPropagation(); router.push(`/countries/${countryId}`); }}
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
    </div>
  );
}
