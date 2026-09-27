export type Status = 'unseen' | 'learning' | 'review' | 'mastered';
export type EdgeKind = 'prereq' | 'related' | 'mention';

export interface Source { title: string; url: string }
export interface Check { q: string; a: string }
export interface Backlink { from: string; kind: EdgeKind }

export type SymbolKind = 'set' | 'function' | 'variable' | 'constant' | 'operator' | 'differential';

export interface Symbol_ {
  id: string;
  glyph: string;
  tex: string;
  match: string[];
  /** other LaTeX spellings of the same mark; the indexer's business, not the reader's */
  alt: string[];
  sel: string;
  /** a `sel` mark owns the text inside it, so its pieces are not matched separately */
  swallow: boolean;
  /** tracks or fields this sense belongs to; elsewhere a competing sense wins */
  where: string[];
  /** a KaTeX class the rendered leaf must carry — `mrel` for \mid, `!mrel` for | */
  cls: string;
  /** set when an author listed this symbol for the formula being annotated */
  listed?: boolean;
  kind: SymbolKind;
  name: string;
  say: string;
  def: string;
  eg: string;
}

/** A symbol as it appears in one particular formula, with any local override. */
export interface FormulaSymbol extends Symbol_ {
  note: string;
  /** named by the author for this formula, so heuristics defer to it */
  listed?: boolean;
}

/** What a click on a piece of maths opens: the line, and which mark was hit. */
export interface MathTarget {
  tex: string;
  symbol: string | null;
  /** the authored title, when the click came from a `formula` block */
  title?: string;
}

export interface Formula {
  title: string;
  tex: string;
  reading: string;
  why: string;
  steps: string[];
  symbols: FormulaSymbol[];
}

export interface SymbolUse {
  concept: string;
  title: string;
  formula: string;
}

export interface ConceptMeta {
  id: string;
  file: string;
  title: string;
  field: string;
  summary: string;
  tags: string[];
  difficulty: number;
  estMinutes: number;
  prereqs: string[];
  related: string[];
  sources: Source[];
  checks: Check[];
  mentions: string[];
  /** language the prose was served in — the source language when untranslated */
  lang: string;
  depth: number;
  /** position in reading order, from the tracks; unplaced concepts sort last */
  order: number;
  formulaCount: number;
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
  formulas: (Formula | null)[];
  state: ConceptState;
  mastery: number;
  tracks: { id: string; title: string }[];
}

export interface Stage { title: string; goal: string; concepts: string[] }
export interface Track {
  id: string; file: string; title: string; goal: string;
  tags: string[]; stages: Stage[]; conceptIds: string[]; body?: string; lang?: string;
}

export interface TrackStat {
  active: boolean; started: string | null; total: number;
  mastered: number; touched: number; completion: number;
  stages: { title: string; total: number; done: number }[];
}

export interface Suggestion {
  id: string;
  reason: 'due' | 'track' | 'unlocked' | 'blocked';
  why: string;
  /** set on `due`: when the review fell due */
  date?: string;
  /** set on `blocked`: the prerequisites still outstanding */
  needs?: string[];
}
export interface NextUp { due: Suggestion[]; unlocked: Suggestion[]; blocked: Suggestion[] }
export interface Issue { level: 'warn' | 'error'; where: string; message: string }

export interface Graph {
  /** content language served, and every language the library has */
  lang: string;
  languages: string[];
  concepts: ConceptMeta[];
  /** field key (source language) -> display name in the served language */
  fieldLabels: Record<string, string>;
  /** field names in the order a reader should meet them */
  fields: string[];
  tracks: Track[];
  edges: { from: string; to: string; kind: EdgeKind }[];
  issues: Issue[];
  symbols: Record<string, Symbol_>;
  symbolUsage: Record<string, SymbolUse[]>;
  progress: Record<string, ConceptState>;
  trackProgress: Record<string, TrackStat>;
  nextUp: NextUp;
  stats: {
    concepts: number; tracks: number; edges: number;
    mastered: number; inFlight: number; reviewsLogged: number;
  };
}
