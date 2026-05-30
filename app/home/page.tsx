"use client";

import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PublicIcon from '@mui/icons-material/Public';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

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

export default function HomePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 dark:border-white/20 border-t-[#3B82F6]"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white font-sans selection:bg-[#3B82F6] selection:text-white overflow-x-hidden transition-colors duration-300">
      
      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-[#0F172A]/60 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.05] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-[#0F172A] dark:bg-white/10 p-1.5 rounded-lg text-white border border-transparent dark:border-white/10 group-hover:bg-[#3B82F6] dark:group-hover:bg-white/20 transition-all shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <PublicIcon fontSize="small" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-[#0F172A] dark:text-white group-hover:text-[#3B82F6] dark:group-hover:text-blue-100 transition-colors">WorldBridge</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-500 dark:text-gray-400">
            <Link href="/programs" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">Programs</Link>
            <Link href="/countries" className="text-[#0F172A] dark:text-white drop-shadow-[0_0_10px_rgba(15,23,42,0.1)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Destinations</Link>
            <Link href="/articles" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">Insights</Link>
            <Link href="/calculator" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">Estimator</Link>
          </div>

          <div className="flex items-center space-x-4">
            {mounted && (
              <select 
                className="bg-transparent text-sm font-medium text-gray-500 dark:text-gray-400 focus:outline-none cursor-pointer hover:text-[#0F172A] dark:hover:text-white transition-colors appearance-none"
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
                <option value="de">Deutsch</option>
              </select>
            )}

            {mounted && (
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300"
                title="Toggle Dark Mode"
              >
                {theme === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#0F172A] dark:hover:text-white transition-colors">
                  <AccountCircleIcon fontSize="small" />
                  <span className="hidden sm:inline">{user?.full_name || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-500 hover:text-[#0F172A] dark:hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-sm font-medium">
                <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-[#0F172A] dark:hover:text-white transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] px-4 py-1.5 rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section & Network Map */}
      <main className="pt-32 pb-24 relative min-h-screen flex flex-col items-center justify-center">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen transition-colors duration-300"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-400/10 dark:bg-[#0ea5e9]/10 rounded-full blur-[150px] pointer-events-none mix-blend-multiply dark:mix-blend-screen transition-colors duration-300"></div>

        <div className="max-w-4xl mx-auto px-6 text-center z-10 relative mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-xs font-semibold uppercase tracking-widest mb-8 shadow-sm dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-colors duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse"></span>
            Global Opportunities Network
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-white/60 mb-6 leading-tight transition-colors duration-300">
            Connect to your future. <br className="hidden md:block"/> Anywhere in the world.
          </h1>
          
          <p className="text-lg text-gray-500 dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Detailed, in-depth information about top programs worldwide. Explore relocation pathways, educational grants, and elite career opportunities across premium destinations.
          </p>
        </div>

        {/* Interactive Country Network */}
        <div className="w-full max-w-6xl mx-auto relative h-[600px] rounded-3xl border border-gray-200 dark:border-white/[0.05] bg-white/40 dark:bg-[#0F172A]/40 backdrop-blur-2xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden transition-colors duration-300">
          
          {/* Subtle World Map Background */}
          <div 
            className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15] pointer-events-none" 
            style={{ 
              backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')`, 
              backgroundSize: '105% auto', 
              backgroundPosition: 'center 45%', 
              backgroundRepeat: 'no-repeat',
              filter: theme === 'dark' ? 'invert(1)' : 'none'
            }}
          ></div>

          {/* SVG Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
            {CONNECTIONS.map(([id1, id2], i) => {
              const c1 = COUNTRIES.find(c => c.id === id1);
              const c2 = COUNTRIES.find(c => c.id === id2);
              if (!c1 || !c2) return null;
              
              const isHoveredLine = hoveredCountry === id1 || hoveredCountry === id2;
              
              return (
                <line
                  key={i}
                  x1={`${c1.x}%`}
                  y1={`${c1.y}%`}
                  x2={`${c2.x}%`}
                  y2={`${c2.y}%`}
                  className={`transition-all duration-500 ${isHoveredLine ? 'stroke-[#3B82F6]' : 'stroke-gray-300 dark:stroke-slate-800'}`}
                  strokeWidth={isHoveredLine ? "2" : "1"}
                  style={{ filter: isHoveredLine ? "drop-shadow(0 0 8px rgba(59,130,246,0.6))" : "none" }}
                />
              );
            })}
          </svg>

          {/* Country Nodes */}
          {COUNTRIES.map((country) => {
            const isHovered = hoveredCountry === country.id;
            
            return (
              <div
                key={country.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer group z-20"
                style={{ left: `${country.x}%`, top: `${country.y}%` }}
                onMouseEnter={() => setHoveredCountry(country.id)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => router.push(`/countries/${country.id}`)}
              >
                {/* Glow Effect */}
                <div className={`absolute w-12 h-12 rounded-full bg-[#3B82F6]/20 dark:bg-[#3B82F6]/30 blur-md transition-all duration-300 ${isHovered ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}></div>
                
                {/* Node Core */}
                <div className={`relative w-3 h-3 rounded-full border border-gray-300 dark:border-white/20 transition-all duration-300 shadow-sm dark:shadow-[0_0_10px_rgba(255,255,255,0.2)] ${isHovered ? 'bg-[#3B82F6] scale-150 border-[#3B82F6]' : 'bg-gray-200 dark:bg-white/40 group-hover:bg-gray-400 dark:group-hover:bg-white'}`}></div>
                
                {/* Tooltip / Label */}
                <div className={`absolute top-6 flex flex-col items-center transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-70 -translate-y-1'}`}>
                  <span className={`text-sm font-medium whitespace-nowrap ${isHovered ? 'text-[#0F172A] dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {country.name}
                  </span>
                  
                  <div className={`mt-2 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-xl flex items-center gap-2 whitespace-nowrap transition-all duration-300 overflow-hidden ${isHovered ? 'max-h-20 opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'}`}>
                    <span className="text-xs text-gray-500 dark:text-gray-300"><strong className="text-[#0F172A] dark:text-white">{country.programs}</strong> programs</span>
                    <KeyboardArrowRightIcon fontSize="small" className="text-[#3B82F6]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
      </main>

    </div>
  );
}
