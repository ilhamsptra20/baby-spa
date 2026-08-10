"use client";

import { useToastContext } from "@/ui/providers/ToastProvider";

export function useToast() {
  return useToastContext();
}
