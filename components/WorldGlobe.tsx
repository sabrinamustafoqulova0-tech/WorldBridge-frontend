"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";

interface GlobeCountry {
  id: string;
  name: string;
  programs: number;
  lat: number;
  lng: number;
}

interface GlobeProject {
  id: string;
  slug: string;
  name: string;
  description: string;
  city: string;
  lat: number;
  lng: number;
}

interface WorldGlobeProps {
  countries: GlobeCountry[];
  projects: Record<string, GlobeProject[]>;
  countryTranslations: Record<string, Record<string, string>>;
  lang: string;
  theme: string | undefined;
  onCountryClick: (id: string) => void;
  onProjectClick: (slug: string) => void;
  focusCountryId: string | null;
  programsLabel: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  name: string;
  type: "country" | "project";
  programs?: number;
  projectCount?: number;
  description?: string;
}

type CountryPoint = GlobeCountry & { _type: "country" };
type ProjectPoint = GlobeProject & { _type: "project"; _countryId: string };
type PointData = CountryPoint | ProjectPoint;

const INITIAL_POV = { lat: 48.0, lng: 32.0, altitude: 2.0 };
const ZOOM_IN_THRESHOLD = 1.0;

export default function WorldGlobe({
  countries,
  projects,
  countryTranslations,
  lang,
  theme,
  onCountryClick,
  onProjectClick,
  focusCountryId,
  programsLabel,
}: WorldGlobeProps) {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const rotationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cameraAlt, setCameraAlt] = useState(INITIAL_POV.altitude);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoveredIdRef = useRef<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, name: "", type: "country",
  });
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });

  const isDark = theme === "dark";

  // Responsive sizing via ResizeObserver
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        setDimensions({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    obs.observe(el);
    setDimensions({ w: el.clientWidth, h: el.clientHeight });
    return () => obs.disconnect();
  }, []);

  // Initial camera + OrbitControls setup
  useEffect(() => {
    const globe = globeEl.current;
    if (!globe) return;
    const id = requestAnimationFrame(() => {
      globe.pointOfView(INITIAL_POV, 0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const controls = (globe as any).controls() as any;
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.35;
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.minDistance = 101;
        controls.maxDistance = 700;
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Pause/resume auto-rotation on interaction
  useEffect(() => {
    const globe = globeEl.current;
    if (!globe) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = (globe as any).controls() as any;
    if (controls) controls.autoRotate = !isInteracting;
  }, [isInteracting]);

  // Keep ref in sync with state (avoids stale closure in onGlobeClick)
  useEffect(() => { hoveredIdRef.current = hoveredId; }, [hoveredId]);

  // Fly-to on focusCountryId change (driven by search)
  useEffect(() => {
    if (!focusCountryId || !globeEl.current) return;
    const target = countries.find((c) => c.id === focusCountryId);
    if (!target) return;
    globeEl.current.pointOfView(
      { lat: target.lat, lng: target.lng, altitude: 0.8 },
      1200
    );
    setHoveredId(focusCountryId);
  }, [focusCountryId, countries]);

  const triggerInteraction = useCallback(() => {
    setIsInteracting(true);
    if (rotationTimer.current) clearTimeout(rotationTimer.current);
    rotationTimer.current = setTimeout(() => setIsInteracting(false), 4000);
  }, []);

  // Track mouse coordinates relative to the wrapper
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    mousePos.current = {
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }));
    setHoveredId(null);
  }, []);

  // Point datasets
  const countryPoints: PointData[] = countries.map((c) => ({
    ...c,
    _type: "country" as const,
  }));

  const projectPoints: PointData[] = Object.entries(projects).flatMap(([cId, projs]) =>
    projs.map((p) => ({ ...p, _type: "project" as const, _countryId: cId }))
  );

  const allPoints: PointData[] =
    cameraAlt < ZOOM_IN_THRESHOLD
      ? [...countryPoints, ...projectPoints]
      : countryPoints;

  const getPointColor = useCallback(
    (p: object) => {
      const point = p as PointData;
      if (point._type === "project") return "#10b981";
      return hoveredId === (point as CountryPoint).id
        ? "#10b981"
        : isDark
        ? "rgba(249,249,249,0.65)"
        : "rgba(28,28,30,0.55)";
    },
    [hoveredId, isDark]
  );

  const getPointAltitude = useCallback(
    (p: object) => ((p as PointData)._type === "project" ? 0.015 : 0.025),
    []
  );

  const getPointRadius = useCallback(
    (p: object) => {
      const point = p as PointData;
      if (point._type === "project") return 0.4;
      return hoveredId === (point as CountryPoint).id ? 1.1 : 0.75;
    },
    [hoveredId]
  );

  // onPointHover — mouse coords come from the tracked mousePos ref
  const handlePointHover = useCallback(
    (point: object | null, _prev: object | null) => {
      triggerInteraction();
      const { x, y } = mousePos.current;

      if (!point) {
        setHoveredId(null);
        setTooltip((t) => ({ ...t, visible: false }));
        return;
      }

      const p = point as PointData;

      if (p._type === "country") {
        const country = p as CountryPoint;
        setHoveredId(country.id);
        const displayName =
          lang === "ru"
            ? countryTranslations[country.id]?.ru || country.name
            : countryTranslations[country.id]?.en || country.name;
        setTooltip({
          visible: true,
          x,
          y,
          name: displayName,
          type: "country",
          programs: country.programs,
          projectCount: projects[country.id]?.length ?? 0,
        });
      } else {
        const proj = p as ProjectPoint;
        setHoveredId(null);
        setTooltip({
          visible: true,
          x,
          y,
          name: proj.name,
          type: "project",
          description: proj.description,
        });
      }
    },
    [triggerInteraction, lang, countryTranslations, projects]
  );

  const handlePointClick = useCallback(
    (point: object) => {
      const p = point as PointData;
      if (p._type === "country") {
        onCountryClick((p as CountryPoint).id);
      } else {
        onProjectClick((p as ProjectPoint).slug);
      }
    },
    [onCountryClick, onProjectClick]
  );

  // Fallback: clicking anywhere on the globe while a country is hovered navigates to it.
  // This makes navigation reliable even when OrbitControls absorbs the point-level click.
  const handleGlobeClick = useCallback(() => {
    const id = hoveredIdRef.current;
    if (id) onCountryClick(id);
  }, [onCountryClick]);

  // Clamp tooltip so it never clips off-screen
  const clampedX = Math.min(tooltip.x + 14, dimensions.w - 215);
  const clampedY = Math.max(tooltip.y - 8, 60);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full"
      style={{ background: "var(--card)", cursor: hoveredId ? "pointer" : "grab" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Globe
        ref={globeEl}
        width={dimensions.w}
        height={dimensions.h}
        globeImageUrl={
          isDark
            ? "//unpkg.com/three-globe/example/img/earth-night.jpg"
            : "//unpkg.com/three-globe/example/img/earth-day.jpg"
        }
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="#10b981"
        atmosphereAltitude={isDark ? 0.18 : 0.12}
        pointsData={allPoints}
        pointLat="lat"
        pointLng="lng"
        pointColor={getPointColor}
        pointAltitude={getPointAltitude}
        pointRadius={getPointRadius}
        pointsMerge={false}
        onPointHover={handlePointHover}
        onPointClick={handlePointClick as (point: object, event: MouseEvent) => void}
        onGlobeClick={handleGlobeClick as any}
        onZoom={({ altitude }: { altitude: number }) => {
          setCameraAlt(altitude);
          triggerInteraction();
        }}
      />

      {/* Depth indicator badge */}
      <div className="absolute bottom-4 left-4 z-30 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[var(--border)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse-dot" />
          <span className="text-[11px] font-medium text-[var(--muted)]">
            {cameraAlt < ZOOM_IN_THRESHOLD
              ? "Видны проекты"
              : "Приблизьтесь для деталей"}
          </span>
        </div>
      </div>

      {/* Floating tooltip overlay */}
      {tooltip.visible && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{ left: clampedX, top: clampedY, transform: "translateY(-50%)" }}
        >
          <div className="glass border border-[var(--border)] rounded-2xl px-3.5 py-2.5 flex flex-col gap-0.5 shadow-xl min-w-[150px] max-w-[210px]">
            <span className="text-[12px] font-bold text-[var(--foreground)]">
              {tooltip.name}
            </span>
            {tooltip.type === "country" && (
              <>
                <span className="text-[10px] text-[var(--muted)]">
                  <strong className="text-[var(--foreground)]">{tooltip.programs}</strong>{" "}
                  {programsLabel}
                </span>
                {(tooltip.projectCount ?? 0) > 0 && (
                  <span className="text-[10px] text-[var(--accent)]">
                    {tooltip.projectCount} проект{tooltip.projectCount === 1 ? "" : "а"} →
                  </span>
                )}
              </>
            )}
            {tooltip.type === "project" && tooltip.description && (
              <span className="text-[10px] text-[var(--muted)] leading-relaxed">
                {tooltip.description}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
