"use strict";

const MAX_VISUALIZED_POINTS = 18;
const MAX_COORDINATE = 100;
const EPSILON = 1e-9;

const text = (vi, en) => ({ vi, en });

function parseIntegerPair(value, label) {
  let pair = value;
  if (typeof pair === "string") {
    const source = pair.trim();
    if (!source) throw new Error(`${label} must contain two coordinates`);
    if (source.startsWith("[")) {
      try {
        pair = JSON.parse(source);
      } catch (_error) {
        throw new Error(`${label} must be written as x,y or [x,y]`);
      }
    } else {
      const parts = source.split(",");
      if (parts.length !== 2 || parts.some((part) => !part.trim())) {
        throw new Error(`${label} must be written as x,y or [x,y]`);
      }
      pair = parts.map((part) => Number(part.trim()));
    }
  }

  if (!Array.isArray(pair) || pair.length !== 2) {
    throw new Error(`${label} must contain exactly two coordinates`);
  }

  const parsed = pair.map((coordinate) => Number(coordinate));
  if (parsed.some((coordinate) => !Number.isInteger(coordinate) || Math.abs(coordinate) > MAX_COORDINATE)) {
    throw new Error(`${label} coordinates must be integers from -${MAX_COORDINATE} to ${MAX_COORDINATE}`);
  }
  return parsed;
}

function parsePoints(value) {
  let rows = value;
  if (typeof rows === "string") {
    const source = rows.trim();
    if (!source) throw new Error("points must not be empty");
    if (source.startsWith("[")) {
      try {
        rows = JSON.parse(source);
      } catch (_error) {
        throw new Error("points must be JSON or x,y pairs separated by semicolons");
      }
    } else {
      const parts = source.split(/[;|\n]/).map((part) => part.trim()).filter(Boolean);
      rows = parts.map((part, index) => parseIntegerPair(part, `point ${index + 1}`));
    }
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("points must contain at least one point");
  }
  if (rows.length > MAX_VISUALIZED_POINTS) {
    throw new Error(`this visualization supports at most ${MAX_VISUALIZED_POINTS} points`);
  }
  return rows.map((row, index) => parseIntegerPair(row, `point ${index + 1}`));
}

function parseVisiblePoints1610Input(input, params = {}) {
  const points = parsePoints(input);
  const rawAngle = params.angle ?? 90;
  if (typeof rawAngle === "string" && !rawAngle.trim()) {
    throw new Error("angle must be an integer from 0 to 359");
  }
  const angle = Number(rawAngle);
  if (!Number.isInteger(angle) || angle < 0 || angle >= 360) {
    throw new Error("angle must be an integer from 0 to 359");
  }
  const location = parseIntegerPair(params.location ?? "1,1", "location");
  return { points, angle, location };
}

function normalizeDegrees(value) {
  const normalized = ((value % 360) + 360) % 360;
  return Object.is(normalized, -0) || Math.abs(normalized - 360) <= EPSILON ? 0 : normalized;
}

function rounded(value) {
  if (!Number.isFinite(value)) return null;
  const result = Math.round(value * 1e6) / 1e6;
  return Object.is(result, -0) ? 0 : result;
}

function range(start, end) {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) return [];
  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
}

function uniquePointIndices(entries, start, end) {
  const seen = new Set();
  const result = [];
  for (const slot of range(start, end)) {
    const entry = entries[slot];
    if (!entry || seen.has(entry.pointIndex)) continue;
    seen.add(entry.pointIndex);
    result.push(entry.pointIndex);
  }
  return result;
}

function buildSteps1610(input, params = {}) {
  const { points, angle, location } = parseVisiblePoints1610Input(input, params);
  const [observerX, observerY] = location;
  const steps = [];
  const angularPoints = [];
  const coincidentIndices = [];
  let doubledAngles = [];
  let left = null;
  let right = null;
  let bestLeft = null;
  let bestRight = null;
  let directionalBest = 0;

  const pointLabel = (index) => `P${index} (${points[index][0]}, ${points[index][1]})`;

  function snapshot(options) {
    const activeSlots = left === null || right === null ? [] : range(left, right);
    const bestSlots = bestLeft === null || bestRight === null ? [] : range(bestLeft, bestRight);
    const activePointIndices = uniquePointIndices(doubledAngles, left, right);
    const bestPointIndices = uniquePointIndices(doubledAngles, bestLeft, bestRight);
    const currentWidth = left !== null && right !== null && doubledAngles[left] && doubledAngles[right]
      ? doubledAngles[right].angle - doubledAngles[left].angle
      : 0;
    const wedgeSlot = left !== null && doubledAngles[left]
      ? left
      : bestLeft !== null && doubledAngles[bestLeft]
        ? bestLeft
        : null;
    const wedgeStart = wedgeSlot === null ? null : normalizeDegrees(doubledAngles[wedgeSlot].angle);
    const sourceLine = Array.isArray(options.codeLines) && options.codeLines.length ? options.codeLines[0] : null;
    const runningAnswer = coincidentIndices.length + directionalBest;

    const view = {
      version: 1,
      problemId: 1610,
      event: options.event,
      phase: options.phase,
      sourceLine,
      points: points.map((point) => point.slice()),
      location: location.slice(),
      angleLimit: angle,
      angularPoints: angularPoints.map((entry) => ({
        pointIndex: entry.pointIndex,
        point: entry.point.slice(),
        angle: rounded(entry.angle),
      })),
      doubledAngles: doubledAngles.map((entry, slot) => ({
        slot,
        pointIndex: entry.pointIndex,
        angle: rounded(entry.angle),
        originalAngle: rounded(entry.originalAngle),
        copy: entry.copy,
      })),
      coincidentIndices: coincidentIndices.slice(),
      processedPointIndices: [...new Set([
        ...angularPoints.map((entry) => entry.pointIndex),
        ...coincidentIndices,
      ])],
      currentPointIndex: Number.isInteger(options.currentPointIndex) ? options.currentPointIndex : null,
      removedPointIndex: Number.isInteger(options.removedPointIndex) ? options.removedPointIndex : null,
      left,
      right,
      activeSlots,
      activePointIndices,
      currentWidth: rounded(currentWidth),
      overLimit: currentWidth > angle + EPSILON,
      bestLeft,
      bestRight,
      bestSlots,
      bestPointIndices,
      directionalCount: activePointIndices.length,
      directionalBest,
      coincidentCount: coincidentIndices.length,
      runningAnswer,
      wedgeStart: wedgeStart === null ? null : rounded(wedgeStart),
      wedgeEnd: wedgeStart === null ? null : rounded(wedgeStart + angle),
      newBest: options.newBest === true,
      final: options.final === true,
      answer: options.final === true ? runningAnswer : null,
    };

    const vars = [
      { name: "angle", value: `${angle}°` },
      { name: "same", value: coincidentIndices.length },
      { name: "left", value: left === null ? "—" : left },
      { name: "right", value: right === null ? "—" : right },
      { name: "window", value: activePointIndices.length },
      { name: "best", value: directionalBest },
      { name: "same + best", value: runningAnswer },
    ];

    steps.push({
      title: options.title,
      note: options.note,
      codeLines: options.codeLines || [],
      vars,
      visiblePoints1610View: view,
      ...(options.final ? { final: true } : {}),
    });
  }

  snapshot({
    event: "setup",
    phase: "polar-conversion",
    codeLines: [5, 6, 7],
    title: text("Đặt người quan sát và tạo danh sách góc", "Place the observer and create the angle list"),
    note: text(
      `Người quan sát ở (${observerX}, ${observerY}). Điểm trùng vị trí luôn nhìn thấy; các điểm khác được đổi sang góc cực.`,
      `The observer is at (${observerX}, ${observerY}). Coincident points are always visible; every other point becomes a polar angle.`,
    ),
  });

  points.forEach((point, pointIndex) => {
    const [x, y] = point;
    if (x === observerX && y === observerY) {
      coincidentIndices.push(pointIndex);
      snapshot({
        event: "coincident",
        phase: "polar-conversion",
        codeLines: [9, 10, 11],
        currentPointIndex: pointIndex,
        title: text(`${pointLabel(pointIndex)} trùng người quan sát`, `${pointLabel(pointIndex)} coincides with the observer`),
        note: text(
          `Điểm này không có hướng riêng. Tăng same lên ${coincidentIndices.length}; điểm sẽ được cộng sau cửa sổ trượt.`,
          `This point has no distinct direction. Increase same to ${coincidentIndices.length}; it will be added after the sliding window.`,
        ),
      });
      return;
    }

    const rawAngle = Math.atan2(y - observerY, x - observerX) * 180 / Math.PI;
    const polarAngle = normalizeDegrees(rawAngle);
    angularPoints.push({ pointIndex, point: point.slice(), angle: polarAngle });
    snapshot({
      event: "convert-angle",
      phase: "polar-conversion",
      codeLines: [12, 13],
      currentPointIndex: pointIndex,
      title: text(`${pointLabel(pointIndex)} → ${rounded(polarAngle)}°`, `${pointLabel(pointIndex)} → ${rounded(polarAngle)}°`),
      note: text(
        "atan2 giữ đúng góc phần tư; phép modulo đưa mọi hướng vào khoảng [0°, 360°).",
        "atan2 preserves the quadrant; modulo normalizes every direction into [0°, 360°).",
      ),
    });
  });

  angularPoints.sort((first, second) => first.angle - second.angle || first.pointIndex - second.pointIndex);
  doubledAngles = angularPoints.map((entry) => ({
    pointIndex: entry.pointIndex,
    angle: entry.angle,
    originalAngle: entry.angle,
    copy: false,
  }));
  snapshot({
    event: "sort-angles",
    phase: "unwrap-circle",
    codeLines: [15],
    title: text("Sắp xếp các góc tăng dần", "Sort the angles in ascending order"),
    note: text(
      "Sau khi sắp xếp, các hướng nằm gần nhau trở thành một đoạn liên tiếp — ngoại trừ đoạn cắt tại 0°/360°.",
      "After sorting, nearby directions form a contiguous range—except for the cut at 0°/360°.",
    ),
  });

  const originalAngles = doubledAngles.map((entry) => ({ ...entry }));
  doubledAngles = [
    ...originalAngles,
    ...originalAngles.map((entry) => ({
      ...entry,
      angle: entry.angle + 360,
      copy: true,
    })),
  ];
  snapshot({
    event: "duplicate-angles",
    phase: "unwrap-circle",
    codeLines: [16],
    title: text("Nhân đôi dãy góc với +360°", "Duplicate the angle list with +360°"),
    note: text(
      "Bản sao biến cửa sổ quấn qua 360° thành một đoạn thẳng, ví dụ 350° → 370° thay vì 350° → 10°.",
      "The copy turns a window crossing 360° into a linear interval, such as 350° → 370° instead of 350° → 10°.",
    ),
  });

  left = 0;
  snapshot({
    event: "initialize-window",
    phase: "sliding-window",
    codeLines: [17],
    title: text("Khởi tạo left = 0, best = 0", "Initialize left = 0, best = 0"),
    note: text(
      "Cửa sổ hợp lệ chứa các góc có độ rộng không vượt quá angle.",
      "A valid window contains angles whose span does not exceed angle.",
    ),
  });

  for (let scanRight = 0; scanRight < doubledAngles.length; scanRight += 1) {
    right = scanRight;
    const incoming = doubledAngles[right];
    snapshot({
      event: "expand-right",
      phase: "sliding-window",
      codeLines: [18],
      currentPointIndex: incoming.pointIndex,
      title: text(
        `Mở rộng right = ${right}: P${incoming.pointIndex} tại ${rounded(incoming.angle)}°`,
        `Expand right = ${right}: P${incoming.pointIndex} at ${rounded(incoming.angle)}°`,
      ),
      note: text(
        "Thêm hướng mới vào cửa sổ. Nếu độ rộng vượt giới hạn, left sẽ tiến sang phải.",
        "Add the new direction to the window. If its span exceeds the limit, left will move right.",
      ),
    });

    while (doubledAngles[right].angle - doubledAngles[left].angle > angle + EPSILON) {
      const removedSlot = left;
      const removed = doubledAngles[removedSlot];
      left += 1;
      snapshot({
        event: "shrink-left",
        phase: "sliding-window",
        codeLines: [19, 20],
        currentPointIndex: incoming.pointIndex,
        removedPointIndex: removed.pointIndex,
        title: text(`Bỏ slot ${removedSlot}; left → ${left}`, `Remove slot ${removedSlot}; left → ${left}`),
        note: text(
          `Khoảng góc vượt ${angle}°, nên P${removed.pointIndex} rời cạnh trái.`,
          `The angular span exceeded ${angle}°, so P${removed.pointIndex} leaves from the left.`,
        ),
      });
    }

    const windowSize = right - left + 1;
    const isNewBest = windowSize > directionalBest;
    if (isNewBest) {
      directionalBest = windowSize;
      bestLeft = left;
      bestRight = right;
    }
    snapshot({
      event: isNewBest ? "update-best" : "compare-best",
      phase: "sliding-window",
      codeLines: [21],
      currentPointIndex: incoming.pointIndex,
      newBest: isNewBest,
      title: isNewBest
        ? text(`Kỷ lục mới: best = ${directionalBest}`, `New record: best = ${directionalBest}`)
        : text(`Cửa sổ có ${windowSize} điểm; best vẫn là ${directionalBest}`, `Window has ${windowSize} points; best remains ${directionalBest}`),
      note: text(
        "Các điểm trong cửa sổ nằm trong một trường nhìn đóng, nên cả hai tia biên đều được tính.",
        "The points in the window fit inside one closed field of view, so both boundary rays are included.",
      ),
    });
  }

  right = bestRight;
  left = bestLeft === null ? 0 : bestLeft;
  const answer = coincidentIndices.length + directionalBest;
  snapshot({
    event: "return-answer",
    phase: "complete",
    codeLines: [22],
    final: true,
    title: text(`Đáp án: ${coincidentIndices.length} + ${directionalBest} = ${answer}`, `Answer: ${coincidentIndices.length} + ${directionalBest} = ${answer}`),
    note: text(
      "Cộng đúng một lần mọi điểm trùng người quan sát vào cửa sổ hướng tốt nhất.",
      "Add every point coincident with the observer exactly once to the best directional window.",
    ),
  });

  return {
    original: { points: points.map((point) => point.slice()), angle, location: location.slice() },
    points: points.map((point) => point.slice()),
    angle,
    location: location.slice(),
    answer,
    steps,
  };
}

const code = [
  "from math import atan2, degrees",
  "",
  "class Solution:",
  "    def visiblePoints(self, points, angle, location):",
  "        ox, oy = location",
  "        same = 0",
  "        angles = []",
  "        for x, y in points:",
  "            if [x, y] == location:",
  "                same += 1",
  "                continue",
  "            direction = degrees(atan2(y - oy, x - ox))",
  "            angles.append(direction % 360)",
  "",
  "        angles.sort()",
  "        circle = angles + [value + 360 for value in angles]",
  "        left = best = 0",
  "        for right, value in enumerate(circle):",
  "            while value - circle[left] > angle:",
  "                left += 1",
  "            best = max(best, right - left + 1)",
  "        return same + best",
];

module.exports = {
  1610: {
    id: 1610,
    difficulty: "hard",
    slug: "maximum-number-of-visible-points",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "math", vi: "Toán", en: "Math" },
      { key: "geometry", vi: "Hình học", en: "Geometry" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
    ],
    title: text("Số điểm nhìn thấy tối đa", "Maximum Number of Visible Points"),
    titleVi: text("Cửa sổ góc trên đường tròn", "An angular sliding window around the observer"),
    statement: text(
      "Cho các điểm trên mặt phẳng, góc nhìn và vị trí quan sát. Hãy xoay hướng nhìn để thấy nhiều điểm nhất trong góc đã cho; điểm trùng vị trí luôn nhìn thấy.",
      "Given points on a plane, a viewing angle, and an observer location, rotate the viewing direction to see as many points as possible; coincident points are always visible.",
    ),
    defaultInput: "2,1; 2,2; 3,3",
    inputKind: "string",
    inputLabel: text(
      `points (x,y; ...) — tối đa ${MAX_VISUALIZED_POINTS} điểm`,
      `points (x,y; ...) — up to ${MAX_VISUALIZED_POINTS} points`,
    ),
    extraParams: [
      {
        key: "angle",
        label: text("angle (0–359°)", "angle (0–359°)"),
        default: 90,
        min: 0,
        max: 359,
      },
      {
        key: "location",
        type: "string",
        label: text("location (x,y)", "location (x,y)"),
        default: "1,1",
      },
    ],
    approach: [
      text("Đếm riêng các điểm trùng location vì chúng nhìn thấy theo mọi hướng.", "Count points at location separately because they are visible in every direction."),
      text("Đổi mỗi điểm còn lại thành góc atan2 trong [0°, 360°), sắp xếp rồi nối thêm bản sao +360°.", "Convert every other point to an atan2 angle in [0°, 360°), sort, then append a +360° copy."),
      text("Dùng cửa sổ trượt dài nhất có góc phải − góc trái ≤ angle; cộng lại số điểm trùng.", "Find the longest sliding window with right angle − left angle ≤ angle, then add coincident points."),
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: text(
        "Tính góc O(n), sắp xếp O(n log n), rồi hai con trỏ quét dãy góc nhân đôi trong O(n).",
        "Angle conversion is O(n), sorting is O(n log n), and two pointers scan the doubled angle list in O(n).",
      ),
    },
    code,
    liveArgs(input, params = {}) {
      const parsed = parseVisiblePoints1610Input(input, params);
      return [parsed.points.map((point) => point.slice()), parsed.angle, parsed.location.slice()];
    },
    builder: buildSteps1610,
  },
};
