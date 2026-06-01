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
import { motion } from "framer-motion";
import { 
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

const COUNTRY_IMAGES: Record<string, string> = {
  de: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80",
  ca: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=600&q=80",
  fr: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
  ch: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
  at: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=600&q=80",
  be: "https://selfguide.ru/wp-content/uploads/2012/08/Ghent-Belgium.jpg",
  cn: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
  cz: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80",
  fi: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
  no: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=600&q=80",
  pl: "https://vkurse.ua/wp-content/uploads/2025/10/chym-slavytsya-polshha.jpg",
  se: "https://traveller-eu.ru/static/img/cover/malmyo_MVPZOxYHg_2x.jpg",
  tr: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=600&q=80",
  us: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80"
};

export default function CountriesListPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { lang } = useLangStore();
  const text = translations[lang]?.countries || translations.ru.countries;

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col pb-24 relative">
      
      {/* Ambient decorative lighting */}
      <div className="absolute top-0 right-0 w-[40dvw] h-[40dvw] bg-[var(--accent)] rounded-full blur-[140px] opacity-[0.04] pointer-events-none z-0" />
      <div className="absolute top-[30%] left-[-10%] w-[35dvw] h-[35dvw] bg-emerald-500 rounded-full blur-[160px] opacity-[0.03] pointer-events-none z-0" />

      {/* ─── Hero Header Area — Left-Aligned ────────────────────── */}
      <div className="pt-24 pb-12 px-4 md:px-6 relative z-10">
        <div className="max-w-[1440px] mx-auto space-y-6">
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
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 w-full mt-4 flex-1 relative z-10">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCountries.map((country) => {
                const bgImg = COUNTRY_IMAGES[country.slug.toLowerCase()] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80";
                return (
                  <motion.button
                    variants={itemVariants}
                    key={country.id}
                    onClick={() => handleCountryClick(country.slug)}
                    className="group block text-left w-full relative h-[280px] rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-sm hover:shadow-xl hover:border-[var(--accent)]/30 transition-all duration-300 cursor-pointer"
                  >
                    {/* Background image container */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      <img 
                        src={bgImg} 
                        alt={country.name_ru}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-[0.7] dark:brightness-[0.55]" 
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/20 to-transparent opacity-95" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end z-10 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                          {country.flag_emoji}
                        </div>
                        <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                          {getLocalizedField(country, 'name', lang)}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md uppercase tracking-wider">
                          <MapPin size={9} />
                          {country.region}
                        </span>
                        <div className="w-7 h-7 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-dim)] transition-all">
                          <ArrowRight size={12} />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

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
