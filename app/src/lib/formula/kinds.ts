import type { SymbolKind } from '../../types';

export const KIND_NAME: Record<SymbolKind, string> = {
  set: 'Set',
  function: 'Function',
  variable: 'Variable',
  constant: 'Constant',
  operator: 'Operator',
  differential: 'Differential',
};

export const KIND_GLOSS: Record<SymbolKind, string> = {
  set: 'a collection of things',
  function: 'a machine: something goes in, something comes out',
  variable: 'a value that moves, or gets counted over',
  constant: 'a value pinned down before you start — often a boundary',
  operator: 'something that acts on whatever follows it',
  differential: 'the marker of one infinitesimal slice',
};

export const KIND_ORDER: SymbolKind[] = ['operator', 'function', 'variable', 'constant', 'differential', 'set'];
