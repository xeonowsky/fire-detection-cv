// Typy odpowiedzi API — odpowiadają schematom w backend/app/schemas.py.

export type AnalysisStatus = "queued" | "processing" | "done" | "failed";
export type Verdict = "fire" | "smoke" | "none";
export type RiskLevel = "low" | "medium" | "high";

export type User = {
  id: number;
  name: string;
  email: string;
};

export type AnalysisResult = {
  verdict: Verdict;
  risk_level: RiskLevel;
  confidence: number;
  first_detection_s: number | null;
  fire_frame_ratio: number;
  smoke_frame_ratio: number;
};

export type Analysis = {
  id: string;
  name: string;
  status: AnalysisStatus;
  progress: number;
  created_at: string;
  duration_s: number | null;
  video_url: string;
  result: AnalysisResult | null;
  error: string | null;
};
