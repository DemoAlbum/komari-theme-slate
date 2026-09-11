import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { usePingTasks } from "@/hooks/use-komari";
import { getPingRecords } from "@/lib/api";
import { t } from "@/lib/i18n";
import { summarizePing } from "@/lib/ping-summary";
import { cn } from "@/lib/utils";

const tones = [
  { text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
  { text: "text-green-600 dark:text-green-400", bar: "bg-green-500" },
  { text: "text-lime-600 dark:text-lime-400", bar: "bg-lime-400" },
  { text: "text-amber-600 dark:text-amber-400", bar: "bg-yellow-400" },
  { text: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500" },
];
function tone(value: number, metric: "latency" | "loss") {
  const limits = metric === "latency" ? [60, 120, 180, 240] : [1, 3, 6, 9];
  const index = limits.findIndex((limit) => value <= limit);
  return tones[index < 0 ? 4 : index];
}
const display = (value: number | null, metric: "latency" | "loss") =>
  value === null
    ? "—"
    : metric === "latency"
      ? `${Math.round(value)} ms`
      : `${value.toFixed(1)}%`;

export function NodePing({
  uuid,
  compact = false,
}: {
  uuid: string;
  compact?: boolean;
}) {
  const tasks = usePingTasks();
  const records = useQuery({
    queryKey: ["pingRecords", uuid, 1],
    queryFn: () => getPingRecords(uuid, 1),
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1,
  });
  const summary = useMemo(
    () => summarizePing(records.data ?? [], tasks.data ?? []),
    [records.data, tasks.data],
  );
  const stateLabel = records.isPending
    ? t("pingLoading")
    : records.isError
      ? t("pingUnavailable")
      : t("pingNoData");
  return (
    <div
      className={cn(
        "min-w-0 tabular-nums",
        compact ? "text-[10px]" : "space-y-2 text-xs",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {!compact && (
          <>
            <span className="shrink-0 text-muted-foreground">
              {t("pingNetworks")}
            </span>
            <span className="min-w-2 flex-1 border-b border-dotted border-border" />
          </>
        )}
        <div className="flex min-w-0 items-center gap-1 overflow-hidden">
          {summary.networks.length ? (
            summary.networks.slice(0, 3).map((network, index) => (
              <span
                key={network.id}
                className="inline-flex min-w-0 items-center gap-1"
                title={`${network.name}: ${display(network.latency, "latency")} · ${t("packetLoss")} ${display(network.loss, "loss")}`}
              >
                {index > 0 && <span className="text-muted-foreground">·</span>}
                <span
                  className={cn(
                    "truncate",
                    network.latency === null
                      ? "text-rose-500"
                      : tone(network.latency, "latency").text,
                  )}
                >
                  {network.latency === null
                    ? "—"
                    : `${Math.round(network.latency)}ms`}
                </span>
              </span>
            ))
          ) : (
            <span className="truncate text-muted-foreground">{stateLabel}</span>
          )}
        </div>
      </div>
      <div
        className={cn("grid", compact ? "mt-1 gap-0.5" : "grid-cols-2 gap-4")}
      >
        {(["latency", "loss"] as const).map((metric) => {
          const label =
            metric === "latency" ? t("pingLatency") : t("packetLoss");
          return (
            <div
              key={metric}
              title={`${label}: ${display(summary[metric], metric)}`}
            >
              {!compact && (
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="min-w-2 flex-1 border-b border-dotted border-border" />
                  <span className="font-medium">
                    {display(summary[metric], metric)}
                  </span>
                </div>
              )}
              <div
                className={cn(
                  "grid grid-cols-10 gap-px",
                  compact ? "h-1" : "h-1.5",
                )}
                role="img"
                aria-label={`${label}: ${display(summary[metric], metric)}`}
              >
                {summary.history.map((point) => (
                  <span
                    key={point.time}
                    className={cn(
                      "rounded-[1px]",
                      point[metric] === null
                        ? "bg-muted-foreground/15"
                        : tone(point[metric], metric).bar,
                    )}
                    title={`${new Date(point.time).toLocaleTimeString()} · ${label}: ${display(point[metric], metric)}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
