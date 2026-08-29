import { useEffect, useRef } from "react";
import { PLANETS, SUN } from "../data/bodies";
import type { BodyData } from "../data/bodies";

const TAU = Math.PI * 2;
const BASE_DAYS_PER_SEC = 10; // at 1× speed

interface Star {
  x: number;
  y: number;
  r: number;
  tw: number;
  ph: number;
  layer: number;
  warm: boolean;
}
interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}
interface HitZone {
  id: string;
  x: number;
  y: number;
  r: number;
}

interface SolarCanvasProps {
  selectedId: string | null;
  playing: boolean;
  speed: number;
  showLabels: boolean;
  onSelect: (id: string | null) => void;
  onTick: (days: number) => void;
  resetToken: number;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const mod = (v: number, m: number) => ((v % m) + m) % m;

export default function SolarCanvas({
  selectedId,
  playing,
  speed,
  showLabels,
  onSelect,
  onTick,
  resetToken,
}: SolarCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const live = useRef({ selectedId, playing, speed, showLabels, onSelect, onTick });
  live.current = { selectedId, playing, speed, showLabels, onSelect, onTick };

  const frameApi = useRef<((target: string | null) => void) | null>(null);

  /* ---------------- engine (mount once) ---------------- */
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: Star[] = [];

    const cam = { x: 0, y: 0, zoom: 0.5 };
    const camTarget = { x: 0, y: 0, zoom: 0.6, active: true };
    let manual = false;

    let simDays = 0;
    let hoverId: string | null = null;
    const hitZones: HitZone[] = [];
    const meteors: Meteor[] = [];
    let meteorTimer = 4;

    const fit = (r: number) => {
      const avail = Math.min(w, h) / 2 - Math.min(w, h) * 0.07 - 30;
      return clamp(avail / r, 0.18, 16);
    };
    const OVERVIEW_R = 578;

    const frameFor = (id: string | null) => {
      let r = OVERVIEW_R;
      if (id === "sun") r = 265;
      else {
        const b = PLANETS.find((p) => p.id === id);
        if (b) r = b.orbitWorld * 1.42 + b.radius * 2 + 26;
      }
      camTarget.x = 0;
      camTarget.y = 0;
      camTarget.zoom = fit(r);
      camTarget.active = true;
      manual = false;
    };
    frameApi.current = frameFor;

    const makeStars = () => {
      const count = clamp(Math.round((w * h) / 4200), 180, 560);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.3,
        tw: 0.5 + Math.random() * 2.2,
        ph: Math.random() * TAU,
        layer: Math.random() < 0.55 ? 0 : Math.random() < 0.75 ? 1 : 2,
        warm: Math.random() < 0.18,
      }));
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeStars();
      if (!manual && camTarget.active) camTarget.zoom = fit(OVERVIEW_R);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // arrival: start pulled back, glide to the framed target
    cam.zoom = clamp(fit(OVERVIEW_R) * 0.55, 0.12, 16);
    frameFor(live.current.selectedId);

    /* ---------- pointer interaction ---------- */
    let down: { x: number; y: number; camX: number; camY: number; moved: boolean } | null = null;

    const toLocal = (e: PointerEvent | WheelEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const hitTest = (x: number, y: number): string | null => {
      let best: HitZone | null = null;
      let bestScore = Infinity;
      for (const z of hitZones) {
        const d = Math.hypot(x - z.x, y - z.y);
        if (d < z.r + 11) {
          const score = d - z.r * 0.4;
          if (score < bestScore) {
            bestScore = score;
            best = z;
          }
        }
      }
      return best ? best.id : null;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      canvas.setPointerCapture(e.pointerId);
      const p = toLocal(e);
      down = { x: p.x, y: p.y, camX: cam.x, camY: cam.y, moved: false };
    };
    const onPointerMove = (e: PointerEvent) => {
      const p = toLocal(e);
      if (down) {
        const dx = p.x - down.x;
        const dy = p.y - down.y;
        if (!down.moved && Math.hypot(dx, dy) > 5) down.moved = true;
        if (down.moved) {
          manual = true;
          camTarget.active = false;
          cam.x = down.camX - dx / cam.zoom;
          cam.y = down.camY - dy / cam.zoom;
        }
      }
      hoverId = hitTest(p.x, p.y);
      canvas.style.cursor = down?.moved ? "grabbing" : hoverId ? "pointer" : "grab";
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!down) return;
      const p = toLocal(e);
      const wasDrag = down.moved;
      down = null;
      canvas.style.cursor = "grab";
      if (!wasDrag) live.current.onSelect(hitTest(p.x, p.y));
    };
    const onPointerLeave = () => {
      hoverId = null;
      down = null;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = toLocal(e);
      const factor = Math.exp(-e.deltaY * 0.00125);
      const nz = clamp(cam.zoom * factor, clamp(fit(OVERVIEW_R) * 0.35, 0.1, 0.5), 18);
      const wx = cam.x + (p.x - w / 2) / cam.zoom;
      const wy = cam.y + (p.y - h / 2) / cam.zoom;
      cam.x = wx - (p.x - w / 2) / nz;
      cam.y = wy - (p.y - h / 2) / nz;
      cam.zoom = nz;
      manual = true;
      camTarget.active = false;
    };
    const onDblClick = () => frameFor(null);

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("dblclick", onDblClick);
    canvas.style.cursor = "grab";
    canvas.style.touchAction = "none";

    /* ---------- draw helpers ---------- */
    const shade = (b: BodyData, x: number, y: number, r: number) => {
      const d = Math.hypot(x, y) || 1;
      const lx = -x / d;
      const ly = -y / d;
      const g = ctx.createRadialGradient(x + lx * r * 0.55, y + ly * r * 0.55, r * 0.12, x, y, r);
      g.addColorStop(0, b.color);
      g.addColorStop(0.55, b.color);
      g.addColorStop(1, b.colorDeep);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    };

    const label = (text: string, x: number, y: number, sub?: string) => {
      const fs = 11 / cam.zoom;
      ctx.font = `700 ${fs}px "Space Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "rgba(233,237,250,0.92)";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 6 / cam.zoom;
      ctx.fillText(text.toUpperCase(), x, y);
      ctx.shadowBlur = 0;
      if (sub) {
        ctx.font = `400 ${8.5 / cam.zoom}px "Space Mono", monospace`;
        ctx.fillStyle = "rgba(242,178,76,0.85)";
        ctx.fillText(sub, x, y + fs * 1.05);
      }
    };

    const pill = (text: string, x: number, y: number, color: string) => {
      const fs = 10.5 / cam.zoom;
      ctx.font = `700 ${fs}px "Space Mono", monospace`;
      const tw = ctx.measureText(text.toUpperCase()).width;
      const padX = fs * 0.7;
      const padY = fs * 0.5;
      const bx = x - tw / 2 - padX;
      const by = y - fs - padY * 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, tw + padX * 2, fs + padY * 2, fs * 0.4);
      ctx.fillStyle = "rgba(10,14,31,0.85)";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1 / cam.zoom;
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(233,237,250,0.95)";
      ctx.fillText(text.toUpperCase(), x, by + (fs + padY * 2) / 2);
    };

    /* ---------- main loop ---------- */
    let raf = 0;
    let last = performance.now();
    let t = 0;
    let tickAcc = 1;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = clamp((now - last) / 1000, 0, 0.05);
      last = now;
      t += dt;

      const { playing: pl, speed: sp, showLabels: labels, selectedId: sel } = live.current;
      if (pl) simDays += dt * BASE_DAYS_PER_SEC * sp;

      // camera glide
      if (camTarget.active && !manual) {
        const k = 1 - Math.exp(-dt * 4.2);
        cam.x += (camTarget.x - cam.x) * k;
        cam.y += (camTarget.y - cam.y) * k;
        cam.zoom += (camTarget.zoom - cam.zoom) * k;
      }

      ctx.clearRect(0, 0, w, h);

      /* stars (screen space, parallax) */
      const par = [0.05, 0.12, 0.24];
      for (const s of stars) {
        const f = par[s.layer];
        const sx = mod(s.x - cam.x * cam.zoom * f, w);
        const sy = mod(s.y - cam.y * cam.zoom * f, h);
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph)) * (0.45 + s.layer * 0.3);
        ctx.fillStyle = s.warm ? `rgba(255,214,165,${a})` : `rgba(190,205,255,${a})`;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r * (0.6 + s.layer * 0.25), 0, TAU);
        ctx.fill();
      }

      /* meteors */
      meteorTimer -= dt;
      if (meteorTimer <= 0) {
        meteorTimer = 5 + Math.random() * 7;
        const fromLeft = Math.random() < 0.5;
        meteors.push({
          x: fromLeft ? -40 : w * (0.3 + Math.random() * 0.8),
          y: -30,
          vx: (fromLeft ? 1 : -0.6) * (220 + Math.random() * 200),
          vy: 260 + Math.random() * 180,
          life: 0,
          max: 1.1 + Math.random() * 0.7,
        });
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.life > m.max || m.y > h + 60 || m.x < -80 || m.x > w + 80) {
          meteors.splice(i, 1);
          continue;
        }
        const a = Math.sin(Math.PI * (m.life / m.max)) * 0.8;
        const tail = 0.14;
        const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tail, m.y - m.vy * tail);
        g.addColorStop(0, `rgba(255,244,220,${a})`);
        g.addColorStop(1, "rgba(255,244,220,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail);
        ctx.stroke();
      }

      /* ---- world space ---- */
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-cam.x, -cam.y);
      const inv = 1 / cam.zoom;

      hitZones.length = 0;
      hitZones.push({
        id: SUN.id,
        x: w / 2 + (0 - cam.x) * cam.zoom,
        y: h / 2 + (0 - cam.y) * cam.zoom,
        r: Math.max(SUN.radius * cam.zoom, 14),
      });

      /* orbit paths */
      for (const p of PLANETS) {
        const isSel = sel === p.id;
        const isHov = hoverId === p.id;
        ctx.beginPath();
        ctx.arc(0, 0, p.orbitWorld, 0, TAU);
        ctx.strokeStyle = isSel
          ? "rgba(242,178,76,0.55)"
          : isHov
            ? "rgba(233,237,250,0.4)"
            : "rgba(141,151,184,0.2)";
        ctx.lineWidth = (isSel ? 1.6 : 1) * inv;
        if (!isSel) ctx.setLineDash([2 * inv, 7 * inv]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      /* positions */
      const pos = new Map<string, { x: number; y: number }>();
      for (const p of PLANETS) {
        const a = p.startAngle + (simDays / p.periodDays) * TAU;
        pos.set(p.id, { x: Math.cos(a) * p.orbitWorld, y: Math.sin(a) * p.orbitWorld });
      }

      /* motion trails */
      for (const p of PLANETS) {
        const a0 = p.startAngle + (simDays / p.periodDays) * TAU;
        const segs = 26;
        const span = 0.85;
        for (let i = 0; i < segs; i++) {
          const f0 = i / segs;
          const f1 = (i + 1) / segs;
          const alpha = 0.42 * (1 - f0) * (1 - f0);
          ctx.beginPath();
          ctx.arc(0, 0, p.orbitWorld, a0 - span * f1, a0 - span * f0);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = Math.max(1.2, p.radius * 0.3);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      /* sun */
      {
        const pulse = 1 + Math.sin(t * 1.6) * 0.05;
        const R = SUN.radius;
        let g = ctx.createRadialGradient(0, 0, R * 0.4, 0, 0, R * 4.6 * pulse);
        g.addColorStop(0, "rgba(255,190,92,0.5)");
        g.addColorStop(0.35, "rgba(255,150,60,0.16)");
        g.addColorStop(1, "rgba(255,120,40,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, R * 4.6 * pulse, 0, TAU);
        ctx.fill();

        // slow rays
        ctx.save();
        ctx.rotate(t * 0.045);
        ctx.strokeStyle = "rgba(255,196,110,0.14)";
        ctx.lineWidth = 1.4 * inv;
        for (let i = 0; i < 12; i++) {
          const ra = (i / 12) * TAU;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ra) * R * 1.35, Math.sin(ra) * R * 1.35);
          ctx.lineTo(Math.cos(ra) * R * (2.2 + 0.35 * Math.sin(t * 1.2 + i)), Math.sin(ra) * R * (2.2 + 0.35 * Math.sin(t * 1.2 + i)));
          ctx.stroke();
        }
        ctx.restore();

        g = ctx.createRadialGradient(-R * 0.25, -R * 0.25, R * 0.1, 0, 0, R);
        g.addColorStop(0, "#fff6da");
        g.addColorStop(0.45, "#ffd98c");
        g.addColorStop(1, "#ff9330");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, TAU);
        ctx.fill();

        if (sel === "sun" || hoverId === "sun") {
          ctx.beginPath();
          ctx.arc(0, 0, R * 1.28, 0, TAU);
          ctx.strokeStyle = "rgba(242,178,76,0.9)";
          ctx.lineWidth = 1.6 * inv;
          ctx.setLineDash([6 * inv, 5 * inv]);
          ctx.lineDashOffset = -t * 26 * inv;
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if (labels || sel === "sun" || hoverId === "sun") {
          label("Sun", 0, -R - 12 * inv, sel === "sun" ? "G2V STAR" : undefined);
        }
      }

      /* planets */
      for (const p of PLANETS) {
        const pt = pos.get(p.id)!;
        const { x, y } = pt;
        const r = p.radius;
        const isSel = sel === p.id;
        const isHov = hoverId === p.id;

        // halo
        const halo = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 2.4);
        halo.addColorStop(0, p.glow.replace("0.5", isSel ? "0.4" : "0.2"));
        halo.addColorStop(1, p.glow.replace(/[\d.]+\)$/, "0)"));
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, r * 2.4, 0, TAU);
        ctx.fill();

        // rings behind (back half)
        if (p.ring) {
          const ringAlpha = p.id === "uranus" ? 0.3 : 1;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(p.ring.tilt);
          const steps = 4;
          for (let i = 0; i < steps; i++) {
            const rr = p.ring.inner + ((p.ring.outer - p.ring.inner) * i) / (steps - 1);
            ctx.beginPath();
            ctx.ellipse(0, 0, rr, rr * 0.34, 0, Math.PI, TAU);
            ctx.strokeStyle = `rgba(232,213,170,${(0.5 - i * 0.09) * ringAlpha})`;
            ctx.lineWidth = (p.ring.outer - p.ring.inner) * 0.16;
            ctx.stroke();
          }
          ctx.restore();
        }

        shade(p, x, y, r);

        // rings in front
        if (p.ring) {
          const ringAlpha = p.id === "uranus" ? 0.3 : 1;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(p.ring.tilt);
          const steps = 4;
          for (let i = 0; i < steps; i++) {
            const rr = p.ring.inner + ((p.ring.outer - p.ring.inner) * i) / (steps - 1);
            ctx.beginPath();
            ctx.ellipse(0, 0, rr, rr * 0.34, 0, 0, Math.PI);
            ctx.strokeStyle = `rgba(238,220,180,${(0.6 - i * 0.1) * ringAlpha})`;
            ctx.lineWidth = (p.ring.outer - p.ring.inner) * 0.16;
            ctx.stroke();
          }
          ctx.restore();
        }

        // Earth's moon
        if (p.moon) {
          const ma = (simDays / p.moon.periodDays) * TAU;
          const mx = x + Math.cos(ma) * p.moon.dist;
          const my = y + Math.sin(ma) * p.moon.dist;
          ctx.beginPath();
          ctx.arc(x, y, p.moon.dist, 0, TAU);
          ctx.strokeStyle = "rgba(141,151,184,0.22)";
          ctx.lineWidth = 0.8 * inv;
          ctx.stroke();
          ctx.fillStyle = "#c9cedd";
          ctx.beginPath();
          ctx.arc(mx, my, p.moon.radius, 0, TAU);
          ctx.fill();
        }

        // selection reticle
        if (isSel) {
          ctx.beginPath();
          ctx.arc(x, y, r + 7 * inv + Math.sin(t * 3) * 1.2 * inv, 0, TAU);
          ctx.strokeStyle = "rgba(242,178,76,0.95)";
          ctx.lineWidth = 1.5 * inv;
          ctx.setLineDash([6 * inv, 5 * inv]);
          ctx.lineDashOffset = -t * 30 * inv;
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (isHov) {
          ctx.beginPath();
          ctx.arc(x, y, r + 5 * inv, 0, TAU);
          ctx.strokeStyle = "rgba(233,237,250,0.5)";
          ctx.lineWidth = 1.2 * inv;
          ctx.stroke();
        }

        hitZones.push({
          id: p.id,
          x: w / 2 + (x - cam.x) * cam.zoom,
          y: h / 2 + (y - cam.y) * cam.zoom,
          r: Math.max(r * cam.zoom, 11),
        });

        if (labels || isSel) {
          label(
            p.name,
            x,
            y - r - (p.ring ? p.ring.outer * 0.42 : 0) - 10 * inv,
            isSel ? `${p.orbitAU} AU` : undefined,
          );
        }
      }

      // hover tooltip for unlabelled bodies
      if (hoverId && !labels && sel !== hoverId) {
        const b = hoverId === "sun" ? null : PLANETS.find((p) => p.id === hoverId);
        if (b) {
          const pt = pos.get(b.id)!;
          pill(b.name, pt.x, pt.y - b.radius - 16 * inv, b.glow);
        }
      }

      ctx.restore();

      // throttled sim clock
      tickAcc += dt;
      if (tickAcc >= 0.25) {
        tickAcc = 0;
        live.current.onTick(simDays);
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("dblclick", onDblClick);
      frameApi.current = null;
    };
  }, []);

  /* reframe camera when selection or reset token changes */
  useEffect(() => {
    if (selectedId) frameApi.current?.(selectedId);
  }, [selectedId]);
  useEffect(() => {
    if (resetToken > 0) frameApi.current?.(null);
  }, [resetToken]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full" aria-label="Solar system map" role="img" />
    </div>
  );
}
