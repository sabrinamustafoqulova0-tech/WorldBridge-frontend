"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import AuthProvider from "../components/AuthProvider";
import AIConsultantWidget from "../components/AIConsultantWidget";
import Lenis from "lenis";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Clear any inline styles that may have been stuck by previous code versions
    document.body.style.cssText = "";

    const lenis = new Lenis();
    (window as any).__lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      delete (window as any).__lenis;
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
