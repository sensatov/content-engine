export type Topic = {
  title: string;
  pillar: string;
  priority: "High" | "Medium" | "Low";
  searchIntent: string;
  contentType: string;
  rationale: string;
  targetKeywords: string[];
  estimatedImpact: string;
  internalLinkingOpportunity: string;
  suggestedAngle: string;
};

export type DataSummary = {
  gscInsights: string;
  semrushInsights: string;
  competitorInsights: string;
  contentGaps: string;
};

export type GenerateResponse = {
  dataSummary: DataSummary;
  topics: Topic[];
};
