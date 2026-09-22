import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------- card --------------------------------- */

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("card-surface p-5", className)}>{children}</div>;
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold sm:text-xl">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* --------------------------------- badge --------------------------------- */

type Tone = "teal" | "success" | "warning" | "danger" | "muted";

const toneClasses: Record<Tone, string> = {
  teal: "bg-teal/15 text-teal border-teal/30",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  muted: "bg-muted text-muted-foreground border-border",
};

export function Badge({
  tone = "muted",
  children,
  className,
  dot,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

/* --------------------------------- button -------------------------------- */

type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "soft";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:brightness-110 shadow-[0_10px_24px_-14px_var(--teal)]",
  outline: "border border-border bg-transparent text-foreground hover:bg-accent",
  ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
  danger: "bg-danger/90 text-destructive-foreground hover:bg-danger",
  soft: "bg-teal-soft text-teal hover:bg-teal/25",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

/* --------------------------------- toggle -------------------------------- */

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
        checked ? "bg-teal" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-1 size-5 rounded-full bg-background transition-all",
          checked ? "left-6" : "left-1",
        )}
      />
    </button>
  );
}

/* ------------------------------- segmented ------------------------------- */

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = "md",
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex w-full rounded-xl border border-border bg-surface-2 p-1 sm:w-auto">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 rounded-lg font-medium whitespace-nowrap transition-colors",
            size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm",
            value === opt.value
              ? "bg-teal text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* --------------------------------- empty --------------------------------- */

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="card-surface flex flex-col items-center gap-1 p-10 text-center">
      <p className="font-medium">{title}</p>
      {detail ? <p className="text-sm text-muted-foreground">{detail}</p> : null}
    </div>
  );
}
