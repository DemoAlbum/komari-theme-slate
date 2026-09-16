import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { t } from "@/lib/i18n";

export function NodeFilters({
  groups,
  group,
  onGroupChange,
}: {
  groups: string[];
  group: string | null;
  onGroupChange: (group: string | null) => void;
}) {
  if (groups.length === 0) {
    return null;
  }

  const value = group ?? "all";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id="group-filter"
        aria-label={t("filterGroup")}
        className="flex h-9 min-w-28 items-center justify-between gap-2 rounded-lg border border-input bg-card px-2.5 py-2 text-xs font-medium shadow-xs outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="truncate">
          {value === "all" ? t("allGroups") : value}
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onGroupChange(next === "all" ? null : next)}
        >
          <DropdownMenuRadioItem value="all" closeOnClick>
            {t("allGroups")}
          </DropdownMenuRadioItem>
          {groups.map((item) => (
            <DropdownMenuRadioItem key={item} value={item} closeOnClick>
              {item}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
