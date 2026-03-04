import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { normalizeGSCRows, formatGSCDataForAI, type GSCRow } from "@/lib/formatGSCData";

type SearchAnalyticsRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

async function fetchSearchAnalytics(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  rowLimit: number
): Promise<GSCRow[]> {
  const encodedSite = encodeURIComponent(siteUrl);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ["query", "page"],
      rowLimit,
      startRow: 0,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Search analytics request failed");
  }

  const data = (await res.json()) as { rows?: SearchAnalyticsRow[] };
  const rows = data.rows ?? [];
  return normalizeGSCRows(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: {
    siteUrl: string;
    periodA: { startDate: string; endDate: string };
    periodB: { startDate: string; endDate: string };
    rowLimit?: number;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { siteUrl, periodA, periodB, rowLimit = 5000 } = body;
  if (!siteUrl || !periodA?.startDate || !periodA?.endDate || !periodB?.startDate || !periodB?.endDate) {
    return NextResponse.json(
      { error: "siteUrl, periodA, and periodB with startDate/endDate are required" },
      { status: 400 }
    );
  }

  try {
    const [rowsA, rowsB] = await Promise.all([
      fetchSearchAnalytics(token, siteUrl, periodA.startDate, periodA.endDate, rowLimit),
      fetchSearchAnalytics(token, siteUrl, periodB.startDate, periodB.endDate, rowLimit),
    ]);

    const periodALabel = `${periodA.startDate} to ${periodA.endDate}`;
    const periodBLabel = `${periodB.startDate} to ${periodB.endDate}`;
    const formatted = formatGSCDataForAI(rowsA, rowsB, periodALabel, periodBLabel);

    return NextResponse.json({
      formatted,
      rowCount: rowsA.length,
      periodA: periodALabel,
      periodB: periodBLabel,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "GSC request failed" },
      { status: 500 }
    );
  }
}
