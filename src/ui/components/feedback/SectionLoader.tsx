import { cn } from "@/ui/utils/cn";

import { Skeleton } from "./Skeleton";

interface SectionLoaderProps {
  className?: string;
  rows?: number;
}

export function SectionLoader({ className, rows = 4 }: SectionLoaderProps) {
  return (
    <div className={cn("rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm", className)}>
      <div className="space-y-4">
        <Skeleton height={20} width="36%" rounded="md" />
        <Skeleton height={14} width="58%" rounded="md" />

        <div className="space-y-3 pt-1">
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} height={16} width="100%" rounded="md" />
          ))}
        </div>
      </div>
    </div>
  );
}
