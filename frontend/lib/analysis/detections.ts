import type {
  Coverage,
  DetectedObject,
  DetectionLabel,
  DetectionSample,
  DetectionTrack,
} from "@/lib/api/types";

type Box = DetectedObject["box"];

// Próbka „obowiązuje” do 1,5 interwału: dalej to przerwa w detekcjach, a nie brak klatki.
const MAX_GAP_FACTOR = 1.5;

function lerp(from: number, to: number, ratio: number): number {
  return from + (to - from) * ratio;
}

/** Indeks ostatniej próbki z czasem ≤ t albo -1. Próbki są posortowane po czasie. */
export function sampleIndexAt(samples: DetectionSample[], t: number): number {
  let low = 0;
  let high = samples.length - 1;
  let found = -1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    if (samples[middle].t <= t) {
      found = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return found;
}

/** Obiekty widoczne w chwili t. Ramki tego samego obiektu (track_id) płynnie przechodzą między próbkami. */
export function objectsAt(
  { samples, sample_interval_s: interval }: DetectionTrack,
  t: number,
): DetectedObject[] {
  const index = sampleIndexAt(samples, t);
  if (index < 0) return [];
  const current = samples[index];
  const maxGap = interval * MAX_GAP_FACTOR;
  if (t - current.t > maxGap) return [];

  const next = samples[index + 1];
  const canBlend = next !== undefined && next.t - current.t <= maxGap;
  const ratio = canBlend ? (t - current.t) / (next.t - current.t) : 0;

  return current.objects.flatMap((object) => {
    const target = canBlend ? next.objects.find((o) => o.track_id === object.track_id) : undefined;
    if (!target) return t - current.t <= interval ? [object] : [];
    const box = object.box.map((value, i) => lerp(value, target.box[i], ratio)) as Box;
    return [{ ...object, score: lerp(object.score, target.score, ratio), box }];
  });
}

export type TrackSummary = {
  trackId: number;
  label: DetectionLabel;
  firstSeen: number;
  lastSeen: number;
  maxScore: number;
  appearances: number;
};

/** Jeden wiersz na wykryty obiekt: kiedy się pojawił i zniknął, z jaką maksymalną pewnością. */
export function summarizeTracks({ samples }: DetectionTrack): TrackSummary[] {
  const tracks = new Map<number, TrackSummary>();
  for (const sample of samples) {
    for (const object of sample.objects) {
      const existing = tracks.get(object.track_id);
      if (existing) {
        existing.lastSeen = sample.t;
        existing.maxScore = Math.max(existing.maxScore, object.score);
        existing.appearances += 1;
      } else {
        tracks.set(object.track_id, {
          trackId: object.track_id,
          label: object.label,
          firstSeen: sample.t,
          lastSeen: sample.t,
          maxScore: object.score,
          appearances: 1,
        });
      }
    }
  }
  return [...tracks.values()].sort((a, b) => a.firstSeen - b.firstSeen);
}

export function hasLabel(sample: DetectionSample, label: DetectionLabel): boolean {
  return sample.objects.some((object) => object.label === label);
}

export function maxScoreAt(objects: DetectedObject[], label: DetectionLabel): number | null {
  const scores = objects.filter((o) => o.label === label).map((o) => o.score);
  return scores.length > 0 ? Math.max(...scores) : null;
}

export type TimeRange = { start: number; end: number };

/** Przedziały czasu, w których widać daną klasę; sąsiednie próbki łączą się w jeden przedział. */
export function labelRanges(
  { samples, sample_interval_s: interval }: DetectionTrack,
  label: DetectionLabel,
): TimeRange[] {
  const ranges: TimeRange[] = [];
  const maxGap = interval * MAX_GAP_FACTOR;
  for (const sample of samples) {
    if (!hasLabel(sample, label)) continue;
    const last = ranges.at(-1);
    if (last && sample.t - (last.end - interval) <= maxGap) last.end = sample.t + interval;
    else ranges.push({ start: sample.t, end: sample.t + interval });
  }
  return ranges;
}

export function trackEnd({ samples, sample_interval_s: interval }: DetectionTrack): number {
  return (samples.at(-1)?.t ?? 0) + interval;
}

/** Pokrycie kadru z najbliższej wcześniejszej próbki; null, gdy wynik go nie zawiera albo jest przerwa. */
export function coverageAt(
  { samples, sample_interval_s: interval }: DetectionTrack,
  t: number,
): Coverage | null {
  const index = sampleIndexAt(samples, t);
  if (index < 0) return null;
  const sample = samples[index];
  if (t - sample.t > interval * MAX_GAP_FACTOR) return null;
  return sample.coverage ?? null;
}
