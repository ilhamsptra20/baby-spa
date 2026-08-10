import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { type HTMLAttributes, type ReactNode } from "react";

import type { UIColor } from "@/ui/types/color";
import { alertColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

type AlertTone = "info" | "success" | "warning" | "error";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  tone?: AlertTone;
  color?: UIColor;
  action?: ReactNode;
}

const toneStyles: Record<
  AlertTone,
  { color: UIColor; Icon: typeof InformationCircleIcon }
> = {
  info: {
    color: "sky",
    Icon: InformationCircleIcon,
  },
  success: {
    color: "emerald",
    Icon: CheckCircleIcon,
  },
  warning: {
    color: "amber",
    Icon: ExclamationTriangleIcon,
  },
  error: {
    color: "rose",
    Icon: ExclamationCircleIcon,
  },
};

export function Alert({
  className,
  title,
  description,
  tone = "info",
  color,
  action,
  children,
  ...props
}: AlertProps) {
  const toneStyle = toneStyles[tone];
  const { container, icon } = alertColorClasses[color ?? toneStyle.color];
  const Icon = toneStyle.Icon;

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border p-4 shadow-xs transition-shadow duration-200 hover:shadow-sm",
        container,
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", icon)} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          {title ? <p className="text-sm font-semibold">{title}</p> : null}
          {description ? <p className="mt-1 text-sm/6">{description}</p> : null}
          {children}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
