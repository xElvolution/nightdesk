"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const CYCLE_MS = 14000;
const STATIC_PROGRESS = 0.28;

const STARS = [
  { x: 8, y: 12, s: 1.2, o: 0.55 },
  { x: 18, y: 28, s: 0.8, o: 0.4 },
  { x: 28, y: 8, s: 1.0, o: 0.65 },
  { x: 42, y: 18, s: 0.7, o: 0.35 },
  { x: 55, y: 6, s: 1.4, o: 0.7 },
  { x: 68, y: 22, s: 0.9, o: 0.45 },
  { x: 78, y: 10, s: 1.1, o: 0.6 },
  { x: 88, y: 30, s: 0.75, o: 0.4 },
  { x: 12, y: 48, s: 0.85, o: 0.35 },
  { x: 92, y: 48, s: 1.0, o: 0.5 },
  { x: 35, y: 38, s: 0.6, o: 0.3 },
  { x: 62, y: 42, s: 0.7, o: 0.38 },
  { x: 48, y: 14, s: 0.55, o: 0.28 },
  { x: 72, y: 55, s: 0.8, o: 0.32 },
  { x: 22, y: 62, s: 0.65, o: 0.3 },
];

/**
 * Night-world 3D moon hero: soft rim glow, stars, orbiting rTokens.
 * Ambient scene only — never video-player chrome (play/pause, scrubber).
 */
export function HeroMoon() {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(STATIC_PROGRESS);

  useEffect(() => {
    if (reduce) {
      setProgress(STATIC_PROGRESS);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      setProgress((elapsed % CYCLE_MS) / CYCLE_MS);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  const phase = progress * Math.PI * 2;
  const floatY = Math.sin(phase) * 8;
  const glowPulse = 0.72 + Math.sin(phase) * 0.18;
  const orbit = progress * 360;

  return (
    <div className="relative w-full select-none">
      <div
        className="relative mx-auto aspect-[16/11] w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/[0.07] md:aspect-[16/10] md:rounded-[32px]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 42%, #0c1424 0%, #070a12 48%, #030406 100%)",
        }}
        aria-hidden
      >
        {/* Atmosphere bloom */}
        <div
          className="pointer-events-none absolute left-1/2 top-[38%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full md:h-[420px] md:w-[420px]"
          style={{
            background: `radial-gradient(circle, rgba(186,210,255,${0.14 * glowPulse}) 0%, rgba(100,140,220,0.06) 42%, transparent 68%)`,
            filter: "blur(6px)",
            transform: `translate(-50%, calc(-50% + ${floatY * 0.3}px))`,
          }}
        />

        {/* Stars */}
        <div className="pointer-events-none absolute inset-0">
          {STARS.map((st, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${st.x}%`,
                top: `${st.y}%`,
                width: st.s,
                height: st.s,
                opacity:
                  st.o *
                  (0.65 +
                    0.35 *
                      Math.sin(phase * (1.2 + (i % 5) * 0.15) + i)),
                boxShadow: st.s > 1 ? "0 0 6px rgba(220,230,255,0.55)" : undefined,
              }}
            />
          ))}
        </div>

        {/* Soft horizon / desk shelf */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%]">
          <div
            className="absolute inset-x-[8%] bottom-[18%] h-px md:inset-x-[12%]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(186,210,255,0.18) 20%, rgba(186,210,255,0.28) 50%, rgba(186,210,255,0.18) 80%, transparent)",
            }}
          />
          <div
            className="absolute left-1/2 bottom-[12%] h-[72px] w-[72%] max-w-[420px] -translate-x-1/2 rounded-[50%] opacity-50 md:h-[90px]"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(20,28,48,0.9) 0%, transparent 70%)",
              boxShadow: "0 0 40px rgba(120,160,220,0.08)",
            }}
          />
          {/* Mini desk silhouette */}
          <div
            className="absolute left-1/2 bottom-[14%] flex -translate-x-1/2 items-end gap-3 opacity-70"
            style={{ transform: `translate(-50%, ${floatY * 0.15}px)` }}
          >
            <div
              className="h-8 w-[140px] rounded-md border border-white/[0.08] md:h-9 md:w-[180px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(28,34,52,0.95), rgba(12,14,22,0.98))",
                boxShadow:
                  "0 8px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <div className="mx-auto mt-1.5 h-1 w-10 rounded-full bg-cyan-300/40" />
              <div className="mx-auto mt-1.5 flex justify-center gap-1.5">
                <span className="h-1 w-6 rounded-full bg-white/10" />
                <span className="h-1 w-4 rounded-full bg-white/10" />
                <span className="h-1 w-8 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Moon + orbits */}
        <div
          className="absolute left-1/2 top-[44%] w-full max-w-[520px] -translate-x-1/2 -translate-y-1/2"
          style={{ perspective: "1200px" }}
        >
          <div
            className="relative mx-auto flex h-[260px] items-center justify-center md:h-[320px]"
            style={{
              transformStyle: "preserve-3d",
              transform: `translateY(${floatY}px)`,
            }}
          >
            {/* Orbital rings (subtle, lunar not neon) */}
            {[0, 1].map((i) => {
              const size = 210 + i * 78;
              const rot = orbit * (i === 0 ? 0.35 : -0.22) + i * 25;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: size,
                    height: size,
                    transform: `rotateX(68deg) rotateZ(${rot}deg)`,
                    boxShadow: `
                      0 0 0 1px rgba(186,210,255,${0.22 - i * 0.08}),
                      0 0 18px rgba(140,180,255,${0.12 - i * 0.04})
                    `,
                    opacity: 0.85 - i * 0.2,
                  }}
                />
              );
            })}

            {/* Moon sphere */}
            <motion.div
              className="relative z-10"
              whileHover={reduce ? undefined : { scale: 1.03 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={{
                width: 168,
                height: 168,
                transform: `translateZ(48px)`,
              }}
            >
              <div
                className="absolute -inset-6 rounded-full md:-inset-8"
                style={{
                  background: `radial-gradient(circle, rgba(210,225,255,${0.22 * glowPulse}) 0%, transparent 68%)`,
                  filter: "blur(10px)",
                }}
              />
              <div
                className="relative h-full w-full overflow-hidden rounded-full"
                style={{
                  background: `
                    radial-gradient(circle at 32% 28%, #f4f7ff 0%, #d7e0f2 18%, #9aacc8 42%, #5a6d8c 68%, #2a3548 100%)
                  `,
                  boxShadow: `
                    0 0 0 1px rgba(230,238,255,0.35),
                    0 0 36px rgba(180,205,255,${0.35 * glowPulse}),
                    0 0 80px rgba(120,160,230,${0.18 * glowPulse}),
                    inset -18px -10px 36px rgba(8,12,24,0.55),
                    inset 10px 8px 20px rgba(255,255,255,0.35)
                  `,
                }}
              >
                {/* Craters */}
                <span
                  className="absolute rounded-full"
                  style={{
                    left: "22%",
                    top: "38%",
                    width: 28,
                    height: 22,
                    background:
                      "radial-gradient(circle at 40% 35%, rgba(90,110,140,0.35), rgba(40,55,80,0.2))",
                    boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.25)",
                  }}
                />
                <span
                  className="absolute rounded-full"
                  style={{
                    left: "48%",
                    top: "22%",
                    width: 14,
                    height: 12,
                    background:
                      "radial-gradient(circle at 40% 35%, rgba(90,110,140,0.4), rgba(40,55,80,0.18))",
                  }}
                />
                <span
                  className="absolute rounded-full"
                  style={{
                    left: "58%",
                    top: "52%",
                    width: 36,
                    height: 28,
                    background:
                      "radial-gradient(circle at 35% 30%, rgba(100,120,150,0.28), rgba(35,48,70,0.22))",
                  }}
                />
                {/* Crescent terminator for night readability */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 38%, rgba(4,8,16,0.15) 52%, rgba(3,6,12,0.72) 78%)",
                  }}
                />
                {/* Specular highlight */}
                <div
                  className="absolute rounded-full"
                  style={{
                    left: "18%",
                    top: "16%",
                    width: "38%",
                    height: "28%",
                    background:
                      "radial-gradient(ellipse, rgba(255,255,255,0.55), transparent 70%)",
                    filter: "blur(1px)",
                  }}
                />
              </div>
            </motion.div>

            {/* Orbiting rToken chips */}
            {[
              { label: "rNVDA", angle: 0, r: 128, size: "md" },
              { label: "rAAPL", angle: 120, r: 118, size: "sm" },
              { label: "USDT", angle: 240, r: 124, size: "sm" },
            ].map((c) => {
              const a = ((c.angle + orbit * 0.55) * Math.PI) / 180;
              const x = Math.cos(a) * c.r;
              const y = Math.sin(a) * c.r * 0.38 + Math.sin(phase + a) * 4;
              const z = Math.sin(a) * 36;
              const dim = c.size === "md" ? 48 : 40;
              return (
                <div
                  key={c.label}
                  className="absolute left-1/2 top-1/2 z-20"
                  style={{
                    width: dim,
                    height: dim,
                    marginLeft: -dim / 2,
                    marginTop: -dim / 2,
                    transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                  }}
                >
                  <div
                    className="flex h-full w-full items-center justify-center rounded-full border border-white/25 text-[8px] font-semibold tracking-wide text-white/95 md:text-[9px]"
                    style={{
                      background:
                        "linear-gradient(155deg, #c5d4f0 0%, #5b7ab0 38%, #1a2438 100%)",
                      boxShadow:
                        "0 8px 22px rgba(0,0,0,0.4), 0 0 16px rgba(140,180,255,0.28), inset 0 1px 0 rgba(255,255,255,0.4)",
                    }}
                  >
                    {c.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#030406] to-transparent" />

        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-[0.18em] text-white/35 uppercase">
          21:00 WAT · overnight
        </div>
      </div>
    </div>
  );
}
