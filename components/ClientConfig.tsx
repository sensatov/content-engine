"use client";

import { useState, useCallback, KeyboardEvent } from "react";

const PILLAR_SUGGESTIONS = [
  "SEO Services",
  "Web Design",
  "PPC Management",
  "Content Marketing",
  "Social Media",
  "Email Marketing",
  "Branding",
  "Analytics",
  "E-commerce",
  "Local SEO",
  "Link Building",
  "CRO",
];

export type ClientConfigState = {
  clientName: string;
  clientUrl: string;
  /** E-commerce vs service/non-ecommerce — affects content type suggestions (e.g. Collection Page). */
  clientType: "ecommerce" | "non-ecommerce";
  pillars: string[];
};

type Props = {
  value: ClientConfigState;
  onChange: (value: ClientConfigState) => void;
};

export function ClientConfig({ value, onChange }: Props) {
  const [pillarInput, setPillarInput] = useState("");

  const addPillar = useCallback(
    (pillar: string) => {
      const trimmed = pillar.trim();
      if (!trimmed || value.pillars.includes(trimmed)) return;
      onChange({ ...value, pillars: [...value.pillars, trimmed] });
      setPillarInput("");
    },
    [value, onChange]
  );

  const removePillar = useCallback(
    (index: number) => {
      onChange({
        ...value,
        pillars: value.pillars.filter((_, i) => i !== index),
      });
    },
    [value, onChange]
  );

  const onPillarKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPillar(pillarInput);
    }
  };

  const availableSuggestions = PILLAR_SUGGESTIONS.filter(
    (s) => !value.pillars.includes(s)
  ).slice(0, 6);

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-accent/30">
      <p className="section-label font-mono mb-4">01 — Client Configuration</p>
      <div className="mb-4">
        <label className="mb-1.5 block font-mono text-xs text-white/60">
          Client type
        </label>
        <div className="flex gap-0 rounded border border-white/10 bg-black/30 p-0.5">
          <button
            type="button"
            onClick={() => onChange({ ...value, clientType: "non-ecommerce" })}
            className={`flex-1 rounded px-3 py-2 font-mono text-sm transition-colors ${
              value.clientType === "non-ecommerce"
                ? "bg-white/10 text-accent"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Non-ecommerce
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...value, clientType: "ecommerce" })}
            className={`flex-1 rounded px-3 py-2 font-mono text-sm transition-colors ${
              value.clientType === "ecommerce"
                ? "bg-white/10 text-accent"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            E-commerce
          </button>
        </div>
        <p className="mt-1 text-xs text-white/50">
          E-commerce clients get Collection Page suggestions for commercial intent where relevant.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-mono text-xs text-white/60">
            Client Name <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Acme Corp"
            value={value.clientName}
            onChange={(e) => onChange({ ...value, clientName: e.target.value })}
            className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-white placeholder-white/40 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-xs text-white/60">
            Website URL
          </label>
          <input
            type="text"
            placeholder="e.g. acmecorp.com"
            value={value.clientUrl}
            onChange={(e) => onChange({ ...value, clientUrl: e.target.value })}
            className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-white placeholder-white/40 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/50"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="mb-1.5 block font-mono text-xs text-white/60">
          Service Pillars
        </label>
        <input
          type="text"
          placeholder="Type a pillar and press Enter"
          value={pillarInput}
          onChange={(e) => setPillarInput(e.target.value)}
          onKeyDown={onPillarKeyDown}
          className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-white placeholder-white/40 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/50"
        />
        {value.pillars.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {value.pillars.map((p, i) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 rounded bg-accent/20 px-2 py-1 font-mono text-sm text-accent"
              >
                {p}
                <button
                  type="button"
                  onClick={() => removePillar(i)}
                  className="text-white/70 hover:text-white"
                  aria-label={`Remove ${p}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {availableSuggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {availableSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addPillar(s)}
                className="rounded border border-white/20 bg-white/5 px-2 py-1 font-mono text-xs text-white/80 transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
