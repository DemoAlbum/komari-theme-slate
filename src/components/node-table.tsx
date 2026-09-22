import { Link } from "@tanstack/react-router";
import {
  getCoreRowModel,
  legacyCreateColumnHelper,
  useLegacyTable,
} from "@tanstack/react-table/legacy";
import { Server } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { LiveUptime } from "@/components/live-uptime";
import { NodePing } from "@/components/node-ping";
import { Progress } from "@/components/ui/progress";
import { formatBytes, formatSpeed } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { NodeRow } from "@/lib/nodes";
import { regionToFlagIconSrc } from "@/lib/region";
import type { ThemeSettings } from "@/lib/schemas";
import { trafficPercent, trafficTone } from "@/lib/traffic";
import { cn } from "@/lib/utils";

const columnHelper = legacyCreateColumnHelper<NodeRow>();

const TABLE_COLUMNS = [
  { id: "name", width: 120, setting: "showTableName" },
  { id: "online", width: 60, setting: "showTableStatus" },
  { id: "system", width: 60, setting: "showTableSystem" },
  { id: "uptime", width: 90, setting: "showTableUptime" },
  { id: "cpuUsage", width: 100, setting: "showTableCpu" },
  { id: "memoryUsage", width: 100, setting: "showTableMemory" },
  { id: "diskUsage", width: 100, setting: "showTableDisk" },
  { id: "speed", width: 120, setting: "showTableSpeed" },
  { id: "traffic", width: 130, setting: "showTableTraffic" },
  { id: "ping", width: 160, setting: "showTablePing" },
] as const;

const SYSTEM_ICON_MAPPINGS = [
  ["almalinux", "almalinux"],
  ["alpine", "alpine"],
  ["archcraft", "archcraft"],
  ["archlabs", "archlabs"],
  ["arcolinux", "arcolinux"],
  ["arch", "arch"],
  ["artix", "artix"],
  ["centos", "centos"],
  ["coreos", "coreos"],
  ["debian", "debian"],
  ["deepin", "deepin"],
  ["devuan", "devuan"],
  ["elementary", "elementary"],
  ["endeavour", "endeavour"],
  ["fedora", "fedora"],
  ["freebsd", "freebsd"],
  ["garuda", "garuda"],
  ["gentoo", "gentoo"],
  ["kali", "kali"],
  ["kubuntu", "kubuntu"],
  ["linux mint", "linuxmint"],
  ["mageia", "mageia"],
  ["mandriva", "mandriva"],
  ["manjaro", "manjaro"],
  ["mx linux", "mxlinux"],
  ["nixos", "nixos"],
  ["nobara", "nobara"],
  ["openbsd", "openbsd"],
  ["opensuse", "opensuse"],
  ["pop!_os", "popos"],
  ["pop os", "popos"],
  ["raspbian", "raspberrypi"],
  ["raspberry", "raspberrypi"],
  ["red hat", "redhat"],
  ["redhat", "redhat"],
  ["rocky", "rockylinux"],
  ["slackware", "slackware"],
  ["solus", "solus"],
  ["windows", "windows"],
  ["ubuntu", "ubuntu"],
  ["void", "void"],
  ["zorin", "zorin"],
  ["darwin", "apple"],
  ["macos", "apple"],
  ["mac os", "apple"],
] as const;

/** Resolves an OS string to the bundled colored SVG icon under /assets/os-icons. */
function systemIconSrc(system: string) {
  const normalized = system.toLowerCase();
  const key =
    SYSTEM_ICON_MAPPINGS.find(([name]) => normalized.includes(name))?.[1] ??
    "tux";
  return `/assets/os-icons/${key}.svg`;
}

function NetworkCell({ down, up }: { down: string; up: string }) {
  return (
    <span className="grid gap-0.5 text-xs leading-4 tabular-nums">
      <span className="flex min-w-0 items-center gap-1.5" title={`↓ ${down}`}>
        <span className="shrink-0 text-status-online">↓</span>
        <span className="truncate">{down}</span>
      </span>
      <span className="flex min-w-0 items-center gap-1.5" title={`↑ ${up}`}>
        <span className="shrink-0 text-data-accent">↑</span>
        <span className="truncate">{up}</span>
      </span>
    </span>
  );
}

function UsageCell({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-muted-foreground">—</span>;
  }

  const tone =
    value >= 85
      ? "[&_[data-slot=progress-indicator]]:bg-status-offline"
      : value >= 65
        ? "[&_[data-slot=progress-indicator]]:bg-amber-500"
        : "[&_[data-slot=progress-indicator]]:bg-status-online";

  return (
    <div className="w-full min-w-16 max-w-24">
      <span className="block text-xs font-medium text-foreground">
        {value.toFixed(2)}%
      </span>
      <Progress
        value={value}
        aria-label={`${value.toFixed(2)}%`}
        className={cn("mt-1 gap-0", tone)}
      />
    </div>
  );
}

function TrafficCell({
  down,
  up,
  used,
  limit,
  resetDay,
}: {
  down: string;
  up: string;
  used: number;
  limit: number;
  resetDay: number | null;
}) {
  const percent = trafficPercent(used, limit);
  const resetTitle = resetDay
    ? t("trafficResetsOnDay").replace("{day}", String(resetDay))
    : undefined;

  return (
    <div className="grid gap-1" title={resetTitle}>
      <NetworkCell down={down} up={up} />
      {percent === null ? null : (
        <div className="w-full min-w-16 max-w-24">
          <Progress
            value={percent}
            aria-label={`${t("colTraffic")} ${percent.toFixed(0)}%`}
            className={cn("gap-0", trafficTone(percent))}
          />
          <span className="mt-0.5 block text-[10px] text-muted-foreground">
            {percent.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}

export function NodeTable({
  rows,
  sortKey,
  showUptime,
  settings,
}: {
  rows: NodeRow[];
  sortKey: string;
  showUptime: boolean;
  settings?: ThemeSettings;
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: t("colName"),
        cell: (info) => {
          const flag = regionToFlagIconSrc(info.row.original.region);
          return (
            <Link
              to="/instance/$uuid"
              params={{ uuid: info.row.original.uuid }}
              title={info.getValue()}
              className="inline-flex max-w-full min-w-0 items-center gap-2 font-medium text-foreground hover:text-data-accent"
            >
              <span
                className="flex size-5 shrink-0 items-center justify-center"
                aria-hidden="true"
              >
                {flag ? (
                  <img
                    src={flag}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-3.5 w-5 rounded-[2px] object-cover shadow-[0_0_0_1px_rgb(0_0_0_/_8%)]"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <Server className="size-3.5 text-muted-foreground" />
                )}
              </span>
              <span className="truncate">{info.getValue()}</span>
            </Link>
          );
        },
      }),
      columnHelper.accessor("online", {
        header: t("colStatus"),
        cell: (info) => (
          <span
            className="inline-flex size-6 items-center justify-center"
            role="img"
            aria-label={info.getValue() ? t("online") : t("offline")}
            title={info.getValue() ? t("online") : t("offline")}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                info.getValue()
                  ? "km-status-pulse bg-status-online"
                  : "bg-status-offline",
              )}
            />
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.client.os, {
        id: "system",
        header: t("colSystem"),
        cell: (info) => {
          const system = info.getValue();
          return system ? (
            <span
              className="inline-flex size-6 items-center justify-center text-muted-foreground"
              role="img"
              aria-label={system}
              title={system}
            >
              <img
                src={systemIconSrc(system)}
                alt=""
                loading="lazy"
                decoding="async"
                className="size-4"
                onError={(event) => {
                  event.currentTarget.src = "/assets/os-icons/tux.svg";
                }}
              />
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      }),
      columnHelper.accessor("uptime", {
        header: t("colUptime"),
        cell: (info) => (
          <LiveUptime
            uptime={info.getValue()}
            reportedAt={info.row.original.status?.time}
            className="text-xs text-foreground"
          />
        ),
      }),
      columnHelper.accessor("cpuUsage", {
        header: t("cpu"),
        cell: (info) => <UsageCell value={info.getValue()} />,
      }),
      columnHelper.accessor("memoryUsage", {
        header: t("memory"),
        cell: (info) => <UsageCell value={info.getValue()} />,
      }),
      columnHelper.accessor("diskUsage", {
        header: t("disk"),
        cell: (info) => <UsageCell value={info.getValue()} />,
      }),
      columnHelper.display({
        id: "speed",
        header: t("colSpeed"),
        cell: (info) => (
          <NetworkCell
            down={formatSpeed(info.row.original.netIn)}
            up={formatSpeed(info.row.original.netOut)}
          />
        ),
      }),
      columnHelper.display({
        id: "traffic",
        header: t("colTraffic"),
        cell: (info) => (
          <TrafficCell
            down={formatBytes(info.row.original.totalDown)}
            up={formatBytes(info.row.original.totalUp)}
            used={info.row.original.traffic}
            limit={info.row.original.trafficLimit}
            resetDay={info.row.original.trafficResetDay}
          />
        ),
      }),
      columnHelper.display({
        id: "ping",
        header: t("pingNetworks"),
        cell: (info) => <NodePing uuid={info.row.original.uuid} compact />,
      }),
    ],
    [],
  );

  const visibleColumns = TABLE_COLUMNS.filter(
    (column) =>
      (settings?.[column.setting] ?? true) &&
      (column.id !== "uptime" || showUptime),
  );
  if (visibleColumns.length === 0) visibleColumns.push(TABLE_COLUMNS[0]);
  const totalWidth = visibleColumns.reduce(
    (sum, column) => sum + column.width,
    0,
  );
  const columnVisibility = Object.fromEntries(
    TABLE_COLUMNS.map((column) => [
      column.id,
      visibleColumns.some((visible) => visible.id === column.id),
    ]),
  );

  const table = useLegacyTable({
    data: rows,
    state: { columnVisibility },
    columns: columns as never,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
      <table
        className="km-ui-table w-full table-fixed text-left text-sm"
        style={{ minWidth: totalWidth }}
      >
        <colgroup>
          {visibleColumns.map((column) => (
            <col
              key={column.id}
              style={{ width: `${(column.width / totalWidth) * 100}%` }}
            />
          ))}
        </colgroup>
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const label = header.isPlaceholder
                  ? null
                  : typeof header.column.columnDef.header === "function"
                    ? header.column.columnDef.header(header.getContext())
                    : header.column.columnDef.header;

                return (
                  <th
                    key={header.id}
                    className={cn(
                      "px-3 py-3 font-medium tracking-wide",
                      (header.column.id === "online" ||
                        header.column.id === "system") &&
                        "px-2 text-center",
                    )}
                  >
                    <span className="block truncate">{label}</span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => (
            <tr
              key={`${sortKey}:${row.original.uuid}`}
              className={cn(
                "km-sort-item km-ui-table-row border-t border-border transition-colors hover:bg-muted/35",
                !row.original.online && "[--km-sort-opacity:0.5]",
              )}
              style={{ animationDelay: `${Math.min(index, 10) * 18}ms` }}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cn(
                    "km-metric overflow-hidden px-3 py-2.5 text-ellipsis whitespace-nowrap",
                    (cell.column.id === "online" ||
                      cell.column.id === "system") &&
                      "px-1 text-center [text-overflow:clip]",
                  )}
                >
                  {typeof cell.column.columnDef.cell === "function"
                    ? cell.column.columnDef.cell(cell.getContext())
                    : (cell.getValue() as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
