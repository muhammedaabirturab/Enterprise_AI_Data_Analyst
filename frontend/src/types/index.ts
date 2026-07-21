export interface User {
  id: number;
  email: string;
  full_name: string;
  company?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Dataset {
  id: number;
  name: string;
  original_filename: string;
  file_type: string;
  n_rows: number;
  n_columns: number;
  created_at: string;
  updated_at: string;
}

export interface PreviewResponse {
  columns: string[];
  rows: Record<string, unknown>[];
  total_rows: number;
  page: number;
  page_size: number;
}

export interface ColumnProfile {
  name: string;
  dtype: string;
  inferred_type: string;
  missing_count: number;
  missing_pct: number;
  unique_count: number;
  mean?: number | null;
  median?: number | null;
  std?: number | null;
  min?: number | null;
  max?: number | null;
  top_values: { value: string; count: number }[];
}

export interface ProfileResponse {
  n_rows: number;
  n_columns: number;
  memory_usage_mb: number;
  duplicate_rows: number;
  missing_cells: number;
  missing_pct: number;
  quality_score: number;
  numeric_columns: number;
  categorical_columns: number;
  datetime_columns: number;
  columns: ColumnProfile[];
}

export interface CleaningStep {
  id: number;
  operation: string;
  params: Record<string, unknown>;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface MLRecommendation {
  task_type: string;
  algorithm: string;
  reason: string;
  target_column: string | null;
  suitability_score: number;
}

export interface MLRunResult {
  id: number;
  task_type: string;
  algorithm: string;
  target_column: string | null;
  feature_columns: string[];
  metrics: Record<string, any>;
  artifacts: Record<string, any>;
  created_at: string;
}

export interface AIReport {
  dataset_summary: string;
  business_summary: string;
  executive_summary: string;
  executive_summary_ai_enhanced?: string;
  recommendations: string[];
  potential_problems: string[];
  opportunities: string[];
  data_quality_report: {
    quality_score: number;
    missing_pct: number;
    duplicate_rows: number;
    flagged_columns: { column: string; issue: string; detail: string }[];
    summary: string;
  };
  risk_analysis: string[];
  correlation_explanation: string;
  outlier_explanation: string;
  natural_language_insights: string[];
}
