"use client";

import { useState, useCallback } from "react";
import { ClientConfig, type ClientConfigState } from "@/components/ClientConfig";
import { GSCConnect } from "@/components/GSCConnect";
import {
  FileUpload,
  initialFileUploadState,
  type FileUploadState,
} from "@/components/FileUpload";
import { GenerateButton } from "@/components/GenerateButton";
import { ResultsSummary } from "@/components/ResultsSummary";
import { TopicCard } from "@/components/TopicCard";
import {
  TopicFilters,
  filterAndSortTopics,
  type FilterState,
} from "@/components/TopicFilters";
import { ExportButton } from "@/components/ExportButton";
import { Providers } from "@/components/Providers";
import type { GenerateResponse, Topic } from "@/types/api";

const initialFilterState: FilterState = {
  pillar: "",
  priority: "",
  contentType: "",
  sortBy: "priority",
};

export default function ContentEnginePage() {
  const [view, setView] = useState<"config" | "results">("config");
  const [clientConfig, setClientConfig] = useState<ClientConfigState>({
    clientName: "",
    clientUrl: "",
    pillars: [],
  });
  const [gscData, setGscData] = useState("");
  const [fileUpload, setFileUpload] = useState<FileUploadState>(initialFileUploadState);
  const [additionalContext, setAdditionalContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [filter, setFilter] = useState<FilterState>(initialFilterState);

  const hasGsc = gscData.length > 0;
  const hasAnyFile =
    fileUpload.semrushClient.files.length > 0 ||
    fileUpload.semrushCompetitor.files.length > 0 ||
    fileUpload.pastCalendars.files.length > 0 ||
    fileUpload.other.files.length > 0;
  const hasDataSource = hasGsc || hasAnyFile;
  const hasClientName = clientConfig.clientName.trim().length > 0;
  const hasPillar = clientConfig.pillars.length > 0;
  const canGenerate = hasClientName && hasPillar && hasDataSource;

  const missingRequirements: string[] = [];
  if (!hasClientName) missingRequirements.push("client name");
  if (!hasPillar) missingRequirements.push("at least one service pillar");
  if (!hasDataSource) missingRequirements.push("GSC data or at least one uploaded file");

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientConfig.clientName.trim(),
          clientUrl: clientConfig.clientUrl.trim(),
          pillars: clientConfig.pillars,
          gscData: gscData || undefined,
          semrushClientData: fileUpload.semrushClient.text || undefined,
          semrushCompetitorData: fileUpload.semrushCompetitor.text || undefined,
          pastCalendars: fileUpload.pastCalendars.text || undefined,
          otherData: fileUpload.other.text || undefined,
          additionalContext: additionalContext.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
        return;
      }
      setResult(data as GenerateResponse);
      setView("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [
    canGenerate,
    clientConfig,
    gscData,
    fileUpload,
    additionalContext,
  ]);

  const topics = result?.topics ?? [];
  const filteredTopics = filterAndSortTopics(topics, filter);

  const highCount = topics.filter((t) => t.priority === "High").length;
  const mediumCount = topics.filter((t) => t.priority === "Medium").length;
  const lowCount = topics.filter((t) => t.priority === "Low").length;
  const typeCounts = topics.reduce<Record<string, number>>((acc, t) => {
    const c = t.contentType || "Other";
    acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Providers>
      <div className="min-h-screen bg-background">
        <header className="border-b border-white/10 px-6 py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <h1 className="font-mono text-lg font-medium tracking-tight text-white">
              ContentEngine
            </h1>
            {view === "results" && (
              <button
                type="button"
                onClick={() => setView("config")}
                className="text-sm text-white/70 hover:text-accent"
              >
                ← New Analysis
              </button>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-6 py-8">
          {view === "config" && (
            <>
              <ClientConfig value={clientConfig} onChange={setClientConfig} />
              <div className="mt-6">
                <GSCConnect onDataLoaded={setGscData} />
              </div>
              <div className="mt-6">
                <FileUpload state={fileUpload} onChange={setFileUpload} />
              </div>
              <div className="mt-6">
                <section className="rounded-lg border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-accent/30">
                  <p className="section-label font-mono mb-4">
                    04 — Additional Context (Optional)
                  </p>
                  <textarea
                    placeholder="Any additional notes — upcoming campaigns, seasonal focus, topics to avoid, specific goals for next month, target audience details..."
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    rows={4}
                    className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-white placeholder-white/40 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/50"
                  />
                </section>
              </div>
              {error && (
                <div className="mt-4 rounded border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  {error}
                  <span className="ml-2 inline-flex gap-2">
                    <button
                      type="button"
                      onClick={handleGenerate}
                      className="underline hover:no-underline"
                    >
                      Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="underline hover:no-underline"
                    >
                      Dismiss
                    </button>
                  </span>
                </div>
              )}
              <GenerateButton
                disabled={!canGenerate}
                loading={loading}
                missingRequirements={missingRequirements}
                onGenerate={handleGenerate}
              />
            </>
          )}

          {view === "results" && result && (
            <>
              <ResultsSummary dataSummary={result.dataSummary} />
              <div className="mt-6 flex flex-wrap gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div className="text-green-400">
                  <span className="font-mono text-xs text-white/50">High</span>{" "}
                  {highCount}
                </div>
                <div className="text-amber-400">
                  <span className="font-mono text-xs text-white/50">Medium</span>{" "}
                  {mediumCount}
                </div>
                <div className="text-white/50">
                  <span className="font-mono text-xs text-white/50">Low</span>{" "}
                  {lowCount}
                </div>
                <div className="text-accent">
                  <span className="font-mono text-xs text-white/50">Total</span>{" "}
                  {topics.length}
                </div>
                {Object.entries(typeCounts).map(([type, count]) => (
                  <div key={type} className="text-white/70">
                    <span className="font-mono text-xs text-white/50">{type}</span>{" "}
                    {count}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <TopicFilters
                  topics={topics}
                  filter={filter}
                  onFilterChange={setFilter}
                />
                <ExportButton topics={filteredTopics} />
              </div>
              <ul className="mt-6 space-y-3">
                {filteredTopics.map((topic, i) => (
                  <li key={topic.title + i}>
                    <TopicCard topic={topic} index={i} />
                  </li>
                ))}
              </ul>
            </>
          )}

          {view === "results" && !result && (
            <p className="text-white/60">No results to show.</p>
          )}
        </main>
      </div>
    </Providers>
  );
}
