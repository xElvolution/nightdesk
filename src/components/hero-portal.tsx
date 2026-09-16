"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const CYCLE_MS = 12000;

/** Portals-grade 3D disc / ring hero with playable motion scrubber. */
export function HeroPortal() {
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(!reduce);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(performance.now());
  const pausedAtRef = useRef(0);
  const dragging = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) {
      setPlaying(false);
      setProgress(0.35);
      return;
    }
    let raf = 0;
    const tick = (now: number) => {
      if (!dragging.current && playing) {
        const elapsed = now - startRef.current;
        const p = (elapsed % CYCLE_MS) / CYCLE_MS;
        setProgress(p);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduce]);

  const seek = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setProgress(p);
    startRef.current = performance.now() - p * CYCLE_MS;
    pausedAtRef.current = p;
  }, []);

  const toggle = () => {
    if (reduce) return;
    setPlaying((v) => {
      if (v) {
        pausedAtRef.current = progress;
        return false;
      }
      startRef.current = performance.now() - pausedAtRef.current * CYCLE_MS;
      return true;
    });
  };

  const spin = progress * 360;
  const pulse = 0.55 + Math.sin(progress * Math.PI * 2) * 0.2;
  const floatY = Math.sin(progress * Math.PI * 2) * 10;

  return (
    <div className="relative w-full select-none">
      <div
        className="portal-stage relative mx-auto aspect-[16/11] w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/[0.07] md:aspect-[16/10] md:rounded-[32px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 55%, #140a22 0%, #08060e 55%, #050508 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(167,139,250,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.06) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage:
                "radial-gradient(ellipse 65% 55% at 50% 60%, #000 10%, transparent 70%)",
            }}
          />
        </div>

        <motion.div
          className="pointer-events-none absolute left-1/2 top-[42%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full md:h-[360px] md:w-[360px]"
          style={{
            background: `radial-gradient(circle, rgba(139,92,246,${0.28 * pulse}) 0%, rgba(91,33,182,0.12) 40%, transparent 70%)`,
            filter: "blur(8px)",
          }}
        />

        <div
          className="absolute left-1/2 top-[48%] w-full max-w-[560px] -translate-x-1/2 -translate-y-1/2"
          style={{ perspective: "1100px" }}
        >
          <div
            className="relative mx-auto h-[280px] w-full md:h-[340px]"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(58deg) rotateZ(${spin * 0.15}deg)`,
            }}
          >
            {[0, 1, 2].map((i) => {
              const size = 180 + i * 70;
              const opacity = 0.9 - i * 0.22;
              const rot = spin * (i % 2 === 0 ? 1 : -0.7) + i * 40;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: size,
                    height: size,
                    opacity,
                    transform: `translateZ(${i * 18}px) rotateZ(${rot}deg)`,
                    boxShadow: `
                      0 0 0 1.5px rgba(167,139,250,${0.55 - i * 0.12}),
                      0 0 24px rgba(139,92,246,${0.45 - i * 0.1}),
                      inset 0 0 28px rgba(167,139,250,${0.15 - i * 0.03})
                    `,
                    background:
                      i === 0
                        ? "radial-gradient(circle at 35% 30%, rgba(196,181,253,0.18), transparent 55%)"
                        : "transparent",
                  }}
                />
              );
            })}

            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: 112,
                height: 112,
                transform: `translateZ(42px) rotateZ(${-spin * 0.4}deg)`,
              }}
            >
              <div
                className="h-full w-full rounded-[22%] border border-violet-300/40"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(91,33,182,0.95), rgba(30,10,55,0.98) 55%, rgba(76,29,149,0.9))",
                  boxShadow: `
                    0 0 40px rgba(139,92,246,0.55),
                    0 0 80px rgba(124,58,237,0.25),
                    inset 0 1px 0 rgba(255,255,255,0.25),
                    inset 0 -8px 24px rgba(0,0,0,0.45)
                  `,
                }}
              >
                <div className="flex h-full items-center justify-center">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
                    <path
                      d="M18 6v6M12 18h12M18 24v6"
                      stroke="#E9D5FF"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <circle cx="18" cy="18" r="5" stroke="#C4B5FD" strokeWidth="1.6" />
                  </svg>
                </div>
              </div>
            </div>

            {[
              { x: -130, y: -40, z: 70, label: "rNVDA", delay: 0 },
              { x: 125, y: 10, z: 90, label: "rAAPL", delay: 0.33 },
              { x: -40, y: 95, z: 55, label: "USDT", delay: 0.66 },
            ].map((c) => {
              const bob =
                floatY * (0.6 + c.delay) +
                Math.sin((progress + c.delay) * Math.PI * 2) * 6;
              return (
                <div
                  key={c.label}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(-50%, -50%) translate3d(${c.x}px, ${c.y + bob}px, ${c.z}px) rotateX(-58deg)`,
                  }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-[9px] font-semibold tracking-wide text-white/90 md:h-14 md:w-14 md:text-[10px]"
                    style={{
                      background:
                        "linear-gradient(160deg, #c4b5fd 0%, #6d28d9 40%, #2e1065 100%)",
                      boxShadow:
                        "0 8px 24px rgba(0,0,0,0.45), 0 0 20px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.35)",
                    }}
                  >
                    {c.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050508] to-transparent" />
      </div>

      <div className="mx-auto mt-4 flex max-w-4xl items-center gap-3 px-1">
        <button
          type="button"
          onClick={toggle}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-ink backdrop-blur transition hover:border-violet-400/40 hover:bg-violet-500/10"
          aria-label={playing ? "Pause hero motion" : "Play hero motion"}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div
          ref={trackRef}
          className="group relative h-9 flex-1 cursor-pointer"
          onPointerDown={(e) => {
            dragging.current = true;
            seek(e.clientX);
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            seek(e.clientX);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Hero motion scrubber"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              seek(
                (trackRef.current?.getBoundingClientRect().left ?? 0) +
                  (progress + 0.05) *
                    (trackRef.current?.getBoundingClientRect().width ?? 0),
              );
            }
            if (e.key === "ArrowLeft") {
              seek(
                (trackRef.current?.getBoundingClientRect().left ?? 0) +
                  (progress - 0.05) *
                    (trackRef.current?.getBoundingClientRect().width ?? 0),
              );
            }
          }}
        >
          <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-white/10" />
          <div
            className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-violet-400/80"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-200/60 bg-violet-300 shadow-[0_0_12px_rgba(167,139,250,0.55)] transition group-hover:scale-110"
            style={{ left: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <path d="M3 1.5v9l8-4.5L3 1.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <rect x="2.5" y="1.5" width="2.5" height="9" rx="0.5" />
      <rect x="7" y="1.5" width="2.5" height="9" rx="0.5" />
    </svg>
  );
}
