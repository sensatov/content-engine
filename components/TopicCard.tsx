"use client";

import { useState } from "react";
import type { Topic } from "@/types/api";

type Props = { topic: Topic; index: number };

const priorityColors = {
  High: "text-green-400 border-green-400/50 bg-green-400/10",
  Medium: "text-amber-400 border-amber-400/50 bg-amber-400/10",
  Low: "text-white/50 border-white/30 bg-white/5",
};

export function TopicCard({ topic, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const priorityClass = priorityColors[topic.priority] ?? priorityColors.Low;

  return (
    <article
      className="rounded-lg border border-white/10 bg-white/[0.02] transition-all hover:border-accent/30"
      style={{
        animation: `fadeUp 0.4s ease-out ${index * 0.05}s both`,
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <span
          className="mt-1 shrink-0 text-white/40 transition-transform"
          aria-hidden
        >
          {expanded ? "▼" : "▶"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-accent/20 px-2 py-0.5 font-mono text-xs text-accent">
              {topic.pillar}
            </span>
            <span
              className={`rounded border px-2 py-0.5 font-mono text-xs ${priorityClass}`}
            >
              {topic.priority}
            </span>
            <span className="rounded border border-white/20 bg-white/5 px-2 py-0.5 font-mono text-xs text-white/70">
              {topic.searchIntent}
            </span>
            <span className="rounded border border-white/20 bg-white/5 px-2 py-0.5 font-mono text-xs text-white/70">
              {topic.contentType}
            </span>
          </div>
          <h3 className="mt-2 font-semibold text-white">{topic.title}</h3>
          <p className="mt-1 text-sm text-white/60 line-clamp-2">{topic.rationale}</p>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-white/10 px-4 pb-4 pt-2 pl-12">
          <div className="space-y-3 text-sm">
            {topic.targetKeywords?.length > 0 && (
              <div>
                <span className="font-mono text-xs text-white/50">Target keywords</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {topic.targetKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-white/80"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {topic.estimatedImpact && (
              <div>
                <span className="font-mono text-xs text-white/50">Estimated impact</span>
                <p className="mt-0.5 text-white/80">{topic.estimatedImpact}</p>
              </div>
            )}
            {topic.internalLinkingOpportunity && (
              <div>
                <span className="font-mono text-xs text-white/50">Internal linking</span>
                <p className="mt-0.5 text-white/80">{topic.internalLinkingOpportunity}</p>
              </div>
            )}
            {topic.suggestedAngle && (
              <div>
                <span className="font-mono text-xs text-white/50">Suggested angle</span>
                <p className="mt-0.5 text-white/80">{topic.suggestedAngle}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
