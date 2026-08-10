import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

interface SpinnerProps {
  className?: string;
  label?: string;
  color?: UIColor;
}

export function Spinner({ className, label = "Loading", color = "slate" }: SpinnerProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-2", fieldColorClasses[color].text, className)}
      role="status"
      aria-live="polite"
    >
      <svg
        className="h-5 w-5 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          className="opacity-30"
        />
        <path
          d="M22 12a10 10 0 0 1-10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-sm">{label}</span>
    </div>
  );
}
