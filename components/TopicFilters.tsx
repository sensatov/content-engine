"use client";

import type { Topic } from "@/types/api";

export type FilterState = {
  pillar: string;
  priority: string;
  contentType: string;
  sortBy: "priority" | "pillar" | "contentType";
};

type Props = {
  topics: Topic[];
  filter: FilterState;
  onFilterChange: (f: FilterState) => void;
};

const PRIORITIES = ["High", "Medium", "Low"];
const SORT_OPTIONS: { value: FilterState["sortBy"]; label: string }[] = [
  { value: "priority", label: "Priority" },
  { value: "pillar", label: "Pillar" },
  { value: "contentType", label: "Content type" },
];

export function TopicFilters({ topics, filter, onFilterChange }: Props) {
  const pillars = Array.from(
    new Set(topics.map((t) => t.pillar).filter(Boolean))
  ).sort();
  const contentTypes = Array.from(
    new Set(topics.map((t) => t.contentType).filter(Boolean))
  ).sort();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-white/50">Pillar</span>
        <select
          value={filter.pillar}
          onChange={(e) =>
            onFilterChange({ ...filter, pillar: e.target.value })
          }
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:border-accent"
        >
          <option value="">All</option>
          {pillars.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-white/50">Priority</span>
        <select
          value={filter.priority}
          onChange={(e) =>
            onFilterChange({ ...filter, priority: e.target.value })
          }
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:border-accent"
        >
          <option value="">All</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-white/50">Content type</span>
        <select
          value={filter.contentType}
          onChange={(e) =>
            onFilterChange({ ...filter, contentType: e.target.value })
          }
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:border-accent"
        >
          <option value="">All</option>
          {contentTypes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-white/50">Sort by</span>
        <select
          value={filter.sortBy}
          onChange={(e) =>
            onFilterChange({
              ...filter,
              sortBy: e.target.value as FilterState["sortBy"],
            })
          }
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:border-accent"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function filterAndSortTopics(
  topics: Topic[],
  filter: FilterState
): Topic[] {
  let result = [...topics];
  if (filter.pillar) {
    result = result.filter((t) => t.pillar === filter.pillar);
  }
  if (filter.priority) {
    result = result.filter((t) => t.priority === filter.priority);
  }
  if (filter.contentType) {
    result = result.filter((t) => t.contentType === filter.contentType);
  }
  const order = { High: 0, Medium: 1, Low: 2 };
  switch (filter.sortBy) {
    case "priority":
      result.sort(
        (a, b) =>
          (order[a.priority] ?? 2) - (order[b.priority] ?? 2) ||
          a.title.localeCompare(b.title)
      );
      break;
    case "pillar":
      result.sort(
        (a, b) =>
          a.pillar.localeCompare(b.pillar) || a.title.localeCompare(b.title)
      );
      break;
    case "contentType":
      result.sort(
        (a, b) =>
          a.contentType.localeCompare(b.contentType) ||
          a.title.localeCompare(b.title)
      );
      break;
  }
  return result;
}
