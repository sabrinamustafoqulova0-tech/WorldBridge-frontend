import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Globe, Menu, X, Compass, Map, BookOpen, Calculator } from "lucide-react";
import { LogoMark } from "./LogoMark";

export default function NavbarRouterDom() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/home", label: "Главная", icon: Compass },
    { to: "/programs", label: "Программы", icon: Map },
    { to: "/countries", label: "Страны", icon: Globe },
    { to: "/articles", label: "Статьи", icon: BookOpen },
    { to: "/calculator", label: "Калькулятор", icon: Calculator },
  ];

  // Active link helper function (applies custom classes based on NavLink's isActive state)
  const getLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
      isActive
        ? "bg-[var(--accent)] text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] scale-[1.02]"
        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/10"
    }`;

  const getMobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${
      isActive
        ? "bg-[var(--accent)] text-white"
        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/10"
    }`;

  return (
    <>
      {/* ─── Premium Glassmorphic Navbar ─── */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-5 md:px-8 bg-[var(--card)]/80 backdrop-blur-xl border-b border-[var(--border)] transition-colors duration-300">
        
        {/* Logo */}
        <NavLink to="/home" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center transition-transform group-hover:scale-110">
            <LogoMark size={14} className="text-white" />
          </div>
          <span className="font-extrabold text-[14px] tracking-tight text-[var(--foreground)]">
            WorldBridge
          </span>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink key={link.to} to={link.to} className={getLinkClass}>
                <Icon size={13} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Action Menu (Mobile Toggle & Settings) */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--border)]/10 transition-colors"
          >
            {isOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>

      </header>

      {/* ─── Mobile Slide-out Menu Overlay ─── */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fade-in">
          {/* Backdrop */}
          <div 
            onClick={() => setIsOpen(false)} 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer menu */}
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-[var(--background)] border-l border-[var(--border)] shadow-2xl flex flex-col p-6 space-y-6 pt-20">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={getMobileLinkClass}
                  >
                    <Icon size={16} />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
