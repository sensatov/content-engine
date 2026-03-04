export type GSCRow = {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GSCRowWithDeltas = GSCRow & {
  clicks_b?: number;
  impressions_b?: number;
  ctr_b?: number;
  position_b?: number;
  clicks_change?: number;
  impressions_change?: number;
  position_change?: number;
};

/**
 * Merge period A and period B GSC results by query+page and compute deltas.
 * Format as a readable table string for the AI prompt.
 */
export function formatGSCDataForAI(
  rowsA: GSCRow[],
  rowsB: GSCRow[],
  periodALabel: string,
  periodBLabel: string
): string {
  const key = (r: GSCRow) => `${r.query}\t${r.page}`;
  const mapB = new Map(rowsB.map((r) => [key(r), r]));

  const merged: GSCRowWithDeltas[] = rowsA.map((a) => {
    const b = mapB.get(key(a));
    const clicksB = b?.clicks ?? 0;
    const impressionsB = b?.impressions ?? 0;
    const positionB = b?.position ?? 0;
    return {
      ...a,
      clicks_b: clicksB,
      impressions_b: impressionsB,
      ctr_b: b?.ctr ?? 0,
      position_b: positionB,
      clicks_change: a.clicks - clicksB,
      impressions_change: a.impressions - impressionsB,
      position_change: b != null ? a.position - positionB : undefined,
    };
  });

  const lines: string[] = [
    `Period A: ${periodALabel} | Period B: ${periodBLabel}`,
    "---",
    "query\tpage\tclicks(A)\timpressions(A)\tctr(A)\tposition(A)\tclicks(B)\timpressions(B)\tposition(B)\tclicks_change\timpressions_change\tposition_change",
  ];

  for (const r of merged) {
    lines.push(
      [
        r.query,
        r.page,
        r.clicks,
        r.impressions,
        r.ctr.toFixed(2),
        r.position.toFixed(1),
        r.clicks_b ?? "",
        r.impressions_b ?? "",
        r.position_b != null ? r.position_b.toFixed(1) : "",
        r.clicks_change ?? "",
        r.impressions_change ?? "",
        r.position_change != null ? r.position_change.toFixed(1) : "",
      ].join("\t")
    );
  }

  return lines.join("\n");
}

/**
 * Normalize GSC API response rows to a common shape.
 */
export function normalizeGSCRows(apiRows: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[]): GSCRow[] {
  return apiRows.map((row) => {
    const [query = "", page = ""] = row.keys;
    return {
      query,
      page,
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    };
  });
}
