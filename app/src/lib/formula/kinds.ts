import type { SymbolKind } from '../../types';
import { useLang } from '../i18n';

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

const KIND_NAME_UK: Record<SymbolKind, string> = {
  set: 'Множина',
  function: 'Функція',
  variable: 'Змінна',
  constant: 'Стала',
  operator: 'Оператор',
  differential: 'Диференціал',
};

const KIND_GLOSS_UK: Record<SymbolKind, string> = {
  set: 'сукупність об’єктів',
  function: 'машина: щось входить, щось виходить',
  variable: 'величина, що змінюється або пробігає значення',
  constant: 'величина, зафіксована наперед, — часто межа',
  operator: 'те, що діє на все, що стоїть після нього',
  differential: 'позначка одного нескінченно тонкого шару',
};

/** Kind names and glosses in the interface language. */
export function useKinds() {
  return useLang() === 'uk'
    ? { KIND_NAME: KIND_NAME_UK, KIND_GLOSS: KIND_GLOSS_UK }
    : { KIND_NAME, KIND_GLOSS };
}

export const KIND_ORDER: SymbolKind[] = ['operator', 'function', 'variable', 'constant', 'differential', 'set'];
