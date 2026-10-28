"use strict";

const bi = (vi, en) => ({ vi, en });
const DEFAULT_PAIRS = [['A', '%B%x'], ['B', '%C%y'], ['C', 'z']];
const SOURCE = [
  'import re',
  'class Solution:',
  '    def applySubstitutions(self, replacements: list[list[str]], text: str) -> str:',
  '        values = dict(replacements)',
  '        memo = {}',
  '        def resolve(key):',
  '            if key in memo:',
  '                return memo[key]',
  '            memo[key] = expand(values[key])',
  '            return memo[key]',
  '        def expand(source):',
  '            parts = []',
  '            start = 0',
  '            for match in re.finditer(r"%([A-Z])%", source):',
  '                parts.append(source[start:match.start()])',
  '                parts.append(resolve(match.group(1)))',
  '                start = match.end()',
  '            parts.append(source[start:])',
  '            return "".join(parts)',
  '        return expand(text)',
];

function parseInput(input, params = {}) {
  let replacements;
  try { replacements = JSON.parse(params.replacements ?? JSON.stringify(DEFAULT_PAIRS)); }
  catch { throw new Error('#3481: replacements must be JSON [[key,value], ...] / replacements phải là JSON [[key,value], ...].'); }
  if (!Array.isArray(replacements) || replacements.length < 1 || replacements.length > 10 || replacements.some(pair => !Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || !/^[A-Z]$/.test(pair[0]) || typeof pair[1] !== 'string' || pair[1].length < 1 || pair[1].length > 8)) {
    throw new Error('#3481: use 1–10 pairs; key A–Z, value 1–8 characters / dùng 1–10 cặp; key A–Z, value 1–8 ký tự.');
  }
  const values = new Map(replacements), dependencies = new Map();
  if (values.size !== replacements.length) throw new Error('#3481: keys must be unique / key không được trùng.');
  for (const [key, value] of values) {
    if (value.replace(/%[A-Z]%/g, '').includes('%')) throw new Error('#3481: use placeholders %A%, %B%, ... / biến có dạng %A%, %B%, ... .');
    const refs = [...value.matchAll(/%([A-Z])%/g)].map(match => match[1]);
    if (refs.some(ref => !values.has(ref))) throw new Error('#3481: every referenced key needs a replacement / mọi biến tham chiếu phải có replacement.');
    dependencies.set(key, refs);
  }
  const states = new Map();
  function visit(key) {
    if (states.get(key) === 1) throw new Error('#3481: cyclic references are not allowed / không được tham chiếu vòng.');
    if (states.get(key) === 2) return;
    states.set(key, 1); dependencies.get(key).forEach(visit); states.set(key, 2);
  }
  values.forEach((_, key) => visit(key));
  const text = typeof input === 'string' ? input.trim() : '';
  const tokens = text.split('_');
  if (tokens.length !== values.size || tokens.some(token => !/^%[A-Z]%$/.test(token) || !values.has(token[1])) || new Set(tokens).size !== values.size) {
    throw new Error('#3481: text must contain each key once, separated by underscores (e.g. %A%_%B%) / text gồm mỗi key một lần, cách nhau bằng dấu gạch dưới (ví dụ %A%_%B%).');
  }
  return { text, replacements, values, dependencies };
}

function buildSteps(input, params) {
  const { text, replacements, values, dependencies } = parseInput(input, params);
  const steps = [], stack = [], memo = {}, states = {}, history = [];
  let nextId = 0, answer = null;
  const frame = (kind, key, source = null) => ({ id: nextId++, kind, key, source, parts: [], start: null, cursor: 0, match: null, result: null, locals: kind === 'resolve' ? { key } : { source } });
  function emit(f, line, event, final = false) {
    const locals = JSON.parse(JSON.stringify(f ? f.kind === 'resolve' ? { ...f.locals, values: Object.fromEntries(values), memo } : f.locals : { replacements, text, values: Object.fromEntries(values), ...(line >= 5 ? { memo } : {}) }));
    steps.push({ source: { line, text: SOURCE[line - 1], scope: f?.kind || 'applySubstitutions' }, locals, arr: [], highlight: [], mark: [], codeLines: [line], title: bi(final ? 'Kết quả' : 'Dòng '+line, final ? 'Result' : 'Line '+line), note: bi('', ''), final,
      vars: Object.entries(locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value })),
      substitutions3481View: { text, line, event, activeId: f?.id ?? null, answer,
        stack: stack.map(item => ({ id: item.id, kind: item.kind, key: item.key, source: item.source, start: item.start, cursor: item.cursor, result: item.result,
          parts: item.parts.map(part => ({ ...part })), match: item.match ? { ...item.match } : null })),
        mappings: replacements.map(([key, value]) => ({ key, value, refs: [...dependencies.get(key)], status: states[key] || 'idle', expanded: memo[key] ?? null })),
        history: history.map(item => ({ ...item })), memo: { ...memo },
      },
    });
  }
  emit(null, 4, 'values');
  emit(null, 5, 'memo-init');
  emit(null, 6, 'define-resolve');
  emit(null, 11, 'define-expand');
  function resolve(key) {
    const f = frame('resolve', key); stack.push(f);
    const hit = Object.hasOwn(memo, key);
    emit(f, 7, 'memo-check');
    if (hit) {
      f.result = memo[key]; history.push({ event: 'hit', key, value: f.result });
      emit(f, 8, 'cache-return');
    } else {
      states[key] = 'working';
      f.result = expand(values.get(key), key);
      memo[key] = f.result; states[key] = 'done'; history.push({ event: 'save', key, value: f.result });
      emit(f, 9, 'memo-save');
      emit(f, 10, 'resolve-return');
    }
    stack.pop(); return f.result;
  }
  function expand(source, owner) {
    const f = frame('expand', owner, source); stack.push(f);
    f.locals.parts = [];
    emit(f, 12, 'parts-init');
    f.start = 0; f.locals.start = 0;
    emit(f, 13, 'start-init');
    for (const match of source.matchAll(/%([A-Z])%/g)) {
      const from = Array.from(source.slice(0, match.index)).length;
      f.match = { key: match[1], token: match[0], from, to: from + match[0].length, value: null, appended: false };
      f.locals.match = match[0];
      emit(f, 14, 'match');
      const literal = Array.from(source).slice(f.start, f.match.from).join('');
      f.parts.push({ kind: 'literal', key: null, value: literal }); f.locals.parts.push(literal); f.cursor = f.match.from;
      emit(f, 15, 'literal');
      const replacement = resolve(match[1]); f.match.value = replacement;
      f.parts.push({ kind: 'replacement', key: match[1], value: replacement }); f.locals.parts.push(replacement); f.match.appended = true; f.cursor = f.match.to;
      emit(f, 16, 'append-child');
      f.start = f.match.to; f.locals.start = f.start;
      emit(f, 17, 'advance');
    }
    emit(f, 14, 'matches-done');
    const tail = Array.from(source).slice(f.start).join('');
    f.parts.push({ kind: 'literal', key: null, value: tail }); f.locals.parts.push(tail); f.cursor = Array.from(source).length; f.match = null;
    emit(f, 18, 'tail');
    f.result = f.parts.map(part => part.value).join('');
    emit(f, 19, 'expand-return');
    stack.pop(); return f.result;
  }
  answer = expand(text, null);
  emit(null, 20, 'return', true);
  return { original: text, answer, steps };
}

module.exports = { 3481: {
  id: 3481, difficulty: 'medium', premium: true, slug: 'apply-substitutions',
  category: { key: 'string', vi: 'Chuỗi', en: 'String' },
  tags: [{ key: 'string', vi: 'Chuỗi', en: 'String' }, { key: 'dfs', vi: 'DFS', en: 'DFS' }, { key: 'memoization', vi: 'Ghi nhớ', en: 'Memoization' }],
  title: bi('Apply Substitutions', 'Apply Substitutions'), titleVi: bi('Thay biến trong chuỗi', 'Expand placeholders in a string'),
  statement: bi('Cho replacements = [[key, value], ...] và text gồm các biến %key% cách nhau bằng dấu _. Thay mỗi biến bằng value; nếu value chứa biến khác thì tiếp tục thay cho đến khi không còn biến. Key là một chữ A–Z, không trùng; 1–10 cặp, mỗi value dài 1–8 ký tự. Mọi biến tham chiếu đều tồn tại và không có vòng. Text chứa mỗi key đúng một lần.', 'Given replacements = [[key, value], ...] and text containing %key% placeholders separated by _, recursively substitute each value until no placeholders remain. Keys are unique single letters A–Z; 1–10 pairs, each value 1–8 characters. All references exist and are acyclic. Text contains every key exactly once.'),
  inputKind: 'string', inputLabel: bi('text — ví dụ %A%_%B%_%C%', 'text — e.g. %A%_%B%_%C%'), defaultInput: '%A%_%B%_%C%',
  extraParams: [{ key: 'replacements', type: 'string', label: bi('replacements — JSON [[key,value], ...]', 'replacements — JSON [[key,value], ...]'), default: JSON.stringify(DEFAULT_PAIRS) }],
  debugMode: 'line-by-line',
  approach: [
    bi('Thay %key% bằng value; mở rộng biến con trước.', 'Replace %key% with its value; expand children first.'),
    bi('Lưu chuỗi hoàn chỉnh vào memo để dùng lại.', 'Cache the completed string in memo for reuse.'),
  ],
  complexity: { time: 'O(N + S)', space: 'O(N + S)', note: bi('N là tổng độ dài input; S là tổng độ dài mọi chuỗi đã mở rộng (memo và đáp án). DFS sâu tối đa số key. Chuỗi mở rộng có thể lớn hơn input nhiều lần. Không tính bản sao visualization.', 'N is total input length; S is the combined size of expanded strings (memo and answer). DFS depth is at most the number of keys. Expansion can greatly exceed the input size. Excludes visualization snapshots.') },
  code: SOURCE, builder: buildSteps, liveArgs: (input, params) => { const parsed = parseInput(input, params); return [parsed.replacements, parsed.text]; },
} };
