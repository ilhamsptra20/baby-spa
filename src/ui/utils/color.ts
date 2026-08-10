import type { UIColor } from "@/ui/types/color";

type ButtonColorClass = {
  solid: string;
  soft: string;
  outline: string;
  ghost: string;
};

type FieldColorClass = {
  focus: string;
  focusWithin: string;
  focusVisible: string;
  peerFocusVisible: string;
  selectedSurface: string;
  selectedControl: string;
  radioControl: string;
  selectedDot: string;
  soft: string;
  solid: string;
  text: string;
};

export const uiColorOptions: UIColor[] = [
  "slate",
  "sky",
  "blue",
  "emerald",
  "amber",
  "rose",
  "violet",
];

export const buttonColorClasses: Record<UIColor, ButtonColorClass> = {
  slate: {
    solid: "bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:ring-slate-500 dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus-visible:ring-sky-500",
    soft: "bg-slate-100 text-slate-800 shadow-sm hover:bg-slate-200 focus-visible:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:focus-visible:ring-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400 disabled:border-slate-200 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-500 dark:disabled:border-slate-800 dark:disabled:text-slate-500",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400 disabled:text-slate-400 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-500 dark:disabled:text-slate-500",
  },
  sky: {
    solid: "bg-sky-600 text-white shadow-sm hover:bg-sky-500 focus-visible:ring-sky-500 disabled:bg-sky-300 dark:bg-sky-500 dark:hover:bg-sky-400",
    soft: "bg-sky-50 text-sky-800 shadow-sm hover:bg-sky-100 focus-visible:ring-sky-300 disabled:bg-sky-50 disabled:text-sky-400 dark:bg-sky-500/10 dark:text-sky-200 dark:hover:bg-sky-500/20 dark:focus-visible:ring-sky-500",
    outline: "border border-sky-300 bg-white text-sky-700 hover:bg-sky-50 focus-visible:ring-sky-300 disabled:border-sky-200 disabled:text-sky-400 dark:border-sky-500/40 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-sky-500/10 dark:focus-visible:ring-sky-500",
    ghost: "bg-transparent text-sky-700 hover:bg-sky-50 focus-visible:ring-sky-300 disabled:text-sky-400 dark:text-sky-200 dark:hover:bg-sky-500/10 dark:focus-visible:ring-sky-500",
  },
  blue: {
    solid: "bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:ring-blue-500 disabled:bg-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400",
    soft: "bg-blue-50 text-blue-800 shadow-sm hover:bg-blue-100 focus-visible:ring-blue-300 disabled:bg-blue-50 disabled:text-blue-400 dark:bg-blue-500/10 dark:text-blue-200 dark:hover:bg-blue-500/20 dark:focus-visible:ring-blue-500",
    outline: "border border-blue-300 bg-white text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-300 disabled:border-blue-200 disabled:text-blue-400 dark:border-blue-500/40 dark:bg-slate-900 dark:text-blue-200 dark:hover:bg-blue-500/10 dark:focus-visible:ring-blue-500",
    ghost: "bg-transparent text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-300 disabled:text-blue-400 dark:text-blue-200 dark:hover:bg-blue-500/10 dark:focus-visible:ring-blue-500",
  },
  emerald: {
    solid: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 focus-visible:ring-emerald-500 disabled:bg-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400",
    soft: "bg-emerald-50 text-emerald-800 shadow-sm hover:bg-emerald-100 focus-visible:ring-emerald-300 disabled:bg-emerald-50 disabled:text-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20 dark:focus-visible:ring-emerald-500",
    outline: "border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-300 disabled:border-emerald-200 disabled:text-emerald-400 dark:border-emerald-500/40 dark:bg-slate-900 dark:text-emerald-200 dark:hover:bg-emerald-500/10 dark:focus-visible:ring-emerald-500",
    ghost: "bg-transparent text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-300 disabled:text-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-500/10 dark:focus-visible:ring-emerald-500",
  },
  amber: {
    solid: "bg-amber-500 text-white shadow-sm hover:bg-amber-400 focus-visible:ring-amber-400 disabled:bg-amber-300 dark:bg-amber-500 dark:hover:bg-amber-400",
    soft: "bg-amber-50 text-amber-800 shadow-sm hover:bg-amber-100 focus-visible:ring-amber-300 disabled:bg-amber-50 disabled:text-amber-400 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20 dark:focus-visible:ring-amber-500",
    outline: "border border-amber-300 bg-white text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-300 disabled:border-amber-200 disabled:text-amber-400 dark:border-amber-500/40 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-amber-500/10 dark:focus-visible:ring-amber-500",
    ghost: "bg-transparent text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-300 disabled:text-amber-400 dark:text-amber-200 dark:hover:bg-amber-500/10 dark:focus-visible:ring-amber-500",
  },
  rose: {
    solid: "bg-rose-600 text-white shadow-sm hover:bg-rose-500 focus-visible:ring-rose-500 disabled:bg-rose-300 dark:bg-rose-500 dark:hover:bg-rose-400",
    soft: "bg-rose-50 text-rose-800 shadow-sm hover:bg-rose-100 focus-visible:ring-rose-300 disabled:bg-rose-50 disabled:text-rose-400 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20 dark:focus-visible:ring-rose-500",
    outline: "border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-300 disabled:border-rose-200 disabled:text-rose-400 dark:border-rose-500/40 dark:bg-slate-900 dark:text-rose-200 dark:hover:bg-rose-500/10 dark:focus-visible:ring-rose-500",
    ghost: "bg-transparent text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-300 disabled:text-rose-400 dark:text-rose-200 dark:hover:bg-rose-500/10 dark:focus-visible:ring-rose-500",
  },
  violet: {
    solid: "bg-violet-600 text-white shadow-sm hover:bg-violet-500 focus-visible:ring-violet-500 disabled:bg-violet-300 dark:bg-violet-500 dark:hover:bg-violet-400",
    soft: "bg-violet-50 text-violet-800 shadow-sm hover:bg-violet-100 focus-visible:ring-violet-300 disabled:bg-violet-50 disabled:text-violet-400 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/20 dark:focus-visible:ring-violet-500",
    outline: "border border-violet-300 bg-white text-violet-700 hover:bg-violet-50 focus-visible:ring-violet-300 disabled:border-violet-200 disabled:text-violet-400 dark:border-violet-500/40 dark:bg-slate-900 dark:text-violet-200 dark:hover:bg-violet-500/10 dark:focus-visible:ring-violet-500",
    ghost: "bg-transparent text-violet-700 hover:bg-violet-50 focus-visible:ring-violet-300 disabled:text-violet-400 dark:text-violet-200 dark:hover:bg-violet-500/10 dark:focus-visible:ring-violet-500",
  },
};

export const fieldColorClasses: Record<UIColor, FieldColorClass> = {
  slate: {
    focus: "focus:border-slate-500 focus:ring-slate-200",
    focusWithin: "focus-within:border-slate-500 focus-within:ring-slate-200",
    focusVisible: "focus-visible:border-slate-500 focus-visible:ring-slate-200",
    peerFocusVisible: "peer-focus-visible:border-slate-500 peer-focus-visible:ring-slate-200",
    selectedSurface: "has-[:checked]:border-slate-300 has-[:checked]:bg-slate-50/80 has-[:indeterminate]:border-slate-300 has-[:indeterminate]:bg-slate-50/80 dark:has-[:checked]:border-slate-500/40 dark:has-[:checked]:bg-slate-500/10 dark:has-[:indeterminate]:border-slate-500/40 dark:has-[:indeterminate]:bg-slate-500/10",
    selectedControl: "peer-checked:border-slate-900 peer-checked:bg-slate-900 peer-indeterminate:border-slate-900 peer-indeterminate:bg-slate-900 dark:peer-checked:border-slate-500 dark:peer-checked:bg-slate-700 dark:peer-indeterminate:border-slate-500 dark:peer-indeterminate:bg-slate-700",
    radioControl: "peer-checked:border-slate-900 peer-checked:bg-slate-50 dark:peer-checked:border-slate-100 dark:peer-checked:bg-slate-100/10",
    selectedDot: "bg-slate-900 dark:bg-slate-100",
    soft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    solid: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950",
    text: "text-slate-700 dark:text-slate-200",
  },
  sky: {
    focus: "focus:border-sky-500 focus:ring-sky-100",
    focusWithin: "focus-within:border-sky-500 focus-within:ring-sky-100",
    focusVisible: "focus-visible:border-sky-500 focus-visible:ring-sky-100",
    peerFocusVisible: "peer-focus-visible:border-sky-500 peer-focus-visible:ring-sky-100",
    selectedSurface: "has-[:checked]:border-sky-200 has-[:checked]:bg-sky-50/70 has-[:indeterminate]:border-sky-200 has-[:indeterminate]:bg-sky-50/70 dark:has-[:checked]:border-sky-500/30 dark:has-[:checked]:bg-sky-500/10 dark:has-[:indeterminate]:border-sky-500/30 dark:has-[:indeterminate]:bg-sky-500/10",
    selectedControl: "peer-checked:border-sky-600 peer-checked:bg-sky-600 peer-indeterminate:border-sky-600 peer-indeterminate:bg-sky-600 dark:peer-checked:border-sky-500 dark:peer-checked:bg-sky-500 dark:peer-indeterminate:border-sky-500 dark:peer-indeterminate:bg-sky-500",
    radioControl: "peer-checked:border-sky-600 peer-checked:bg-sky-50 dark:peer-checked:border-sky-500 dark:peer-checked:bg-sky-500/10",
    selectedDot: "bg-sky-600 dark:bg-sky-400",
    soft: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200",
    solid: "bg-sky-600 text-white dark:bg-sky-500",
    text: "text-sky-700 dark:text-sky-200",
  },
  blue: {
    focus: "focus:border-blue-500 focus:ring-blue-100",
    focusWithin: "focus-within:border-blue-500 focus-within:ring-blue-100",
    focusVisible: "focus-visible:border-blue-500 focus-visible:ring-blue-100",
    peerFocusVisible: "peer-focus-visible:border-blue-500 peer-focus-visible:ring-blue-100",
    selectedSurface: "has-[:checked]:border-blue-200 has-[:checked]:bg-blue-50/70 has-[:indeterminate]:border-blue-200 has-[:indeterminate]:bg-blue-50/70 dark:has-[:checked]:border-blue-500/30 dark:has-[:checked]:bg-blue-500/10 dark:has-[:indeterminate]:border-blue-500/30 dark:has-[:indeterminate]:bg-blue-500/10",
    selectedControl: "peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-indeterminate:border-blue-600 peer-indeterminate:bg-blue-600 dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-500 dark:peer-indeterminate:border-blue-500 dark:peer-indeterminate:bg-blue-500",
    radioControl: "peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-500/10",
    selectedDot: "bg-blue-600 dark:bg-blue-400",
    soft: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200",
    solid: "bg-blue-600 text-white dark:bg-blue-500",
    text: "text-blue-700 dark:text-blue-200",
  },
  emerald: {
    focus: "focus:border-emerald-500 focus:ring-emerald-100",
    focusWithin: "focus-within:border-emerald-500 focus-within:ring-emerald-100",
    focusVisible: "focus-visible:border-emerald-500 focus-visible:ring-emerald-100",
    peerFocusVisible: "peer-focus-visible:border-emerald-500 peer-focus-visible:ring-emerald-100",
    selectedSurface: "has-[:checked]:border-emerald-200 has-[:checked]:bg-emerald-50/70 has-[:indeterminate]:border-emerald-200 has-[:indeterminate]:bg-emerald-50/70 dark:has-[:checked]:border-emerald-500/30 dark:has-[:checked]:bg-emerald-500/10 dark:has-[:indeterminate]:border-emerald-500/30 dark:has-[:indeterminate]:bg-emerald-500/10",
    selectedControl: "peer-checked:border-emerald-600 peer-checked:bg-emerald-600 peer-indeterminate:border-emerald-600 peer-indeterminate:bg-emerald-600 dark:peer-checked:border-emerald-500 dark:peer-checked:bg-emerald-500 dark:peer-indeterminate:border-emerald-500 dark:peer-indeterminate:bg-emerald-500",
    radioControl: "peer-checked:border-emerald-600 peer-checked:bg-emerald-50 dark:peer-checked:border-emerald-500 dark:peer-checked:bg-emerald-500/10",
    selectedDot: "bg-emerald-600 dark:bg-emerald-400",
    soft: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
    solid: "bg-emerald-600 text-white dark:bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-200",
  },
  amber: {
    focus: "focus:border-amber-500 focus:ring-amber-100",
    focusWithin: "focus-within:border-amber-500 focus-within:ring-amber-100",
    focusVisible: "focus-visible:border-amber-500 focus-visible:ring-amber-100",
    peerFocusVisible: "peer-focus-visible:border-amber-500 peer-focus-visible:ring-amber-100",
    selectedSurface: "has-[:checked]:border-amber-200 has-[:checked]:bg-amber-50/70 has-[:indeterminate]:border-amber-200 has-[:indeterminate]:bg-amber-50/70 dark:has-[:checked]:border-amber-500/30 dark:has-[:checked]:bg-amber-500/10 dark:has-[:indeterminate]:border-amber-500/30 dark:has-[:indeterminate]:bg-amber-500/10",
    selectedControl: "peer-checked:border-amber-500 peer-checked:bg-amber-500 peer-indeterminate:border-amber-500 peer-indeterminate:bg-amber-500 dark:peer-checked:border-amber-500 dark:peer-checked:bg-amber-500 dark:peer-indeterminate:border-amber-500 dark:peer-indeterminate:bg-amber-500",
    radioControl: "peer-checked:border-amber-500 peer-checked:bg-amber-50 dark:peer-checked:border-amber-500 dark:peer-checked:bg-amber-500/10",
    selectedDot: "bg-amber-500 dark:bg-amber-400",
    soft: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
    solid: "bg-amber-500 text-white",
    text: "text-amber-700 dark:text-amber-200",
  },
  rose: {
    focus: "focus:border-rose-500 focus:ring-rose-100",
    focusWithin: "focus-within:border-rose-500 focus-within:ring-rose-100",
    focusVisible: "focus-visible:border-rose-500 focus-visible:ring-rose-100",
    peerFocusVisible: "peer-focus-visible:border-rose-500 peer-focus-visible:ring-rose-100",
    selectedSurface: "has-[:checked]:border-rose-200 has-[:checked]:bg-rose-50/70 has-[:indeterminate]:border-rose-200 has-[:indeterminate]:bg-rose-50/70 dark:has-[:checked]:border-rose-500/30 dark:has-[:checked]:bg-rose-500/10 dark:has-[:indeterminate]:border-rose-500/30 dark:has-[:indeterminate]:bg-rose-500/10",
    selectedControl: "peer-checked:border-rose-600 peer-checked:bg-rose-600 peer-indeterminate:border-rose-600 peer-indeterminate:bg-rose-600 dark:peer-checked:border-rose-500 dark:peer-checked:bg-rose-500 dark:peer-indeterminate:border-rose-500 dark:peer-indeterminate:bg-rose-500",
    radioControl: "peer-checked:border-rose-600 peer-checked:bg-rose-50 dark:peer-checked:border-rose-500 dark:peer-checked:bg-rose-500/10",
    selectedDot: "bg-rose-600 dark:bg-rose-400",
    soft: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
    solid: "bg-rose-600 text-white dark:bg-rose-500",
    text: "text-rose-700 dark:text-rose-200",
  },
  violet: {
    focus: "focus:border-violet-500 focus:ring-violet-100",
    focusWithin: "focus-within:border-violet-500 focus-within:ring-violet-100",
    focusVisible: "focus-visible:border-violet-500 focus-visible:ring-violet-100",
    peerFocusVisible: "peer-focus-visible:border-violet-500 peer-focus-visible:ring-violet-100",
    selectedSurface: "has-[:checked]:border-violet-200 has-[:checked]:bg-violet-50/70 has-[:indeterminate]:border-violet-200 has-[:indeterminate]:bg-violet-50/70 dark:has-[:checked]:border-violet-500/30 dark:has-[:checked]:bg-violet-500/10 dark:has-[:indeterminate]:border-violet-500/30 dark:has-[:indeterminate]:bg-violet-500/10",
    selectedControl: "peer-checked:border-violet-600 peer-checked:bg-violet-600 peer-indeterminate:border-violet-600 peer-indeterminate:bg-violet-600 dark:peer-checked:border-violet-500 dark:peer-checked:bg-violet-500 dark:peer-indeterminate:border-violet-500 dark:peer-indeterminate:bg-violet-500",
    radioControl: "peer-checked:border-violet-600 peer-checked:bg-violet-50 dark:peer-checked:border-violet-500 dark:peer-checked:bg-violet-500/10",
    selectedDot: "bg-violet-600 dark:bg-violet-400",
    soft: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200",
    solid: "bg-violet-600 text-white dark:bg-violet-500",
    text: "text-violet-700 dark:text-violet-200",
  },
};

export const alertColorClasses: Record<UIColor, { container: string; icon: string }> = {
  slate: {
    container: "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
    icon: "text-slate-600 dark:text-slate-300",
  },
  sky: {
    container: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100",
    icon: "text-sky-600 dark:text-sky-300",
  },
  blue: {
    container: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100",
    icon: "text-blue-600 dark:text-blue-300",
  },
  emerald: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100",
    icon: "text-emerald-600 dark:text-emerald-300",
  },
  amber: {
    container: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100",
    icon: "text-amber-600 dark:text-amber-300",
  },
  rose: {
    container: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100",
    icon: "text-rose-600 dark:text-rose-300",
  },
  violet: {
    container: "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100",
    icon: "text-violet-600 dark:text-violet-300",
  },
};
