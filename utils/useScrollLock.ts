"use client";

import { useEffect } from "react";

// Module-level state shared by all hook instances in the client runtime
let activeLocksCount = 0;
let savedScrollY = 0;
let originalBodyStyles = {
  overflow: "",
  position: "",
  top: "",
  width: "",
  paddingRight: "",
};
let originalHtmlStyles = {
  overflow: "",
  height: "",
};

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    // Track that this instance locked the scroll
    activeLocksCount++;

    if (activeLocksCount === 1) {
      // First lock: capture scroll and apply lock styles
      savedScrollY = window.scrollY;
      const sbWidth = window.innerWidth - document.documentElement.clientWidth;

      // Save original styles
      originalBodyStyles = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
        paddingRight: document.body.style.paddingRight,
      };
      originalHtmlStyles = {
        overflow: document.documentElement.style.overflow,
        height: document.documentElement.style.height,
      };

      // Stop Lenis if active
      const lenis = (window as any).__lenis;
      lenis?.stop();

      // Differentiate mobile vs desktop viewport behavior
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // On mobile, position:fixed body breaks soft keyboards and layout offsets.
        // We set overflow:hidden on both html & body + height:100% to lock scrolling robustly.
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.height = "100%";
      } else {
        // On desktop, use position: fixed to guarantee background scroll locking
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${savedScrollY}px`;
        document.body.style.width = "100%";

        if (sbWidth > 0) {
          document.body.style.paddingRight = `${sbWidth}px`;
          
          // Prevent fixed navigation bar shift
          const navbar = document.querySelector("nav") as HTMLElement | null;
          if (navbar) {
            navbar.style.paddingRight = `${sbWidth}px`;
          }
        }
      }

      const container = document.querySelector("[data-scroll-container]") as HTMLElement | null;
      if (container) {
        container.setAttribute("data-original-overflow", container.style.overflow || "");
        container.style.overflow = "hidden";
      }
    }

    return () => {
      activeLocksCount = Math.max(0, activeLocksCount - 1);

      if (activeLocksCount === 0) {
        // Last unlock: restore original styles and scroll position
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
          document.documentElement.style.overflow = originalHtmlStyles.overflow;
          document.documentElement.style.height = originalHtmlStyles.height;
          document.body.style.overflow = originalBodyStyles.overflow;
          document.body.style.height = "";
        } else {
          document.body.style.overflow = originalBodyStyles.overflow;
          document.body.style.position = originalBodyStyles.position;
          document.body.style.top = originalBodyStyles.top;
          document.body.style.width = originalBodyStyles.width;
          document.body.style.paddingRight = originalBodyStyles.paddingRight;

          const navbar = document.querySelector("nav") as HTMLElement | null;
          if (navbar) {
            navbar.style.paddingRight = "";
          }
        }

        const container = document.querySelector("[data-scroll-container]") as HTMLElement | null;
        if (container) {
          const orig = container.getAttribute("data-original-overflow") || "";
          container.style.overflow = orig;
          container.removeAttribute("data-original-overflow");
        }

        // Restore scroll position
        if (!isMobile) {
          window.scrollTo({ top: savedScrollY, behavior: "instant" as ScrollBehavior });
        }

        // Restart Lenis if active
        const lenis = (window as any).__lenis;
        lenis?.start();
      }
    };
  }, [locked]);
}
