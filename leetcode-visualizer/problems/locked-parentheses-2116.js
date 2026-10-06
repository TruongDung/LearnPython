"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def canBeValid(self, s: str, locked: str) -> bool:",
  "        n = len(s)",
  "        if n % 2:",
  "            return False",
  "        balance = 0",
  "        for i in range(n):",
  "            if locked[i] == '0' or s[i] == '(':",
  "                balance += 1",
  "            else:",
  "                balance -= 1",
  "            if balance < 0:",
  "                return False",
  "        balance = 0",
  "        for i in range(n - 1, -1, -1):",
  "            if locked[i] == '0' or s[i] == ')':",
  "                balance += 1",
  "            else:",
  "                balance -= 1",
  "            if balance < 0:",
  "                return False",
  "        return True",
];

function parseInput(input, params = {}, limit = 80) {
  if (typeof input !== 'string' || typeof params.locked !== 'string') throw new TypeError('#2116: s and locked must be strings / s và locked phải là chuỗi.');
  const s = input.trim(), locked = params.locked.trim();
  if (!s.length || s.length > limit || !/^[()]+$/.test(s)) throw new Error(`#2116: s needs 1–${limit} parentheses / s cần 1–${limit} dấu ngoặc.`);
  if (locked.length !== s.length || !/^[01]+$/.test(locked)) throw new Error('#2116: locked must contain 0/1 and have the same length as s / locked chỉ gồm 0/1 và phải dài bằng s.');
  return { s, locked };
}

function buildSteps(input, params = {}) {
  const { s, locked } = parseInput(input, params), steps = [];
  const locals = { s, locked }, passes = { forward: { status: 'pending', trail: [] }, backward: { status: 'pending', trail: [] } };
  let n = null, balance = null, index = null, phase = 'length', choice = null, failure = null;
  function emit(line, event, title, note, answer = null) {
    // The witness is an illustration, separate from the two-pass Python checks.
    let witness = null;
    if (answer === true) {
      let openQuota = s.length / 2 - [...s].filter((ch, i) => locked[i] === '1' && ch === '(').length;
      witness = [...s].map((ch, i) => locked[i] === '1' ? ch : openQuota-- > 0 ? '(' : ')').join('');
    }
    steps.push({ arr: [], highlight: [], mark: [], codeLines: [line], final: answer !== null, title, note,
      vars: Object.entries(locals).map(([name, value]) => ({ name, value })),
      lockedParentheses2116View: { s, locked, n, index, phase, event, line, balance, choice, answer, witness,
        failure: failure ? { ...failure } : null,
        forward: { status: passes.forward.status, trail: passes.forward.trail.map(item => ({ ...item })) },
        backward: { status: passes.backward.status, trail: passes.backward.trail.map(item => ({ ...item })) },
      },
    });
  }
  emit(2, 'call', bi('locked = 1: giữ nguyên; locked = 0: được đổi', 'locked = 1: fixed; locked = 0: editable'), bi("Vị trí được đổi vẫn phải là '(' hoặc ')', không thể xóa ký tự.", "An editable position must remain '(' or ')'; it cannot be deleted."));
  n = s.length; locals.n = n;
  emit(3, 'length', bi(`n = ${n}`, `n = ${n}`), bi('Chuỗi hợp lệ có số dấu mở bằng số dấu đóng, nên độ dài phải chẵn.', 'A valid string has equal opening and closing counts, so its length must be even.'));
  const odd = n % 2 === 1;
  if (odd) failure = { kind: 'odd-length' };
  emit(4, 'check-length', bi(`n % 2 → ${n % 2}`, `n % 2 → ${n % 2}`), bi(odd ? 'Độ dài lẻ: đổi ký tự cũng không thể tạo đủ các cặp.' : 'Độ dài chẵn. Tiếp tục kiểm tra hai hướng.', odd ? 'Odd length: changing characters cannot form complete pairs.' : 'Even length. Continue with both directional checks.'));
  if (odd) {
    emit(5, 'return', bi('return False: độ dài lẻ', 'return False: odd length'), bi('Không chạy hai lượt quét vì đã có điều kiện loại chắc chắn.', 'Neither scan runs because the length already rules out validity.'), false);
    return { original: s, answer: false, steps };
  }
  for (const direction of ['forward', 'backward']) {
    const forward = direction === 'forward', pass = passes[direction];
    if (!forward) passes.forward.status = 'passed';
    phase = direction; index = null; choice = null; balance = 0; locals.balance = balance; pass.status = 'running';
    emit(forward ? 6 : 14, 'reset', bi(`balance = 0 · ${forward ? 'trái → phải' : 'phải → trái'}`, `balance = 0 · ${forward ? 'left → right' : 'right → left'}`), bi(forward ? "Giả sử mọi vị trí tự do là '(' để tối đa khả năng cung cấp dấu mở cho mỗi prefix." : "Quét lại độc lập: giả sử mọi vị trí tự do là ')' để tối đa khả năng cung cấp dấu đóng cho mỗi suffix.", forward ? "Assume every editable position is '(' to maximize opening supply in each prefix." : "Start an independent scan: assume every editable position is ')' to maximize closing supply in each suffix."));
    for (let j = 0; j < n; j++) {
      index = forward ? j : n - 1 - j; locals.i = index; choice = null;
      emit(forward ? 7 : 15, 'read', bi(`Xét s[${index}] = '${s[index]}', locked = ${locked[index]}`, `Read s[${index}] = '${s[index]}', locked = ${locked[index]}`), bi('Đọc ký tự chưa làm balance thay đổi.', 'Reading a character does not change balance.'));
      const flexible = locked[index] === '0', supply = forward ? '(' : ')';
      const adds = flexible || s[index] === supply;
      choice = flexible ? supply : s[index];
      emit(forward ? 8 : 16, 'branch', bi(`${flexible ? 'Vị trí tự do' : 'Vị trí khóa'}: xét '${choice}'`, `${flexible ? 'Editable' : 'Locked'}: consider '${choice}'`), bi(flexible ? `Chỉ giả định '${supply}' cho lượt này, chưa chốt ký tự của chuỗi kết quả.` : 'Ký tự khóa phải giữ nguyên.', flexible ? `Assume '${supply}' for this scan only; this does not finalize the result string.` : 'A locked character must stay unchanged.'));
      if (!adds) emit(forward ? 10 : 18, 'else', bi('Ký tự này tiêu thụ một khả năng ghép cặp', 'This character consumes one pairing opportunity'), bi('Dòng trừ balance sẽ chạy tiếp theo.', 'The balance subtraction runs on the next line.'));
      const before = balance; balance += adds ? 1 : -1; locals.balance = balance;
      pass.trail.push({ index, choice, flexible, delta: adds ? 1 : -1, before, balance });
      emit(forward ? adds ? 9 : 11 : adds ? 17 : 19, 'update', bi(`balance: ${before} ${adds ? '+' : '−'} 1 = ${balance}`, `balance: ${before} ${adds ? '+' : '−'} 1 = ${balance}`), bi(adds ? `Có thêm một dấu '${supply}' có thể dùng để ghép.` : `Một dấu '${s[index]}' cần được ghép từ ${forward ? 'bên trái' : 'bên phải'}.`, adds ? `One more '${supply}' is available for pairing.` : `A '${s[index]}' needs a match from the ${forward ? 'left' : 'right'}.`));
      const negative = balance < 0;
      if (negative) failure = { kind: direction, index, start: forward ? 0 : index, end: forward ? index : n - 1 };
      emit(forward ? 12 : 20, 'check', bi(`balance < 0 → ${negative ? 'True' : 'False'}`, `balance < 0 → ${negative ? 'True' : 'False'}`), bi(negative ? 'Dù dùng mọi vị trí tự do theo hướng có lợi nhất, đoạn này vẫn thiếu dấu để ghép.' : 'Đoạn vừa quét chưa thiếu khả năng ghép. Còn phải kiểm tra phần tiếp theo.', negative ? 'Even the most favorable use of editable positions cannot supply enough matches in this segment.' : 'The scanned segment has enough pairing capacity. The remaining checks still need to run.'));
      if (negative) {
        pass.status = 'failed';
        emit(forward ? 13 : 21, 'return', bi(`return False: ${forward ? 'prefix thiếu dấu mở' : 'suffix thiếu dấu đóng'}`, `return False: ${forward ? 'prefix lacks openings' : 'suffix lacks closings'}`), bi(`Không thể sửa đoạn [${failure.start}…${failure.end}] chỉ bằng các vị trí được phép đổi.`, `Editable positions cannot repair segment [${failure.start}…${failure.end}].`), false);
        return { original: s, answer: false, steps };
      }
    }
  }
  passes.backward.status = 'passed';
  emit(22, 'return', bi('return True: cả hai lượt đều đạt', 'return True: both scans passed'), bi('Độ dài chẵn và mọi prefix/suffix đều đủ khả năng ghép. Chuỗi minh họa bên dưới chọn đủ n/2 dấu mở, ưu tiên vị trí tự do bên trái.', 'The length is even and every prefix/suffix has enough pairing capacity. The illustration below chooses n/2 openings, using the earliest editable positions first.'), true);
  return { original: s, answer: true, steps };
}

module.exports = { 2116: {
  id: 2116, difficulty: 'medium', slug: 'check-if-a-parentheses-string-can-be-valid',
  category: { key: 'greedy', vi: 'Tham lam', en: 'Greedy' },
  tags: [{ key: 'string', vi: 'Chuỗi', en: 'String' }, { key: 'parentheses', vi: 'Ngoặc', en: 'Parentheses' }, { key: 'greedy', vi: 'Tham lam', en: 'Greedy' }],
  title: bi('Check if a Parentheses String Can Be Valid', 'Check if a Parentheses String Can Be Valid'),
  titleVi: bi('Kiểm tra chuỗi ngoặc có thể sửa thành hợp lệ', 'Check whether editable parentheses can make the string valid'),
  statement: bi("Cho s và locked cùng độ dài. locked[i] = 1 thì giữ nguyên s[i]; 0 thì được chọn '(' hoặc ')'. Trả về true nếu có thể tạo chuỗi ngoặc hợp lệ. Đề gốc tối đa 100.000 ký tự; visualization từng dòng hỗ trợ 1–80 ký tự.", "Given equal-length s and locked, locked[i] = 1 fixes s[i]; 0 lets you choose '(' or ')'. Return true if a valid parentheses string is possible. The original limit is 100,000 characters; this line-by-line visualization supports 1–80."),
  inputKind: 'string', inputLabel: bi('s — 1–80 dấu ngoặc', 's — 1–80 parentheses'), defaultInput: '))()))',
  extraParams: [{ key: 'locked', type: 'string', label: bi('locked — 0: được đổi, 1: khóa; dài bằng s', 'locked — 0: editable, 1: fixed; same length as s'), default: '010100' }],
  debugMode: 'line-by-line',
  approach: [
    bi('Độ dài lẻ → false ngay: không thể ghép đủ cặp, kể cả tất cả vị trí đều tự do.', 'Odd length → false immediately: pairs cannot cover the string, even if every position is editable.'),
    bi("Trái → phải: coi mỗi vị trí tự do là '('; balance âm nghĩa là prefix vẫn thiếu dấu mở.", "Left → right: treat every editable position as '('; negative balance means the prefix still lacks openings."),
    bi("Phải → trái: đặt lại balance, coi mỗi vị trí tự do là ')'; balance âm nghĩa là suffix vẫn thiếu dấu đóng.", "Right → left: reset balance and treat every editable position as ')'; negative balance means the suffix still lacks closings."),
    bi('Hai lượt dùng hai giả định độc lập, không phải chuỗi kết quả. Độ dài chẵn và cả hai đạt → true.', 'The scans use independent assumptions, not a result string. Even length and both scans passing → true.'),
  ],
  complexity: { time: 'O(n)', space: 'O(1)', note: bi('Hai lượt quét chỉ dùng bộ đếm. Không tính các khung và chuỗi minh họa của visualization.', 'The two scans use a counter. Excludes visualization snapshots and the illustrative witness.') },
  code: SOURCE, builder: buildSteps, liveArgs: (input, params) => { const { s, locked } = parseInput(input, params, 100000); return [s, locked]; },
} };
