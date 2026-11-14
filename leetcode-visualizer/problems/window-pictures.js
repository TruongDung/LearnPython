'use strict';

const range = (left, right) => Array.from({ length: Math.max(0, right - left + 1) }, (_, i) => left + i);
const counts = items => Object.fromEntries([...new Set(items)].map(value => [value, items.filter(item => item === value).length]));
const words = {
  setup: ['Chuẩn bị cửa sổ', 'Prepare the window'],
  add: ['Thêm bên phải →', 'Add on the right →'],
  check: ['Kiểm tra cửa sổ', 'Check the window'],
  shrink: ['Bỏ bên trái → L', 'Remove from the left → L'],
  best: ['🏆 Kỷ lục mới', '🏆 New best window'],
  keep: ['Giữ kỷ lục hiện tại', 'Keep the current record'],
  emit: ['Lấy phần tử ở giữa', 'Read the middle'],
  result: ['Kết quả', 'Result'],
  pop: ['Lấy số nhỏ nhất', 'Take the smallest value'],
  advance: ['Tiến trong hàng giữ minimum →', 'Advance the row holding the minimum →'],
  stop: ['Một hàng đã hết → dừng', 'One row is exhausted → stop'],
};

function emit(steps, state) {
  const view = structuredClone(state), title = words[view.phase] || words.check;
  steps.push({
    title: { vi: title[0], en: title[1] }, note: { vi: '', en: '' },
    arr: [...(view.items || [])], highlight: range(view.left ?? 0, view.right ?? -1),
    mark: view.best ? range(...view.best) : [], final: Boolean(view.final), codeLines: view.lines || [view.line],
    vars: [{ name: 'left', value: view.left ?? '—' }, { name: 'right', value: view.right ?? '—' }, { name: 'answer', value: view.answer ?? '—' }],
    windowStudyView: view,
  });
}

function build424(input, params = {}) {
  const s = String(input ?? ''), items = [...s], k = Number(params.k ?? 2);
  if (!Number.isSafeInteger(k) || k < 0) throw new Error('424: k must be a non-negative integer');
  const steps = [], count = new Map();
  let left = 0, right = -1, maxFreq = 0, answer = 0, best = [0, -1];
  const snap = (phase, line, extra = {}) => emit(steps, { id: 424, kind: 'replacement', items, k, left, right,
    count: Object.fromEntries(count), maxFreq, best, answer, phase, line, ...extra });
  snap('setup', 3);
  for (right = 0; right < items.length; right++) {
    const ch = items[right];
    count.set(ch, (count.get(ch) || 0) + 1);
    maxFreq = Math.max(maxFreq, count.get(ch));
    snap('add', 6, { lines: [4, 5, 6], focus: right });
    snap('check', 7);
    while (right - left + 1 - maxFreq > k) {
      const removed = left;
      count.set(items[left], count.get(items[left]) - 1); left++;
      snap('shrink', 8, { removed });
      snap('check', 7);
    }
    const improved = right - left + 1 > answer;
    if (improved) { answer = right - left + 1; best = [left, right]; }
    snap(improved ? 'best' : 'keep', 9);
  }
  left = best[0]; right = best[1];
  snap('result', 10, { final: true, count: counts(items.slice(left, right + 1)) });
  return { original: s, k, answer, steps };
}

function build487(nums) {
  if (!Array.isArray(nums) || nums.some(n => n !== 0 && n !== 1)) throw new Error('487: nums must be binary');
  const items = [...nums], steps = [];
  let left = 0, right = -1, zeros = 0, answer = 0, best = [0, -1];
  const snap = (phase, line, extra = {}) => emit(steps, { id: 487, kind: 'binary', items, k: 1, left, right, zeros, answer, best, phase, line, ...extra });
  snap('setup', 5, { lines: [3, 4, 5] });
  for (right = 0; right < items.length; right++) {
    if (items[right] === 0) zeros++;
    snap('add', 8, { lines: [6, 7, 8], focus: right });
    snap('check', 9);
    while (zeros > 1) {
      const removed = left;
      if (items[left] === 0) zeros--;
      left++;
      snap('shrink', 12, { lines: [10, 11, 12], removed });
      snap('check', 9);
    }
    const improved = right - left + 1 > answer;
    if (improved) { answer = right - left + 1; best = [left, right]; }
    snap(improved ? 'best' : 'keep', 13);
  }
  left = best[0]; right = best[1]; zeros = items.slice(left, right + 1).filter(n => n === 0).length;
  snap('result', 14, { final: true });
  return { original: items, answer, steps };
}

function build480(input, params = {}) {
  const items = Array.isArray(input) ? [...input] : String(input).split(',').map(Number), k = Number(params.k ?? 3);
  if (!items.length || items.some(n => !Number.isSafeInteger(n)) || !Number.isSafeInteger(k) || k < 1 || k > items.length) throw new Error('480: use integer nums and 1 ≤ k ≤ nums.length');
  const steps = [], sorted = [], result = [], history = [];
  let left = 0, right = -1;
  const snap = (phase, line, extra = {}) => emit(steps, { id: 480, kind: 'median', items, k, left, right, sorted, result, history, phase, line, ...extra });
  snap('setup', 3, { lines: [3, 4] });
  for (right = 0; right < items.length; right++) {
    left = Math.max(0, right - k);
    const entry = { value: items[right], index: right };
    let at = sorted.findIndex(item => item.value >= entry.value); if (at < 0) at = sorted.length;
    sorted.splice(at, 0, entry);
    snap('add', 6, { lines: [5, 6], focus: right });
    if (right >= k) {
      const removed = right - k;
      // SortedList.remove removes one equal value; identity tracks the outgoing occurrence.
      sorted.splice(sorted.findIndex(item => item.index === removed), 1); left++;
      snap('shrink', 8, { lines: [7, 8], removed });
    }
    if (right >= k - 1) {
      const middle = k % 2 ? [Math.floor(k / 2)] : [k / 2 - 1, k / 2];
      const median = k % 2 ? sorted[middle[0]].value : sorted[middle[0]].value / 2 + sorted[middle[1]].value / 2;
      result.push(median); history.push({ left, right, median, sorted: structuredClone(sorted), middle });
      snap('emit', k % 2 ? 10 : 11, { lines: [9, k % 2 ? 10 : 11], middle, median });
    }
  }
  right = items.length - 1;
  snap('result', 12, { final: true });
  return { original: items, k, answer: result, steps };
}

function build632(input) {
  const lists = String(input ?? '').split('|').map(part => part.trim()).filter(Boolean).map(part => part.split(',').map(value => Number(value.trim())));
  if (!lists.length || lists.some(list => !list.length || list.some(n => !Number.isFinite(n)) || list.some((n, i) => i && n < list[i - 1]))) throw new Error('632: use non-empty sorted lists separated by |');
  const steps = [], heap = lists.map((list, row) => [list[0], row, 0]), selected = lists.map(() => 0), history = [];
  heap.sort((a, b) => a[0] - b[0]);
  let currentMax = Math.max(...heap.map(entry => entry[0])), best = null, current = [heap[0][0], currentMax], popped = null;
  const snap = (phase, line, extra = {}) => emit(steps, { id: 632, kind: 'range', lists, heap, selected, currentMax, current, popped, bestRange: best, history, phase, line, ...extra });
  snap('setup', 3, { lines: [3, 4] });
  while (heap.length) {
    const [low, row, index] = heap.shift(); popped = [low, row, index]; current = [low, currentMax];
    snap('pop', 6, { focusRow: row });
    const improved = !best || currentMax - low < best[1] - best[0] || (currentMax - low === best[1] - best[0] && low < best[0]);
    if (improved) best = [...current];
    history.push({ range: [...current], selected: [...selected], improved });
    snap(improved ? 'best' : 'keep', 7, { focusRow: row });
    if (index + 1 === lists[row].length) { snap('stop', 8, { focusRow: row }); break; }
    const next = lists[row][index + 1]; currentMax = Math.max(currentMax, next);
    selected[row] = index + 1;
    current = [Math.min(...selected.map((col, r) => lists[r][col])), currentMax];
    snap('advance', 9, { focusRow: row, next: [next, row, index + 1] });
    heap.push([next, row, index + 1]); heap.sort((a, b) => a[0] - b[0]);
    current = [heap[0][0], currentMax]; popped = null;
    snap('add', 10, { focusRow: row });
  }
  snap('result', 11, { final: true });
  return { original: lists, answer: best, steps };
}

module.exports = { build424, build487, build480, build632 };
