"use client";

import { useAuthStore } from "../../../store/authStore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTheme } from "next-themes";

const COUNTRY_NAMES: Record<string, string> = {
  de: "Германия",
  fr: "Франция",
  be: "Бельгия",
  ch: "Швейцария",
  at: "Австрия",
  pl: "Польша",
  cz: "Чехия",
  se: "Швеция",
  no: "Норвегия",
  fi: "Финляндия",
  tr: "Турция",
  cn: "Китай",
  ca: "Канада",
  us: "США"
};

const FAQ_DATA = [
  {
    q: "1. Почему стоит выбрать эту страну?",
    a: "Краткое описание преимуществ страны:\n• качество образования\n• высокий уровень зарплат\n• безопасность\n• широкие возможности для иммиграции\n• востребованные профессии"
  },
  {
    q: "2. Какие программы доступны в этой стране?",
    a: "Список всех программ:\n• Учёба\n• Работа\n• Стажировки\n• Волонтёрство\n• Au Pair\n• Языковые курсы\n• Государственные стипендии\n• Программы обмена"
  },
  {
    q: "3. Какие требования для участия?",
    a: "Подробно:\n• возраст (обычно 18-35 лет)\n• образование (аттестат или диплом)\n• знание языка (местный или английский)\n• опыт работы (для рабочих виз)\n• финансовые требования (наличие средств на счету)"
  },
  {
    q: "4. Какой уровень языка необходим?",
    a: "Для каждой программы:\nУчёба: B1/B2\nРабота: A2/B1\nAu Pair: A1/A2\nСтажировка: B1"
  },
  {
    q: "5. Сколько стоят документы и оформление?",
    a: "Включить:\n• виза (~80-150€)\n• страховка (~30-100€/мес)\n• переводы документов (~50€)\n• апостиль\n• авиабилеты"
  },
  {
    q: "6. Сколько денег нужно на первое время?",
    a: "Примерный бюджет:\n• жильё (от 400€)\n• питание (от 200€)\n• транспорт (от 50€)\n• мобильная связь (от 20€)\n• личные расходы\nИтого: ~1000-1500€ в месяц"
  },
  {
    q: "7. Можно ли работать во время учёбы?",
    a: "Да.\n• разрешено работать 20 часов в неделю\n• средняя зарплата студентов: 10-15€ в час\n• популярные подработки: кафе, доставка, ассистенты в ВУЗе"
  },
  {
    q: "8. Какие профессии востребованы?",
    a: "Список актуальных профессий:\n• IT\n• медицина\n• инженерия\n• строительство\n• логистика\n• туризм\n• образование"
  },
  {
    q: "9. Какие документы необходимы?",
    a: "Полный список:\n• загранпаспорт\n• диплом/аттестат\n• языковой сертификат\n• мотивационное письмо\n• резюме\n• справка о финансах"
  },
  {
    q: "10. Можно ли получить ВНЖ или ПМЖ?",
    a: "Подробно объяснить:\n• ВНЖ выдается на срок учебы/работы\n• ПМЖ доступен через 3-5 лет легального проживания\n• путь к гражданству: от 5 до 8 лет"
  },
  {
    q: "11. Какие преимущества и недостатки страны?",
    a: "Плюсы:\n• высокий уровень жизни\n• безопасность\n• качество образования\nМинусы:\n• дорогая аренда\n• сложный язык\n• высокая конкуренция"
  },
  {
    q: "12. Какие города лучше выбрать?",
    a: "Для каждого города:\n• Столицы: выше зарплаты, но дороже аренда\n• Студенческие города: дешевле, много молодёжи, отличные университеты"
  },
  {
    q: "13. Какие университеты и колледжи самые популярные?",
    a: "Список лучших учебных заведений страны включает национальные исследовательские институты, технические ВУЗы и бизнес-школы мирового уровня."
  },
  {
    q: "14. Есть ли государственные стипендии?",
    a: "Да. Выдаются национальные гранты (например, DAAD, Türkiye Bursları, Erasmus+). Покрывают обучение, проживание и выдают ежемесячную стипендию."
  },
  {
    q: "15. Насколько сложно получить визу?",
    a: "Оценка:\n⭐⭐⭐☆☆ — средне. При полном и правильном пакете документов шансы стремятся к 100%."
  },
  {
    q: "16. Какие реальные шансы на переезд?",
    a: "AI анализирует ваш профиль. Обычно для молодых специалистов с уровнем языка B1 шансы составляют более 85%."
  },
  {
    q: "17. С чего начать подготовку?",
    a: "Пошаговый план:\nШаг 1 — выбрать программу\nШаг 2 — изучить требования\nШаг 3 — подготовить документы\nШаг 4 — улучшить язык\nШаг 5 — подать заявку\nШаг 6 — получить визу\nШаг 7 — переезд"
  }
];

export default function CountryPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const countryId = params.id;
  const countryName = COUNTRY_NAMES[countryId] || "Страна";

  const { isAuthenticated, isLoading } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white font-sans transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-[#0F172A]/60 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.05] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/home" className="flex items-center gap-2 text-gray-500 hover:text-[#3B82F6] transition-colors font-medium">
              <ArrowBackIcon fontSize="small" /> Назад
            </Link>
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
            {!isAuthenticated && (
              <Link href="/register" className="bg-[#3B82F6] text-white px-4 py-1.5 rounded-full hover:bg-blue-600 transition-colors shadow-md text-sm font-medium">
                Регистрация
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-32 pb-16 px-6 max-w-4xl mx-auto text-center">
        <div className="inline-block p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm mb-6">
          <PublicIcon fontSize="large" className="text-[#3B82F6]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Подробная информация: <span className="text-[#3B82F6]">{countryName}</span>
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Всё, что вам нужно знать для успешного переезда, учебы или работы. 
          {countryId === 'tr' && " Включая Türkiye Bursları, Study in Turkey и Work Permit."}
        </p>
      </div>

      {/* Turkey Custom Banner (Only visible for Turkey) */}
      {countryId === 'tr' && (
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <PublicIcon style={{ fontSize: 200 }} />
            </div>
            <h2 className="text-2xl font-bold mb-4 relative z-10">🇹🇷 Турция — Популярные программы</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 mt-6">
              <div className="bg-white/10 rounded-xl p-5 backdrop-blur-md">
                <h3 className="font-bold text-lg mb-2">🎓 Türkiye Bursları</h3>
                <ul className="list-disc pl-5 text-sm space-y-1 text-red-100">
                  <li>Бесплатное обучение и общежитие</li>
                  <li>Ежемесячная стипендия</li>
                  <li>Медицинская страховка</li>
                  <li>Год изучения турецкого языка</li>
                  <li>Авиабилет</li>
                </ul>
                <div className="mt-3 text-xs text-red-200">Бакалавр: до 21г | Магистратура: до 30л | Докторантура: до 35л</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-5 backdrop-blur-md">
                <h3 className="font-bold text-lg mb-2">🎓 Study in Turkey</h3>
                <p className="text-sm text-red-100 mb-2">Популярные направления: медицина, IT, инженерия, бизнес.</p>
                <ul className="list-disc pl-5 text-sm space-y-1 text-red-100">
                  <li>Istanbul University</li>
                  <li>Middle East Technical Univ.</li>
                  <li>Hacettepe University</li>
                  <li>Istanbul Technical Univ.</li>
                </ul>
              </div>

              <div className="bg-white/10 rounded-xl p-5 backdrop-blur-md">
                <h3 className="font-bold text-lg mb-2">💼 Work Permit Turkey</h3>
                <p className="text-sm text-red-100 mb-2">Рабочая виза для иностранных специалистов.</p>
                <ul className="list-disc pl-5 text-sm space-y-1 text-red-100">
                  <li>IT и международные компании</li>
                  <li>Туризм и гостиничный бизнес</li>
                  <li>Образование</li>
                </ul>
              </div>

              <div className="bg-white/10 rounded-xl p-5 backdrop-blur-md">
                <h3 className="font-bold text-lg mb-2">🏨 Internship Turkey</h3>
                <p className="text-sm text-red-100 mb-2">Популярно: Antalya, Istanbul, Izmir</p>
                <ul className="list-disc pl-5 text-sm space-y-1 text-red-100">
                  <li>Отели и турагентства</li>
                  <li>Международные компании</li>
                  <li>Рестораны</li>
                </ul>
              </div>

              <div className="bg-white/10 rounded-xl p-5 backdrop-blur-md">
                <h3 className="font-bold text-lg mb-2">🌍 Erasmus+ Turkey</h3>
                <p className="text-sm text-red-100 mb-2">Обмен на 1–2 семестра</p>
                <ul className="list-disc pl-5 text-sm space-y-1 text-red-100">
                  <li>Международный опыт</li>
                  <li>Изучение языка</li>
                </ul>
              </div>

              <div className="bg-white/10 rounded-xl p-5 backdrop-blur-md">
                <h3 className="font-bold text-lg mb-2">🇹🇷 Language & Summer</h3>
                <ul className="list-disc pl-5 text-sm space-y-1 text-red-100">
                  <li>Курсы языка: A1–C2</li>
                  <li>Летние школы (2 нед - 3 мес)</li>
                  <li>Культура, бизнес, IT</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-red-400/30 relative z-10">
              <h3 className="font-bold text-xl mb-3">Почему Турция популярна?</h3>
              <div className="flex flex-wrap gap-2 text-sm text-red-100">
                <span className="bg-white/10 px-3 py-1 rounded-full">✅ Невысокие расходы</span>
                <span className="bg-white/10 px-3 py-1 rounded-full">✅ Много стипендий</span>
                <span className="bg-white/10 px-3 py-1 rounded-full">✅ Простая студ. виза</span>
                <span className="bg-white/10 px-3 py-1 rounded-full">✅ Международные ВУЗы</span>
                <span className="bg-white/10 px-3 py-1 rounded-full">✅ Учеба на английском</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <main className="max-w-4xl mx-auto px-6 pb-24 space-y-6">
        <h2 className="text-2xl font-bold mb-8">FAQ — Часто задаваемые вопросы</h2>
        
        {FAQ_DATA.map((item, index) => (
          <div key={index} className="bg-white dark:bg-[#1E293B]/50 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-white/5 transition-colors">
            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-4 leading-snug">
              {item.q}
            </h3>
            
            {isAuthenticated ? (
              <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed text-sm sm:text-base">
                {item.a}
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-[#0F172A]/40 border border-gray-100 dark:border-transparent">
                <div className="text-transparent bg-clip-text bg-gray-400 dark:bg-gray-600 select-none blur-[4px] pointer-events-none h-24 p-4">
                  {item.a}
                  <br/>
                  Дополнительная скрытая информация, доступная только для авторизованных пользователей платформы...
                </div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-[#0F172A]/60 backdrop-blur-[2px]">
                  <LockIcon className="text-[#3B82F6] mb-2 drop-shadow-md" />
                  <Link href="/register" className="text-sm font-semibold bg-[#3B82F6] text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/25">
                    Зарегистрируйтесь, чтобы увидеть ответ
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Question 18 - Interactive AI Form */}
        <div className="bg-gradient-to-br from-[#0F172A] to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/10 text-center relative overflow-hidden mt-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6] rounded-full blur-[100px] opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              18. Какая программа подойдёт именно мне?
            </h3>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Наш искусственный интеллект задаст вам несколько вопросов и подберет лучший вариант переезда на основе вашего опыта, возраста и целей.
            </p>
            
            {isAuthenticated ? (
              <button className="flex items-center justify-center gap-2 mx-auto bg-white text-[#0F172A] font-bold py-4 px-8 rounded-full hover:scale-105 hover:bg-gray-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <AutoAwesomeIcon className="text-[#3B82F6]" />
                Подобрать программу с помощью AI
              </button>
            ) : (
              <Link href="/register" className="inline-flex items-center justify-center gap-2 mx-auto bg-[#3B82F6] text-white font-bold py-4 px-8 rounded-full hover:scale-105 hover:bg-blue-600 transition-all shadow-lg">
                <LockIcon fontSize="small" />
                Войдите для доступа к AI
              </Link>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
