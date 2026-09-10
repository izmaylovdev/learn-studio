export type Status = 'unseen' | 'learning' | 'review' | 'mastered';
export type EdgeKind = 'prereq' | 'related' | 'mention';

export interface Source { title: string; url: string }
export interface Check { q: string; a: string }
export interface Backlink { from: string; kind: EdgeKind }

export interface ConceptMeta {
  id: string;
  file: string;
  title: string;
  summary: string;
  tags: string[];
  difficulty: number;
  estMinutes: number;
  prereqs: string[];
  related: string[];
  sources: Source[];
  checks: Check[];
  mentions: string[];
  depth: number;
  backlinks: Backlink[];
}

export interface ConceptState {
  status: Status;
  reps: number;
  ease: number;
  intervalDays: number;
  lastReviewed: string | null;
  nextReview: string | null;
  notes: string;
}

export interface Concept extends ConceptMeta {
  body: string;
  state: ConceptState;
  mastery: number;
  tracks: { id: string; title: string }[];
}

export interface Stage { title: string; goal: string; concepts: string[] }
export interface Track {
  id: string; file: string; title: string; goal: string;
  tags: string[]; stages: Stage[]; conceptIds: string[]; body?: string;
}

export interface TrackStat {
  active: boolean; started: string | null; total: number;
  mastered: number; touched: number; completion: number;
  stages: { title: string; total: number; done: number }[];
}

export interface Suggestion { id: string; reason: 'due' | 'track' | 'unlocked' | 'blocked'; why: string }
export interface NextUp { due: Suggestion[]; unlocked: Suggestion[]; blocked: Suggestion[] }
export interface Issue { level: 'warn' | 'error'; where: string; message: string }

export interface Graph {
  concepts: ConceptMeta[];
  tracks: Track[];
  edges: { from: string; to: string; kind: EdgeKind }[];
  issues: Issue[];
  progress: Record<string, ConceptState>;
  trackProgress: Record<string, TrackStat>;
  nextUp: NextUp;
  stats: {
    concepts: number; tracks: number; edges: number;
    mastered: number; inFlight: number; reviewsLogged: number;
  };
}
