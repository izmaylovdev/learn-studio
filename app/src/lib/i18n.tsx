import { createContext, useCallback, useContext, type ReactNode } from 'react';

/**
 * Interface language. The *content* language is the server's business — it
 * serves each material in the requested language and falls back to the source
 * for anything untranslated. This module only covers the words the viewer
 * itself owns: navigation, controls, and the prose inside figures.
 */
export type Lang = 'en' | 'uk';
export const LANGS: { id: Lang; label: string; name: string }[] = [
  { id: 'en', label: 'EN', name: 'English' },
  { id: 'uk', label: 'UK', name: 'Українська' },
];

const LangContext = createContext<Lang>('en');
export const LangProvider = LangContext.Provider;
export const useLang = () => useContext(LangContext);

export function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'uk') return saved;
  } catch { /* private mode */ }
  return navigator.language?.toLowerCase().startsWith('uk') ? 'uk' : 'en';
}

/** Ukrainian nouns take one of three forms after a number: 1 тиждень, 3 тижні, 5 тижнів. */
export function ukPlural(n: number, one: string, few: string, many: string) {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return one;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
  return many;
}

/**
 * Bilingual prose inline, for text that belongs to one component — a figure's
 * caption, a scene's beat. Keeping both languages next to each other, in the
 * file that draws the figure, is what keeps a figure self-contained.
 */
export function L({ en, uk }: { en: ReactNode; uk: ReactNode }) {
  return <>{useLang() === 'uk' ? uk : en}</>;
}

/** The same choice as `L`, for places that need a string (aria-label, a readout key). */
export function useTr() {
  const lang = useLang();
  return useCallback(<T,>(en: T, uk: T): T => (lang === 'uk' ? uk : en), [lang]);
}

type Msg = string | ((...args: never[]) => string);
const M = {
  brandStats: {
    en: (c: number, e: number) => `${c} concepts · ${e} links`,
    uk: (c: number, e: number) => `${c} ${ukPlural(c, 'поняття', 'поняття', 'понять')} · ${e} ${ukPlural(e, 'зв’язок', 'зв’язки', 'зв’язків')}`,
  },
  dashboard: { en: 'Dashboard', uk: 'Огляд' },
  graph: { en: 'Knowledge graph', uk: 'Граф знань' },
  lexicon: { en: 'Lexicon', uk: 'Лексикон' },
  nDue: { en: (n: number) => `${n} due`, uk: (n: number) => `${n} до повторення` },
  tracks: { en: 'Tracks', uk: 'Маршрути' },
  notInTrack: { en: 'Not in a track', uk: 'Поза маршрутами' },
  collapse: { en: (t: string) => `Collapse ${t}`, uk: (t: string) => `Згорнути «${t}»` },
  expand: { en: (t: string) => `Expand ${t}`, uk: (t: string) => `Розгорнути «${t}»` },
  lightTheme: { en: 'Light theme', uk: 'Світла тема' },
  darkTheme: { en: 'Dark theme', uk: 'Темна тема' },
  language: { en: 'Language', uk: 'Мова' },
  cantReach: { en: 'Can’t reach the library', uk: 'Бібліотека недоступна' },
  cantReachBody: {
    en: 'The API server isn’t responding. Start both processes with',
    uk: 'API-сервер не відповідає. Запустіть обидва процеси командою',
  },
  loadingLibrary: { en: 'Loading library…', uk: 'Завантаження бібліотеки…' },
  loading: { en: 'Loading…', uk: 'Завантаження…' },
  untranslated: {
    en: 'This material has not been translated yet, so it is shown in English.',
    uk: 'Цей матеріал ще не перекладено, тому він показаний англійською.',
  },

  // statuses and edge kinds
  'status.unseen': { en: 'unseen', uk: 'не почато' },
  'status.learning': { en: 'learning', uk: 'вивчаю' },
  'status.review': { en: 'review', uk: 'повторення' },
  'status.mastered': { en: 'mastered', uk: 'засвоєно' },
  'reason.due': { en: 'due', uk: 'на повторення' },
  'reason.track': { en: 'track', uk: 'маршрут' },
  'reason.unlocked': { en: 'unlocked', uk: 'відкрито' },
  'reason.blocked': { en: 'blocked', uk: 'заблоковано' },
  'why.due': { en: (d: string) => `review due ${d}`, uk: (d: string) => `повторити до ${d}` },
  'why.track': { en: 'next in an active track', uk: 'наступне в активному маршруті' },
  'why.unlocked': { en: 'prerequisites met', uk: 'передумови виконано' },
  'why.blocked': { en: (s: string) => `needs ${s}`, uk: (s: string) => `потребує: ${s}` },
  'edge.prereq': { en: 'prereq', uk: 'передумова' },
  'edge.related': { en: 'related', uk: 'пов’язане' },
  'edge.mention': { en: 'mention', uk: 'згадка' },

  // dashboard
  dashLede: {
    en: 'What to study next, chosen from prerequisites you’ve already cleared and reviews that have come due.',
    uk: 'Що вивчати далі — з урахуванням уже пройдених передумов і повторень, яким настав час.',
  },
  brokenRefs: {
    en: (n: number) => `${n} broken reference${n > 1 ? 's' : ''} in the library`,
    uk: (n: number) => `${n} ${ukPlural(n, 'зламане посилання', 'зламані посилання', 'зламаних посилань')} у бібліотеці`,
  },
  statMastered: { en: 'mastered', uk: 'засвоєно' },
  statInFlight: { en: 'in flight', uk: 'у процесі' },
  statDueToday: { en: 'due today', uk: 'на сьогодні' },
  statConcepts: { en: 'concepts', uk: 'понять' },
  statReviews: { en: 'reviews logged', uk: 'повторень записано' },
  dueForReview: { en: 'Due for review', uk: 'Час повторити' },
  dueHint: { en: 'recall these before they decay', uk: 'пригадайте, поки не забулося' },
  readyToLearn: { en: 'Ready to learn', uk: 'Можна вивчати' },
  readyHint: { en: 'prerequisites cleared', uk: 'передумови пройдено' },
  nothingUnlocked: {
    en: 'Nothing unlocked — everything available is already in progress.',
    uk: 'Нічого нового не відкрито — усе доступне вже в процесі.',
  },
  tracksActive: { en: 'active', uk: 'активні' },
  tracksNoneActive: { en: 'none active yet', uk: 'ще жодного активного' },
  active: { en: 'active', uk: 'активний' },
  nOfMastered: { en: (a: number, b: number) => `${a}/${b} mastered`, uk: (a: number, b: number) => `${a}/${b} засвоєно` },
  nStages: {
    en: (n: number) => `${n} stages`,
    uk: (n: number) => `${n} ${ukPlural(n, 'етап', 'етапи', 'етапів')}`,
  },
  blocked: { en: 'Blocked', uk: 'Заблоковано' },
  blockedHint: { en: 'waiting on prerequisites', uk: 'чекають на передумови' },
  minutes: { en: (n: number) => `${n} min`, uk: (n: number) => `${n} хв` },
  difficulty: { en: (n: number) => `difficulty ${n}/5`, uk: (n: number) => `складність ${n}/5` },

  // track page
  noTrack: { en: 'No track', uk: 'Немає маршруту' },
  complete: { en: 'complete', uk: 'пройдено' },
  started: { en: 'started', uk: 'розпочато' },
  isActive: { en: 'Active', uk: 'Активний' },
  setActive: { en: 'Set active', uk: 'Зробити активним' },
  prioritizes: { en: 'prioritizes this track', uk: 'ставить маршрут у пріоритет' },
  missingConcept: { en: 'missing concept file', uk: 'файл поняття відсутній' },

  // reader
  reviewRecorded: { en: 'review recorded', uk: 'повторення записано' },
  markedAs: { en: (s: string) => `marked ${s}`, uk: (s: string) => `позначено: ${s}` },
  notesSaved: { en: 'notes saved', uk: 'нотатки збережено' },
  status: { en: 'Status', uk: 'Статус' },
  last: { en: (d: string) => `last ${d}`, uk: (d: string) => `останнє ${d}` },
  next: { en: (d: string) => `next ${d}`, uk: (d: string) => `наступне ${d}` },
  reps: {
    en: (n: number) => `${n} reps`,
    uk: (n: number) => `${n} ${ukPlural(n, 'повторення', 'повторення', 'повторень')}`,
  },
  about: { en: 'About', uk: 'Про матеріал' },
  depth: { en: (n: number) => `depth ${n}`, uk: (n: number) => `глибина ${n}` },
  prerequisites: { en: 'Prerequisites', uk: 'Передумови' },
  related: { en: 'Related', uk: 'Пов’язане' },
  referencedBy: { en: 'Referenced by', uk: 'Посилаються сюди' },
  inTracks: { en: 'In tracks', uk: 'У маршрутах' },
  sources: { en: 'Sources', uk: 'Джерела' },
  myNotes: { en: 'My notes', uk: 'Мої нотатки' },
  notesPlaceholder: {
    en: 'What clicked, what didn’t, what to come back to…',
    uk: 'Що стало зрозуміло, що ні, до чого повернутися…',
  },
  sourceFile: { en: 'Source file', uk: 'Файл джерела' },

  // recall checks
  recallCheck: { en: 'recall check', uk: 'перевірка пам’яті' },
  missedIt: { en: 'Missed it', uk: 'Не пригадалося' },
  hard: { en: 'Hard', uk: 'Важко' },
  good: { en: 'Good', uk: 'Добре' },
  easy: { en: 'Easy', uk: 'Легко' },
  graded: { en: 'graded — next review rescheduled', uk: 'оцінено — наступне повторення переплановано' },
  showAnswer: { en: 'Show answer', uk: 'Показати відповідь' },
  gradeMyself: { en: 'Answered it — grade myself', uk: 'Відповідь готова — оцінити себе' },
  thisFigure: { en: 'This figure', uk: 'Цей рисунок' },
  thisExplorer: { en: 'This formula explorer', uk: 'Цей розбір формули' },


  // graph
  fit: { en: 'fit', uk: 'вмістити' },
  legendMastered: { en: 'mastered', uk: 'засвоєно' },
  legendReview: { en: 'in review', uk: 'на повторенні' },
  legendLearning: { en: 'learning', uk: 'вивчаю' },
  legendUnseen: { en: 'unseen', uk: 'не почато' },
  legendPrereq: { en: 'prerequisite', uk: 'передумова' },
  legendRelated: { en: 'related', uk: 'пов’язане' },
  legendMentioned: { en: 'mentioned', uk: 'згадане' },

  // lexicon
  lexLede: {
    en: 'Every symbol used in the library. A glyph can mean different things in different formulas — the entries here are the general meaning, and each formula can override it locally.',
    uk: 'Усі символи бібліотеки. Той самий знак у різних формулах може означати різне — тут подано загальне значення, а кожна формула може уточнити його для себе.',
  },
  lexSearch: { en: 'Search a glyph, a name, or what it does…', uk: 'Шукайте знак, назву або що він робить…' },
  lexEmpty: { en: 'No symbols yet. Add them to', uk: 'Символів ще немає. Додайте їх у' },
  lexEmptyThen: { en: ', then reference them from a', uk: ', а тоді посилайтеся на них із блоку' },
  lexNoMatch: { en: (q: string) => `Nothing matches “${q}”.`, uk: (q: string) => `Нічого не знайдено за запитом «${q}».` },
  appearsIn: { en: 'appears in', uk: 'трапляється в' },
  notYetUsed: { en: 'not yet used in any formula', uk: 'ще не вжито в жодній формулі' },

  // formula explorer and drawer
  colour: { en: 'colour', uk: 'колір' },
  howToRead: { en: 'How to read it', uk: 'Як це читати' },
  hideReading: { en: 'Hide the plain-English reading', uk: 'Сховати пояснення звичайною мовою' },
  showReading: { en: 'Show the plain-English reading', uk: 'Показати пояснення звичайною мовою' },
  clickSymbol: { en: 'Click any highlighted symbol', uk: 'Клацніть будь-який підсвічений символ' },
  toStep: { en: 'to step through', uk: 'щоб переходити між ними' },
  listedMissing: {
    en: (n: number) => `${n} listed symbol${n > 1 ? 's' : ''} not found in the rendered formula`,
    uk: (n: number) => `${n} ${ukPlural(n, 'заявлений символ не знайдено', 'заявлені символи не знайдено', 'заявлених символів не знайдено')} у формулі`,
  },
  thisSymbolHere: { en: 'This symbol, here', uk: 'Цей символ тут' },
  noSpec: { en: 'No parsed spec reached this formula block.', uk: 'Розібраний опис не дійшов до цього блоку формули.' },
  noSpecBody: {
    en: 'The block’s text did not match any formula the server parsed for this concept.',
    uk: 'Текст блоку не збігся з жодною формулою, яку сервер розібрав для цього поняття.',
  },
  unparsed: { en: 'This formula block could not be parsed.', uk: 'Не вдалося розібрати цей блок формули.' },
  unparsedRun: { en: 'Run', uk: 'Запустіть' },
  unparsedBody: {
    en: '— the indexer names the file and the reason.',
    uk: '— індексатор назве файл і причину.',
  },
  inThisFormula: { en: 'In this formula', uk: 'У цій формулі' },
  whatItIs: { en: 'What it is', uk: 'Що це' },
  worthKnowing: { en: 'Worth knowing', uk: 'Варто знати' },
  sameMark: { en: 'The same mark elsewhere', uk: 'Той самий знак деінде' },
  senseNote: {
    en: 'Which one this is was inferred from the concept you are reading. If it looks wrong, the other reading is one click away.',
    uk: 'Яке саме значення тут, виведено з поняття, яке ви читаєте. Якщо схоже на помилку — інше прочитання за один клік.',
  },
  seeEvery: { en: 'See every formula that uses it →', uk: 'Усі формули, де він трапляється →' },
  drawerLabel: { en: 'What this formula says', uk: 'Що каже ця формула' },
  formula: { en: 'Formula', uk: 'Формула' },
  thisFormula: { en: 'This formula', uk: 'Ця формула' },
  close: { en: 'Close', uk: 'Закрити' },
  lineUses: {
    en: (n: number) => `This line uses ${n} mark${n > 1 ? 's' : ''} the lexicon knows. Click one — in the formula or in the row above — to see what it is doing here.`,
    uk: (n: number) => `У цьому рядку ${n} ${ukPlural(n, 'знак, відомий', 'знаки, відомі', 'знаків, відомих')} лексикону. Клацніть будь-який — у формулі чи в рядку вище, — щоб побачити, що він тут робить.`,
  },
  lineNone: { en: 'Nothing in this line is in the lexicon yet.', uk: 'Жодного знака з цього рядка ще немає в лексиконі.' },
  lineNoneRun: { en: 'lists the marks that have no entry.', uk: 'покаже знаки без статті.' },
  drawerAside: {
    en: 'Anything typeset as maths on the page opens here, including the bits inside a sentence — they highlight as you pass over them.',
    uk: 'Сюди відкривається будь-яка математика на сторінці, зокрема й та, що всередині речення, — вона підсвічується, коли наводите курсор.',
  },
  keysStep: { en: 'step', uk: 'крок' },
  keysClose: { en: 'close', uk: 'закрити' },
  fullLexicon: { en: 'Full lexicon →', uk: 'Увесь лексикон →' },

  // scenes and figures
  play: { en: 'Play', uk: 'Відтворити' },
  pause: { en: 'Pause', uk: 'Пауза' },
  replay: { en: 'Replay', uk: 'Повторити' },
  scrub: { en: 'Scrub the animation', uk: 'Перемотати анімацію' },
  unknownViz: { en: 'Unknown visualization', uk: 'Невідомий рисунок' },
  unknownScene: { en: 'Unknown scene', uk: 'Невідома сцена' },
  available: { en: 'Available', uk: 'Доступні' },
} satisfies Record<string, { en: Msg; uk: Msg }>;

export type MsgKey = keyof typeof M;

/** Look up an interface string. Parameterised entries take their arguments after the key. */
export function useT() {
  const lang = useLang();
  return useCallback(
    (key: MsgKey, ...args: (string | number)[]): string => {
      const m = M[key][lang] as Msg;
      return typeof m === 'function' ? (m as (...a: (string | number)[]) => string)(...args) : m;
    },
    [lang]
  );
}
