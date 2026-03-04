import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: err || "Failed to fetch sites" },
        { status: res.status }
      );
    }

    const data = (await res.json()) as { siteEntry?: { siteUrl: string }[] };
    const sites = (data.siteEntry ?? []).map((e) => e.siteUrl).filter(Boolean);
    return NextResponse.json(sites);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Request failed" },
      { status: 500 }
    );
  }
}
