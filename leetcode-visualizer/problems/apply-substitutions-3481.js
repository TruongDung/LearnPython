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
  function emit(f, line, event, title, note, final = false) {
    steps.push({ arr: [], highlight: [], mark: [], codeLines: [line], title, note, final,
      vars: Object.entries(f?.locals || {}).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value })),
      substitutions3481View: { text, line, event, activeId: f?.id ?? null, answer,
        stack: stack.map(item => ({ id: item.id, kind: item.kind, key: item.key, source: item.source, start: item.start, cursor: item.cursor, result: item.result,
          parts: item.parts.map(part => ({ ...part })), match: item.match ? { ...item.match } : null })),
        mappings: replacements.map(([key, value]) => ({ key, value, refs: [...dependencies.get(key)], status: states[key] || 'idle', expanded: memo[key] ?? null })),
        history: history.map(item => ({ ...item })), memo: { ...memo },
      },
    });
  }
  emit(null, 4, 'values', bi('Tạo bảng key → value', 'Build the key → value table'), bi('Value có thể chứa biến khác. Cần mở rộng biến con trước.', 'A value can contain another variable. Expand the child before completing its parent.'));
  emit(null, 5, 'memo-init', bi('memo = {}', 'memo = {}'), bi('Chưa có kết quả nào được nhớ.', 'No expanded values are cached yet.'));
  function resolve(key) {
    const f = frame('resolve', key); stack.push(f);
    emit(f, 6, 'resolve-call', bi(`Gọi resolve('${key}')`, `Call resolve('${key}')`), bi(`Tìm chuỗi cuối cùng thay cho %${key}%.`, `Find the final string that replaces %${key}%.`));
    const hit = Object.hasOwn(memo, key);
    emit(f, 7, 'memo-check', bi(`${key} in memo → ${hit ? 'True' : 'False'}`, `${key} in memo → ${hit ? 'True' : 'False'}`), bi(hit ? 'Đã có chuỗi hoàn chỉnh. Dùng lại, không đi sâu nữa.' : 'Chưa có. Mở rộng value và chờ các biến con.', hit ? 'The full string is cached. Reuse it without descending again.' : 'Not cached. Expand its value and wait for child variables.'));
    if (hit) {
      f.result = memo[key]; history.push({ event: 'hit', key, value: f.result });
      emit(f, 8, 'cache-return', bi(`Dùng lại ${key} = '${f.result}'`, `Reuse ${key} = '${f.result}'`), bi('Chỉ trả về chuỗi đã nhớ; chưa ghép vào parts của cha.', 'Return the cached string; it has not been appended to the parent parts yet.'));
    } else {
      states[key] = 'working';
      emit(f, 9, 'expand-key', bi(`Mở rộng ${key}: '${values.get(key)}'`, `Expand ${key}: '${values.get(key)}'`), bi('Cha chờ expand trả về. Chưa lưu memo ở bước gọi con.', 'Wait for expand to return. The child call has not written memo yet.'));
      f.result = expand(values.get(key), key);
      memo[key] = f.result; states[key] = 'done'; history.push({ event: 'save', key, value: f.result });
      emit(f, 9, 'memo-save', bi(`Nhớ ${key} = '${f.result}'`, `Cache ${key} = '${f.result}'`), bi('Value đã được thay hết biến. Bây giờ mới gán memo[key].', 'Every variable in the value is resolved. Assign memo[key] now.'));
      emit(f, 10, 'resolve-return', bi(`Trả về '${f.result}' cho cha`, `Return '${f.result}' to the parent`), bi('Cha sẽ ghép chuỗi này tại dòng parts.append.', 'The parent will append this string on its parts.append line.'));
    }
    stack.pop(); return f.result;
  }
  function expand(source, owner) {
    const f = frame('expand', owner, source); stack.push(f);
    emit(f, 11, 'expand-call', bi(`Gọi expand cho ${owner === null ? 'text' : owner}`, `Call expand for ${owner === null ? 'text' : owner}`), bi('Đọc từ trái sang phải. Giữ nguyên ký tự thường, thay mỗi %key% bằng chuỗi hoàn chỉnh.', 'Read left to right. Keep literal characters and replace each %key% with its fully expanded string.'));
    f.locals.parts = [];
    emit(f, 12, 'parts-init', bi('parts = []', 'parts = []'), bi('Các đoạn sẽ được ghép khi expand kết thúc.', 'Join the chunks when expand finishes.'));
    f.start = 0; f.locals.start = 0;
    emit(f, 13, 'start-init', bi('start = 0', 'start = 0'), bi('start là đầu đoạn thường chưa ghép.', 'start marks the next literal chunk to append.'));
    for (const match of source.matchAll(/%([A-Z])%/g)) {
      f.match = { key: match[1], token: match[0], from: match.index, to: match.index + match[0].length, value: null, appended: false };
      f.locals.match = match[0];
      emit(f, 14, 'match', bi(`Gặp ${match[0]} trong ${owner === null ? 'text' : owner}`, `Found ${match[0]} inside ${owner === null ? 'text' : owner}`), bi(`Vị trí [${f.match.from}, ${f.match.to}). Chuỗi gốc không bị sửa khi duyệt.`, `Positions [${f.match.from}, ${f.match.to}). The source string stays unchanged during scanning.`));
      const literal = source.slice(f.start, f.match.from);
      f.parts.push({ kind: 'literal', key: null, value: literal }); f.locals.parts.push(literal); f.cursor = f.match.from;
      emit(f, 15, 'literal', bi(`Ghép đoạn thường '${literal}'`, `Append literal '${literal}'`), bi(literal ? 'Giữ nguyên đoạn trước biến.' : 'Đoạn trước biến rỗng; không tạo ký tự mới.', literal ? 'Keep the text before the variable.' : 'The preceding chunk is empty; it adds no characters.'));
      emit(f, 16, 'call-child', bi(`Chờ resolve('${match[1]}')`, `Wait for resolve('${match[1]}')`), bi('Chưa append. Phải nhận kết quả con hoàn chỉnh trước.', 'No append yet. Receive the fully expanded child result first.'));
      const replacement = resolve(match[1]); f.match.value = replacement;
      f.parts.push({ kind: 'replacement', key: match[1], value: replacement }); f.locals.parts.push(replacement); f.match.appended = true; f.cursor = f.match.to;
      emit(f, 16, 'append-child', bi(`${match[0]} → '${replacement}'`, `${match[0]} → '${replacement}'`), bi('Con đã trả về. Ghép kết quả vào parts của đúng lời gọi cha.', 'The child returned. Append its result to this parent call’s parts.'));
      f.start = f.match.to; f.locals.start = f.start;
      emit(f, 17, 'advance', bi(`start = ${f.start}`, `start = ${f.start}`), bi('Lần tiếp theo lấy đoạn thường sau biến vừa xử lý.', 'The next literal chunk begins after this variable.'));
    }
    const tail = source.slice(f.start);
    f.parts.push({ kind: 'literal', key: null, value: tail }); f.locals.parts.push(tail); f.cursor = source.length; f.match = null;
    emit(f, 18, 'tail', bi(`Ghép đoạn cuối '${tail}'`, `Append tail '${tail}'`), bi('Không còn biến. Giữ nguyên phần còn lại.', 'No placeholders remain. Keep the rest of the source.'));
    f.result = f.parts.map(part => part.value).join('');
    emit(f, 19, 'expand-return', bi(`Ghép parts → '${f.result}'`, `Join parts → '${f.result}'`), bi('Trả chuỗi hoàn chỉnh cho lời gọi đang chờ.', 'Return the completed string to the waiting caller.'));
    stack.pop(); return f.result;
  }
  emit(null, 20, 'expand-text', bi('Bắt đầu mở rộng text', 'Start expanding text'), bi('Mỗi biến có thể dẫn tới một chuỗi lời gọi DFS.', 'Each placeholder can lead to a chain of DFS calls.'));
  answer = expand(text, null);
  emit(null, 20, 'return', bi(`Kết quả: ${answer}`, `Result: ${answer}`), bi('Tất cả biến đã được thay. Trả về chuỗi kết quả.', 'All placeholders are resolved. Return the resulting string.'), true);
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
    bi('Đọc text từ trái sang phải. Ký tự thường giữ nguyên; gặp %A% thì gọi resolve(A).', 'Read text left to right. Keep literal text; call resolve(A) for %A%.'),
    bi('DFS: nếu A chứa %B%, tạm chờ A, xử lý B trước. Khi con trả về mới ghép vào chuỗi của cha.', 'DFS: if A contains %B%, suspend A and resolve B first. Append the child result only after it returns.'),
    bi('Memo: chỉ nhớ chuỗi đã mở rộng hoàn chỉnh. Lần sau gặp cùng key thì dùng lại kết quả.', 'Memo: cache only fully expanded strings. Reuse a cached result whenever the same key appears again.'),
    bi('Ví dụ mặc định A=%B%x, B=%C%y, C=z: C→z, B→zy, A→zyx; text→zyx_zy_z.', 'Default example A=%B%x, B=%C%y, C=z: C→z, B→zy, A→zyx; text→zyx_zy_z.'),
  ],
  complexity: { time: 'O(N + S)', space: 'O(N + S)', note: bi('N là tổng độ dài input; S là tổng độ dài mọi chuỗi đã mở rộng (memo và đáp án). DFS sâu tối đa số key. Chuỗi mở rộng có thể lớn hơn input nhiều lần. Không tính bản sao visualization.', 'N is total input length; S is the combined size of expanded strings (memo and answer). DFS depth is at most the number of keys. Expansion can greatly exceed the input size. Excludes visualization snapshots.') },
  code: SOURCE, builder: buildSteps, liveArgs: (input, params) => { const parsed = parseInput(input, params); return [parsed.replacements, parsed.text]; },
} };
