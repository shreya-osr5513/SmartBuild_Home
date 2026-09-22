import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "teal",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "teal" | "success" | "warning" | "danger";
}) {
  const toneBg = {
    teal: "bg-teal/15 text-teal",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-danger/15 text-danger",
  }[tone];

  return (
    <div className="card-surface p-4 sm:p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="font-display mt-2 text-2xl font-semibold sm:text-3xl">{value}</p>
          {hint ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", toneBg)}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}
