import { Spinner } from "./Spinner";
import { cn } from "@/ui/utils/cn";

interface PageLoaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export function PageLoader({
  title = "Preparing dashboard",
  description = "Please wait while we load your workspace.",
  className,
}: PageLoaderProps) {
  return (
    <div className={cn("flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center", className)}>
      <div className="rounded-full bg-white dark:bg-slate-900 p-4 shadow-sm ring-1 ring-slate-200">
        <Spinner label="Loading" className="text-slate-700 dark:text-slate-200" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </div>
  );
}
