// Focused array problem definitions extracted from array.js.
module.exports = {};

/**
 * LeetCode 2502: Design Memory Allocator.
 * Allocation scans left-to-right while tracking the current consecutive-free
 * streak. The first streak reaching size is the required first-fit block.
 */
function buildSteps2502(input, params) {
  const n = Array.isArray(input) && Number.isInteger(input[0]) ? input[0] : 10;
  const raw = String((params && params.operations) || "").trim();
  const operations = raw.split(/\s*[|;]\s*/).filter(Boolean).map((part) => {
    const tokens = part.replace(/[(),]/g, " ").trim().split(/\s+/);
    const name = String(tokens[0] || "").toLowerCase();
    if (name === "allocate") {
      const size = Number(tokens[1]);
      const mID = Number(tokens[2]);
      return {
        name,
        size,
        mID,
        raw: part,
        label: `allocate(${tokens[1] ?? "?"}, ${tokens[2] ?? "?"})`,
        valid: tokens.length === 3 && Number.isInteger(size) && size > 0 && Number.isInteger(mID) && mID > 0,
      };
    }
    const mID = Number(tokens[1]);
    const freeName = name === "free" || name === "freememory";
    return {
      name: freeName ? "free" : name,
      mID,
      raw: part,
      label: `freeMemory(${tokens[1] ?? "?"})`,
      valid: freeName && tokens.length === 2 && Number.isInteger(mID) && mID > 0,
    };
  });
  const valid = Number.isInteger(n) && n > 0 && n <= 30
    && operations.length > 0
    && operations.every((operation) => operation.valid);
  const memory = new Array(Math.max(1, Math.min(30, Number.isInteger(n) ? n : 10))).fill(0);
  const results = new Array(operations.length).fill(null);
  const steps = [];

  const freeRuns = () => {
    const runs = [];
    let start = -1;
    for (let i = 0; i <= memory.length; i += 1) {
      if (i < memory.length && memory[i] === 0 && start === -1) start = i;
      if ((i === memory.length || memory[i] !== 0) && start !== -1) {
        runs.push({ start, end: i - 1, length: i - start });
        start = -1;
      }
    }
    return runs;
  };

  function snapshot({
    title,
    note,
    codeLines,
    phase,
    activeOpIndex = -1,
    completedOps = 0,
    currentOperation = null,
    scanIndex = null,
    streak = 0,
    candidateRange = null,
    touched = [],
    blocker = null,
    result = null,
    final = false,
  }) {
    const step = {
      title,
      codeLines,
      allocator2502View: {
        phase,
        n: memory.length,
        memory: memory.slice(),
        operations: operations.map((operation) => operation.label),
        activeOpIndex,
        completedOps,
        results: results.slice(),
        currentOperation: currentOperation ? { ...currentOperation } : null,
        scanIndex,
        streak,
        candidateRange: candidateRange ? candidateRange.slice() : null,
        touched: touched.slice(),
        blocker,
        freeRuns: freeRuns(),
        result,
      },
      vars: [
        { name: "memory", value: `[${memory.join(", ")}]` },
        { name: "free runs", value: freeRuns().map((run) => `[${run.start}..${run.end}] len=${run.length}`).join(" | ") || "none" },
        { name: "result", value: result === null ? "pending" : result },
      ],
      note,
    };
    if (final) step.final = true;
    steps.push(step);
  }

  if (!valid) {
    snapshot({
      title: { vi: "Input hoặc operations không hợp lệ", en: "Invalid input or operations" },
      note: {
        vi: "n phải trong 1..30. Dùng: allocate size mID | free mID.",
        en: "n must be in 1..30. Use: allocate size mID | free mID.",
      },
      codeLines: [1],
      phase: "invalid",
      final: true,
    });
    return { original: { n, operations: raw }, answer: null, steps };
  }

  snapshot({
    title: { vi: `Khởi tạo ${n} ô nhớ đều FREE`, en: `Initialize ${n} FREE memory cells` },
    note: {
      vi: "0 nghĩa là ô trống; số dương là mID đang sở hữu ô đó. allocate luôn phải chọn block trống liên tiếp đầu tiên.",
      en: "0 means free; a positive number is the mID owning that cell. allocate must always take the first contiguous free block.",
    },
    codeLines: [1, 2, 3],
    phase: "init",
  });

  operations.forEach((operation, opIndex) => {
    if (operation.name === "allocate") {
      let streak = 0;
      let start = -1;
      snapshot({
        title: { vi: `Bắt đầu allocate(size=${operation.size}, mID=${operation.mID})`, en: `Start allocate(size=${operation.size}, mID=${operation.mID})` },
        note: {
          vi: "Quét từ địa chỉ 0. Biến free đếm độ dài chuỗi ô trống đang kết thúc tại i.",
          en: "Scan from address 0. Variable free counts the consecutive free cells ending at i.",
        },
        codeLines: [4, 5],
        phase: "allocate-start",
        activeOpIndex: opIndex,
        completedOps: opIndex,
        currentOperation: operation,
      });

      for (let i = 0; i < memory.length; i += 1) {
        const isFree = memory[i] === 0;
        streak = isFree ? streak + 1 : 0;
        const candidateStart = streak > 0 ? i - streak + 1 : null;
        const candidateRange = candidateStart === null ? null : [candidateStart, i];
        snapshot({
          title: {
            vi: isFree ? `i=${i}: FREE → streak=${streak}` : `i=${i}: mID ${memory[i]} chặn → reset streak=0`,
            en: isFree ? `i=${i}: FREE → streak=${streak}` : `i=${i}: mID ${memory[i]} blocks → reset streak=0`,
          },
          note: {
            vi: isFree
              ? `Block trống ứng viên hiện là [${candidateStart}..${i}], dài ${streak}/${operation.size}.`
              : `Không thể đi xuyên qua ô đã cấp phát; bắt đầu tìm block mới sau index ${i}.`,
            en: isFree
              ? `The current candidate free block is [${candidateStart}..${i}], length ${streak}/${operation.size}.`
              : `An allocation cannot cross an occupied cell; start a new candidate after index ${i}.`,
          },
          codeLines: isFree ? [6, 7, 8, 11] : [6, 9, 10],
          phase: isFree && streak === operation.size ? "fit-found" : isFree ? "scan-free" : "scan-blocked",
          activeOpIndex: opIndex,
          completedOps: opIndex,
          currentOperation: operation,
          scanIndex: i,
          streak,
          candidateRange,
          blocker: isFree ? null : i,
        });
        if (streak === operation.size) {
          start = i - operation.size + 1;
          break;
        }
      }

      if (start === -1) {
        results[opIndex] = -1;
        snapshot({
          title: { vi: "Không có block đủ dài → -1", en: "No free block is long enough → -1" },
          note: {
            vi: `Có thể tổng số ô trống vẫn đủ ${operation.size}, nhưng chúng bị phân mảnh nên không tạo thành một block liên tiếp.`,
            en: `There may be at least ${operation.size} free cells in total, but fragmentation prevents one contiguous block.`,
          },
          codeLines: [15],
          phase: "allocate-fail",
          activeOpIndex: opIndex,
          completedOps: opIndex + 1,
          currentOperation: operation,
          result: -1,
        });
        return;
      }

      const range = Array.from({ length: operation.size }, (_, offset) => start + offset);
      range.forEach((index) => { memory[index] = operation.mID; });
      results[opIndex] = start;
      snapshot({
        title: { vi: `Ghi mID ${operation.mID} vào [${start}..${start + operation.size - 1}]`, en: `Write mID ${operation.mID} into [${start}..${start + operation.size - 1}]` },
        note: {
          vi: `Đây là block hợp lệ đầu tiên nên allocate trả về địa chỉ bắt đầu ${start}.`,
          en: `This is the first valid block, so allocate returns its start address ${start}.`,
        },
        codeLines: [12, 13, 14],
        phase: "allocate-write",
        activeOpIndex: opIndex,
        completedOps: opIndex + 1,
        currentOperation: operation,
        scanIndex: start + operation.size - 1,
        streak: operation.size,
        candidateRange: [start, start + operation.size - 1],
        touched: range,
        result: start,
      });
      return;
    }

    const matches = memory.map((value, index) => value === operation.mID ? index : -1).filter((index) => index >= 0);
    snapshot({
      title: { vi: `freeMemory(${operation.mID}): tìm mọi ô cùng mID`, en: `freeMemory(${operation.mID}): find every matching cell` },
      note: {
        vi: matches.length
          ? `Tìm thấy ${matches.length} ô tại index [${matches.join(", ")}]. Một mID có thể sở hữu nhiều block rời nhau.`
          : `Không có ô nào thuộc mID ${operation.mID}.`,
        en: matches.length
          ? `Found ${matches.length} cells at indices [${matches.join(", ")}]. One mID may own several separate blocks.`
          : `No cell belongs to mID ${operation.mID}.`,
      },
      codeLines: [16, 17, 18, 19],
      phase: "free-find",
      activeOpIndex: opIndex,
      completedOps: opIndex,
      currentOperation: operation,
      touched: matches,
    });
    matches.forEach((index) => { memory[index] = 0; });
    results[opIndex] = matches.length;
    snapshot({
      title: { vi: `Đặt ${matches.length} ô về FREE → ${matches.length}`, en: `Mark ${matches.length} cells FREE → ${matches.length}` },
      note: {
        vi: "Các vùng FREE kề nhau tự hợp thành một run dài hơn; freeMemory trả về số ô vừa giải phóng.",
        en: "Adjacent FREE regions naturally form a longer run; freeMemory returns the number of released cells.",
      },
      codeLines: [20, 21, 22],
      phase: "free-write",
      activeOpIndex: opIndex,
      completedOps: opIndex + 1,
      currentOperation: operation,
      touched: matches,
      result: matches.length,
    });
  });

  snapshot({
    title: { vi: "Hoàn tất mọi operation", en: "All operations complete" },
    note: {
      vi: "Mỗi allocate dùng first-fit từ trái sang phải; mỗi freeMemory xóa toàn bộ ô mang đúng mID.",
      en: "Every allocate uses left-to-right first fit; every freeMemory clears all cells carrying that mID.",
    },
    codeLines: [22],
    phase: "done",
    activeOpIndex: operations.length,
    completedOps: operations.length,
    final: true,
  });
  return { original: { n, operations: raw }, answer: results, steps };
}

Object.assign(module.exports, {
  2502: {
    id: 2502,
    difficulty: "medium",
    slug: "design-memory-allocator",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Design Memory Allocator", en: "Design Memory Allocator" },
    titleVi: { vi: "Thiết kế bộ cấp phát bộ nhớ", en: "Design a memory allocator" },
    statement: {
      vi: "Thiết kế Allocator cho n ô nhớ. allocate(size, mID) cấp block FREE liên tiếp đầu tiên có độ dài size và trả về index đầu; nếu không có trả -1. freeMemory(mID) giải phóng mọi ô thuộc mID và trả số ô đã giải phóng.",
      en: "Design Allocator for n memory cells. allocate(size, mID) takes the first contiguous FREE block of length size and returns its start index, or -1. freeMemory(mID) releases every cell owned by mID and returns the released count.",
    },
    defaultInput: [10],
    inputKind: "positive",
    singleInput: true,
    maxInput: 30,
    inputLabel: { vi: "n (số ô nhớ, tối đa 30)", en: "n (memory cells, max 30)" },
    extraParams: [{
      key: "operations",
      type: "string",
      label: { vi: "Operations, ngăn cách bằng |", en: "Operations separated by |" },
      default: "allocate 1 1 | allocate 1 2 | allocate 1 3 | free 2 | allocate 3 4 | allocate 1 1 | allocate 1 1 | free 1",
    }],
    approach: [
      { vi: "Biểu diễn bộ nhớ bằng mảng: 0 là FREE, giá trị dương là mID sở hữu ô.", en: "Represent memory as an array: 0 is FREE and a positive value is the owning mID." },
      { vi: "allocate quét trái sang phải và đếm streak FREE liên tiếp; streak đầu tiên đạt size chính là first-fit.", en: "allocate scans left-to-right and counts a consecutive FREE streak; the first streak reaching size is the first fit." },
      { vi: "freeMemory quét toàn mảng, đặt mọi ô bằng mID về 0 và đếm số ô đã xóa.", en: "freeMemory scans all cells, resets every matching mID to 0, and counts released cells." },
    ],
    complexity: {
      time: "O(n) / operation",
      space: "O(n)",
      note: { vi: "Mỗi operation quét tối đa n ô; mảng memory có n phần tử.", en: "Each operation scans at most n cells; memory contains n entries." },
    },
    code: [
      "class Allocator:",
      "    def __init__(self, n: int):",
      "        self.memory = [0] * n",
      "    def allocate(self, size: int, mID: int) -> int:",
      "        free = 0",
      "        for i in range(len(self.memory)):",
      "            if self.memory[i] == 0:",
      "                free += 1",
      "            else:",
      "                free = 0",
      "            if free == size:",
      "                start = i - size + 1",
      "                self.memory[start:i + 1] = [mID] * size",
      "                return start",
      "        return -1",
      "    def freeMemory(self, mID: int) -> int:",
      "        released = 0",
      "        for i in range(len(self.memory)):",
      "            if self.memory[i] == mID:",
      "                self.memory[i] = 0",
      "                released += 1",
      "        return released",
    ],
    builder: buildSteps2502,
  },
});


function parsePourWater755Input(input, params = {}) {
  if (!Array.isArray(input) || input.length === 0 || !input.every(Number.isInteger)) {
    throw new Error("heights must be a non-empty array of integers.");
  }
  if (input.length > 16) {
    throw new Error("Use at most 16 terrain columns so the visualization stays readable.");
  }
  if (input.some((height) => height < 0 || height > 1000000)) {
    throw new Error("Each terrain height must be between 0 and 10^6.");
  }
  const volume = Number(params.volume ?? 4);
  const source = Number(params.k ?? 3);
  if (!Number.isInteger(volume) || volume < 0 || volume > 24) {
    throw new Error("volume must be an integer between 0 and 24 for the visualization.");
  }
  if (!Number.isInteger(source) || source < 0 || source >= input.length) {
    throw new Error(`k must be an integer between 0 and ${input.length - 1}.`);
  }
  return { terrain: [...input], volume, source };
}

function buildSteps755(input, params = {}) {
  const { terrain, volume, source } = parsePourWater755Input(input, params);
  const heights = [...terrain];
  const water = Array(terrain.length).fill(0);
  const steps = [];

  function snapshot({
    phase,
    phaseIndex,
    event,
    codeLines,
    title,
    note,
    dropNumber = 0,
    current = source,
    best = source,
    candidate = -1,
    compared = -1,
    canMove = null,
    direction = "stay",
    path = [source],
    operation = "",
    final = false,
  }) {
    steps.push({
      title,
      note,
      codeLines,
      final,
      arr: [...heights],
      highlight: current >= 0 ? [current] : [],
      mark: water.map((amount, index) => amount > 0 ? index : -1).filter((index) => index >= 0),
      vars: [
        { name: "drop", value: `${dropNumber}/${volume}` },
        { name: "k", value: source },
        { name: "best", value: best },
        { name: "heights", value: `[${heights.join(", ")}]` },
      ],
      pourWater755View: {
        phase,
        phaseIndex,
        event,
        terrain: [...terrain],
        heights: [...heights],
        water: [...water],
        volume,
        source,
        dropNumber,
        current,
        best,
        candidate,
        compared,
        canMove,
        direction,
        path: [...path],
        operation,
        final,
      },
    });
  }

  snapshot({
    phase: "setup",
    phaseIndex: 0,
    event: "intro",
    codeLines: [3, 4, 5],
    title: { vi: "Thả từng giọt tại k", en: "Release each drop at k" },
    note: {
      vi: "Mỗi giọt thử tìm một vị trí thấp hơn ở bên trái. Chỉ khi không tìm được, nó mới thử bên phải; nếu cả hai phía đều không thấp hơn, giọt nằm lại tại k.",
      en: "Each drop first searches for a lower position on the left. Only if none exists does it search right; if neither side is lower, it stays at k.",
    },
    operation: "priority: lower left → lower right → source k",
  });

  for (let drop = 1; drop <= volume; drop += 1) {
    let best = source;
    let path = [source];
    snapshot({
      phase: "drop",
      phaseIndex: 0,
      event: "drop-start",
      codeLines: [4, 5],
      title: { vi: `Giọt ${drop} bắt đầu tại k = ${source}`, en: `Drop ${drop} starts at k = ${source}` },
      note: { vi: "Đặt best tại nguồn rồi quét sang trái trước.", en: "Set best to the source, then scan left first." },
      dropNumber: drop,
      best,
      path,
      operation: `drop ${drop}: best = k = ${source}`,
    });

    for (let index = source - 1; index >= 0; index -= 1) {
      const canMove = heights[index] <= heights[index + 1];
      if (canMove) {
        path.push(index);
        if (heights[index] < heights[best]) best = index;
      }
      snapshot({
        phase: "left",
        phaseIndex: 1,
        event: "left-check",
        codeLines: canMove ? [7, 8, 10, 11] : [7, 8, 9],
        title: canMove
          ? { vi: `Có thể đi trái tới index ${index}`, en: `Can move left to index ${index}` }
          : { vi: `Bị chặn bên trái tại index ${index}`, en: `Blocked on the left at index ${index}` },
        note: canMove
          ? {
            vi: `${heights[index]} ≤ ${heights[index + 1]}; tiếp tục quét. best hiện là index ${best}, cao ${heights[best]}.`,
            en: `${heights[index]} ≤ ${heights[index + 1]}; continue scanning. best is now index ${best}, height ${heights[best]}.`,
          }
          : {
            vi: `${heights[index]} > ${heights[index + 1]}; giọt không thể leo qua vách này.`,
            en: `${heights[index]} > ${heights[index + 1]}; the drop cannot climb this wall.`,
          },
        dropNumber: drop,
        current: index + 1,
        best,
        candidate: index,
        compared: index + 1,
        canMove,
        direction: "left",
        path,
        operation: `${heights[index]} ${canMove ? "≤" : ">"} ${heights[index + 1]} → ${canMove ? `best=${best}` : "stop left"}`,
      });
      if (!canMove) break;
    }

    if (best !== source) {
      heights[best] += 1;
      water[best] += 1;
      snapshot({
        phase: "settle",
        phaseIndex: 3,
        event: "settle-left",
        codeLines: [12, 13, 14],
        title: { vi: `Giọt ${drop} đọng tại index ${best}`, en: `Drop ${drop} settles at index ${best}` },
        note: {
          vi: "Đã tìm thấy chỗ thấp hơn bên trái nên không cần xét bên phải.",
          en: "A lower place was found on the left, so the right side is not considered.",
        },
        dropNumber: drop,
        current: best,
        best,
        direction: "left",
        path,
        operation: `heights[${best}] += 1 → ${heights[best]}`,
      });
      continue;
    }

    best = source;
    path = [source];
    snapshot({
      phase: "right",
      phaseIndex: 2,
      event: "right-start",
      codeLines: [12, 16],
      title: { vi: "Không có chỗ thấp hơn bên trái", en: "No lower position on the left" },
      note: { vi: "Giọt quay lại k và bắt đầu tìm sang phải.", en: "The drop returns to k and starts searching right." },
      dropNumber: drop,
      best,
      direction: "right",
      path,
      operation: `reset best = k = ${source}`,
    });

    for (let index = source + 1; index < heights.length; index += 1) {
      const canMove = heights[index] <= heights[index - 1];
      if (canMove) {
        path.push(index);
        if (heights[index] < heights[best]) best = index;
      }
      snapshot({
        phase: "right",
        phaseIndex: 2,
        event: "right-check",
        codeLines: canMove ? [16, 17, 19, 20] : [16, 17, 18],
        title: canMove
          ? { vi: `Có thể đi phải tới index ${index}`, en: `Can move right to index ${index}` }
          : { vi: `Bị chặn bên phải tại index ${index}`, en: `Blocked on the right at index ${index}` },
        note: canMove
          ? {
            vi: `${heights[index]} ≤ ${heights[index - 1]}; tiếp tục quét. best hiện là index ${best}, cao ${heights[best]}.`,
            en: `${heights[index]} ≤ ${heights[index - 1]}; continue scanning. best is now index ${best}, height ${heights[best]}.`,
          }
          : {
            vi: `${heights[index]} > ${heights[index - 1]}; giọt không thể leo qua vách này.`,
            en: `${heights[index]} > ${heights[index - 1]}; the drop cannot climb this wall.`,
          },
        dropNumber: drop,
        current: index - 1,
        best,
        candidate: index,
        compared: index - 1,
        canMove,
        direction: "right",
        path,
        operation: `${heights[index]} ${canMove ? "≤" : ">"} ${heights[index - 1]} → ${canMove ? `best=${best}` : "stop right"}`,
      });
      if (!canMove) break;
    }

    heights[best] += 1;
    water[best] += 1;
    snapshot({
      phase: "settle",
      phaseIndex: 3,
      event: best === source ? "settle-source" : "settle-right",
      codeLines: [21],
      title: best === source
        ? { vi: `Giọt ${drop} nằm lại tại nguồn`, en: `Drop ${drop} stays at the source` }
        : { vi: `Giọt ${drop} đọng tại index ${best}`, en: `Drop ${drop} settles at index ${best}` },
      note: best === source
        ? { vi: "Không phía nào có vị trí thấp hơn k.", en: "Neither side has a position lower than k." }
        : { vi: "Không có chỗ bên trái; đây là vị trí thấp nhất có thể tới bên phải.", en: "No lower place exists on the left; this is the lowest reachable position on the right." },
      dropNumber: drop,
      current: best,
      best,
      direction: best === source ? "stay" : "right",
      path,
      operation: `heights[${best}] += 1 → ${heights[best]}`,
    });
  }

  snapshot({
    phase: "done",
    phaseIndex: 4,
    event: "done",
    codeLines: [22],
    title: { vi: `Kết quả [${heights.join(", ")}]`, en: `Result [${heights.join(", ")}]` },
    note: {
      vi: `Đã đặt đủ ${volume} giọt; phần màu xanh cho biết lượng nước nằm trên từng cột địa hình.`,
      en: `All ${volume} drops have settled; the blue part shows the water resting above each terrain column.`,
    },
    dropNumber: volume,
    current: -1,
    best: source,
    path: [],
    operation: `return [${heights.join(", ")}]`,
    final: true,
  });

  return { original: [...terrain], volume, k: source, answer: [...heights], steps };
}

Object.assign(module.exports, {
  755: {
    id: 755,
    difficulty: "medium",
    premium: true,
    slug: "pour-water",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "simulation", vi: "Mô phỏng", en: "Simulation" },
    ],
    title: { vi: "Pour Water", en: "Pour Water" },
    titleVi: { vi: "Rót nước lên địa hình", en: "Pour Water" },
    statement: {
      vi: "Cho địa hình heights, thả volume đơn vị nước từng giọt tại index k. Mỗi giọt ưu tiên chảy tới vị trí thấp hơn bên trái, nếu không có thì tìm bên phải, nếu vẫn không có thì nằm lại tại k. Trả về chiều cao cuối cùng.",
      en: "Given terrain heights, release volume units of water one drop at a time at index k. Each drop prefers a lower position on the left, then the right, and otherwise stays at k. Return the final heights.",
    },
    defaultInput: [2, 1, 1, 2, 1, 2, 2],
    inputKind: "nonneg",
    inputLabel: { vi: "heights (tối đa 16 cột)", en: "heights (up to 16 columns)" },
    extraParams: [
      { key: "volume", type: "number", label: { vi: "volume (số giọt, tối đa 24)", en: "volume (drops, up to 24)" }, default: 4, min: 0, max: 24 },
      { key: "k", type: "number", label: { vi: "k (index thả nước)", en: "k (release index)" }, default: 3, min: 0 },
    ],
    approach: [
      { vi: "Với mỗi giọt, quét từ k sang trái qua các cột không cao hơn cột vừa đi qua; ghi nhớ vị trí thấp nhất.", en: "For each drop, scan left from k through columns no higher than the previous one; remember the lowest position." },
      { vi: "Nếu tìm được vị trí thấp hơn k, đặt giọt ở đó ngay vì bên trái luôn được ưu tiên.", en: "If a position lower than k is found, place the drop there immediately because the left side has priority." },
      { vi: "Nếu không, quét tương tự sang phải; cuối cùng tăng chiều cao tại vị trí tốt nhất hoặc ngay tại k.", en: "Otherwise scan right in the same way; finally increase the best position or k itself." },
    ],
    complexity: {
      time: "O(volume × n)",
      space: "O(1)",
      note: { vi: "Không tính mảng kết quả; mỗi giọt quét tối đa toàn bộ địa hình.", en: "Excluding the returned array; each drop scans the terrain at most once per direction." },
    },
    code: [
      "class Solution:",
      "    def pourWater(self, heights, volume, k):",
      "        n = len(heights)",
      "        for _ in range(volume):",
      "            best = k",
      "",
      "            for i in range(k - 1, -1, -1):",
      "                if heights[i] > heights[i + 1]:",
      "                    break",
      "                if heights[i] < heights[best]:",
      "                    best = i",
      "            if best != k:",
      "                heights[best] += 1",
      "                continue",
      "",
      "            for i in range(k + 1, n):",
      "                if heights[i] > heights[i - 1]:",
      "                    break",
      "                if heights[i] < heights[best]:",
      "                    best = i",
      "            heights[best] += 1",
      "        return heights",
    ],
    liveArgs: (input, params) => {
      const parsed = parsePourWater755Input(input, params);
      return [[...parsed.terrain], parsed.volume, parsed.source];
    },
    builder: buildSteps755,
  },
});


// ─── 419: Battleships in a Board ───
// Count the ships on an X/. board. Ships are straight 1×k or k×1 runs and never
// touch, so the connected components ARE the ships.
//
// Both builders feed `battleships419View`. The point worth seeing is why the
// O(1)-space one-pass solution is allowed to be so short: because each ship is a
// straight run that touches nothing else, exactly ONE of its cells has no X above
// AND no X to the left — its top-left end. Counting those cells counts the ships,
// with no visited set and no writes to the board.

const BS419_LIMITS = { rows: 10, cols: 12 };

function parseBoard419(input) {
  const raw = String(input ?? "").trim();
  if (!raw) throw new Error("board must not be empty");
  const rowsRaw = raw.split(/[|;\n]/).map((r) => r.trim().replace(/,/g, "")).filter((r) => r.length);
  if (!rowsRaw.length) throw new Error("board must not be empty");
  if (!rowsRaw.every((r) => /^[X.]+$/i.test(r))) throw new Error("board cells must be only 'X' or '.'");
  const grid = rowsRaw.map((r) => r.toUpperCase().split(""));
  const cols = grid[0].length;
  if (!grid.every((r) => r.length === cols)) throw new Error("all board rows must have the same length");
  const rows = grid.length;
  if (rows > BS419_LIMITS.rows) throw new Error(`visualization supports at most ${BS419_LIMITS.rows} rows`);
  if (cols > BS419_LIMITS.cols) throw new Error(`visualization supports at most ${BS419_LIMITS.cols} cols`);

  // LeetCode guarantees ships are 1×k or k×1 and never adjacent, so every
  // connected component must be a straight line. That guarantee is exactly what
  // makes the top-left trick correct, and an L-shaped blob genuinely breaks it
  // (".X / XX" would be counted as 2 ships but is 1 component), so reject inputs
  // the problem never allows rather than report something wrong.
  const shipOf = Array.from({ length: rows }, () => Array(cols).fill(-1));
  const ships = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== "X" || shipOf[r][c] !== -1) continue;
      const id = ships.length;
      const cells = [];
      const stack = [[r, c]];
      shipOf[r][c] = id;
      while (stack.length) {
        const [cr, cc] = stack.pop();
        cells.push([cr, cc]);
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (grid[nr][nc] !== "X" || shipOf[nr][nc] !== -1) continue;
          shipOf[nr][nc] = id;
          stack.push([nr, nc]);
        }
      }
      const sameRow = cells.every(([cr]) => cr === cells[0][0]);
      const sameCol = cells.every(([, cc]) => cc === cells[0][1]);
      if (!sameRow && !sameCol) {
        throw new Error("every ship must be a straight 1xk or kx1 run with no ship touching another (LeetCode guarantees this)");
      }
      cells.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      ships.push({ id, cells, horizontal: sameRow && cells.length > 1 });
    }
  }
  return { grid, rows, cols, shipOf, ships };
}

function bs419Base(grid, rows, cols, shipOf, ships, approach) {
  const steps = [];
  function snap(o) {
    steps.push({
      title: o.title,
      note: o.note,
      arr: [], highlight: [], mark: [],
      final: o.final || false,
      codeLines: o.codeLines || [],
      vars: o.vars || [],
      battleships419View: {
        approach,
        rows, cols,
        grid: grid.map((row) => [...row]),
        // Ship identity is shown only so a reader can check the count by eye. The
        // O(1) algorithm never computes it, and the panel says so.
        shipOf: shipOf.map((row) => [...row]),
        shipCount: ships.length,
        phase: o.phase,
        cur: o.cur || null,
        skip: o.skip || null,
        checks: o.checks || null,
        counted: o.counted ? o.counted.map((x) => [...x]) : [],
        seen: o.seen ? o.seen.map((x) => [...x]) : null,
        stack: o.stack ? o.stack.map((x) => [...x]) : null,
        count: o.count === undefined ? null : o.count,
        answer: o.answer === undefined ? null : o.answer,
        decision: o.decision || null,
      },
    });
  }
  return { steps, snap };
}

const bs419Cells = (grid) => grid.flat();
const bs419CountX = (grid) => bs419Cells(grid).filter((ch) => ch === "X").length;

// ── Approach 1: count only each ship's top-left cell (O(1) space, one pass) ──
function buildSteps419(input) {
  const { grid, rows, cols, shipOf, ships } = parseBoard419(input);
  const { steps, snap } = bs419Base(grid, rows, cols, shipOf, ships, 1);
  const counted = [];
  let count = 0;

  snap({
    phase: "intro",
    title: { vi: `Bảng ${rows}×${cols}, ${bs419CountX(grid)} ô 'X'`, en: `Board ${rows}×${cols}, ${bs419CountX(grid)} cells of 'X'` },
    note: {
      vi: `Tàu là một dãy THẲNG 1×k hoặc k×1, và hai tàu không bao giờ kề nhau. Chính hai điều kiện đó khiến mỗi tàu có ĐÚNG MỘT ô không có 'X' ở trên và cũng không có 'X' ở bên trái — đó là ô đầu trên-trái của tàu. Vậy chỉ cần đếm những ô như thế là đếm được số tàu: quét một lượt, không cần mảng visited, không sửa bảng.`,
      en: `A ship is a STRAIGHT 1×k or k×1 run, and two ships never touch. Those two facts give every ship EXACTLY ONE cell with no 'X' above it and no 'X' to its left — its top-left end. So counting those cells counts the ships: one pass, no visited array, no writes to the board.`,
    },
    codeLines: [2, 3],
    count: 0, counted,
    decision: { vi: "Đếm ô đầu trên-trái của mỗi tàu.", en: "Count each ship's top-left end cell." },
    vars: [{ name: "rows, cols", value: `${rows}, ${cols}` }, { name: "count", value: 0 }],
  });

  let pendingFrom = null;                 // start of the current run of non-X cells
  const flushSkip = (toR, toC) => {
    if (pendingFrom === null) return;
    const from = pendingFrom;
    pendingFrom = null;
    snap({
      phase: "skip",
      title: {
        vi: `Bỏ qua ô trống (${from[0]},${from[1]}) → (${toR},${toC})`,
        en: `Skip the empty cells (${from[0]},${from[1]}) → (${toR},${toC})`,
      },
      note: {
        vi: `Các ô này là '.' nên không thuộc tàu nào, bỏ qua ngay. Quét theo thứ tự từng hàng từ trái sang phải — đó là lý do "ô ở trên" và "ô bên trái" luôn đã được xét trước ô hiện tại.`,
        en: `These cells are '.', so they belong to no ship and are skipped. The scan goes row by row, left to right — which is exactly why the cell above and the cell to the left have always been visited before the current one.`,
      },
      codeLines: [6, 7],
      cur: { r: toR, c: toC },
      skip: { from, to: [toR, toC] },
      count, counted,
      decision: { vi: "Ô trống → bỏ qua.", en: "Empty cells → skipped." },
      vars: [{ name: "count", value: count }],
    });
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== "X") {
        if (pendingFrom === null) pendingFrom = [r, c];
        continue;
      }
      flushSkip(r, c);

      const up = r > 0 ? grid[r - 1][c] : null;       // null = off the board
      const left = c > 0 ? grid[r][c - 1] : null;
      const upIsX = up === "X";
      const leftIsX = left === "X";
      const isStart = !upIsX && !leftIsX;
      const checks = { up, left, upIsX, leftIsX, isStart };

      if (isStart) {
        count += 1;
        counted.push([r, c]);
        snap({
          phase: "count",
          title: { vi: `(${r},${c}) là đầu tàu → count = ${count}`, en: `(${r},${c}) is a ship's start → count = ${count}` },
          note: {
            vi: `Ô trên: ${up === null ? "ngoài bảng" : `'${up}'`}. Ô bên trái: ${left === null ? "ngoài bảng" : `'${left}'`}. Không bên nào là 'X', nên (${r},${c}) là ô trên-trái nhất của tàu nó thuộc về → đếm tàu này. Các ô 'X' còn lại của cùng tàu đó sẽ bị bỏ qua vì chúng có 'X' ở trên hoặc bên trái.`,
            en: `Above: ${up === null ? "off the board" : `'${up}'`}. To the left: ${left === null ? "off the board" : `'${left}'`}. Neither is 'X', so (${r},${c}) is the top-left end of its ship → count it. The ship's other 'X' cells will be skipped, because each of them does have an 'X' above or to the left.`,
          },
          codeLines: [8, 10, 12],
          cur: { r, c }, checks,
          count, counted,
          decision: { vi: `Tàu thứ ${count}.`, en: `Ship number ${count}.` },
          vars: [
            { name: "board[i-1][j]", value: up === null ? "ngoài bảng / off board" : `'${up}'` },
            { name: "board[i][j-1]", value: left === null ? "ngoài bảng / off board" : `'${left}'` },
            { name: "count", value: count },
          ],
        });
      } else {
        snap({
          phase: "inside",
          title: {
            vi: `(${r},${c}) là thân tàu → không đếm`,
            en: `(${r},${c}) is inside a ship → not counted`,
          },
          note: {
            vi: `${upIsX ? `Ô trên (${r - 1},${c}) là 'X'` : `Ô bên trái (${r},${c - 1}) là 'X'`}, nghĩa là ô này nối tiếp một ô 'X' đã quét trước đó của CÙNG một tàu. Tàu đó đã được đếm ở đầu trên-trái của nó, nên bỏ qua ô này để không đếm trùng.`,
            en: `${upIsX ? `The cell above (${r - 1},${c}) is 'X'` : `The cell to the left (${r},${c - 1}) is 'X'`}, so this cell continues an already-scanned 'X' of the SAME ship. That ship was counted at its top-left end, so skip this cell to avoid double counting.`,
          },
          codeLines: upIsX ? [8, 9] : [10, 11],
          cur: { r, c }, checks,
          count, counted,
          decision: upIsX
            ? { vi: "Có 'X' ở trên → đã đếm rồi.", en: "There is an 'X' above → already counted." }
            : { vi: "Có 'X' bên trái → đã đếm rồi.", en: "There is an 'X' to the left → already counted." },
          vars: [
            { name: "board[i-1][j]", value: up === null ? "ngoài bảng / off board" : `'${up}'` },
            { name: "board[i][j-1]", value: left === null ? "ngoài bảng / off board" : `'${left}'` },
            { name: "count", value: count },
          ],
        });
      }
    }
  }
  flushSkip(rows - 1, cols - 1);

  snap({
    phase: "done",
    title: { vi: `Đáp án = ${count}`, en: `Answer = ${count}` },
    note: {
      vi: `Quét đúng một lượt qua ${rows * cols} ô và chỉ dùng một biến count — O(1) bộ nhớ thêm, không sửa bảng. Đếm được ${count} tàu, khớp với ${ships.length} tàu thật trên bảng. Mấu chốt vẫn là: vì tàu là dãy thẳng và không kề nhau, mỗi tàu chỉ có một ô "không có X ở trên và không có X bên trái".`,
      en: `Exactly one pass over ${rows * cols} cells using a single counter — O(1) extra memory, and the board is never modified. It found ${count} ships, matching the ${ships.length} ships actually on the board. The reason it works stays the same: because ships are straight and never touch, each has exactly one cell with no X above and no X to the left.`,
    },
    codeLines: [13],
    final: true,
    count, counted, answer: count,
    decision: { vi: `${count} tàu.`, en: `${count} ships.` },
    vars: [{ name: "answer", value: count }],
  });

  return { input, answer: count, steps };
}

// ── Approach 2: flood fill each component (the baseline that needs memory) ───
function buildSteps419FloodFill(input) {
  const { grid, rows, cols, shipOf, ships } = parseBoard419(input);
  const { steps, snap } = bs419Base(grid, rows, cols, shipOf, ships, 2);
  const seenSet = new Set();
  const seen = [];
  const key = (r, c) => `${r},${c}`;
  let count = 0;

  snap({
    phase: "intro",
    title: { vi: `Cách 2: flood fill — bảng ${rows}×${cols}`, en: `Approach 2: flood fill — board ${rows}×${cols}` },
    note: {
      vi: `Cách thẳng thắn: mỗi tàu là một thành phần liên thông của các ô 'X', nên quét bảng, gặp ô 'X' chưa thăm thì tăng count rồi loang ra toàn bộ tàu đó và đánh dấu đã thăm. Đúng nhưng phải trả giá: cần một tập seen kích thước O(m·n) (hoặc phải ghi đè lên bảng). Đề bài hỏi thêm liệu có làm được một lượt với O(1) bộ nhớ và KHÔNG sửa bảng — đó chính là cách 1.`,
      en: `The straightforward way: each ship is a connected component of 'X' cells, so scan the board, and on an unvisited 'X' increment the count then flood out over that whole ship marking cells visited. Correct, but it costs an O(m·n) seen set (or overwriting the board). The problem's follow-up asks for one pass in O(1) memory WITHOUT modifying the board — that is approach 1.`,
    },
    codeLines: [3, 4, 5],
    count: 0, seen, stack: [],
    decision: { vi: "Đếm thành phần liên thông, cần O(m·n) bộ nhớ.", en: "Count connected components, needing O(m·n) memory." },
    vars: [{ name: "rows, cols", value: `${rows}, ${cols}` }, { name: "len(seen)", value: 0 }],
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== "X" || seenSet.has(key(r, c))) continue;
      count += 1;
      seenSet.add(key(r, c));
      seen.push([r, c]);
      const stack = [[r, c]];
      snap({
        phase: "newShip",
        title: { vi: `Gặp 'X' chưa thăm ở (${r},${c}) → tàu thứ ${count}`, en: `Unvisited 'X' at (${r},${c}) → ship number ${count}` },
        note: {
          vi: `Ô (${r},${c}) là 'X' và chưa nằm trong seen, nên nó mở ra một tàu mới. Tăng count lên ${count}, đánh dấu đã thăm, rồi đẩy vào stack để loang ra hết tàu.`,
          en: `Cell (${r},${c}) is an 'X' not yet in seen, so it opens a new ship. Bump the count to ${count}, mark it visited, and push it on the stack to flood the rest of the ship.`,
        },
        codeLines: [8, 10, 11, 12],
        cur: { r, c },
        count, seen, stack,
        decision: { vi: `Tàu thứ ${count} bắt đầu ở (${r},${c}).`, en: `Ship ${count} starts at (${r},${c}).` },
        vars: [{ name: "count", value: count }, { name: "len(seen)", value: seen.length }],
      });

      while (stack.length) {
        const [cr, cc] = stack.pop();
        const added = [];
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (grid[nr][nc] !== "X" || seenSet.has(key(nr, nc))) continue;
          seenSet.add(key(nr, nc));
          seen.push([nr, nc]);
          stack.push([nr, nc]);
          added.push([nr, nc]);
        }
        snap({
          phase: "flood",
          title: {
            vi: added.length
              ? `Loang từ (${cr},${cc}): thêm ${added.map(([ar, ac]) => `(${ar},${ac})`).join(", ")}`
              : `Loang từ (${cr},${cc}): không còn ô mới`,
            en: added.length
              ? `Flood from (${cr},${cc}): added ${added.map(([ar, ac]) => `(${ar},${ac})`).join(", ")}`
              : `Flood from (${cr},${cc}): nothing new`,
          },
          note: {
            vi: added.length
              ? `Xét 4 ô kề của (${cr},${cc}); ${added.length} ô là 'X' và chưa thăm nên thuộc cùng tàu này, đánh dấu và đẩy vào stack. Stack còn ${stack.length} ô chờ.`
              : `Cả 4 ô kề của (${cr},${cc}) đều ngoài bảng, là '.', hoặc đã thăm. ${stack.length ? `Stack còn ${stack.length} ô chờ.` : "Stack rỗng → tàu này đã loang xong."}`,
            en: added.length
              ? `Check the 4 neighbours of (${cr},${cc}); ${added.length} of them are 'X' and unvisited so they belong to this ship — mark and push them. The stack holds ${stack.length} cells.`
              : `All 4 neighbours of (${cr},${cc}) are off the board, '.', or already visited. ${stack.length ? `The stack holds ${stack.length} cells.` : "The stack is empty → this ship is fully flooded."}`,
          },
          codeLines: [14, 15, 16, 17, 18, 19],
          cur: { r: cr, c: cc },
          count, seen, stack,
          decision: added.length
            ? { vi: `Thêm ${added.length} ô vào tàu ${count}.`, en: `Added ${added.length} cells to ship ${count}.` }
            : { vi: stack.length ? "Không có ô mới, lấy ô khác từ stack." : `Tàu ${count} loang xong.`, en: stack.length ? "Nothing new, pop the next stack cell." : `Ship ${count} is complete.` },
          vars: [{ name: "stack", value: stack.length }, { name: "len(seen)", value: seen.length }],
        });
      }
    }
  }

  snap({
    phase: "done",
    title: { vi: `Đáp án = ${count}`, en: `Answer = ${count}` },
    note: {
      vi: `Tìm được ${count} thành phần liên thông = ${count} tàu, cùng kết quả với cách 1. Nhưng cách này đã phải lưu ${seen.length} ô trong seen — O(m·n) bộ nhớ, trong khi cách 1 chỉ dùng một biến đếm. Đó là lý do cách 1 mới là câu trả lời cho phần follow-up của đề.`,
      en: `It found ${count} connected components = ${count} ships, the same result as approach 1. But it had to store ${seen.length} cells in seen — O(m·n) memory, where approach 1 uses a single counter. That is why approach 1 is the answer to the problem's follow-up.`,
    },
    codeLines: [20],
    final: true,
    count, seen, stack: [], answer: count,
    decision: { vi: `${count} tàu, dùng ${seen.length} ô bộ nhớ.`, en: `${count} ships, using ${seen.length} cells of memory.` },
    vars: [{ name: "answer", value: count }, { name: "len(seen)", value: seen.length }],
  });

  return { input, answer: count, steps };
}

Object.assign(module.exports, {
  419: {
    id: 419,
    difficulty: "medium",
    slug: "battleships-in-a-board",
    category: { key: "array", vi: "Mảng / Ma trận", en: "Array / Matrix" },
    tags: [
      { key: "matrix", vi: "Ma trận", en: "Matrix" },
      { key: "counting", vi: "Đếm", en: "Counting" },
      { key: "flood-fill", vi: "Flood Fill", en: "Flood Fill" },
    ],
    title: { vi: "Battleships in a Board", en: "Battleships in a Board" },
    titleVi: { vi: "Đếm tàu chiến trên bảng", en: "Counting battleships on a board" },
    statement: {
      vi: "Cho bảng m×n gồm 'X' (thân tàu) và '.' (ô trống), đếm số tàu. Mỗi tàu là một dãy thẳng 1×k hoặc k×1, và giữa hai tàu luôn có ít nhất một ô trống ngăn cách (không có hai tàu kề nhau). Nhập bảng: các hàng cách nhau bởi '|' hoặc ';', ví dụ \"X..X|...X|...X\".",
      en: "Given an m×n board of 'X' (ship) and '.' (empty), count the battleships. Each ship is a straight 1×k or k×1 run, and at least one empty cell always separates two ships (no two ships are adjacent). Enter the board with rows separated by '|' or ';', e.g. \"X..X|...X|...X\".",
    },
    defaultInput: "X..X|...X|...X",
    inputKind: "string",
    inputLabel: { vi: "board (hàng cách bởi '|', ký tự X và .)", en: "board (rows separated by '|', characters X and .)" },
    extraParams: [],
    approach: [
      { vi: "Vì tàu là dãy THẲNG và hai tàu không bao giờ kề nhau, mỗi tàu có ĐÚNG MỘT ô không có 'X' ở trên và cũng không có 'X' ở bên trái — chính là đầu trên-trái của nó.", en: "Because ships are STRAIGHT runs and two ships never touch, every ship has EXACTLY ONE cell with no 'X' above it and no 'X' to its left — its top-left end." },
      { vi: "Vậy chỉ cần quét từng hàng từ trái sang phải và đếm các ô 'X' thoả điều kiện đó. Đếm đúng mỗi tàu một lần, không cần visited, không sửa bảng → đúng yêu cầu follow-up: một lượt, O(1) bộ nhớ.", en: "So scan row by row, left to right, and count the 'X' cells meeting that condition. Each ship is counted exactly once with no visited array and no writes to the board → exactly the follow-up's ask: one pass, O(1) memory." },
      { vi: "Thứ tự quét là lý do phép kiểm chỉ cần nhìn LÊN và nhìn SANG TRÁI: hai ô đó chắc chắn đã được quét trước ô hiện tại, còn ô dưới và ô bên phải thì chưa.", en: "The scan order is why the test only looks UP and LEFT: those two cells have certainly been scanned already, while the cell below and the cell to the right have not." },
      { vi: "Cách 2 là flood fill đếm thành phần liên thông — dễ nghĩ ra và cũng đúng, nhưng cần tập seen O(m·n) (hoặc phải ghi đè bảng), nên không đáp ứng được follow-up.", en: "Approach 2 is flood fill counting connected components — easy to think of and also correct, but it needs an O(m·n) seen set (or overwriting the board), so it does not satisfy the follow-up." },
      { vi: "Điều kiện 'không hai tàu kề nhau' là bắt buộc cho cách 1. Với một khối hình chữ L như '.X' trên 'XX', cách 1 đếm ra 2 còn flood fill ra 1 — nhưng đề bài bảo đảm không có hình như thế.", en: "The 'no two ships adjacent' rule is essential for approach 1. On an L-shaped blob such as '.X' over 'XX' approach 1 counts 2 while flood fill counts 1 — but the problem guarantees such shapes never appear." },
    ],
    complexity: {
      time: "O(m · n)",
      space: "O(1)",
      note: {
        vi: "Cách 1 xét mỗi ô đúng một lần và chỉ giữ một biến đếm → O(m·n) thời gian, O(1) bộ nhớ thêm, bảng không bị sửa. Cách 2 cũng O(m·n) thời gian nhưng tốn O(m·n) bộ nhớ cho tập seen và stack.",
        en: "Approach 1 visits each cell once and keeps a single counter → O(m·n) time, O(1) extra space, board untouched. Approach 2 is also O(m·n) time but spends O(m·n) space on the seen set and the stack.",
      },
    },
    codeLabel: { vi: "Cách 1 · Đếm đầu trên-trái (O(1) bộ nhớ)", en: "Approach 1 · Count top-left ends (O(1) space)" },
    code: [
      "class Solution:",
      "    def countBattleships(self, board: List[List[str]]) -> int:",
      "        count = 0",
      "        for i in range(len(board)):",
      "            for j in range(len(board[0])):",
      "                if board[i][j] != 'X':",
      "                    continue",
      "                if i > 0 and board[i-1][j] == 'X':",
      "                    continue            # same ship, already counted",
      "                if j > 0 and board[i][j-1] == 'X':",
      "                    continue            # same ship, already counted",
      "                count += 1              # top-left end of a ship",
      "        return count",
    ],
    code2Label: { vi: "Cách 2 · Flood fill thành phần liên thông", en: "Approach 2 · Flood-fill connected components" },
    code2: [
      "class Solution:",
      "    def countBattleships(self, board: List[List[str]]) -> int:",
      "        m, n = len(board), len(board[0])",
      "        seen = set()",
      "        count = 0",
      "        for i in range(m):",
      "            for j in range(n):",
      "                if board[i][j] != 'X' or (i, j) in seen:",
      "                    continue",
      "                count += 1              # a new ship",
      "                stack = [(i, j)]",
      "                seen.add((i, j))",
      "                while stack:",
      "                    r, c = stack.pop()",
      "                    for dr, dc in ((1,0), (-1,0), (0,1), (0,-1)):",
      "                        nr, nc = r+dr, c+dc",
      "                        if 0 <= nr < m and 0 <= nc < n and board[nr][nc] == 'X' and (nr, nc) not in seen:",
      "                            seen.add((nr, nc))",
      "                            stack.append((nr, nc))",
      "        return count",
    ],
    liveArgs(input) {
      const { grid } = parseBoard419(input);
      return [grid];
    },
    builder: buildSteps419,
    builder2: buildSteps419FloodFill,
  },
});
