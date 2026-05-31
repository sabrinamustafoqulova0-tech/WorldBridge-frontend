"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { useLangStore } from "../../store/langStore";
import { translations } from "../../locales/translations";
import { getLocalizedField } from "../../utils/langHelper";
import AuthGateModal from "../../components/AuthGateModal";
import Link from "next/link";
import { 
  ArrowLeft, 
  Globe, 
  Moon, 
  Sun, 
  Search, 
  MapPin,
  ArrowRight,
  Compass
} from "lucide-react";

interface Country {
  id: number;
  slug: string;
  name_ru: string;
  name_en: string;
  flag_emoji: string;
  region: string;
}

export default function CountriesListPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { lang } = useLangStore();
  const text = translations[lang]?.countries || translations.ru.countries;
  const navText = translations[lang]?.nav || translations.ru.nav;

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [authGate, setAuthGate] = useState<{ open: boolean; target: string }>({ open: false, target: "" });

  const handleCountryClick = (slug: string) => {
    if (isAuthenticated) {
      router.push(`/countries/${slug}`);
    } else {
      setAuthGate({ open: true, target: `/countries/${slug}` });
    }
  };

  useEffect(() => {
    setMounted(true);
    const fetchCountries = async () => {
      try {
        const res = await api.get("/countries");
        setCountries(res.data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name_ru.toLowerCase().includes(search.toLowerCase()) || 
    c.name_en.toLowerCase().includes(search.toLowerCase()) ||
    c.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col pb-24">
      
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-5 md:px-8 glass border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft size={14} /> Назад
          </button>
          <div className="h-4 w-px bg-[var(--border)] hidden sm:block"></div>
          <Link href="/" className="hidden sm:flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center transition-transform group-hover:scale-110">
              <Globe size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-[14px] tracking-tight">WorldBridge</span>
          </Link>
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
          {!authLoading && !isAuthenticated && (
            <Link 
              href="/register" 
              className="px-3 py-1.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-[12px] font-bold hover:opacity-85 transition-all"
            >
              {navText.signup}
            </Link>
          )}
        </div>
      </nav>

      {/* ─── Hero Header Area — Left-Aligned ────────────────────── */}
      <div className="pt-24 pb-12 px-5 md:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] flex items-center gap-1.5">
              <Compass size={12} className="animate-spin-slow" />
              Каталог направлений
            </p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight text-balance">
              {text.title1} <span className="text-[var(--accent)]">{text.title2}</span>
            </h1>
            <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed max-w-[55ch]">
              {text.subtitle}
            </p>
          </div>

          {/* Elegant Search Input */}
          <div className="relative max-w-md w-full pt-2">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input 
              type="text" 
              placeholder={text.searchPlaceholder || "Поиск направления..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 shadow-inner transition-all placeholder:text-[var(--muted)]"
            />
          </div>
        </div>
      </div>

      {/* ─── Grid / List Section — Bento inspired ───────────────── */}
      <div className="max-w-4xl mx-auto px-5 md:px-8 w-full mt-4 flex-1">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCountries.map((country, idx) => (
                <button
                  key={country.id}
                  onClick={() => handleCountryClick(country.slug)}
                  className="group block text-left w-full"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="glass border border-[var(--border)] rounded-2xl p-5 hover:bg-[var(--card)] transition-all duration-200 flex items-start gap-4 h-full relative overflow-hidden">
                    {/* Glow element */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)] rounded-full blur-[40px] opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />

                    {/* Emoji Flag Container */}
                    <div className="w-12 h-12 rounded-xl bg-[var(--background)] flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                      {country.flag_emoji}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h3 className="font-bold text-sm sm:text-base group-hover:text-[var(--accent)] transition-colors">
                        {getLocalizedField(country, 'name', lang)}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider bg-[var(--border)]/20 px-2 py-0.5 rounded-md">
                        <MapPin size={9} />
                        {country.region}
                      </span>
                    </div>

                    <div className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-dim)] transition-all self-center shrink-0">
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </button>
              ))}
            </div>

          {filteredCountries.length === 0 && (
              <div className="text-center py-20 text-[var(--muted)] text-sm font-light">
                {text.notFound || "Ничего не найдено по вашему запросу."}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auth Gate Modal */}
      <AuthGateModal
        isOpen={authGate.open}
        onClose={() => setAuthGate({ open: false, target: "" })}
        redirectTo={authGate.target}
      />

    </div>
  );
}
