"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

type GSCState = {
  siteUrl: string;
  periodA: { startDate: string; endDate: string };
  periodB: { startDate: string; endDate: string };
  rowLimit: number;
  formattedData: string | null;
  rowCount: number | null;
  periodALabel: string | null;
  periodBLabel: string | null;
  loading: boolean;
  error: string | null;
};

function getDefaultDates() {
  const now = new Date();
  const periodAEnd = new Date(now);
  periodAEnd.setDate(periodAEnd.getDate() - 1);
  const periodAStart = new Date(periodAEnd);
  periodAStart.setDate(periodAStart.getDate() - 27);
  const periodBEnd = new Date(periodAStart);
  periodBEnd.setDate(periodBEnd.getDate() - 1);
  const periodBStart = new Date(periodBEnd);
  periodBStart.setDate(periodBStart.getDate() - 27);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return {
    periodA: { startDate: fmt(periodAStart), endDate: fmt(periodAEnd) },
    periodB: { startDate: fmt(periodBStart), endDate: fmt(periodBEnd) },
  };
}

export type GSCConnectProps = {
  onDataLoaded: (formatted: string) => void;
};

export function GSCConnect({ onDataLoaded }: GSCConnectProps) {
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState<string[]>([]);
  const [propsLoading, setPropsLoading] = useState(false);
  const [state, setState] = useState<GSCState>(() => ({
    siteUrl: "",
    ...getDefaultDates(),
    rowLimit: 5000,
    formattedData: null,
    rowCount: null,
    periodALabel: null,
    periodBLabel: null,
    loading: false,
    error: null,
  }));

  useEffect(() => {
    if (status !== "authenticated") return;
    setPropsLoading(true);
    fetch("/api/gsc/properties")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProperties(data);
        else if (data.error) setState((s) => ({ ...s, error: data.error }));
      })
      .finally(() => setPropsLoading(false));
  }, [status]);

  const pullData = useCallback(() => {
    if (!state.siteUrl) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetch("/api/gsc/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteUrl: state.siteUrl,
        periodA: state.periodA,
        periodB: state.periodB,
        rowLimit: state.rowLimit,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setState((s) => ({ ...s, loading: false, error: data.error }));
          return;
        }
        setState((s) => ({
          ...s,
          loading: false,
          formattedData: data.formatted,
          rowCount: data.rowCount,
          periodALabel: data.periodA,
          periodBLabel: data.periodB,
          error: null,
        }));
        if (data.formatted) onDataLoaded(data.formatted);
      })
      .catch((err) => {
        setState((s) => ({
          ...s,
          loading: false,
          error: err.message || "Request failed",
        }));
      });
  }, [state.siteUrl, state.periodA, state.periodB, state.rowLimit, onDataLoaded]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <section className="rounded-lg border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-accent/30">
        <p className="section-label font-mono mb-4">02 — Google Search Console</p>
        <button
          type="button"
          onClick={() => signIn("google")}
          className="rounded bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent hover:text-white"
        >
          Connect Google Search Console
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-accent/30">
      <p className="section-label font-mono mb-4">02 — Google Search Console</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/70">Connected as {session?.user?.email}</span>
        <button
          type="button"
          onClick={() => signOut()}
          className="text-xs text-white/50 underline hover:text-white/80"
        >
          Disconnect
        </button>
      </div>
      {propsLoading ? (
        <p className="mt-2 text-sm text-white/50">Loading properties…</p>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-xs text-white/60">
              Property
            </label>
            <select
              value={state.siteUrl}
              onChange={(e) => setState((s) => ({ ...s, siteUrl: e.target.value }))}
              className="w-full max-w-md rounded border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent/50"
            >
              <option value="">Select a property</option>
              {properties.map((url) => (
                <option key={url} value={url}>
                  {url}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-mono text-xs text-white/60">
                Period A
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={state.periodA.startDate}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      periodA: { ...s.periodA, startDate: e.target.value },
                    }))
                  }
                  className="flex-1 rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:border-accent"
                />
                <input
                  type="date"
                  value={state.periodA.endDate}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      periodA: { ...s.periodA, endDate: e.target.value },
                    }))
                  }
                  className="flex-1 rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-xs text-white/60">
                Period B
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={state.periodB.startDate}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      periodB: { ...s.periodB, startDate: e.target.value },
                    }))
                  }
                  className="flex-1 rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:border-accent"
                />
                <input
                  type="date"
                  value={state.periodB.endDate}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      periodB: { ...s.periodB, endDate: e.target.value },
                    }))
                  }
                  className="flex-1 rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={pullData}
              disabled={!state.siteUrl || state.loading}
              className="rounded bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50 hover:opacity-90"
            >
              {state.loading ? "Pulling…" : "Pull Data"}
            </button>
            {state.formattedData != null && state.rowCount != null && (
              <span className="flex items-center gap-1.5 text-sm text-green-400">
                <span aria-hidden>✓</span> GSC data loaded — {state.rowCount} rows
              </span>
            )}
          </div>
          {state.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}
        </div>
      )}
    </section>
  );
}
