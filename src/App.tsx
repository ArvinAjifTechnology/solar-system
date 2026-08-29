import { useCallback, useEffect, useState } from "react";
import SolarCanvas from "./components/SolarCanvas";
import InfoPanel from "./components/InfoPanel";
import ControlBar, { SPEEDS } from "./components/ControlBar";
import { bodyById, PLANETS } from "./data/bodies";

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>("earth");
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [simDays, setSimDays] = useState(0);
  const [resetToken, setResetToken] = useState(0);

  const selected = bodyById(selectedId);

  const stepSpeed = useCallback((dir: number) => {
    setSpeed((s) => {
      const i = Math.max(0, SPEEDS.indexOf(s));
      return SPEEDS[Math.min(SPEEDS.length - 1, Math.max(0, i + dir))];
    });
  }, []);

  const resetView = useCallback(() => {
    setSelectedId(null);
    setResetToken((t) => t + 1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
        return;
      }
      if (e.key === "Escape") {
        setSelectedId(null);
        return;
      }
      if (e.key === "r" || e.key === "R") {
        resetView();
        return;
      }
      if (e.key === "l" || e.key === "L") {
        setShowLabels((v) => !v);
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        stepSpeed(1);
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        stepSpeed(-1);
        return;
      }
      if (e.key === "0") {
        setSelectedId("sun");
        return;
      }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 8) setSelectedId(PLANETS[n - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepSpeed, resetView]);

  return (
    <div className="cosmos-bg relative h-dvh w-full overflow-hidden">
      <div className="nebula-drift pointer-events-none absolute inset-0" aria-hidden />

      <SolarCanvas
        selectedId={selectedId}
        playing={playing}
        speed={speed}
        showLabels={showLabels}
        onSelect={setSelectedId}
        onTick={setSimDays}
        resetToken={resetToken}
      />

      {/* header HUD */}
      <header className="rise-in pointer-events-none absolute left-5 top-5 z-20 max-w-[270px] select-none md:left-7 md:top-7">
        <div className="flex items-center gap-2">
          <span className="pulse-dot h-2 w-2 rounded-full bg-solar" />
          <span className="font-mono text-[10px] font-bold tracking-[0.28em] text-solar">
            LIVE ORRERY
          </span>
        </div>
        <h1 className="mt-2.5 font-display text-[24px] font-black leading-[1.02] tracking-tight md:text-[32px]">
          <span className="text-ink">THE SOLAR</span>
          <br />
          <span className="title-outline">SYSTEM</span>
        </h1>
        <p className="mt-2.5 text-[13px] leading-relaxed text-dim">
          Eight worlds circling a star in real orbital rhythm.{" "}
          <span className="text-ink/85">Click any world</span> — or the Sun — to read its
          vitals, then bend time below.
        </p>
      </header>

      {/* nav hint */}
      <div className="rise-in pointer-events-none absolute right-6 top-6 z-10 hidden text-right font-mono text-[10px] leading-relaxed tracking-[0.2em] text-faint lg:block" style={{ animationDelay: "0.25s" }}>
        DRAG · PAN
        <br />
        SCROLL · ZOOM
        <br />
        DBL-CLICK · RESET
      </div>

      {selected && <InfoPanel body={selected} onClose={() => setSelectedId(null)} />}

      <ControlBar
        playing={playing}
        onTogglePlay={() => setPlaying((p) => !p)}
        speed={speed}
        onSpeed={setSpeed}
        simDays={simDays}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((v) => !v)}
        onResetView={resetView}
        selectedId={selectedId}
        onSelectBody={setSelectedId}
      />
    </div>
  );
}
