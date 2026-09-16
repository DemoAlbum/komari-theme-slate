const TAG_TONES = [
  "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
] as const;

const NAMED_TAG_TONES: Record<string, string> = {
  red: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
  orange:
    "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  amber:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  yellow:
    "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  lime: "border-lime-500/20 bg-lime-500/10 text-lime-700 dark:text-lime-300",
  green:
    "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300",
  emerald:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  teal: "border-teal-500/20 bg-teal-500/10 text-teal-700 dark:text-teal-300",
  cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  sky: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  blue: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  indigo:
    "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  violet:
    "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  purple:
    "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  fuchsia:
    "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  pink: "border-pink-500/20 bg-pink-500/10 text-pink-700 dark:text-pink-300",
  rose: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  gray: "border-gray-500/20 bg-gray-500/10 text-gray-700 dark:text-gray-300",
  grey: "border-gray-500/20 bg-gray-500/10 text-gray-700 dark:text-gray-300",
  slate:
    "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

export function tagTone(label: string, explicitColor?: string | null) {
  if (explicitColor) {
    const named = NAMED_TAG_TONES[explicitColor.toLowerCase()];
    if (named) return named;
  }
  let hash = 0;
  for (let index = 0; index < label.length; index += 1) {
    hash = (hash * 31 + label.charCodeAt(index)) | 0;
  }
  return TAG_TONES[Math.abs(hash) % TAG_TONES.length];
}
