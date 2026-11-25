// Typy odpowiedzi API — odpowiadają schematom w backend/app/schemas.py.

export type AnalysisStatus = "queued" | "processing" | "done" | "failed";
export type Verdict = "fire" | "smoke" | "none";
export type RiskLevel = "low" | "medium" | "high";
export type DetectionLabel = "fire" | "smoke";

export type User = {
  id: number;
  name: string;
  email: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

/** Ramka [x, y, szerokość, wysokość] względem rozmiaru klatki (0–1). */
export type DetectedObject = {
  track_id: number;
  label: DetectionLabel;
  score: number;
  box: [number, number, number, number];
};

/** Część kadru (0–1) zajęta przez ogień i dym w danej klatce. */
export type Coverage = Record<DetectionLabel, number>;

export type DetectionSample = {
  t: number;
  objects: DetectedObject[];
  /** Brak w wynikach sprzed dodania pokrycia kadru i w trybie demo. */
  coverage?: Coverage;
};

export type DetectionTrack = {
  sample_interval_s: number;
  samples: DetectionSample[];
};

export type AnalysisResult = {
  verdict: Verdict;
  risk_level: RiskLevel;
  confidence: number;
  first_detection_s: number | null;
  fire_frame_ratio: number;
  smoke_frame_ratio: number;
  fire_coverage_max?: number;
  smoke_coverage_max?: number;
  detections_track: DetectionTrack;
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

export type AnalysisList = {
  items: Analysis[];
  total: number;
};
