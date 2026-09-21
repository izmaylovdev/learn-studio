import type { ConceptMeta, Graph, Symbol_ } from '../../types';

/**
 * The same glyph legitimately means several things: `a` is a limit of
 * integration, the parameter of a substitution and the centre of a Taylor
 * series; `P` is a probability and a polynomial. A `formula` block resolves
 * that by listing symbols by hand, but the reader now annotates *every*
 * formula on a page, and nobody is going to hand-list a thousand of them.
 *
 * So the sense is chosen by where the reader is. A symbol that the concept's
 * own authored formula uses wins; then one used elsewhere in the same field,
 * then the same track, then anywhere. The losing senses are not thrown away —
 * they are offered in the card as other readings, which is honest about the
 * ambiguity instead of hiding it.
 */
export interface Senses {
  /** the whole lexicon, preferred sense first — feed straight to `annotate` */
  ordered: Symbol_[];
  /** symbol id -> the other entries that render as the same mark */
  siblings: Map<string, Symbol_[]>;
  byId: Map<string, Symbol_>;
}

/** Entries collide when they can claim the same rendered text. */
function markKey(s: Symbol_) {
  return s.sel ? `sel:${s.sel}` : `txt:${s.match?.[0] ?? s.glyph}`;
}

export function buildSenses(graph: Graph | null, scopeId?: string | null): Senses {
  const all = Object.values(graph?.symbols ?? {});
  const byId = new Map(all.map((s) => [s.id, s]));
  const usage = graph?.symbolUsage ?? {};

  const concepts = new Map((graph?.concepts ?? []).map((c) => [c.id, c]));
  const scope: ConceptMeta | undefined = scopeId ? concepts.get(scopeId) : undefined;
  const sameField = new Set(
    scope ? (graph?.concepts ?? []).filter((c) => c.field === scope.field).map((c) => c.id) : []
  );
  const sameTrack = new Set(
    scope
      ? (graph?.tracks ?? [])
          .filter((t) => t.conceptIds.includes(scope.id))
          .flatMap((t) => t.conceptIds)
      : []
  );

  const trackIds = new Set(
    scope ? (graph?.tracks ?? []).filter((t) => t.conceptIds.includes(scope.id)).map((t) => t.id) : []
  );

  /**
   * A sense can declare where it lives. That is the only way a mark nobody has
   * written a `formula` block for can still win at home — the `c` of a
   * complement has no authored usage anywhere, and would otherwise lose every
   * page to the `c` of the Mean Value Theorem.
   */
  const affinity = (s: Symbol_) => {
    // `?? []` rather than `.length`: a graph fetched before the field existed
    // is still in memory after a hot reload, and crashing the provider over it
    // would take the whole page with it.
    const where = s.where ?? [];
    if (!where.length || !scope) return 0;
    const home = where.some((w) => w === scope.field || trackIds.has(w));
    return home ? 3 : -3;
  };

  const score = (s: Symbol_) => {
    const used = usage[s.id] ?? [];
    const base = !used.length ? 0
      : scope && used.some((u) => u.concept === scope.id) ? 4
      : used.some((u) => sameField.has(u.concept)) ? 3
      : used.some((u) => sameTrack.has(u.concept)) ? 2
      : 1;
    return base + affinity(s);
  };

  const weight = new Map(all.map((s) => [s.id, score(s)]));
  const ordered = [...all].sort(
    (a, b) =>
      (weight.get(b.id) ?? 0) - (weight.get(a.id) ?? 0) ||
      (usage[b.id]?.length ?? 0) - (usage[a.id]?.length ?? 0) ||
      a.id.localeCompare(b.id)
  );

  const groups = new Map<string, Symbol_[]>();
  for (const s of ordered) {
    const key = markKey(s);
    const list = groups.get(key);
    if (list) list.push(s); else groups.set(key, [s]);
  }
  const siblings = new Map<string, Symbol_[]>();
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    for (const s of list) siblings.set(s.id, list.filter((o) => o.id !== s.id));
  }

  return { ordered, siblings, byId };
}
