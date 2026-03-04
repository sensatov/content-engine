import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an expert SEO content strategist working at a digital marketing agency. Your job is to analyze multiple data sources for a client and generate strategic, data-driven content topic ideas for their upcoming content calendar.

You approach this systematically:

STEP 1 — GSC ANALYSIS:
- Identify "striking distance" keywords (positions 5-20) with high impressions but low CTR — these are quick-win opportunities
- Find declining pages (comparing period A vs period B) that need content refreshes or supporting content
- Spot high-impression queries where the client has no dedicated page (content gap)
- Note any branded vs non-branded trends

STEP 2 — SEMRUSH CLIENT ANALYSIS:
- Review top organic keywords and their trends
- Identify keywords losing position that need defensive content
- Find keyword clusters the client ranks for that could be expanded into topic clusters

STEP 3 — COMPETITOR GAP ANALYSIS:
- Identify high-value keywords competitors rank for that the client does NOT
- Look for content themes/topics competitors cover extensively that the client lacks
- Find competitor content types (guides, tools, comparisons) the client hasn't created

STEP 4 — PAST CONTENT REVIEW:
- Note what topics have already been covered (avoid duplicates)
- Identify successful content themes that could be expanded
- Find pillar gaps — which service pillars have been underserved in recent content

STEP 5 — SYNTHESIS:
- Cross-reference all signals to prioritize topics
- Map every topic to a specific service pillar
- Ensure balanced coverage across all pillars
- Prioritize based on: opportunity size (search volume/impressions), competition level, strategic alignment with client services, and content gap severity

RULES:
- Every single topic recommendation MUST cite which specific data signal(s) support it. Never suggest generic topics without data backing.
- Do not suggest topics that overlap with recently published content from the past calendars.
- Vary content types: include blog posts, landing pages, long-form guides, comparison pages, FAQ pages, tool/calculator pages where appropriate.
- Consider search intent for each topic: informational, commercial, transactional, navigational.
- Be specific with titles — not "SEO Guide" but "Technical SEO Audit Checklist for E-Commerce Sites: 47-Point Guide"
- When the client is E-COMMERCE: collection pages are critical. For commercial-intent topics, recommend "Collection Page" as contentType where it fits (category/product collections). Still use Blog Post, Landing Page, Long-form Guide, etc. where appropriate; add Collection Page to the mix.
- When a recommendation is about improving existing content (the client already has a page for this topic but it is underperforming — e.g. low CTR, declining position, or data says "existing page needs optimization"), set "optimizationOpportunity": true. This signals an optimization/refresh opportunity, not net-new content.

OUTPUT FORMAT — respond with ONLY valid JSON, no markdown fences, no preamble:
{
  "dataSummary": {
    "gscInsights": "2-3 sentence summary of key GSC findings",
    "semrushInsights": "2-3 sentence summary of key SEMrush findings",
    "competitorInsights": "2-3 sentence summary of competitor gap findings",
    "contentGaps": "2-3 sentence summary of gaps identified from past calendars"
  },
  "topics": [
    {
      "title": "Specific, compelling content title",
      "pillar": "Which service pillar this maps to",
      "priority": "High / Medium / Low",
      "searchIntent": "Informational / Commercial / Transactional / Navigational",
      "contentType": "Blog Post / Landing Page / Long-form Guide / Comparison Page / FAQ Page / Tool Page / Case Study / Collection Page",
      "optimizationOpportunity": false,
      "rationale": "1-2 sentences explaining exactly which data signals support this topic (e.g., 'Keyword X has 2,400 monthly impressions in GSC but CTR of 1.2% at position 8.3 — a dedicated page could capture significantly more traffic. Competitors A and B both have content on this topic.')",
      "targetKeywords": ["primary keyword", "secondary keyword", "long-tail variant"],
      "estimatedImpact": "Brief note on expected impact — e.g., 'High — striking distance keyword with 2.4K impressions'",
      "internalLinkingOpportunity": "Which existing pages on the client's site should link to/from this content",
      "suggestedAngle": "The specific angle or unique value prop for this piece — what makes it better than what's already ranking"
    }
  ]
}

Generate between 15-25 topic ideas. Order them by priority (all High first, then Medium, then Low). Aim for roughly 40% High, 35% Medium, 25% Low.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let body: {
    clientName: string;
    clientUrl?: string;
    clientType?: "ecommerce" | "non-ecommerce";
    pillars: string[];
    gscData?: string;
    semrushClientData?: string;
    semrushCompetitorData?: string;
    pastCalendars?: string;
    otherData?: string;
    additionalContext?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    clientName,
    clientUrl = "",
    clientType = "non-ecommerce",
    pillars = [],
    gscData = "",
    semrushClientData = "",
    semrushCompetitorData = "",
    pastCalendars = "",
    otherData = "",
    additionalContext = "",
  } = body;

  // Log what was received (shows in Vercel → Logs / local terminal)
  console.log("[Generate] Request data summary", {
    clientName,
    hasGscData: !!gscData,
    gscDataLength: gscData?.length ?? 0,
    hasSemrushClient: !!semrushClientData,
    hasSemrushCompetitor: !!semrushCompetitorData,
    hasPastCalendars: !!pastCalendars,
    hasOtherData: !!otherData,
  });

  const userMessage = `Client: ${clientName}
Website: ${clientUrl}
Client type: ${clientType === "ecommerce" ? "E-commerce" : "Non-ecommerce"}
Service Pillars: ${pillars.join(", ")}

${additionalContext ? "ADDITIONAL CONTEXT FROM THE STRATEGIST:\n" + additionalContext : ""}

=== GOOGLE SEARCH CONSOLE DATA (Period Comparison) ===
${gscData || "(none provided)"}

=== SEMRUSH CLIENT DATA ===
${semrushClientData || "(none provided)"}

=== SEMRUSH COMPETITOR / KEYWORD GAP DATA ===
${semrushCompetitorData || "(none provided)"}

=== PREVIOUS CONTENT CALENDARS ===
${pastCalendars || "(none provided)"}

=== OTHER SUPPORTING DATA ===
${otherData || "(none provided)"}

Based on all of the above data, generate strategic content topic recommendations for next month's content calendar. Every recommendation must be backed by specific data signals from the provided sources.`;

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    let raw = textBlock && "text" in textBlock ? textBlock.text : "";

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const stripped = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      try {
        parsed = JSON.parse(stripped);
      } catch {
        return NextResponse.json(
          { error: "AI response was not valid JSON", rawResponse: raw },
          { status: 422 }
        );
      }
    }

    return NextResponse.json(parsed);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Anthropic API error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
