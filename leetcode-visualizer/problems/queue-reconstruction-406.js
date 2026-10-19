"use strict";

const { bi, parseRows } = require("./hard-viz-shared");

function parsePeople(input) {
  const people = parseRows(input, { problemId: 406, name: "people", columns: 2, maxRows: 100, minValue: 0, maxValue: 1000000 });
  if (people.some(([, k]) => k >= people.length)) {
    throw new RangeError("#406: k phải nhỏ hơn số người / k must be smaller than the number of people.");
  }
  return people;
}

function buildSteps(input) {
  const people = parsePeople(input);
  const original = people.map(([h, k], id) => ({ h, k, id }));
  const sorted = [...original].sort((a, b) => b.h - a.h || a.k - b.k);
  const queue = [];
  const steps = [];
  function emit(phase, line, current, remaining, title, note, final = false) {
    steps.push({
      arr: [], codeLines: [line], final, title, note,
      vars: [{ name: "h", value: current?.h ?? "—" }, { name: "k", value: current?.k ?? "—" },
        { name: "queue", value: queue.map(p => [p.h, p.k]) }],
      queue406View: { phase, original, sorted, queue: [...queue], current, remaining, maxHeight: Math.max(...people.map(p => p[0])) },
    });
  }
  emit("input", 2, null, original, bi("Mỗi người mang nhãn [h, k]", "Each person carries [h, k]"), bi("h: chiều cao · k: số người cao ≥ h đứng trước.", "h: height · k: people of height ≥ h ahead."));
  emit("sort", 2, null, sorted, bi("Cao trước · cùng chiều cao: k nhỏ trước", "Tallest first · equal height: smaller k first"), bi("h ↓ · k ↑", "h ↓ · k ↑"));
  emit("empty", 3, null, sorted, bi("Bắt đầu với hàng trống", "Start with an empty queue"), bi("Lần lượt lấy người từ trái sang phải.", "Take people from left to right."));
  sorted.forEach((person, index) => {
    if (person.k > queue.length) throw new RangeError("#406: dữ liệu không tạo được hàng hợp lệ / people do not form a valid queue.");
    emit("place", 4, person, sorted.slice(index), bi(`Đặt [${person.h}, ${person.k}] tại vị trí ${person.k}`, `Place [${person.h}, ${person.k}] at index ${person.k}`), bi("Vị trí bắt đầu từ 0. Người phía sau dịch sang phải.", "Indices start at 0. People behind shift right."));
    queue.splice(person.k, 0, person);
    emit("insert", 5, person, sorted.slice(index + 1), bi(`Đã chèn tại ${person.k}`, `Inserted at ${person.k}`), bi(`Đúng ${person.k} người cao ≥ ${person.h} đứng trước.`, `Exactly ${person.k} people of height ≥ ${person.h} ahead.`));
  });
  if (queue.some((person, index) => queue.slice(0, index).filter(p => p.h >= person.h).length !== person.k)) {
    throw new RangeError("#406: dữ liệu không tạo được hàng hợp lệ / people do not form a valid queue.");
  }
  emit("done", 6, sorted.at(-1), [], bi("Xếp xong ✓", "Queue complete ✓"), bi("Chọn một người để đếm số người cao ≥ h đứng trước.", "Select a person to count people of height ≥ h ahead."), true);
  return { input: people, answer: queue.map(p => [p.h, p.k]), steps };
}

module.exports = {
  406: {
    id: 406, difficulty: "medium", slug: "queue-reconstruction-by-height",
    category: { key: "greedy", vi: "Tham lam", en: "Greedy" },
    tags: [{ key: "array", vi: "Mảng", en: "Array" }],
    title: bi("Queue Reconstruction by Height", "Queue Reconstruction by Height"),
    titleVi: bi("Xếp hàng theo chiều cao", "Reconstruct the queue by height"),
    statement: bi("Mỗi người là [h,k]: chiều cao h, có đúng k người cao ≥ h đứng trước. Hãy xếp lại hàng.", "Each person is [h,k]: height h, with exactly k people of height ≥ h ahead. Reconstruct the queue."),
    defaultInput: "[[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]", inputKind: "string",
    inputLabel: bi("people: [[h,k], …] hoặc h,k; h,k; … (tối đa 100 người)", "people: [[h,k], …] or h,k; h,k; … (up to 100 people)"),
    extraParams: [],
    approach: [bi("Cao trước: h ↓. Cùng chiều cao: k ↑.", "Tallest first: h ↓. Equal height: k ↑."), bi("Chèn mỗi người vào chỉ số k (tính từ 0).", "Insert each person at index k (starting at 0)."), bi("Người thấp chèn sau không làm đổi số người cao phía trước.", "Inserting shorter people later preserves taller people's counts.")],
    complexity: { time: "O(n²)", space: "O(n)", note: bi("Chèn vào mảng phải dịch các phần tử phía sau.", "Array insertion shifts the following elements.") },
    code: ["class Solution:", "    def reconstructQueue(self, people):", "        people.sort(key=lambda p: (-p[0], p[1]))", "        queue = []", "        for h, k in people:", "            queue.insert(k, [h, k])", "        return queue"],
    builder: (input) => {
      const result = buildSteps(input);
      // Frames use one-based Python lines, including the class declaration.
      result.steps.forEach(step => { step.codeLines = step.codeLines.map(line => line + 1); });
      return result;
    },
    liveArgs: input => [parsePeople(input)],
  },
};
