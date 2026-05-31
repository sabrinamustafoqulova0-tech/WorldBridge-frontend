"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../../lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useAuthStore } from "../../store/authStore";
import { Globe, ArrowRight, MapPin, Users, TrendingUp } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const BRAND_STATS = [
  { icon: MapPin, value: "47", label: "стран" },
  { icon: Users, value: "18.4K", label: "участников" },
  { icon: TrendingUp, value: "91.3%", label: "успешных кейсов" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/home";
  const [error, setError] = useState("");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) router.push(nextUrl);
  }, [isAuthenticated, router, nextUrl]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    try {
      const formData = new FormData();
      formData.append("username", data.email);
      formData.append("password", data.password);
      const response = await api.post("/auth/login", formData);
      const { access_token, refresh_token } = response.data;
      useAuthStore.getState().login(access_token, refresh_token, {
        id: 0, email: data.email, full_name: "", country: "", is_admin: false,
      });
      router.push(nextUrl);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка входа. Попробуйте снова.");
    }
  };

  const registerHref = nextUrl !== "/home"
    ? `/register?next=${encodeURIComponent(nextUrl)}`
    : "/register";

  return (
    <div className="min-h-[100dvh] grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] bg-[var(--background)]">

      {/* ─── Left brand panel ──────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[var(--foreground)] text-[var(--background)] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--accent)] rounded-full blur-[120px] opacity-15 translate-y-1/2 -translate-x-1/2" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Globe size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight">WorldBridge</span>
        </div>

        {/* Statement */}
        <div className="relative space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--background)]/40">Ваш маршрут начинается здесь</p>
          <h2 className="text-4xl font-bold tracking-tighter leading-tight text-balance">
            Тысячи людей уже нашли{" "}
            <span className="text-[var(--accent)]">свой путь</span>{" "}
            за рубеж.
          </h2>
          <div className="grid grid-cols-3 gap-6 pt-4">
            {BRAND_STATS.map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <Icon size={16} className="text-[var(--accent)] mb-2" />
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-[var(--background)]/50 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative border-l-2 border-[var(--accent)] pl-4">
          <p className="text-sm text-[var(--background)]/60 leading-relaxed">
            "Через WorldBridge я нашёл стажировку в Берлине за 3 недели. Процесс был прозрачным и понятным."
          </p>
          <p className="mt-2 text-xs font-semibold text-[var(--background)]/40">— Амирджон К., Душанбе</p>
        </div>
      </div>

      {/* ─── Right form panel ──────────────────────────────── */}
      <div className="flex flex-col justify-center px-6 md:px-16 xl:px-24 py-16">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-12">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Globe size={13} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold tracking-tight">WorldBridge</span>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8 reveal-up">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Войти в аккаунт</h1>
            {nextUrl !== "/home" && (
              <p className="text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-dim)] border border-[var(--accent)]/20 px-3 py-1.5 rounded-lg mb-2 flex items-center gap-1.5">
                🔒 Войдите, чтобы продолжить просмотр программы
              </p>
            )}
            <p className="text-sm text-[var(--muted)]">
              Нет аккаунта?{" "}
              <Link href={registerHref} className="text-[var(--accent)] font-semibold hover:underline">
                Зарегистрироваться
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/8 text-red-500 text-sm reveal-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="reveal-up delay-100">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all"
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="reveal-up delay-200">
              <label className="block text-sm font-medium mb-2">Пароль</label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all"
              />
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
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
                    Входим...
                  </span>
                ) : (
                  <>
                    Войти
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
