"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./Button.module.css";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  external?: boolean;
}

export function Button({
  children,
  variant = "primary",
  href,
  onClick,
  className,
  disabled = false,
  type = "button",
  external = false,
}: ButtonProps) {
  const classes = cn(styles.button, styles[variant], className);
  const prefersReduced = useReducedMotion();

  const motionProps = prefersReduced || variant === "ghost"
    ? {}
    : {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { type: "spring", stiffness: 400, damping: 20 },
      };

  const magnetic = variant === "primary" ? { "data-magnetic": true } : {};

  if (href) {
    if (external) {
      return (
        <motion.a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
          {...magnetic}
          {...motionProps}
        >
          {children}
        </motion.a>
      );
    }
    return (
      <motion.div {...motionProps} {...magnetic} style={{ display: "inline-flex" }}>
        <Link href={href} className={classes}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...magnetic}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}
