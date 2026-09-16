"use client";

import { motion, type MotionProps, useReducedMotion } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Hero entrance: opacity 0 to 1, y 24 to 0, optional scale .98 to 1, 600-800ms */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 24,
  scale = false,
  style,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: boolean;
  style?: CSSProperties;
} & MotionProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={
        reduce
          ? false
          : { opacity: 0, y, ...(scale ? { scale: 0.98 } : {}) }
      }
      animate={{ opacity: 1, y: 0, ...(scale ? { scale: 1 } : {}) }}
      transition={{ duration: 0.7, delay, ease }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Hero stagger parent: children delay index * 0.05 */
export function HeroStagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduce ? 0 : 0.05,
            delayChildren: 0.08,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function HeroItem({
  children,
  className,
  scale = false,
}: {
  children: ReactNode;
  className?: string;
  scale?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce
          ? { opacity: 1 }
          : { opacity: 0, y: 24, ...(scale ? { scale: 0.98 } : {}) },
        show: {
          opacity: 1,
          y: 0,
          ...(scale ? { scale: 1 } : {}),
          transition: { duration: 0.72, ease },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Scroll reveal: whileInView once */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  delay = 0,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? { opacity: 1 } : { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, ease },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Hover card: translateY(-4px) */
export function LiftCard({
  children,
  className,
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -4,
        boxShadow: glow
          ? "0 0 0 1px rgba(167,139,250,0.22), 0 0 36px rgba(139,92,246,0.14), 0 20px 48px rgba(0,0,0,0.45)"
          : "0 0 0 1px rgba(255,255,255,0.1), 0 20px 48px rgba(0,0,0,0.45)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      {children}
    </motion.div>
  );
}

export function PulseDot({ className = "bg-accent" }: { className?: string }) {
  return (
    <span className="relative inline-flex h-1.5 w-1.5">
      <motion.span
        className={`absolute inset-0 rounded-full ${className}`}
        animate={{ opacity: [1, 0.35, 1], scale: [1, 1.35, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${className}`} />
    </span>
  );
}
