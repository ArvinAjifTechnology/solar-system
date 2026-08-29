import { PLANETS, SUN } from "../data/bodies";

export const SPEEDS = [0.5, 1, 2, 5, 10, 20];

interface ControlBarProps {
  playing: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeed: (s: number) => void;
  simDays: number;
  showLabels: boolean;
  onToggleLabels: () => void;
  onResetView: () => void;
  selectedId: string | null;
  onSelectBody: (id: string) => void;
}

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M4.5 2.7c0-.8.9-1.3 1.6-.9l7 4.3c.7.4.7 1.4 0 1.8l-7 4.3c-.7.4-1.6-.1-1.6-.9V2.7z" />
  </svg>
);
const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <rect x="3.4" y="2.5" width="3.4" height="11" rx="1" />
    <rect x="9.2" y="2.5" width="3.4" height="11" rx="1" />
  </svg>
);
const TagIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path
      d="M1.8 5.2V2.6c0-.4.4-.8.8-.8h2.6c.5 0 .9.2 1.3.5l5.2 5.2c.7.7.7 1.8 0 2.5l-3 3c-.7.7-1.8.7-2.5 0L2.3 6.5c-.3-.4-.5-.8-.5-1.3z"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <circle cx="4.6" cy="4.6" r="1" fill="currentColor" />
  </svg>
);
const ResetIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
    <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.3" />
    <path d="M7 .6v2.2M7 11.2v2.2M.6 7h2.2M11.2 7h2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="7" cy="7" r="1.1" fill="currentColor" />
  </svg>
);

export default function ControlBar({
  playing,
  onTogglePlay,
  speed,
  onSpeed,
  simDays,
  showLabels,
  onToggleLabels,
  onResetView,
  selectedId,
  onSelectBody,
}: ControlBarProps) {
  const years = Math.floor(simDays / 365.25);
  const days = Math.floor(simDays % 365.25);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 p-3 pb-4">
      {/* jump rail */}
      <div className="hud rise-in pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full px-2.5 py-1.5 no-scrollbar" style={{ animationDelay: "0.15s" }}>
        <span className="stat-label hidden shrink-0 pl-1 pr-2 sm:block">Jump&nbsp;to</span>
        {[SUN, ...PLANETS].map((b) => {
          const active = selectedId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onSelectBody(b.id)}
              className={`chip flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] ${
                active
                  ? "border-transparent text-void"
                  : "border-transparent text-dim hover:text-ink"
              }`}
              style={active ? { background: b.color, color: "#0a0e1f" } : undefined}
              aria-pressed={active}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: active ? "#0a0e1f" : b.color,
                  boxShadow: active ? "none" : `0 0 6px ${b.glow}`,
                }}
              />
              {b.name}
            </button>
          );
        })}
      </div>

      {/* main deck */}
      <div className="hud rise-in pointer-events-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl px-4 py-2.5">
        {/* play / pause */}
        <button
          onClick={onTogglePlay}
          aria-label={playing ? "Pause simulation" : "Play simulation"}
          className="btn-press grid h-11 w-11 shrink-0 place-items-center rounded-full bg-solar text-[#1a1206] shadow-[0_0_22px_-4px_rgba(242,178,76,0.7)] hover:bg-[#ffc46a]"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* speed */}
        <div className="flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => onSpeed(s)}
                aria-pressed={speed === s}
                className={`chip rounded-md border px-2 py-1 font-mono text-[11px] leading-none ${
                  speed === s
                    ? "border-solar/70 bg-solar/15 text-solar"
                    : "border-line text-dim hover:border-faint hover:text-ink"
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
          <span className="pl-0.5 font-mono text-[9.5px] tracking-wider text-faint">
            1s ≈ {Math.round(10 * speed * 10) / 10} DAYS
          </span>
        </div>

        <div className="hidden h-8 w-px bg-line sm:block" />

        {/* mission clock */}
        <div className="text-center leading-tight">
          <div className="stat-label">Mission clock</div>
          <div className="font-mono text-[15px] font-bold text-cryo">
            T+{years}y {String(days).padStart(3, "0")}d
          </div>
        </div>

        <div className="hidden h-8 w-px bg-line sm:block" />

        {/* toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleLabels}
            aria-pressed={showLabels}
            className={`chip flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] ${
              showLabels
                ? "border-cryo/60 bg-cryo/10 text-cryo"
                : "border-line text-dim hover:text-ink"
            }`}
          >
            <TagIcon />
            Labels
          </button>
          <button
            onClick={onResetView}
            className="chip flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 font-mono text-[11px] text-dim hover:border-solar/60 hover:text-solar"
          >
            <ResetIcon />
            Whole system
          </button>
        </div>
      </div>

      <p className="hidden font-mono text-[10px] tracking-widest text-faint md:block">
        SPACE PLAY/PAUSE · 1–8 PLANETS · SCROLL ZOOM · DRAG PAN · DBL-CLICK RESET
      </p>
    </div>
  );
}
