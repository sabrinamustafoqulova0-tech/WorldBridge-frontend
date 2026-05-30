"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../../lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "../../store/authStore";
import PublicIcon from '@mui/icons-material/Public';

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  country: z.string().min(1, "Please select a country"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError("");
    try {
      await api.post("/auth/register", {
        email: data.email,
        password: data.password,
        full_name: data.fullName,
      });
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      <header className="w-full p-4 flex justify-between items-center shadow-sm bg-white dark:bg-[#0F172A] border-b-[4px] border-b-gray-200 dark:border-b-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <PublicIcon fontSize="large" className="text-blue-500" />
          <span className="font-bold text-xl text-[#0F172A] dark:text-white">WorldBridge</span>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Or{" "}
              <Link href="/login" className="font-medium text-[#3B82F6] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                sign in to your existing account
              </Link>
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm text-center border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input
                  {...register("fullName")}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 shadow-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm transition-colors"
                  placeholder="John Doe"
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                <input
                  {...register("email")}
                  type="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 shadow-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm transition-colors"
                  placeholder="john@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country of Residence</label>
                <select
                  {...register("country")}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 shadow-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm transition-colors"
                >
                  <option value="">Select a country</option>
                  <option value="TJ">Tajikistan</option>
                  <option value="UZ">Uzbekistan</option>
                  <option value="KZ">Kazakhstan</option>
                  <option value="RU">Russia</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.country && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.country.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input
                  {...register("password")}
                  type="password"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 shadow-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm transition-colors"
                />
                {errors.password && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>}
              </div>


            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 disabled:bg-gray-400 transition-colors shadow-md"
              >
                {isSubmitting ? "Creating account..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
