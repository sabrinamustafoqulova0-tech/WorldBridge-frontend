"use client";

import { ThemeProvider } from "next-themes";
import AuthProvider from "../components/AuthProvider";
import AIConsultantWidget from "../components/AIConsultantWidget";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange enableSystem={false}>
      <AuthProvider>
        {children}
        <AIConsultantWidget />
      </AuthProvider>
    </ThemeProvider>
  );
}
