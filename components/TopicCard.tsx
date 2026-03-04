"use client";

import { useState } from "react";
import type { Topic } from "@/types/api";

type Props = { topic: Topic; index: number };

const priorityColors = {
  High: "text-green-700 border-green-300 bg-green-50",
  Medium: "text-amber-700 border-amber-300 bg-amber-50",
  Low: "text-optidge-text-muted border-gray-300 bg-gray-100",
};

export function TopicCard({ topic, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const priorityClass = priorityColors[topic.priority] ?? priorityColors.Low;

  return (
    <article
      className="rounded-lg border border-gray-200 bg-optidge-green-pale/30 transition-all hover:border-accent/40"
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
          className="mt-1 shrink-0 text-optidge-text-muted transition-transform"
          aria-hidden
        >
          {expanded ? "▼" : "▶"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-optidge-green-soft px-2 py-0.5 font-mono text-xs text-optidge-text">
              {topic.pillar}
            </span>
            <span
              className={`rounded border px-2 py-0.5 font-mono text-xs ${priorityClass}`}
            >
              {topic.priority}
            </span>
            <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-xs text-optidge-text-muted">
              {topic.searchIntent}
            </span>
            <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-xs text-optidge-text-muted">
              {topic.contentType}
            </span>
            {topic.optimizationOpportunity && (
              <span className="rounded border border-accent bg-optidge-green-soft px-2 py-0.5 font-mono text-xs text-accent">
                Optimization
              </span>
            )}
          </div>
          <h3 className="mt-2 font-semibold text-optidge-text">{topic.title}</h3>
          <p className="mt-1 text-sm text-optidge-text-muted line-clamp-2">{topic.rationale}</p>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-gray-200 px-4 pb-4 pt-2 pl-12">
          <div className="space-y-3 text-sm">
            {topic.targetKeywords?.length > 0 && (
              <div>
                <span className="font-mono text-xs text-optidge-text-muted">Target keywords</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {topic.targetKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-optidge-text"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {topic.estimatedImpact && (
              <div>
                <span className="font-mono text-xs text-optidge-text-muted">Estimated impact</span>
                <p className="mt-0.5 text-optidge-text">{topic.estimatedImpact}</p>
              </div>
            )}
            {topic.internalLinkingOpportunity && (
              <div>
                <span className="font-mono text-xs text-optidge-text-muted">Internal linking</span>
                <p className="mt-0.5 text-optidge-text">{topic.internalLinkingOpportunity}</p>
              </div>
            )}
            {topic.suggestedAngle && (
              <div>
                <span className="font-mono text-xs text-optidge-text-muted">Suggested angle</span>
                <p className="mt-0.5 text-optidge-text">{topic.suggestedAngle}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
