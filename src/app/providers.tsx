"use client";

import { type ReactNode } from "react";

import {
  DialogProvider,
  QueryProvider,
  ThemeProvider,
  ToastProvider,
} from "@/ui/providers";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <DialogProvider>
          <ToastProvider>{children}</ToastProvider>
        </DialogProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
