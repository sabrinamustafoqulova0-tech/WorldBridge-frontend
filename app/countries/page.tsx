"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublicIcon from '@mui/icons-material/Public';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from "next-themes";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { useLangStore } from "../../store/langStore";
import { translations } from "../../locales/translations";
import { getLocalizedField } from "../../utils/langHelper";

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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white font-sans transition-colors duration-300 pb-24">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-[#0F172A]/60 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.05] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-[#3B82F6] transition-colors font-medium">
              <ArrowBackIcon fontSize="small" /> {navText.back}
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>
            <Link href="/" className="hidden sm:flex items-center gap-3 group">
              <div className="bg-[#0F172A] dark:bg-white/10 p-1 rounded-md text-white border border-transparent dark:border-white/10 group-hover:bg-[#3B82F6] transition-all shadow-sm">
                <PublicIcon fontSize="small" />
              </div>
              <span className="text-lg font-bold text-[#0F172A] dark:text-white">WorldBridge</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {mounted && (
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300"
              >
                {theme === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </button>
            )}
            {!authLoading && !isAuthenticated && (
              <Link href="/register" className="bg-[#3B82F6] text-white px-4 py-1.5 rounded-full hover:bg-blue-600 transition-colors shadow-md text-sm font-medium">
                {navText.signup}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div className="pt-32 pb-12 px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          {text.title1} <span className="text-[#3B82F6]">{text.title2}</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          {text.subtitle}
        </p>

        <div className="relative max-w-xl mx-auto">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder={text.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] shadow-sm transition-shadow"
          />
        </div>
      </div>

      {/* Grid Section */}
      <div className="max-w-6xl mx-auto px-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 dark:border-white/20 border-t-[#3B82F6]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCountries.map(country => (
              <Link href={`/countries/${country.slug}`} key={country.id} className="block group">
                <div className="bg-white dark:bg-[#1E293B]/70 rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-100 dark:border-white/5 transition-all h-full flex flex-col items-center text-center group-hover:-translate-y-1 group-hover:border-blue-200 dark:group-hover:border-blue-800">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {country.flag_emoji}
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">
                    {getLocalizedField(country, 'name', lang)}
                  </h3>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full mt-auto">
                    {country.region}
                  </div>
                </div>
              </Link>
            ))}
            {filteredCountries.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                {text.notFound}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
