"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import AuthProvider from "../components/AuthProvider";
import AIConsultantWidget from "../components/AIConsultantWidget";
import Lenis from "lenis";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <ThemeProvider attribute="class" disableTransitionOnChange enableSystem={false}>
      <AuthProvider>
        {children}
        <AIConsultantWidget />
      </AuthProvider>
    </ThemeProvider>
  );
}
