"use strict";

const {
  bi,
  cloneJsonSafe,
  createTracer,
  fail,
  parsePlainParams,
  parseRows,
} = require("./hard-viz-shared");

const PROBLEM_ID_3027 = 3027;
const DEFAULT_INPUT_3027 = "[[6,2],[4,4],[2,6]]";

const LIMITS_3027 = Object.freeze({
  minPoints: 2,
  maxPoints: 20,
  minCoordinate: -1_000_000_000,
  maxCoordinate: 1_000_000_000,
  maxTraceSteps: 240,
  maxGraphNodes: 20,
  maxTableRows: 20,
  maxSequenceItems: 20,
});

const PHASES_3027 = Object.freeze([
  bi("Sắp xếp điểm", "Sort the points"),
  bi("Chọn điểm neo trên-trái", "Choose an upper-left anchor"),
  bi("Quét ứng viên bên phải", "Scan candidates to the right"),
  bi("Chốt đóng góp của điểm neo", "Finalize the anchor contribution"),
  bi("Kết quả", "Result"),
]);

const SOURCE_3027 = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def numberOfPairs(self, points: List[List[int]]) -> int:",
  "        points.sort(key=lambda point: (point[0], -point[1]))",
  "        answer = 0",
  "",
  "        for i in range(len(points)):",
  "            max_y = float('-inf')",
  "            for j in range(i + 1, len(points)):",
  "                candidate_y = points[j][1]",
  "                if candidate_y <= points[i][1] and candidate_y > max_y:",
  "                    answer += 1",
  "                    max_y = candidate_y",
  "",
  "        return answer",
]);

function parseNumberOfPairs3027Input(input, params = {}) {
  parsePlainParams(params, PROBLEM_ID_3027);
  const points = parseRows(input, {
    problemId: PROBLEM_ID_3027,
    name: "points",
    columns: 2,
    minRows: LIMITS_3027.minPoints,
    maxRows: LIMITS_3027.maxPoints,
    minValue: LIMITS_3027.minCoordinate,
    maxValue: LIMITS_3027.maxCoordinate,
  });

  const seen = new Set();
  points.forEach(([x, y], index) => {
    const key = `${x},${y}`;
    if (seen.has(key)) {
      fail(
        PROBLEM_ID_3027,
        RangeError,
        `points[${index}] trùng một điểm trước đó; mọi điểm phải phân biệt`,
        `points[${index}] duplicates an earlier point; all points must be distinct`,
      );
    }
    seen.add(key);
  });

  return { points: points.map((point) => [...point]) };
}

function sortPointRecords(points) {
  return points
    .map(([x, y], originalIndex) => ({ x, y, originalIndex }))
    .sort((left, right) => (
      left.x - right.x
      || right.y - left.y
      || left.originalIndex - right.originalIndex
    ))
    .map((point, sortedIndex) => ({ ...point, sortedIndex }));
}

function pointText(point) {
  return `(${point.x}, ${point.y})`;
}

function maxYText(value) {
  return value === null ? "−∞" : value;
}

function rectangleText(anchor, candidate) {
  return `x[${anchor.x}, ${candidate.x}] × y[${candidate.y}, ${anchor.y}]`;
}

function buildSteps3027(input, params = {}) {
  const { points } = parseNumberOfPairs3027Input(input, params);
  const sorted = sortPointRecords(points);
  const sortedY = sorted.map((point) => point.y);
  const sortedLabels = sorted.map((point) => (
    `S${point.sortedIndex} · P${point.originalIndex} ${pointText(point)}`
  ));

  const tracer = createTracer({
    problemId: PROBLEM_ID_3027,
    source: SOURCE_3027,
    phases: PHASES_3027,
    maxSteps: LIMITS_3027.maxTraceSteps,
    baseArray: sortedY,
    legend: [
      { label: bi("Điểm neo trên-trái", "Upper-left anchor"), state: "active" },
      { label: bi("Ứng viên đang xét", "Candidate under consideration"), state: "candidate" },
      { label: bi("Cặp hợp lệ / biên maxY mới", "Valid pair / new maxY frontier"), state: "updated" },
      { label: bi("Điểm chặn trong hoặc trên hình chữ nhật", "Blocker inside or on the rectangle"), state: "danger" },
      { label: bi("Ứng viên bị loại", "Rejected candidate"), state: "invalid" },
      { label: bi("Điểm đã quét", "Scanned point"), state: "visited" },
    ],
  });

  let runningAnswer = 0;
  let currentAnchorIndex = null;
  let currentCandidateIndex = null;
  let frontierIndex = null;
  let blockingIndex = null;
  let maxY = null;
  let maxYBefore = null;
  let anchorContribution = 0;
  let outcome = "sorted";
  let scanRows = [];
  let acceptedIndices = [];
  const anchorSummaries = [];

  function roleLabels(index) {
    const vi = [];
    const en = [];
    if (index === currentAnchorIndex) {
      vi.push("neo");
      en.push("anchor");
    }
    if (index === currentCandidateIndex) {
      vi.push("ứng viên");
      en.push("candidate");
    }
    if (index === blockingIndex) {
      vi.push("blocker");
      en.push("blocker");
    }
    if (index === frontierIndex) {
      vi.push("biên maxY");
      en.push("maxY frontier");
    }
    return { vi, en };
  }

  function stateForPoint(index) {
    if (outcome === "result") return "success";

    let state = currentAnchorIndex !== null && index < currentAnchorIndex
      ? "visited"
      : "computed";
    if (acceptedIndices.includes(index)) state = "chosen";
    if (index === frontierIndex) state = "warning";
    if (index === blockingIndex) state = "danger";
    if (index === currentAnchorIndex) state = "active";
    if (index === currentCandidateIndex) {
      if (outcome === "accepted") state = "updated";
      else if (outcome === "blocked") state = "invalid";
      else state = "warning";
    }
    return state;
  }

  function pointSub(point) {
    const roles = roleLabels(point.sortedIndex);
    const summary = anchorSummaries[point.sortedIndex];
    const summaryVi = outcome === "result" && summary
      ? ` · ${summary.contribution} cặp`
      : "";
    const summaryEn = outcome === "result" && summary
      ? ` · ${summary.contribution} pairs`
      : "";
    const roleVi = roles.vi.length ? ` · ${roles.vi.join(" + ")}` : "";
    const roleEn = roles.en.length ? ` · ${roles.en.join(" + ")}` : "";
    return bi(
      `P${point.originalIndex} ${pointText(point)}${roleVi}${summaryVi}`,
      `P${point.originalIndex} ${pointText(point)}${roleEn}${summaryEn}`,
    );
  }

  function graphView() {
    const nodes = sorted.map((point) => ({
      id: `s${point.sortedIndex}`,
      label: `S${point.sortedIndex}`,
      sub: pointSub(point),
      state: stateForPoint(point.sortedIndex),
    }));

    const edges = [];
    for (let index = 0; index + 1 < sorted.length; index += 1) {
      const sameX = sorted[index].x === sorted[index + 1].x;
      const onCurrentScan = currentAnchorIndex !== null
        && currentCandidateIndex !== null
        && index >= currentAnchorIndex
        && index < currentCandidateIndex;
      edges.push({
        u: `s${index}`,
        v: `s${index + 1}`,
        label: sameX ? bi("x bằng nhau: y↓", "equal x: y↓") : "x↑",
        directed: true,
        state: onCurrentScan ? "path" : "muted",
      });
    }

    if (currentAnchorIndex !== null && currentCandidateIndex !== null) {
      const anchor = sorted[currentAnchorIndex];
      const candidate = sorted[currentCandidateIndex];
      edges.push({
        u: `s${currentAnchorIndex}`,
        v: `s${currentCandidateIndex}`,
        label: rectangleText(anchor, candidate),
        directed: true,
        state: outcome === "accepted"
          ? "success"
          : (outcome === "blocked" ? "danger" : "warning"),
      });
    }

    if (outcome === "blocked" && blockingIndex !== null && currentCandidateIndex !== null) {
      edges.push({
        u: `s${blockingIndex}`,
        v: `s${currentCandidateIndex}`,
        label: bi("chặn biên", "boundary blocker"),
        directed: true,
        state: "danger",
      });
    }

    return {
      layout: "tree",
      nodes,
      edges,
      levels: [nodes.map((node) => node.id)],
    };
  }

  function sortedPointsTable() {
    return {
      title: bi("Điểm sau khi sắp xếp", "Points after sorting"),
      columns: [
        bi("Chỉ số gốc", "Original index"),
        "x",
        "y",
        bi("Quan hệ với điểm trước", "Relation to previous point"),
      ],
      rows: sorted.map((point, index) => ({
        label: `S${index}`,
        state: "computed",
        cells: [
          `P${point.originalIndex}`,
          point.x,
          point.y,
          index === 0
            ? bi("đầu tiên", "first")
            : (point.x === sorted[index - 1].x
              ? bi("x bằng nhau, y không tăng", "equal x, nonincreasing y")
              : bi("x tăng", "x increases")),
        ],
      })),
    };
  }

  function scanTable() {
    const anchor = sorted[currentAnchorIndex];
    const rows = scanRows.map((row) => ({
      label: `S${row.candidateIndex}`,
      state: row.outcome === "accepted"
        ? "success"
        : (row.outcome === "blocked" ? "danger" : "warning"),
      cells: [
        pointText(sorted[row.candidateIndex]),
        row.rectangle,
        { value: row.isLowerOrLevel ? "✓" : "✗", state: row.isLowerOrLevel ? "success" : "invalid" },
        maxYText(row.maxYBefore),
        { value: row.clearsFrontier ? "✓" : "✗", state: row.clearsFrontier ? "success" : "invalid" },
        row.outcome === "accepted"
          ? bi("đếm cặp", "count pair")
          : (row.outcome === "blocked"
            ? bi(`bị S${row.blockingIndex} chặn`, `blocked by S${row.blockingIndex}`)
            : bi("cao hơn điểm neo", "above the anchor")),
        maxYText(row.maxYAfter),
        row.answerAfter,
      ],
    }));

    if (!rows.length) {
      rows.push({
        label: "—",
        state: "pending",
        cells: [
          bi("Chưa có ứng viên", "No candidate yet"),
          "—",
          "—",
          "−∞",
          "—",
          bi("Chờ quét", "Waiting to scan"),
          "−∞",
          runningAnswer,
        ],
      });
    }

    return {
      title: bi(
        `Quét từ neo S${currentAnchorIndex} ${pointText(anchor)}`,
        `Scan from anchor S${currentAnchorIndex} ${pointText(anchor)}`,
      ),
      columns: [
        bi("Ứng viên", "Candidate"),
        bi("Hình chữ nhật", "Rectangle"),
        "y_c ≤ y_a",
        bi("maxY trước", "maxY before"),
        "y_c > maxY",
        bi("Quyết định", "Decision"),
        bi("maxY sau", "maxY after"),
        bi("Tổng cặp", "Pair count"),
      ],
      rows: rows.slice(0, LIMITS_3027.maxTableRows),
    };
  }

  function summaryTable() {
    return {
      title: bi("Đóng góp theo điểm neo", "Contribution by anchor"),
      columns: [
        bi("Điểm neo", "Anchor point"),
        bi("Số ứng viên quét", "Candidates scanned"),
        bi("Cặp hợp lệ", "Valid pairs"),
        bi("maxY cuối", "Final maxY"),
        bi("Tổng chạy", "Running total"),
      ],
      rows: anchorSummaries.map((summary) => ({
        label: `S${summary.anchorIndex}`,
        state: summary.contribution > 0 ? "success" : "muted",
        cells: [
          pointText(sorted[summary.anchorIndex]),
          summary.candidatesScanned,
          summary.contribution,
          maxYText(summary.finalMaxY),
          summary.answerAfter,
        ],
      })),
    };
  }

  function tableView() {
    if (outcome === "sorted") return sortedPointsTable();
    if (outcome === "result") return summaryTable();
    return scanTable();
  }

  function sequenceView() {
    return sorted.map((point) => {
      const roles = roleLabels(point.sortedIndex);
      const suffixVi = roles.vi.length ? ` · ${roles.vi.join(" + ")}` : "";
      const suffixEn = roles.en.length ? ` · ${roles.en.join(" + ")}` : "";
      return {
        label: bi(
          `S${point.sortedIndex} / P${point.originalIndex}${suffixVi}`,
          `S${point.sortedIndex} / P${point.originalIndex}${suffixEn}`,
        ),
        value: [point.x, point.y],
        state: stateForPoint(point.sortedIndex),
      };
    }).slice(0, LIMITS_3027.maxSequenceItems);
  }

  function currentDecisionText() {
    if (outcome === "accepted") return bi("Hợp lệ: cộng 1", "Valid: add 1");
    if (outcome === "blocked") return bi("Bị chặn", "Blocked");
    if (outcome === "above") return bi("Sai hướng trên-trái", "Wrong upper-left orientation");
    if (outcome === "anchor-complete") return bi("Đã chốt điểm neo", "Anchor finalized");
    if (outcome === "anchor") return bi("Bắt đầu điểm neo", "Anchor started");
    if (outcome === "result") return bi("Hoàn tất", "Complete");
    return bi("Đã sắp xếp", "Sorted");
  }

  function emitFrame(options) {
    const highlights = [currentAnchorIndex, currentCandidateIndex]
      .filter((index) => Number.isInteger(index));
    const marks = [blockingIndex, frontierIndex]
      .filter((index) => Number.isInteger(index));

    return tracer.emit({
      phaseIndex: options.phaseIndex,
      title: options.title,
      note: options.note,
      action: options.action,
      formula: options.formula,
      codeLines: options.codeLines,
      vars: [
        { name: bi("neo", "anchor"), value: currentAnchorIndex === null ? "—" : `S${currentAnchorIndex}` },
        { name: bi("ứng viên", "candidate"), value: currentCandidateIndex === null ? "—" : `S${currentCandidateIndex}` },
        { name: "maxY before", value: maxYText(maxYBefore) },
        { name: "maxY", value: maxYText(maxY) },
        { name: bi("đóng góp neo", "anchor contribution"), value: anchorContribution },
        { name: bi("quyết định", "decision"), value: currentDecisionText() },
        { name: bi("đáp án chạy", "running answer"), value: runningAnswer },
      ],
      arr: sortedY,
      sub: sortedLabels,
      highlight: highlights,
      mark: marks,
      graph: graphView(),
      table: tableView(),
      sequence: sequenceView(),
      metrics: [
        { label: bi("Số điểm", "Points"), value: sorted.length },
        { label: bi("Chỉ số neo", "Anchor index"), value: currentAnchorIndex === null ? "—" : currentAnchorIndex, state: "active" },
        { label: bi("Chỉ số ứng viên", "Candidate index"), value: currentCandidateIndex === null ? "—" : currentCandidateIndex, state: "candidate" },
        { label: "maxY", value: maxYText(maxY), state: frontierIndex === null ? "muted" : "warning" },
        { label: bi("Cặp của neo", "Pairs for anchor"), value: anchorContribution, state: "updated" },
        { label: bi("Đáp án chạy", "Running answer"), value: runningAnswer, state: "answer" },
      ],
      final: Boolean(options.final),
      answer: options.final ? runningAnswer : null,
    });
  }

  emitFrame({
    phaseIndex: 0,
    title: bi("Sắp xếp theo x tăng, rồi y giảm", "Sort by ascending x, then descending y"),
    note: bi(
      "Tie-break y giảm đặt điểm cao hơn trước khi x bằng nhau. Khi y bằng nhau, ứng viên gần hơn được nhận trước và chặn các điểm xa hơn trên cùng biên.",
      "The descending-y tie-break places higher points first when x is equal. When y is equal, the nearer candidate is accepted first and blocks farther points on the same boundary.",
    ),
    action: bi("Tạo thứ tự quét S0, S1, …", "Create scan order S0, S1, …"),
    formula: bi("khóa = (x tăng, y giảm)", "key = (x ascending, y descending)"),
    codeLines: [5, 6],
  });

  for (let anchorIndex = 0; anchorIndex < sorted.length; anchorIndex += 1) {
    currentAnchorIndex = anchorIndex;
    currentCandidateIndex = null;
    frontierIndex = null;
    blockingIndex = null;
    maxY = null;
    maxYBefore = null;
    anchorContribution = 0;
    outcome = "anchor";
    scanRows = [];
    acceptedIndices = [];

    const anchor = sorted[anchorIndex];
    emitFrame({
      phaseIndex: 1,
      title: bi(
        `Chọn S${anchorIndex} ${pointText(anchor)} làm điểm neo`,
        `Choose S${anchorIndex} ${pointText(anchor)} as the anchor`,
      ),
      note: bi(
        "Mọi điểm phía sau có x không nhỏ hơn x của neo. maxY bắt đầu ở −∞ và sẽ lưu biên y cao nhất đã được nhận.",
        "Every later point has x no smaller than the anchor's x. maxY starts at −∞ and stores the highest accepted y-frontier.",
      ),
      action: bi("Đặt maxY = −∞ cho điểm neo mới.", "Reset maxY = −∞ for the new anchor."),
      formula: bi("maxY = −∞", "maxY = −∞"),
      codeLines: [8, 9],
    });

    for (let candidateIndex = anchorIndex + 1; candidateIndex < sorted.length; candidateIndex += 1) {
      currentCandidateIndex = candidateIndex;
      const candidate = sorted[candidateIndex];
      maxYBefore = maxY;
      const previousFrontierIndex = frontierIndex;
      const isLowerOrLevel = candidate.y <= anchor.y;
      const clearsFrontier = maxYBefore === null || candidate.y > maxYBefore;
      blockingIndex = null;

      if (isLowerOrLevel && clearsFrontier) {
        outcome = "accepted";
        runningAnswer += 1;
        anchorContribution += 1;
        maxY = candidate.y;
        frontierIndex = candidateIndex;
        acceptedIndices.push(candidateIndex);
      } else if (!isLowerOrLevel) {
        outcome = "above";
      } else {
        outcome = "blocked";
        blockingIndex = previousFrontierIndex;
      }

      scanRows.push({
        candidateIndex,
        rectangle: rectangleText(anchor, candidate),
        isLowerOrLevel,
        clearsFrontier,
        maxYBefore,
        maxYAfter: maxY,
        blockingIndex,
        outcome,
        answerAfter: runningAnswer,
      });

      if (outcome === "accepted") {
        emitFrame({
          phaseIndex: 2,
          title: bi(
            `S${candidateIndex} tạo một cặp hợp lệ`,
            `S${candidateIndex} forms a valid pair`,
          ),
          note: bi(
            `y=${candidate.y} không vượt y neo ${anchor.y} và lớn hơn maxY trước ${maxYText(maxYBefore)}; hình chữ nhật chưa có điểm thứ ba trong hoặc trên biên.`,
            `y=${candidate.y} is no higher than anchor y=${anchor.y} and exceeds previous maxY=${maxYText(maxYBefore)}; no third point lies inside or on the rectangle.`,
          ),
          action: bi("Cộng 1 và nâng maxY lên y của ứng viên.", "Add 1 and raise maxY to the candidate's y."),
          formula: bi(
            `${candidate.y} ≤ ${anchor.y} và ${candidate.y} > ${maxYText(maxYBefore)} ⇒ answer++, maxY=${candidate.y}`,
            `${candidate.y} ≤ ${anchor.y} and ${candidate.y} > ${maxYText(maxYBefore)} ⇒ answer++, maxY=${candidate.y}`,
          ),
          codeLines: [10, 11, 12, 13, 14],
        });
      } else if (outcome === "blocked") {
        emitFrame({
          phaseIndex: 2,
          title: bi(
            `S${candidateIndex} bị S${blockingIndex} chặn`,
            `S${candidateIndex} is blocked by S${blockingIndex}`,
          ),
          note: bi(
            `Biên maxY=${maxY} thuộc S${blockingIndex} nằm trong hoặc trên hình chữ nhật neo–ứng viên, vì ${candidate.y} ≤ ${maxY}.`,
            `The maxY=${maxY} frontier at S${blockingIndex} lies inside or on the anchor-candidate rectangle because ${candidate.y} ≤ ${maxY}.`,
          ),
          action: bi("Không đếm cặp; giữ nguyên maxY.", "Do not count the pair; keep maxY unchanged."),
          formula: bi(
            `${candidate.y} ≤ maxY=${maxY} ⇒ bị chặn`,
            `${candidate.y} ≤ maxY=${maxY} ⇒ blocked`,
          ),
          codeLines: [10, 11, 12],
        });
      } else {
        emitFrame({
          phaseIndex: 2,
          title: bi(
            `S${candidateIndex} cao hơn điểm neo`,
            `S${candidateIndex} is above the anchor`,
          ),
          note: bi(
            `y=${candidate.y} > y neo ${anchor.y}, nên neo không nằm trên-trái của ứng viên. Điểm này không thay đổi maxY.`,
            `y=${candidate.y} > anchor y=${anchor.y}, so the anchor is not upper-left of the candidate. This point does not change maxY.`,
          ),
          action: bi("Bỏ qua ứng viên sai hướng.", "Skip the candidate with the wrong orientation."),
          formula: bi(
            `${candidate.y} > ${anchor.y} ⇒ bỏ qua`,
            `${candidate.y} > ${anchor.y} ⇒ skip`,
          ),
          codeLines: [10, 11, 12],
        });
      }
    }

    currentCandidateIndex = null;
    blockingIndex = null;
    maxYBefore = maxY;
    outcome = "anchor-complete";
    anchorSummaries.push({
      anchorIndex,
      candidatesScanned: sorted.length - anchorIndex - 1,
      contribution: anchorContribution,
      finalMaxY: maxY,
      answerAfter: runningAnswer,
    });

    emitFrame({
      phaseIndex: 3,
      title: bi(
        `Điểm neo S${anchorIndex} đóng góp ${anchorContribution} cặp`,
        `Anchor S${anchorIndex} contributes ${anchorContribution} pairs`,
      ),
      note: bi(
        `Đã quét toàn bộ điểm bên phải; tổng chạy hiện là ${runningAnswer}.`,
        `All points to the right have been scanned; the running total is now ${runningAnswer}.`,
      ),
      action: bi("Chốt đóng góp và chuyển sang điểm neo kế tiếp.", "Finalize this contribution and move to the next anchor."),
      formula: bi(
        `đóng góp(S${anchorIndex}) = ${anchorContribution}`,
        `contribution(S${anchorIndex}) = ${anchorContribution}`,
      ),
      codeLines: [8, 9, 10],
    });
  }

  currentAnchorIndex = null;
  currentCandidateIndex = null;
  frontierIndex = null;
  blockingIndex = null;
  maxY = null;
  maxYBefore = null;
  anchorContribution = 0;
  acceptedIndices = [];
  outcome = "result";

  emitFrame({
    phaseIndex: 4,
    title: bi(
      `Có ${runningAnswer} cách đặt hai người`,
      `There are ${runningAnswer} ways to place the two people`,
    ),
    note: bi(
      "Mỗi cặp được đếm đúng một lần theo điểm neo trong thứ tự đã sắp xếp, và phép kiểm tra maxY loại mọi hình chữ nhật chứa điểm thứ ba trên cả phần trong lẫn biên.",
      "Each pair is counted once by its anchor in sorted order, and the maxY test excludes every rectangle containing a third point either inside or on its boundary.",
    ),
    action: bi("Trả về đáp án.", "Return the answer."),
    formula: bi(`answer = ${runningAnswer}`, `answer = ${runningAnswer}`),
    codeLines: [16],
    final: true,
  });

  return {
    original: cloneJsonSafe({ points }),
    answer: runningAnswer,
    steps: tracer.finish(),
  };
}

module.exports = {
  3027: {
    id: 3027,
    difficulty: "hard",
    slug: "find-the-number-of-ways-to-place-people-ii",
    category: { key: "geometry", vi: "Hình học", en: "Geometry" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "geometry", vi: "Hình học", en: "Geometry" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
      { key: "enumeration", vi: "Liệt kê", en: "Enumeration" },
    ],
    title: bi("Tìm số cách đặt người II", "Find the Number of Ways to Place People II"),
    titleVi: bi(
      "Quét hình chữ nhật bằng biên maxY",
      "Scan rectangles with a maxY frontier",
    ),
    statement: bi(
      "Cho các điểm phân biệt. Đếm cặp có người thứ nhất ở trên-trái người thứ hai và không có điểm thứ ba nào nằm trong hoặc trên biên hình chữ nhật giữa họ.",
      "Given distinct points, count pairs where the first person is upper-left of the second and no third point lies inside or on the boundary of their rectangle.",
    ),
    defaultInput: DEFAULT_INPUT_3027,
    defaults: { input: DEFAULT_INPUT_3027 },
    expectedOutput: 2,
    inputKind: "string",
    inputLabel: bi(
      `points dạng JSON [[x,y], ...] hoặc x,y; ... (${LIMITS_3027.minPoints}..${LIMITS_3027.maxPoints} điểm phân biệt)`,
      `points as JSON [[x,y], ...] or x,y; ... (${LIMITS_3027.minPoints}..${LIMITS_3027.maxPoints} distinct points)`,
    ),
    extraParams: [],
    visualizationLimits: { ...LIMITS_3027 },
    approach: [
      bi(
        "Sắp xếp theo x tăng và y giảm. Tie-break y giảm là bắt buộc để các điểm cùng x được quét từ trên xuống.",
        "Sort by ascending x and descending y. The descending-y tie-break is essential so equal-x points are scanned top-down.",
      ),
      bi(
        "Với mỗi điểm neo trên-trái, quét toàn bộ điểm phía sau; thứ tự sắp xếp đã bảo đảm candidate.x ≥ anchor.x.",
        "For each upper-left anchor, scan every later point; sorted order already guarantees candidate.x ≥ anchor.x.",
      ),
      bi(
        "Chỉ nhận candidate khi candidate.y ≤ anchor.y và candidate.y > maxY, rồi gán maxY = candidate.y.",
        "Accept a candidate only when candidate.y ≤ anchor.y and candidate.y > maxY, then set maxY = candidate.y.",
      ),
      bi(
        "Điều kiện nghiêm ngặt > xử lý đúng các y bằng nhau: điểm gần hơn trên cùng biên sẽ chặn mọi điểm xa hơn có cùng y.",
        "The strict > handles equal y correctly: the nearer point on a boundary blocks every farther point with that same y.",
      ),
    ],
    complexity: {
      time: "O(n²)",
      space: "O(n)",
      note: bi(
        "Sắp xếp tốn O(n log n), sau đó mọi cặp theo thứ tự được quét trong O(n²). Visualizer giữ một bản sao đã sắp xếp và tối đa 20 điểm để trace luôn phản hồi nhanh.",
        "Sorting costs O(n log n), then all ordered pairs are scanned in O(n²). The visualizer keeps a sorted copy and caps input at 20 points so the trace stays responsive.",
      ),
    },
    code: SOURCE_3027,
    debugMode: "semantic",
    parser: parseNumberOfPairs3027Input,
    parseNumberOfPairs3027Input,
    liveArgs(input, params = {}) {
      const parsed = parseNumberOfPairs3027Input(input, params);
      return [parsed.points.map((point) => [...point])];
    },
    builder: buildSteps3027,
  },
};
