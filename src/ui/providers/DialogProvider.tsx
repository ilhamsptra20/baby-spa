"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ConfirmDialog,
  type ConfirmDialogOptions,
  type ConfirmDialogVariant,
} from "@/ui/components/overlay/ConfirmDialog";
import type { UIColor } from "@/ui/types/color";

export interface ConfirmOptions extends ConfirmDialogOptions {
  variant?: ConfirmDialogVariant;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

interface DialogContextValue {
  confirm: ConfirmFn;
}

const DialogContext = createContext<DialogContextValue | null>(null);

interface DialogState extends Required<Pick<ConfirmDialogOptions, "title" | "confirmText" | "cancelText">> {
  description?: string;
  variant: ConfirmDialogVariant;
  position: NonNullable<ConfirmDialogOptions["position"]>;
  color?: UIColor;
  autoClose: boolean;
  autoCloseDelay: number;
  showProgress: boolean;
  open: boolean;
}

const INITIAL_STATE: DialogState = {
  open: false,
  title: "",
  description: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  variant: "default",
  position: "center",
  autoClose: false,
  autoCloseDelay: 3000,
  showProgress: false,
};

interface DialogProviderProps {
  children: ReactNode;
}

export function DialogProvider({ children }: DialogProviderProps) {
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>(INITIAL_STATE);

  const handleClose = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;

    setDialogState((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;

      setDialogState({
        open: true,
        title: options.title,
        description: options.description,
        confirmText: options.confirmText ?? "Confirm",
        cancelText: options.cancelText ?? "Cancel",
        variant: options.variant ?? "default",
        position: options.position ?? "center",
        color: options.color,
        autoClose: options.autoClose ?? false,
        autoCloseDelay: options.autoCloseDelay ?? 3000,
        showProgress: options.showProgress ?? false,
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      resolverRef.current?.(false);
      resolverRef.current = null;
    };
  }, []);

  const contextValue = useMemo<DialogContextValue>(
    () => ({
      confirm,
    }),
    [confirm],
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      <ConfirmDialog
        open={dialogState.open}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
        position={dialogState.position}
        color={dialogState.color}
        autoClose={dialogState.autoClose}
        autoCloseDelay={dialogState.autoCloseDelay}
        showProgress={dialogState.showProgress}
        onConfirm={() => handleClose(true)}
        onCancel={() => handleClose(false)}
      />
    </DialogContext.Provider>
  );
}

export function useDialogContext() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("useConfirm must be used within DialogProvider.");
  }

  return context;
}
