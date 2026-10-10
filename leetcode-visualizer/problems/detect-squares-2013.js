"use strict";

const PROBLEM_ID = 2013;
const MAX_OPERATIONS = 60;
const MAX_COORDINATE = 1_000;
const MAX_TRACE_STEPS = 220;

const SOURCE = Object.freeze([
  "from collections import Counter",
  "",
  "class DetectSquares:",
  "    def __init__(self):",
  "        self.points = Counter()",
  "",
  "    def add(self, point: list[int]) -> None:",
  "        self.points[tuple(point)] += 1",
  "",
  "    def count(self, point: list[int]) -> int:",
  "        px, py = point",
  "        total = 0",
  "",
  "        for (x, y), diagonal_count in self.points.items():",
  "            if x == px or abs(x - px) != abs(y - py):",
  "                continue",
  "",
  "            total += (diagonal_count",
  "                      * self.points[(x, py)]",
  "                      * self.points[(px, y)])",
  "",
  "        return total",
]);

const bi = (vi, en) => ({ vi, en });
const pointKey = (x, y) => `${x},${y}`;

function parseOperations2013(input) {
  let decoded = input;
  if (typeof input === "string") {
    try {
      decoded = JSON.parse(input.trim());
    } catch (_error) {
      throw new TypeError(`#${PROBLEM_ID}: operations phải là JSON hợp lệ / operations must be valid JSON.`);
    }
  }
  if (!Array.isArray(decoded) || decoded.length < 1 || decoded.length > MAX_OPERATIONS) {
    throw new RangeError(`#${PROBLEM_ID}: cần 1..${MAX_OPERATIONS} operations / provide 1..${MAX_OPERATIONS} operations.`);
  }
  return decoded.map((row, index) => {
    if (!Array.isArray(row) || row.length !== 2 || !["add", "count"].includes(row[0])) {
      throw new TypeError(`#${PROBLEM_ID}: operation ${index + 1} phải là ["add"|"count", [x,y]].`);
    }
    const point = row[1];
    if (!Array.isArray(point) || point.length !== 2 || point.some((value) => !Number.isSafeInteger(value))) {
      throw new TypeError(`#${PROBLEM_ID}: point tại operation ${index + 1} phải gồm 2 số nguyên.`);
    }
    const [x, y] = point;
    if (x < 0 || x > MAX_COORDINATE || y < 0 || y > MAX_COORDINATE) {
      throw new RangeError(`#${PROBLEM_ID}: tọa độ tại operation ${index + 1} phải thuộc 0..${MAX_COORDINATE}.`);
    }
    return { name: row[0], args: [[x, y]], point: [x, y], label: `${row[0]}([${x}, ${y}])` };
  });
}

function buildSteps2013(input) {
  const operations = parseOperations2013(input);
  const frequency = new Map();
  const outputs = [];
  const history = [];
  const steps = [];
  let traceTruncated = false;

  const pointViews = () => [...frequency.entries()]
    .map(([key, count]) => {
      const [x, y] = key.split(",").map(Number);
      return { x, y, count };
    })
    .sort((left, right) => left.x - right.x || left.y - right.y);

  const emit = ({ phase, operationIndex, title, note, codeLines, query = null, candidate = null, square = null, running = 0, final = false }) => {
    if (!final && steps.length >= MAX_TRACE_STEPS - 1) {
      traceTruncated = true;
      return;
    }
    const points = pointViews();
    const activeKeys = new Set((square || []).map(([x, y]) => pointKey(x, y)));
    steps.push({
      title,
      note,
      codeLines,
      final,
      arr: points.map((point) => point.count),
      sub: points.map((point) => `(${point.x},${point.y})`),
      highlight: points.map((point, index) => activeKeys.has(pointKey(point.x, point.y)) ? index : -1).filter((index) => index >= 0),
      mark: query ? points.map((point, index) => point.x === query[0] && point.y === query[1] ? index : -1).filter((index) => index >= 0) : [],
      vars: [
        { name: "operation", value: operationIndex === null ? "complete" : operations[operationIndex].label },
        { name: "distinct points", value: points.length },
        { name: "running total", value: running },
        { name: "outputs", value: JSON.stringify(outputs) },
      ],
      detectSquares2013View: {
        phase,
        operationIndex,
        operationCount: operations.length,
        points,
        query: query ? [...query] : null,
        candidate: candidate ? { ...candidate, diagonal: [...candidate.diagonal], otherCorners: candidate.otherCorners.map((point) => [...point]) } : null,
        square: square ? square.map((point) => [...point]) : null,
        running,
        history: history.map((entry) => ({ ...entry, point: [...entry.point] })),
        outputs: [...outputs],
        traceTruncated,
        answer: final ? [...outputs] : null,
      },
    });
  };

  emit({
    phase: "init",
    operationIndex: 0,
    title: bi("Khởi tạo bộ đếm điểm", "Initialize the point counter"),
    note: bi("Counter lưu multiplicity vì cùng một tọa độ có thể được add nhiều lần.", "The Counter stores multiplicity because the same coordinate may be added repeatedly."),
    codeLines: [1, 3, 4, 5],
  });

  operations.forEach((operation, operationIndex) => {
    const [px, py] = operation.point;
    if (operation.name === "add") {
      const key = pointKey(px, py);
      frequency.set(key, (frequency.get(key) || 0) + 1);
      outputs.push(null);
      history.push({ index: operationIndex + 1, name: "add", point: [px, py], result: null, running: 0 });
      emit({
        phase: "add",
        operationIndex,
        title: bi(`Thêm điểm (${px}, ${py})`, `Add point (${px}, ${py})`),
        note: bi(`Multiplicity tại (${px}, ${py}) tăng thành ${frequency.get(key)}.`, `Multiplicity at (${px}, ${py}) becomes ${frequency.get(key)}.`),
        codeLines: [7, 8],
        square: [[px, py]],
      });
      return;
    }

    let total = 0;
    emit({
      phase: "count-start",
      operationIndex,
      title: bi(`Đếm hình vuông chứa (${px}, ${py})`, `Count squares containing (${px}, ${py})`),
      note: bi("Duyệt mỗi điểm đã lưu như góc chéo đối diện với query.", "Treat every stored point as the diagonal corner opposite the query."),
      codeLines: [10, 11, 12, 14],
      query: [px, py],
    });

    for (const diagonal of pointViews()) {
      const dx = diagonal.x - px;
      const dy = diagonal.y - py;
      if (dx === 0 || Math.abs(dx) !== Math.abs(dy)) continue;
      const cornerA = [diagonal.x, py];
      const cornerB = [px, diagonal.y];
      const countA = frequency.get(pointKey(...cornerA)) || 0;
      const countB = frequency.get(pointKey(...cornerB)) || 0;
      const contribution = diagonal.count * countA * countB;
      total += contribution;
      const candidate = {
        diagonal: [diagonal.x, diagonal.y],
        diagonalCount: diagonal.count,
        otherCorners: [cornerA, cornerB],
        cornerCounts: [countA, countB],
        side: Math.abs(dx),
        contribution,
        complete: contribution > 0,
      };
      emit({
        phase: contribution > 0 ? "match" : "missing",
        operationIndex,
        title: contribution > 0
          ? bi(`Tìm thấy hình vuông cạnh ${Math.abs(dx)}: +${contribution}`, `Found side-${Math.abs(dx)} square: +${contribution}`)
          : bi("Thiếu một góc còn lại", "A required corner is missing"),
        note: contribution > 0
          ? bi(`${diagonal.count} × ${countA} × ${countB} = ${contribution}; tổng = ${total}.`, `${diagonal.count} × ${countA} × ${countB} = ${contribution}; total = ${total}.`)
          : bi(`Góc chéo hợp lệ, nhưng multiplicity hai góc còn lại là ${countA} và ${countB}.`, `The diagonal is valid, but the two remaining corner multiplicities are ${countA} and ${countB}.`),
        codeLines: contribution > 0 ? [14, 15, 18, 19, 20] : [14, 15, 18, 19, 20],
        query: [px, py],
        candidate,
        square: [[px, py], cornerA, [diagonal.x, diagonal.y], cornerB],
        running: total,
      });
    }

    outputs.push(total);
    history.push({ index: operationIndex + 1, name: "count", point: [px, py], result: total, running: total });
    emit({
      phase: "count-done",
      operationIndex,
      title: bi(`count([${px}, ${py}]) = ${total}`, `count([${px}, ${py}]) = ${total}`),
      note: bi("Đã cộng đóng góp của mọi lựa chọn góc chéo.", "All diagonal-corner contributions have been accumulated."),
      codeLines: [22],
      query: [px, py],
      running: total,
    });
  });

  emit({
    phase: "done",
    operationIndex: null,
    title: bi("Hoàn tất chuỗi thao tác", "Operation stream complete"),
    note: traceTruncated
      ? bi("Kết quả vẫn đầy đủ; trace dài đã được rút gọn.", "The answers are complete; the long trace was compacted.")
      : bi("Mỗi count đã xét các góc chéo và multiplicity tương ứng.", "Each count examined diagonal corners and their multiplicities."),
    codeLines: [22],
    final: true,
  });

  return {
    original: operations.map((operation) => [operation.name, [...operation.point]]),
    operations: operations.map((operation) => ({ name: operation.name, args: [[...operation.point]] })),
    answer: outputs,
    steps,
  };
}

module.exports = {
  2013: {
    id: 2013,
    difficulty: "medium",
    slug: "detect-squares",
    category: { key: "design", vi: "Thiết kế hệ thống", en: "Design" },
    tags: [
      { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
      { key: "geometry", vi: "Hình học", en: "Geometry" },
      { key: "counting", vi: "Đếm", en: "Counting" },
    ],
    title: bi("Detect Squares", "Detect Squares"),
    titleVi: bi("Phát hiện hình vuông song song trục", "Detect axis-aligned squares"),
    statement: bi(
      "Thiết kế cấu trúc add(point) và count(point): đếm số cách chọn ba điểm đã lưu để cùng query tạo thành hình vuông song song các trục. Điểm trùng được tính theo multiplicity.",
      "Design add(point) and count(point): count ways to choose three stored points that form an axis-aligned square with the query. Duplicate points count by multiplicity.",
    ),
    defaultInput: '[["add",[3,10]],["add",[11,2]],["add",[3,2]],["count",[11,10]],["count",[14,8]],["add",[11,2]],["count",[11,10]]]',
    inputKind: "string",
    inputLabel: bi("Operations JSON: add/count với [x,y]", "Operations JSON: add/count with [x,y]"),
    extraParams: [],
    debugMode: "line-by-line",
    approach: [
      bi("Counter[(x,y)] lưu số lần mỗi điểm được thêm.", "Counter[(x,y)] stores how often each point was added."),
      bi("Với query (px,py), chọn một điểm chéo (x,y) sao cho |x−px| = |y−py| > 0.", "For query (px,py), choose a diagonal point (x,y) with |x−px| = |y−py| > 0."),
      bi("Hai góc còn lại bắt buộc là (x,py) và (px,y); nhân ba multiplicity rồi cộng vào đáp án.", "The remaining corners must be (x,py) and (px,y); multiply the three multiplicities and add the result."),
    ],
    complexity: {
      time: "add O(1), count O(P)",
      space: "O(P)",
      note: bi("P là số tọa độ phân biệt đã được thêm.", "P is the number of distinct stored coordinates."),
    },
    code: SOURCE,
    parseOperations: parseOperations2013,
    builder: buildSteps2013,
  },
};
