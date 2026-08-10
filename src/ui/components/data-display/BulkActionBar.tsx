"use client";

import { type ReactNode } from "react";

import { Button, type ButtonProps } from "@/ui/components/common/Button";
import { cn } from "@/ui/utils/cn";

export interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  disabled?: boolean;
}

interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkAction[];
  className?: string;
}

export function BulkActionBar({ selectedCount, actions, className }: BulkActionBarProps) {
  if (selectedCount <= 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm",
        className,
      )}
    >
      <p className="text-sm text-slate-700 dark:text-slate-200">
        <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedCount}</span> row selected
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant ?? "secondary"}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
