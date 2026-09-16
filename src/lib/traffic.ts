export function trafficPercent(used: number, limit: number): number | null {
  if (!limit || limit <= 0) return null;
  return Math.min(100, Math.max(0, (used / limit) * 100));
}

export function trafficTone(percent: number) {
  if (percent >= 100) {
    return "[&_[data-slot=progress-indicator]]:bg-status-offline";
  }
  if (percent >= 80) {
    return "[&_[data-slot=progress-indicator]]:bg-amber-500";
  }
  return "[&_[data-slot=progress-indicator]]:bg-status-online";
}
