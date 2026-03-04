"use client";

import type { Topic } from "@/types/api";

type Props = { topics: Topic[] };

function escapeCsvCell(value: string): string {
  const s = String(value ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function ExportButton({ topics }: Props) {
  const download = () => {
    const headers = [
      "Title",
      "Pillar",
      "Priority",
      "Search Intent",
      "Content Type",
      "Optimization",
      "Target Keywords",
      "Rationale",
      "Estimated Impact",
      "Suggested Angle",
    ];
    const rows = topics.map((t) => [
      t.title,
      t.pillar,
      t.priority,
      t.searchIntent,
      t.contentType,
      t.optimizationOpportunity ? "Yes" : "No",
      Array.isArray(t.targetKeywords) ? t.targetKeywords.join("; ") : "",
      t.rationale,
      t.estimatedImpact,
      t.suggestedAngle,
    ]);
    const csv = [headers.map(escapeCsvCell).join(",")]
      .concat(rows.map((row) => row.map(escapeCsvCell).join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "content-engine-topics.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={download}
      className="rounded border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
    >
      Export to CSV
    </button>
  );
}
