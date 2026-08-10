"use client";

import { useCallback } from "react";

import { type ConfirmOptions, useDialogContext } from "@/ui/providers/DialogProvider";

export function useConfirm() {
  const { confirm } = useDialogContext();

  return useCallback(
    (options: ConfirmOptions) => {
      return confirm(options);
    },
    [confirm],
  );
}
