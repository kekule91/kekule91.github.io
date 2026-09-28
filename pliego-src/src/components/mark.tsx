import { cx } from "@/lib/cn";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={cx("text-ink", className)} aria-hidden="true">
      <rect width="36" height="36" rx="8" fill="currentColor" />
      <rect
        x="6"
        y="6"
        width="24"
        height="24"
        fill="none"
        stroke="var(--color-paper)"
        strokeWidth="3"
      />
      <rect x="13" y="13" width="10" height="10" fill="var(--color-accent)" />
    </svg>
  );
}
