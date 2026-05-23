import clsx from "clsx";
import type { ReactNode } from "react";

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "purple" | "green" | "red";
}
export function Card({ children, className, hover, glow }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-mantle-card border border-mantle-border rounded-xl p-5",
        hover && "card-hover cursor-pointer",
        glow === "purple" && "glow-purple",
        glow === "green" && "glow-green",
        glow === "red" && "glow-red",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | ReactNode;
  sub?: string | ReactNode;
  positive?: boolean;
  negative?: boolean;
  className?: string;
}
export function StatCard({ label, value, sub, positive, negative, className }: StatCardProps) {
  return (
    <div className={clsx("bg-[#0D0D14] border border-mantle-border rounded-xl p-4", className)}>
      <div className="text-xs text-mantle-muted mb-1">{label}</div>
      <div
        className={clsx(
          "text-xl font-semibold num",
          positive && "text-mantle-teal",
          negative && "text-mantle-coral"
        )}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-mantle-muted mt-1">{sub}</div>}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeVariant = "purple" | "green" | "red" | "amber" | "gray" | "blue";
interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}
const badgeStyles: Record<BadgeVariant, string> = {
  purple: "bg-[#2A2858] text-mantle-purple border border-[#3C3489]",
  green: "bg-[#0D2E20] text-mantle-teal border border-[#1A4A35]",
  red: "bg-[#2E1010] text-mantle-coral border border-[#4A2020]",
  amber: "bg-[#2E2010] text-amber-400 border border-[#4A3010]",
  gray: "bg-[#1A1A2A] text-mantle-muted border border-mantle-border",
  blue: "bg-[#0D1E2E] text-blue-400 border border-[#1A3A4A]",
};
export function Badge({ children, variant = "gray", dot, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium",
        badgeStyles[variant],
        className
      )}
    >
      {dot && <span className="live-dot" />}
      {children}
    </span>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "outline" | "danger" | "ghost" | "success";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}
const btnBase = "inline-flex items-center justify-center gap-2 font-medium transition-all rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
const btnVariants: Record<ButtonVariant, string> = {
  primary: "bg-mantle-purple hover:bg-mantle-purple-dark text-white",
  outline: "border border-mantle-border text-white hover:border-mantle-purple hover:text-mantle-purple bg-transparent",
  danger: "bg-mantle-coral hover:bg-red-700 text-white",
  ghost: "text-mantle-muted hover:text-white bg-transparent",
  success: "bg-mantle-teal hover:bg-green-700 text-white",
};
const btnSizes: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};
export function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(btnBase, btnVariants[variant], btnSizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("text-xs font-semibold text-mantle-muted uppercase tracking-widest mb-4", className)}>
      {children}
    </div>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl mb-3 opacity-30">{icon}</div>
      <div className="text-sm font-medium text-mantle-muted">{title}</div>
      {sub && <div className="text-xs text-mantle-muted mt-1 opacity-70">{sub}</div>}
    </div>
  );
}

// ─── PnlText ─────────────────────────────────────────────────────────────────
export function PnlText({ value, prefix = "$", className }: { value: number; prefix?: string; className?: string }) {
  return (
    <span className={clsx("num font-semibold", value >= 0 ? "text-mantle-teal" : "text-mantle-coral", className)}>
      {value >= 0 ? "+" : ""}{prefix}{Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}
