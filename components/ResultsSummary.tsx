"use client";

import type { DataSummary } from "@/types/api";

type Props = { dataSummary: DataSummary };

const SECTIONS: { key: keyof DataSummary; label: string }[] = [
  { key: "gscInsights", label: "GSC Insights" },
  { key: "semrushInsights", label: "SEMrush Insights" },
  { key: "competitorInsights", label: "Competitor Insights" },
  { key: "contentGaps", label: "Content Gaps" },
];

export function ResultsSummary({ dataSummary }: Props) {
  return (
    <section className="rounded-lg border border-accent/40 bg-optidge-green-pale/50 p-6">
      <p className="section-label font-mono mb-4">Data summary</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SECTIONS.map(({ key, label }) => (
          <div key={key} className="rounded border border-gray-200 bg-white p-4">
            <h3 className="font-mono text-xs font-medium uppercase tracking-wider text-accent">
              {label}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-optidge-text">
              {dataSummary[key] || "—"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
