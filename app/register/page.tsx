"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../../lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useAuthStore } from "../../store/authStore";
import { Globe, ArrowRight } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  country: z.string().min(1, "Выберите страну"),
  password: z.string()
    .min(8, "Минимум 8 символов")
    .regex(/[A-Z]/, "Нужна хотя бы одна заглавная буква")
    .regex(/[0-9]/, "Нужна хотя бы одна цифра"),
});
type RegisterFormValues = z.infer<typeof registerSchema>;

// ── Inner form (needs useSearchParams inside Suspense) ────────────────────────
function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/home";
  const [error, setError] = useState("");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) router.push(nextUrl);
  }, [isAuthenticated, router, nextUrl]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormValues) => {
    setError("");
    try {
      await api.post("/auth/register", {
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        country: data.country,
      });
      // After registration → go to login preserving ?next=
      const loginHref = nextUrl !== "/home"
        ? `/login?next=${encodeURIComponent(nextUrl)}&registered=true`
        : "/login?registered=true";
      router.push(loginHref);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => `${d.loc?.[1] || "поле"}: ${d.msg}`).join(", "));
      } else {
        setError("Ошибка регистрации. Попробуйте снова.");
      }
    }
  };

  const loginHref = nextUrl !== "/home"
    ? `/login?next=${encodeURIComponent(nextUrl)}`
    : "/login";

  const inputCls = "w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all";

  return (
    <div className="min-h-[100dvh] grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] bg-[var(--background)]">

      {/* ─── Left brand panel ──────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[var(--foreground)] text-[var(--background)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent)] rounded-full blur-[100px] opacity-12 -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Globe size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight">WorldBridge</span>
        </div>

        <div className="relative space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--background)]/40">Присоединяйтесь бесплатно</p>
          <h2 className="text-4xl font-bold tracking-tighter leading-tight text-balance">
            Ваш следующий <span className="text-[var(--accent)]">шаг</span> начинается с регистрации.
          </h2>
          <p className="text-sm text-[var(--background)]/55 leading-relaxed max-w-[42ch]">
            Получите доступ к 2,341 программам релокации, AI-консультанту и калькулятору расходов.
          </p>

          {/* Steps preview */}
          <div className="pt-6 space-y-4">
            {[
              "Зарегистрируйтесь за 30 секунд",
              "Пройдите AI-консультацию",
              "Выберите программу и подайте заявку",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border border-[var(--accent)]/40 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-[var(--accent)]">{i + 1}</span>
                </div>
                <span className="text-sm text-[var(--background)]/60">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-[var(--background)]/35">
          Уже более 18,400 человек используют WorldBridge.
        </div>
      </div>

      {/* ─── Right form panel ──────────────────────────────── */}
      <div className="flex flex-col justify-center px-6 md:px-16 xl:px-24 py-16">
        <div className="lg:hidden flex items-center gap-2 mb-12">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Globe size={13} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold tracking-tight">WorldBridge</span>
        </div>

        <div className="w-full max-w-[420px]">
          <div className="mb-8 reveal-up">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Создать аккаунт</h1>

            {/* Context hint when user came from auth gate */}
            {nextUrl !== "/home" && (
              <p className="text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-dim)] border border-[var(--accent)]/20 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-1.5">
                🔒 После регистрации вы попадёте на выбранную программу
              </p>
            )}

            <p className="text-sm text-[var(--muted)]">
              Уже есть аккаунт?{" "}
              <Link href={loginHref} className="text-[var(--accent)] font-semibold hover:underline">
                Войти
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/8 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="reveal-up delay-75">
              <label className="block text-sm font-medium mb-2">Полное имя</label>
              <input {...register("fullName")} placeholder="Камол Рахимов" className={inputCls} />
              {errors.fullName && <p className="mt-1.5 text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            <div className="reveal-up delay-100">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input {...register("email")} type="email" placeholder="you@example.com" className={inputCls} />
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="reveal-up delay-150">
              <label className="block text-sm font-medium mb-2">Страна проживания</label>
              <select {...register("country")} className={`${inputCls} cursor-pointer`}>
                <option value="">Выберите страну</option>
                <option value="TJ">Таджикистан</option>
                <option value="UZ">Узбекистан</option>
                <option value="KZ">Казахстан</option>
                <option value="RU">Россия</option>
                <option value="KG">Кыргызстан</option>
                <option value="OTHER">Другая</option>
              </select>
              {errors.country && <p className="mt-1.5 text-xs text-red-500">{errors.country.message}</p>}
            </div>

            <div className="reveal-up delay-200">
              <label className="block text-sm font-medium mb-2">Пароль</label>
              <input {...register("password")} type="password" placeholder="••••••••" className={inputCls} />
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
              <p className="mt-1.5 text-xs text-[var(--muted)]">Мин. 8 символов, одна заглавная, одна цифра</p>
            </div>

            <div className="reveal-up delay-300 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-semibold text-sm hover:opacity-85 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-[var(--background)]/30 border-t-[var(--background)] animate-spin" />
                    Создаём аккаунт...
                  </span>
                ) : (
                  <>
                    Зарегистрироваться
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-xs text-center text-[var(--muted)] reveal-up delay-400">
            Регистрируясь, вы соглашаетесь с нашей политикой конфиденциальности
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Default export wrapped in Suspense (required for useSearchParams) ─────────
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
