"use client";

import {
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ScrollArea } from "@/ui/components/common";
import { DASHBOARD_NAVIGATION } from "@/ui/constants/routes";
import { cn } from "@/ui/utils/cn";

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  href?: string;
  shortcut?: string;
  onSelect?: () => void;
}

interface CommandPaletteProps {
  commands?: CommandPaletteItem[];
  placeholder?: string;
}

function createDefaultCommands(): CommandPaletteItem[] {
  return [
    ...DASHBOARD_NAVIGATION.map((route) => ({
      id: route.href,
      label: route.label,
      description: `Go to ${route.label.toLowerCase()} page`,
      href: route.href,
    })),
    {
      id: "docs",
      label: "Component Docs",
      description: "Open internal UI component documentation",
      href: "/docs",
    },
  ];
}

export function CommandPalette({
  commands = createDefaultCommands(),
  placeholder = "Search commands...",
}: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return commands;
    }

    return commands.filter((command) => {
      return (
        command.label.toLowerCase().includes(normalized) ||
        command.description?.toLowerCase().includes(normalized)
      );
    });
  }, [commands, query]);

  function openPalette() {
    setQuery("");
    setHighlightedIndex(0);
    setOpen(true);
  }

  function closePalette() {
    setOpen(false);
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openPalette();
      }

      if (event.key === "Escape") {
        closePalette();
      }
    }

    function handleOpenEvent() {
      openPalette();
    }

    window.addEventListener("keydown", handleShortcut);
    window.addEventListener("ui:command-palette-open", handleOpenEvent as EventListener);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
      window.removeEventListener("ui:command-palette-open", handleOpenEvent as EventListener);
    };
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    itemRefs.current[highlightedIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [open, highlightedIndex, filteredCommands]);

  function selectCommand(command: CommandPaletteItem) {
    command.onSelect?.();

    if (command.href) {
      router.push(command.href);
    }

    closePalette();
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(filteredCommands.length, 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + Math.max(filteredCommands.length, 1)) % Math.max(filteredCommands.length, 1),
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const command = filteredCommands[highlightedIndex];
      if (command) {
        selectCommand(command);
      }
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[150] flex items-start justify-center px-4 pt-[12vh] transition-[visibility] duration-200",
        open ? "pointer-events-auto visible" : "pointer-events-none invisible",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={cn("absolute inset-0 bg-slate-900 dark:bg-slate-950/45", open ? "ui-overlay-enter" : "ui-overlay-exit")}
        onClick={closePalette}
        aria-label="Close command palette"
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl",
          open ? "ui-modal-enter-top" : "ui-modal-exit-top",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 px-4 py-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={onKeyDown}
            className="h-10 w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:text-slate-500"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={closePalette}
            className="rounded-md p-1 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <ScrollArea className="p-2" viewportClassName="max-h-[60vh]" fadeEdges hideScrollbarUntilHover>
          {filteredCommands.length === 0 ? (
            <p className="rounded-md px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">No matching command.</p>
          ) : (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectCommand(command)}
                className={cn(
                  "flex w-full items-start justify-between gap-3 rounded-md px-3 py-2.5 text-left transition",
                  highlightedIndex === index ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/70 dark:bg-slate-900/60",
                )}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">{command.label}</span>
                  {command.description ? (
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{command.description}</span>
                  ) : null}
                </span>

                {command.shortcut ? (
                  <span className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                    {command.shortcut}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
