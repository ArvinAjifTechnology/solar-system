import type { CSSProperties } from "react";
import type { BodyData } from "../data/bodies";
import { fmtInt } from "../data/bodies";

interface InfoPanelProps {
  body: BodyData;
  onClose: () => void;
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-l-2 border-line pl-3">
      <div className="stat-label">{label}</div>
      <div className="mt-1 font-body text-[15px] font-semibold leading-tight text-ink">
        {value}
      </div>
      {sub && <div className="font-mono text-[10.5px] text-dim">{sub}</div>}
    </div>
  );
}

export default function InfoPanel({ body, onClose }: InfoPanelProps) {
  const isStar = body.kind === "star";
  const sphereBg = `radial-gradient(circle at 32% 30%, ${body.color} 0%, ${body.color} 42%, ${body.colorDeep} 92%)`;

  return (
    <aside
      key={body.id}
      className="panel-reveal hud pointer-events-auto absolute bottom-[188px] left-3 right-3 z-30 max-h-[34vh] overflow-y-auto rounded-xl p-5 md:bottom-auto md:left-auto md:right-5 md:top-1/2 md:max-h-[calc(100vh-140px)] md:w-[350px] md:-translate-y-1/2 md:rounded-2xl"
      style={{ borderColor: `color-mix(in srgb, ${body.color} 34%, #232c4d)` }}
      aria-label={`${body.name} facts`}
    >
      {/* accent spine */}
      <div
        className="absolute inset-x-5 top-0 h-[2.5px] rounded-b-full"
        style={{ background: `linear-gradient(90deg, transparent, ${body.color}, transparent)` }}
      />

      <button
        onClick={onClose}
        aria-label="Close panel"
        className="btn-press absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg border border-line text-dim hover:border-solar/60 hover:text-solar"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <div className="flex items-center gap-4">
        {/* sphere preview */}
        <div className="relative h-20 w-20 shrink-0 md:h-24 md:w-24">
          <div
            className="sphere absolute inset-0"
            style={{ background: sphereBg, "--glow": body.glow } as CSSProperties}
          />
          {body.ring && (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2"
              style={{
                width: "132%",
                height: "132%",
                transform: `translate(-50%,-50%) rotate(${body.id === "uranus" ? 78 : -16}deg)`,
                borderColor: `color-mix(in srgb, ${body.color} 55%, transparent)`,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                boxShadow: `0 0 12px -4px ${body.glow}`,
              }}
            />
          )}
        </div>
        <div className="min-w-0 pr-8">
          <div className="stat-label" style={{ color: body.color }}>
            {body.typeLabel}
          </div>
          <h2 className="mt-1 font-display text-[26px] font-bold leading-none tracking-tight text-ink md:text-3xl">
            {body.name}
          </h2>
          <p className="mt-1.5 font-mono text-[11px] text-dim">
            {isStar ? "SYSTEM PRIMARY" : `PLANET ${["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"].indexOf(body.id) + 1} OF 8`}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
        <Stat
          label="Size · diameter"
          value={`${fmtInt(body.diameterKm)} km`}
          sub={body.earthRatio}
        />
        <Stat
          label="Distance from Sun"
          value={body.distanceMkm ? `${fmtInt(Math.round(body.distanceMkm * 10) / 10)} million km` : "—"}
          sub={body.distanceAU ? `${body.distanceAU} AU from the Sun` : "anchor of the system"}
        />
        <Stat
          label="Orbital period"
          value={isStar ? "—" : body.periodLabel}
          sub={isStar ? "orbits galactic core in 230m yrs" : `≈ ${fmtInt(Math.round(body.periodDays))} Earth days`}
        />
        <Stat label="Day length" value={body.dayLength} />
        <Stat
          label={isStar ? "Spectral class" : "Moons"}
          value={isStar ? "G2V" : body.moons === 0 ? "None" : fmtInt(body.moons)}
        />
        <Stat label="Temperature" value={body.tempC} />
      </div>

      <div className="mt-5 rounded-lg border border-line/70 bg-void/40 p-3.5">
        <div className="stat-label mb-1.5 flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 1v6.2M6 10.4v.2" stroke={body.color} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="6" cy="6" r="5.1" stroke={body.color} strokeWidth="1.2" opacity="0.5" />
          </svg>
          Field note
        </div>
        <p className="text-[13.5px] leading-relaxed text-ink/90">{body.fact}</p>
      </div>
    </aside>
  );
}
