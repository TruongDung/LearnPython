const category = { key: "bitmask", vi: "Bitmask", en: "Bitmask" };
const bitmaskTag = { key: "bitmask", vi: "Bitmask", en: "Bitmask" };

function readNumber(input, fallback = 0) {
  const raw = Array.isArray(input) ? input[0] : input;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.trunc(value) : fallback;
}

function unsigned(value) {
  return Number(value) >>> 0;
}

function bitWidth(values, minimum = 4) {
  const nums = values.map(Number);
  if (nums.some((value) => value < 0 || value > 0x7fffffff)) return 32;
  const largest = Math.max(0, ...nums.map((value) => Math.abs(value)));
  return Math.min(32, Math.max(minimum, largest.toString(2).length));
}

function bitString(value, width) {
  return unsigned(value).toString(2).padStart(32, "0").slice(-width);
}

function bitRow(label, value, width, tone = "") {
  return { label, value: unsigned(value), bits: bitString(value, width), tone };
}

function lowestSetBitIndex(value) {
  const bits = unsigned(value);
  if (bits === 0) return -1;
  return 31 - Math.clz32((bits & -bits) >>> 0);
}

function addStep(steps, config) {
  steps.push({
    title: config.title,
    arr: config.arr || [],
    sub: config.sub || [],
    highlight: config.highlight || [],
    mark: config.mark || [],
    final: Boolean(config.final),
    codeLines: config.codeLines || [],
    vars: config.vars || [],
    note: config.note,
    bitmaskBasicsView: {
      problemId: config.problemId,
      mode: config.mode,
      phase: config.phase,
      stages: config.stages,
      stageIndex: config.stageIndex,
      rule: config.rule,
      width: config.width,
      rows: config.rows || [],
      activeBit: Number.isInteger(config.activeBit) ? config.activeBit : -1,
      expression: config.expression || null,
      progress: config.progress || null,
      trail: config.trail || [],
      result: config.result || null,
    },
  });
}

function buildXorDistance(input, params, problemId) {
  const isFlipProblem = problemId === 2220;
  const leftName = isFlipProblem ? "start" : "x";
  const rightName = isFlipProblem ? "goal" : "y";
  const left = unsigned(readNumber(input, isFlipProblem ? 10 : 1));
  const right = unsigned(Number(params && params[rightName] !== undefined ? params[rightName] : (isFlipProblem ? 7 : 4)));
  const width = bitWidth([left, right, left ^ right]);
  const stages = isFlipProblem
    ? [{ vi: "1. So sánh", en: "1. Compare" }, { vi: "2. XOR", en: "2. XOR" }, { vi: "3. Đếm bit khác", en: "3. Count differences" }, { vi: "4. Kết quả", en: "4. Result" }]
    : [{ vi: "1. Căn bit", en: "1. Align bits" }, { vi: "2. XOR", en: "2. XOR" }, { vi: "3. Đếm bit 1", en: "3. Count 1-bits" }, { vi: "4. Kết quả", en: "4. Result" }];
  const rule = {
    vi: `${leftName} ^ ${rightName}: bit 1 xuất hiện đúng tại vị trí hai số khác nhau.`,
    en: `${leftName} ^ ${rightName}: a 1-bit appears exactly where the two values differ.`,
  };
  const steps = [];
  const xor = unsigned(left ^ right);
  let working = xor;
  let count = 0;
  const trail = [];

  addStep(steps, {
    problemId, mode: "xor-distance", phase: "align", stages, stageIndex: 0, rule, width,
    title: { vi: `Căn ${leftName} và ${rightName} theo từng bit`, en: `Align ${leftName} and ${rightName} bit by bit` },
    codeLines: [3],
    vars: [{ name: leftName, value: left }, { name: rightName, value: right }],
    rows: [bitRow(leftName, left, width, "source"), bitRow(rightName, right, width, "source")],
    expression: { vi: "Hai bit khác nhau sẽ tạo bit 1 sau XOR.", en: "Different bits produce a 1 after XOR." },
    note: { vi: "Đọc từng cột từ phải sang trái. Chưa cần đếm; trước tiên hãy tìm các cột khác nhau.", en: "Read each column from right to left. Do not count yet; first find the columns that differ." },
  });

  addStep(steps, {
    problemId, mode: "xor-distance", phase: "xor", stages, stageIndex: 1, rule, width,
    title: { vi: `${leftName} ^ ${rightName} = ${xor}`, en: `${leftName} ^ ${rightName} = ${xor}` },
    codeLines: [3, 4],
    vars: [{ name: "diff", value: xor }],
    rows: [bitRow(leftName, left, width, "source"), bitRow(rightName, right, width, "source"), bitRow("diff", xor, width, "result")],
    expression: { vi: `${left} ^ ${right} = ${xor}. Bây giờ chỉ cần đếm bit 1 trong diff.`, en: `${left} ^ ${right} = ${xor}. Now count the 1-bits in diff.` },
    progress: { current: 0, total: xor.toString(2).split("1").length - 1, label: { vi: "bit khác đã đếm", en: "different bits counted" } },
    note: { vi: "Mỗi bit 1 trong diff tương ứng chính xác một vị trí phải đổi.", en: "Every 1-bit in diff corresponds to exactly one position that must change." },
  });

  const total = xor.toString(2).split("1").length - 1;
  while (working !== 0) {
    const before = working;
    const activeBit = lowestSetBitIndex(before);
    working = unsigned(before & unsigned(before - 1));
    count += 1;
    trail.push({ label: `#${count}`, value: working, bits: bitString(working, width) });
    addStep(steps, {
      problemId, mode: "xor-distance", phase: "count", stages, stageIndex: 2, rule, width, activeBit,
      title: { vi: `Xóa bit 1 thấp nhất ở vị trí ${activeBit}`, en: `Clear the lowest 1-bit at position ${activeBit}` },
      codeLines: [5, 6, 7],
      vars: [{ name: "diff trước", value: before }, { name: "diff sau", value: working }, { name: "count", value: count }],
      rows: [bitRow("diff", before, width, "active"), bitRow("diff - 1", before - 1, width, "source"), bitRow("diff mới", working, width, "result")],
      expression: { vi: `${before} & (${before} - 1) = ${working}; count = ${count}.`, en: `${before} & (${before} - 1) = ${working}; count = ${count}.` },
      progress: { current: count, total, label: { vi: "bit khác đã đếm", en: "different bits counted" } },
      trail: [...trail],
      note: { vi: "Mẹo n & (n-1) xóa đúng một bit 1 thấp nhất, nên số lần lặp chính là số bit khác nhau.", en: "The n & (n-1) trick clears exactly one lowest 1-bit, so the loop count is the number of differing bits." },
    });
  }

  addStep(steps, {
    problemId, mode: "xor-distance", phase: "done", stages, stageIndex: 3, rule, width,
    title: { vi: `Kết quả: ${count}`, en: `Result: ${count}` },
    codeLines: [8], final: true,
    vars: [{ name: "answer", value: count }],
    rows: [bitRow(leftName, left, width, "source"), bitRow(rightName, right, width, "source"), bitRow("XOR", xor, width, "result")],
    expression: { vi: `XOR có ${count} bit 1 → cần ${count} lần đổi bit.`, en: `The XOR has ${count} 1-bits → ${count} bit changes are needed.` },
    progress: { current: count, total, label: { vi: "bit khác đã đếm", en: "different bits counted" } },
    trail,
    result: { label: { vi: "ĐÁP ÁN", en: "ANSWER" }, value: count, status: "success" },
    note: { vi: `Có ${count} vị trí bit khác nhau.`, en: `There are ${count} differing bit positions.` },
  });
  return { original: left, answer: count, steps };
}

function buildSteps191(input) {
  const n = unsigned(readNumber(input, 11));
  const width = bitWidth([n]);
  const stages = [{ vi: "1. Đọc nhị phân", en: "1. Read binary" }, { vi: "2. Tìm bit 1", en: "2. Find a 1-bit" }, { vi: "3. Xóa bit", en: "3. Clear the bit" }, { vi: "4. Kết quả", en: "4. Result" }];
  const rule = { vi: "n & (n - 1) xóa bit 1 thấp nhất của n.", en: "n & (n - 1) clears n's lowest set bit." };
  const steps = [];
  const total = n.toString(2).split("1").length - 1;
  let working = n;
  let count = 0;
  const trail = [];

  addStep(steps, {
    problemId: 191, mode: "popcount", phase: "setup", stages, stageIndex: 0, rule, width,
    title: { vi: `n = ${n} có dạng nhị phân ${bitString(n, width)}`, en: `n = ${n} is ${bitString(n, width)} in binary` },
    codeLines: [3], vars: [{ name: "n", value: n }, { name: "count", value: 0 }],
    rows: [bitRow("n", n, width, "source")],
    expression: { vi: "Mỗi vòng lặp sẽ xóa đúng một bit 1.", en: "Each loop iteration will clear exactly one 1-bit." },
    progress: { current: 0, total, label: { vi: "bit 1 đã đếm", en: "1-bits counted" } },
    note: { vi: "Thay vì kiểm tra đủ 32 vị trí, ta chỉ lặp theo số bit 1 thật sự có.", en: "Instead of checking all 32 positions, iterate only once per actual 1-bit." },
  });

  while (working !== 0) {
    const before = working;
    const activeBit = lowestSetBitIndex(before);
    working = unsigned(before & unsigned(before - 1));
    count += 1;
    trail.push({ label: `#${count}`, value: working, bits: bitString(working, width) });
    addStep(steps, {
      problemId: 191, mode: "popcount", phase: "clear", stages, stageIndex: 2, rule, width, activeBit,
      title: { vi: `Lần ${count}: xóa bit 1 ở vị trí ${activeBit}`, en: `Pass ${count}: clear the 1-bit at position ${activeBit}` },
      codeLines: [4, 5, 6],
      vars: [{ name: "n trước", value: before }, { name: "n sau", value: working }, { name: "count", value: count }],
      rows: [bitRow("n", before, width, "active"), bitRow("n - 1", before - 1, width, "source"), bitRow("n mới", working, width, "result")],
      expression: { vi: `${before} & ${unsigned(before - 1)} = ${working}`, en: `${before} & ${unsigned(before - 1)} = ${working}` },
      progress: { current: count, total, label: { vi: "bit 1 đã đếm", en: "1-bits counted" } }, trail: [...trail],
      note: { vi: `Bit ở vị trí ${activeBit} vừa bị xóa; count tăng thành ${count}.`, en: `The bit at position ${activeBit} was cleared; count becomes ${count}.` },
    });
  }

  addStep(steps, {
    problemId: 191, mode: "popcount", phase: "done", stages, stageIndex: 3, rule, width,
    title: { vi: `n = 0 → trả ${count}`, en: `n = 0 → return ${count}` }, codeLines: [7], final: true,
    vars: [{ name: "answer", value: count }], rows: [bitRow("ban đầu", n, width, "source"), bitRow("sau cùng", 0, width, "result")],
    expression: { vi: `Đã xóa ${count} bit 1, vậy hamming weight = ${count}.`, en: `Cleared ${count} 1-bits, so the Hamming weight is ${count}.` },
    progress: { current: count, total, label: { vi: "bit 1 đã đếm", en: "1-bits counted" } }, trail,
    result: { label: { vi: "SỐ BIT 1", en: "SET BITS" }, value: count, status: "success" },
    note: { vi: `Biểu diễn nhị phân của ${n} có ${count} bit 1.`, en: `${n}'s binary representation has ${count} 1-bits.` },
  });
  return { original: n, answer: count, steps };
}

function buildSteps461(input, params) {
  return buildXorDistance(input, params, 461);
}

function buildSteps2220(input, params) {
  return buildXorDistance(input, params, 2220);
}

function buildSteps476(input) {
  const n = unsigned(readNumber(input, 5));
  const width = Math.max(1, n.toString(2).length);
  const mask = unsigned((2 ** width) - 1);
  const answer = unsigned(n ^ mask);
  const stages = [{ vi: "1. Đếm bit", en: "1. Count bits" }, { vi: "2. Tạo mask", en: "2. Build mask" }, { vi: "3. Lật bit", en: "3. Flip bits" }, { vi: "4. Kết quả", en: "4. Result" }];
  const rule = { vi: "XOR với mask toàn bit 1 sẽ lật mọi bit có nghĩa của n.", en: "XOR with an all-ones mask flips every significant bit of n." };
  const steps = [];
  addStep(steps, {
    problemId: 476, mode: "complement", phase: "width", stages, stageIndex: 0, rule, width,
    title: { vi: `${n} cần ${width} bit`, en: `${n} needs ${width} bits` }, codeLines: [3],
    vars: [{ name: "n", value: n }, { name: "bits", value: width }], rows: [bitRow("n", n, width, "source")],
    expression: { vi: `Chỉ lật ${width} bit có nghĩa, không lật các số 0 vô hạn ở bên trái.`, en: `Flip only the ${width} significant bits, not the leading zeros.` },
    note: { vi: "Độ dài nhị phân quyết định mask cần tạo.", en: "The binary length determines the mask to build." },
  });
  addStep(steps, {
    problemId: 476, mode: "complement", phase: "mask", stages, stageIndex: 1, rule, width,
    title: { vi: `mask = (1 << ${width}) - 1 = ${mask}`, en: `mask = (1 << ${width}) - 1 = ${mask}` }, codeLines: [4],
    vars: [{ name: "mask", value: mask }], rows: [bitRow("n", n, width, "source"), bitRow("mask", mask, width, "active")],
    expression: { vi: `Mask ${bitString(mask, width)} có bit 1 ở mọi vị trí cần lật.`, en: `Mask ${bitString(mask, width)} has a 1 at every position to flip.` },
    note: { vi: "Dịch 1 sang trái width lần tạo 1000..., trừ 1 thành 1111....", en: "Shift 1 left by width to get 1000..., then subtract 1 to get 1111...." },
  });
  addStep(steps, {
    problemId: 476, mode: "complement", phase: "flip", stages, stageIndex: 2, rule, width,
    title: { vi: `${n} ^ ${mask} = ${answer}`, en: `${n} ^ ${mask} = ${answer}` }, codeLines: [5],
    vars: [{ name: "answer", value: answer }], rows: [bitRow("n", n, width, "source"), bitRow("mask", mask, width, "active"), bitRow("n ^ mask", answer, width, "result")],
    expression: { vi: "0 ^ 1 = 1 và 1 ^ 1 = 0: từng bit được đảo ngược.", en: "0 ^ 1 = 1 and 1 ^ 1 = 0: every bit is inverted." },
    note: { vi: `${bitString(n, width)} biến thành ${bitString(answer, width)}.`, en: `${bitString(n, width)} becomes ${bitString(answer, width)}.` },
  });
  addStep(steps, {
    problemId: 476, mode: "complement", phase: "done", stages, stageIndex: 3, rule, width,
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` }, codeLines: [5], final: true,
    vars: [{ name: "answer", value: answer }], rows: [bitRow("n", n, width, "source"), bitRow("complement", answer, width, "result")],
    expression: { vi: `${bitString(n, width)} → ${bitString(answer, width)}`, en: `${bitString(n, width)} → ${bitString(answer, width)}` },
    result: { label: { vi: "COMPLEMENT", en: "COMPLEMENT" }, value: answer, bits: bitString(answer, width), status: "success" },
    note: { vi: `Số bù của ${n} là ${answer}.`, en: `The complement of ${n} is ${answer}.` },
  });
  return { original: n, answer, steps };
}

function buildSteps693(input) {
  const n = unsigned(readNumber(input, 5));
  const width = Math.max(1, n.toString(2).length);
  const stages = [{ vi: "1. Tách bit", en: "1. Read bits" }, { vi: "2. So sánh", en: "2. Compare" }, { vi: "3. Dịch phải", en: "3. Shift right" }, { vi: "4. Kết luận", en: "4. Decide" }];
  const rule = { vi: "Hai bit kề nhau phải luôn khác nhau: 0,1,0,1,...", en: "Every adjacent pair must differ: 0,1,0,1,..." };
  const steps = [];
  const originalBits = bitString(n, width);
  let previous = n & 1;
  let working = n >>> 1;
  let position = 1;
  let answer = true;
  addStep(steps, {
    problemId: 693, mode: "alternating", phase: "setup", stages, stageIndex: 0, rule, width, activeBit: 0,
    title: { vi: `Bit đầu tiên = ${previous}`, en: `First bit = ${previous}` }, codeLines: [3, 4],
    vars: [{ name: "n", value: n }, { name: "prev", value: previous }], rows: [bitRow("n", n, width, "source")],
    expression: { vi: `Bắt đầu từ bit 0 (bên phải): prev = ${previous}.`, en: `Start at bit 0 (the rightmost): prev = ${previous}.` },
    progress: { current: 1, total: width, label: { vi: "bit đã kiểm tra", en: "bits checked" } },
    note: { vi: "Giữ bit trước đó để so với bit kế tiếp.", en: "Keep the previous bit so it can be compared with the next one." },
  });
  while (working > 0) {
    const current = working & 1;
    const differs = current !== previous;
    addStep(steps, {
      problemId: 693, mode: "alternating", phase: "compare", stages, stageIndex: 1, rule, width, activeBit: position,
      title: { vi: `bit ${position} = ${current}; bit ${position - 1} = ${previous}`, en: `bit ${position} = ${current}; bit ${position - 1} = ${previous}` },
      codeLines: [5, 6, 7], vars: [{ name: "curr", value: current }, { name: "prev", value: previous }, { name: "khác nhau", value: differs }],
      rows: [bitRow("n", n, width, differs ? "source" : "danger")],
      expression: { vi: differs ? `${current} ≠ ${previous} → hợp lệ, tiếp tục.` : `${current} = ${previous} → hai bit kề nhau giống nhau.`, en: differs ? `${current} ≠ ${previous} → valid, continue.` : `${current} = ${previous} → adjacent bits are equal.` },
      progress: { current: position + 1, total: width, label: { vi: "bit đã kiểm tra", en: "bits checked" } },
      note: differs ? { vi: "Cặp hiện tại xen kẽ đúng.", en: "This adjacent pair alternates correctly." } : { vi: "Chỉ cần một cặp bằng nhau là toàn bộ số không xen kẽ.", en: "One equal adjacent pair is enough to reject the number." },
    });
    if (!differs) { answer = false; break; }
    previous = current;
    working >>>= 1;
    position += 1;
  }
  addStep(steps, {
    problemId: 693, mode: "alternating", phase: "done", stages, stageIndex: 3, rule, width,
    title: { vi: answer ? "Mọi cặp đều khác nhau → True" : "Có cặp giống nhau → False", en: answer ? "Every pair differs → True" : "An equal pair exists → False" },
    codeLines: answer ? [10] : [7], final: true, vars: [{ name: "answer", value: answer }], rows: [bitRow("n", n, width, answer ? "result" : "danger")],
    expression: { vi: `${n} = ${originalBits}₂ ${answer ? "là" : "không phải"} chuỗi bit xen kẽ.`, en: `${n} = ${originalBits}₂ ${answer ? "has" : "does not have"} alternating bits.` },
    result: { label: { vi: "XEN KẼ?", en: "ALTERNATING?" }, value: answer ? "True" : "False", status: answer ? "success" : "danger" },
    note: { vi: answer ? "Không có hai bit kề nhau nào giống nhau." : "Đã tìm thấy hai bit kề nhau giống nhau.", en: answer ? "No adjacent bits are equal." : "Two equal adjacent bits were found." },
  });
  return { original: n, answer, steps };
}

function buildSteps868(input) {
  const n = unsigned(readNumber(input, 22));
  const width = Math.max(1, n.toString(2).length);
  const stages = [{ vi: "1. Đọc bit", en: "1. Read bits" }, { vi: "2. Gặp bit 1", en: "2. Find a 1-bit" }, { vi: "3. Đo khoảng cách", en: "3. Measure gap" }, { vi: "4. Kết quả", en: "4. Result" }];
  const rule = { vi: "Khi gặp bit 1 mới, khoảng cách = vị trí hiện tại - vị trí bit 1 trước.", en: "At each new 1-bit, distance = current position - previous 1-bit position." };
  const steps = [];
  let working = n;
  let position = 0;
  let previousOne = -1;
  let best = 0;
  const trail = [];
  addStep(steps, {
    problemId: 868, mode: "binary-gap", phase: "setup", stages, stageIndex: 0, rule, width,
    title: { vi: `Quét ${bitString(n, width)} từ phải sang trái`, en: `Scan ${bitString(n, width)} right to left` }, codeLines: [3, 4, 5],
    vars: [{ name: "last", value: -1 }, { name: "best", value: 0 }], rows: [bitRow("n", n, width, "source")],
    expression: { vi: "last = -1 nghĩa là chưa gặp bit 1 đầu tiên.", en: "last = -1 means no 1-bit has been seen yet." },
    progress: { current: 0, total: width, label: { vi: "bit đã quét", en: "bits scanned" } },
    note: { vi: "Vị trí bit được tính từ phải: bit 0, bit 1, ...", en: "Bit positions are counted from the right: bit 0, bit 1, ..." },
  });
  while (working > 0) {
    const currentBit = working & 1;
    if (currentBit === 1) {
      const gap = previousOne < 0 ? null : position - previousOne;
      const previousBest = best;
      if (gap !== null) best = Math.max(best, gap);
      trail.push({ label: `bit ${position}`, value: gap === null ? "đầu" : gap, bits: gap === null ? "first 1" : `gap ${gap}` });
      addStep(steps, {
        problemId: 868, mode: "binary-gap", phase: gap === null ? "first" : "measure", stages, stageIndex: gap === null ? 1 : 2, rule, width, activeBit: position,
        title: { vi: gap === null ? `Bit 1 đầu tiên ở vị trí ${position}` : `Khoảng cách ${position} - ${previousOne} = ${gap}`, en: gap === null ? `First 1-bit at position ${position}` : `Distance ${position} - ${previousOne} = ${gap}` },
        codeLines: gap === null ? [7, 8] : [7, 8, 9], vars: [{ name: "position", value: position }, { name: "last", value: previousOne }, { name: "gap", value: gap === null ? "—" : gap }, { name: "best", value: best }],
        rows: [bitRow("n", n, width, "source")], expression: { vi: gap === null ? "Lưu vị trí này làm mốc đầu tiên." : `best = max(${previousBest}, ${gap}) = ${best}.`, en: gap === null ? "Save this position as the first reference." : `best = max(${previousBest}, ${gap}) = ${best}.` },
        progress: { current: position + 1, total: width, label: { vi: "bit đã quét", en: "bits scanned" } }, trail: [...trail],
        note: { vi: gap === null ? "Chưa thể đo vì cần hai bit 1." : `Đây là khoảng cách giữa hai bit 1 liên tiếp; best hiện là ${best}.`, en: gap === null ? "A distance needs two 1-bits, so there is nothing to measure yet." : `This is the distance between consecutive 1-bits; best is now ${best}.` },
      });
      previousOne = position;
    } else {
      addStep(steps, {
        problemId: 868, mode: "binary-gap", phase: "scan", stages, stageIndex: 0, rule, width, activeBit: position,
        title: { vi: `Bit ${position} = 0 → bỏ qua`, en: `Bit ${position} = 0 → skip` },
        codeLines: [6, 7, 11, 12], vars: [{ name: "position", value: position }, { name: "current bit", value: 0 }, { name: "last", value: previousOne }, { name: "best", value: best }],
        rows: [bitRow("n", n, width, "source")],
        expression: { vi: "Bit 0 không tạo đầu mút của binary gap, nên last và best không đổi.", en: "A 0-bit cannot be a binary-gap endpoint, so last and best stay unchanged." },
        progress: { current: position + 1, total: width, label: { vi: "bit đã quét", en: "bits scanned" } }, trail: [...trail],
        note: { vi: "Dịch phải để kiểm tra vị trí kế tiếp.", en: "Shift right to inspect the next position." },
      });
    }
    working >>>= 1;
    position += 1;
  }
  addStep(steps, {
    problemId: 868, mode: "binary-gap", phase: "done", stages, stageIndex: 3, rule, width,
    title: { vi: `Binary gap lớn nhất = ${best}`, en: `Maximum binary gap = ${best}` }, codeLines: [13], final: true,
    vars: [{ name: "answer", value: best }], rows: [bitRow("n", n, width, "result")],
    expression: { vi: `Khoảng cách lớn nhất giữa hai bit 1 liên tiếp là ${best}.`, en: `The largest distance between consecutive 1-bits is ${best}.` }, trail,
    result: { label: { vi: "BINARY GAP", en: "BINARY GAP" }, value: best, status: "success" },
    note: { vi: `Trả về ${best}.`, en: `Return ${best}.` },
  });
  return { original: n, answer: best, steps };
}

function buildSteps1342(input) {
  const n = unsigned(readNumber(input, 14));
  const width = bitWidth([n]);
  const stages = [{ vi: "1. Đọc bit cuối", en: "1. Read last bit" }, { vi: "2. Chọn phép", en: "2. Choose operation" }, { vi: "3. Cập nhật n", en: "3. Update n" }, { vi: "4. Kết quả", en: "4. Result" }];
  const rule = { vi: "Bit cuối 1 → số lẻ, trừ 1. Bit cuối 0 → số chẵn, dịch phải để chia 2.", en: "Last bit 1 → odd, subtract 1. Last bit 0 → even, shift right to divide by 2." };
  const steps = [];
  let working = n;
  let count = 0;
  const trail = [];
  addStep(steps, {
    problemId: 1342, mode: "reduce-zero", phase: "setup", stages, stageIndex: 0, rule, width,
    title: { vi: `Bắt đầu từ num = ${n}`, en: `Start with num = ${n}` }, codeLines: [3],
    vars: [{ name: "num", value: n }, { name: "steps", value: 0 }], rows: [bitRow("num", n, width, "source")],
    expression: { vi: "Chỉ cần nhìn bit cuối để biết num chẵn hay lẻ.", en: "The last bit alone tells whether num is even or odd." },
    progress: { current: n === 0 ? 1 : 0, total: 1, label: { vi: "đã về 0", en: "reached zero" } },
    note: { vi: "Mục tiêu là biến toàn bộ hàng bit thành 0.", en: "The goal is to turn the whole bit row into zeros." },
  });
  while (working > 0) {
    const before = working;
    const odd = Boolean(before & 1);
    working = odd ? unsigned(before - 1) : before >>> 1;
    count += 1;
    trail.push({ label: `#${count}`, value: working, bits: bitString(working, width) });
    addStep(steps, {
      problemId: 1342, mode: "reduce-zero", phase: odd ? "subtract" : "shift", stages, stageIndex: 2, rule, width, activeBit: 0,
      title: { vi: odd ? `${before} lẻ → trừ 1` : `${before} chẵn → dịch phải`, en: odd ? `${before} is odd → subtract 1` : `${before} is even → shift right` },
      codeLines: odd ? [5, 6] : [5, 7, 8], vars: [{ name: "num trước", value: before }, { name: "bit cuối", value: odd ? 1 : 0 }, { name: "num sau", value: working }, { name: "steps", value: count }],
      rows: [bitRow("trước", before, width, "active"), bitRow(odd ? "- 1" : ">> 1", working, width, "result")],
      expression: { vi: odd ? `${before} - 1 = ${working}` : `${before} >> 1 = ${working} (chia 2)`, en: odd ? `${before} - 1 = ${working}` : `${before} >> 1 = ${working} (divide by 2)` },
      progress: { current: working === 0 ? 1 : 0, total: 1, label: { vi: "đã về 0", en: "reached zero" } }, trail: [...trail],
      note: { vi: odd ? "Trừ 1 biến bit cuối từ 1 thành 0." : "Dịch phải bỏ bit 0 cuối và chia giá trị cho 2.", en: odd ? "Subtracting 1 turns the last bit from 1 to 0." : "Right shift drops the trailing 0 and halves the value." },
    });
  }
  addStep(steps, {
    problemId: 1342, mode: "reduce-zero", phase: "done", stages, stageIndex: 3, rule, width,
    title: { vi: `num = 0 sau ${count} bước`, en: `num = 0 after ${count} steps` }, codeLines: [10], final: true,
    vars: [{ name: "answer", value: count }], rows: [bitRow("ban đầu", n, width, "source"), bitRow("sau cùng", 0, width, "result")],
    expression: { vi: `Cần tổng cộng ${count} phép toán.`, en: `${count} operations are needed in total.` }, trail,
    result: { label: { vi: "SỐ BƯỚC", en: "STEPS" }, value: count, status: "success" },
    note: { vi: `Trả về ${count}.`, en: `Return ${count}.` },
  });
  return { original: n, answer: count, steps };
}

module.exports = {
  191: {
    id: 191, difficulty: "easy", slug: "number-of-1-bits", category, tags: [bitmaskTag],
    title: { vi: "Number of 1 Bits", en: "Number of 1 Bits" },
    titleVi: { vi: "Đếm số bit 1", en: "Count set bits" },
    statement: { vi: "Cho số nguyên không âm n, trả về số bit 1 trong biểu diễn nhị phân của n.", en: "Given a non-negative integer n, return the number of 1-bits in its binary representation." },
    defaultInput: [11], inputKind: "nonneg", inputLabel: { vi: "n", en: "n" }, singleInput: true, extraParams: [],
    approach: [{ vi: "Mỗi lần dùng n &= n-1 để xóa bit 1 thấp nhất.", en: "Use n &= n-1 to clear the lowest set bit each time." }, { vi: "Đếm số lần xóa cho tới khi n = 0.", en: "Count clears until n becomes 0." }],
    complexity: { time: "O(k)", space: "O(1)", note: { vi: "k là số bit 1.", en: "k is the number of set bits." } },
    code: ["class Solution:", "    def hammingWeight(self, n: int) -> int:", "        count = 0", "        while n:", "            n &= n - 1", "            count += 1", "        return count"], builder: buildSteps191,
  },
  461: {
    id: 461, difficulty: "easy", slug: "hamming-distance", category, tags: [bitmaskTag],
    title: { vi: "Hamming Distance", en: "Hamming Distance" }, titleVi: { vi: "Khoảng cách Hamming", en: "Hamming distance" },
    statement: { vi: "Đếm số vị trí bit khác nhau giữa x và y.", en: "Count the bit positions where x and y differ." },
    defaultInput: [1], inputKind: "nonneg", inputLabel: { vi: "x", en: "x" }, singleInput: true,
    extraParams: [{ key: "y", label: { vi: "y", en: "y" }, default: 4 }],
    approach: [{ vi: "XOR x và y để các vị trí khác nhau thành bit 1.", en: "XOR x and y so differing positions become 1-bits." }, { vi: "Dùng n & (n-1) để đếm bit 1.", en: "Use n & (n-1) to count set bits." }],
    complexity: { time: "O(k)", space: "O(1)", note: { vi: "k là số bit khác nhau.", en: "k is the number of differing bits." } },
    code: ["class Solution:", "    def hammingDistance(self, x: int, y: int) -> int:", "        diff = x ^ y", "        distance = 0", "        while diff:", "            diff &= diff - 1", "            distance += 1", "        return distance"], builder: buildSteps461,
  },
  476: {
    id: 476, difficulty: "easy", slug: "number-complement", category, tags: [bitmaskTag],
    title: { vi: "Number Complement", en: "Number Complement" }, titleVi: { vi: "Số bù nhị phân", en: "Binary number complement" },
    statement: { vi: "Lật mọi bit có nghĩa trong biểu diễn nhị phân của số nguyên dương n.", en: "Flip every significant bit in the binary representation of positive integer n." },
    defaultInput: [5], inputKind: "positive", inputLabel: { vi: "n", en: "n" }, singleInput: true, extraParams: [],
    approach: [{ vi: "Tạo mask gồm toàn bit 1 có cùng độ dài với n.", en: "Build an all-ones mask with n's bit length." }, { vi: "XOR n với mask để lật từng bit.", en: "XOR n with the mask to flip every bit." }],
    complexity: { time: "O(1)", space: "O(1)", note: { vi: "Số nguyên có độ rộng bit cố định.", en: "Integers have fixed bit width." } },
    code: ["class Solution:", "    def findComplement(self, n: int) -> int:", "        bits = n.bit_length()", "        mask = (1 << bits) - 1", "        return n ^ mask"], builder: buildSteps476,
  },
  693: {
    id: 693, difficulty: "easy", slug: "binary-number-with-alternating-bits", category, tags: [bitmaskTag],
    title: { vi: "Binary Number with Alternating Bits", en: "Binary Number with Alternating Bits" }, titleVi: { vi: "Số nhị phân có bit xen kẽ", en: "Binary number with alternating bits" },
    statement: { vi: "Kiểm tra biểu diễn nhị phân của n có các bit 0 và 1 xen kẽ hay không.", en: "Check whether n's binary representation has alternating 0 and 1 bits." },
    defaultInput: [5], inputKind: "positive", inputLabel: { vi: "n", en: "n" }, singleInput: true, extraParams: [],
    approach: [{ vi: "Đọc bit cuối bằng n & 1.", en: "Read the last bit with n & 1." }, { vi: "Dịch phải và so mỗi bit với bit trước.", en: "Shift right and compare each bit with the previous one." }],
    complexity: { time: "O(log n)", space: "O(1)", note: { vi: "Kiểm tra mỗi bit một lần.", en: "Inspect each bit once." } },
    code: ["class Solution:", "    def hasAlternatingBits(self, n: int) -> bool:", "        prev = n & 1", "        n >>= 1", "        while n:", "            curr = n & 1", "            if curr == prev:", "                return False", "            prev = curr", "            n >>= 1", "        return True"], builder: buildSteps693,
  },
  868: {
    id: 868, difficulty: "easy", slug: "binary-gap", category, tags: [bitmaskTag],
    title: { vi: "Binary Gap", en: "Binary Gap" }, titleVi: { vi: "Khoảng cách nhị phân", en: "Binary gap" },
    statement: { vi: "Tìm khoảng cách lớn nhất giữa hai bit 1 liên tiếp trong biểu diễn nhị phân của n.", en: "Find the largest distance between consecutive 1-bits in n's binary representation." },
    defaultInput: [22], inputKind: "positive", inputLabel: { vi: "n", en: "n" }, singleInput: true, extraParams: [],
    approach: [{ vi: "Quét từng bit từ phải sang trái.", en: "Scan bits from right to left." }, { vi: "Lưu vị trí bit 1 trước và cập nhật khoảng cách tốt nhất.", en: "Store the previous 1-bit position and update the best distance." }],
    complexity: { time: "O(log n)", space: "O(1)", note: { vi: "Một lượt qua các bit.", en: "One pass over the bits." } },
    code: ["class Solution:", "    def binaryGap(self, n: int) -> int:", "        last = -1", "        best = 0", "        position = 0", "        while n:", "            if n & 1:", "                if last >= 0:", "                    best = max(best, position - last)", "                last = position", "            n >>= 1", "            position += 1", "        return best"], builder: buildSteps868,
  },
  1342: {
    id: 1342, difficulty: "easy", slug: "number-of-steps-to-reduce-a-number-to-zero", category, tags: [bitmaskTag],
    title: { vi: "Number of Steps to Reduce a Number to Zero", en: "Number of Steps to Reduce a Number to Zero" }, titleVi: { vi: "Số bước đưa một số về 0", en: "Steps to reduce a number to zero" },
    statement: { vi: "Nếu num chẵn thì chia 2, nếu lẻ thì trừ 1. Đếm số bước để num về 0.", en: "If num is even, divide it by 2; otherwise subtract 1. Count steps until num reaches 0." },
    defaultInput: [14], inputKind: "nonneg", inputLabel: { vi: "num", en: "num" }, singleInput: true, extraParams: [],
    approach: [{ vi: "num & 1 đọc bit cuối để phân biệt chẵn/lẻ.", en: "num & 1 reads the last bit to distinguish even from odd." }, { vi: "Số chẵn dịch phải; số lẻ trừ 1.", en: "Right-shift even values; subtract 1 from odd values." }],
    complexity: { time: "O(log n)", space: "O(1)", note: { vi: "Mỗi một hoặc hai bước loại bỏ ít nhất một bit.", en: "Every one or two steps removes at least one bit." } },
    code: ["class Solution:", "    def numberOfSteps(self, num: int) -> int:", "        steps = 0", "        while num:", "            if num & 1:", "                num -= 1", "            else:", "                num >>= 1", "            steps += 1", "        return steps"], builder: buildSteps1342,
  },
  2220: {
    id: 2220, difficulty: "easy", slug: "minimum-bit-flips-to-convert-number", category, tags: [bitmaskTag],
    title: { vi: "Minimum Bit Flips to Convert Number", en: "Minimum Bit Flips to Convert Number" }, titleVi: { vi: "Số lần lật bit tối thiểu", en: "Minimum bit flips" },
    statement: { vi: "Tìm số bit tối thiểu cần lật để biến start thành goal.", en: "Find the minimum number of bit flips needed to convert start into goal." },
    defaultInput: [10], inputKind: "nonneg", inputLabel: { vi: "start", en: "start" }, singleInput: true,
    extraParams: [{ key: "goal", label: { vi: "goal", en: "goal" }, default: 7 }],
    approach: [{ vi: "XOR start và goal để đánh dấu các bit khác nhau.", en: "XOR start and goal to mark differing bits." }, { vi: "Đếm bit 1 trong kết quả XOR.", en: "Count the 1-bits in the XOR result." }],
    complexity: { time: "O(k)", space: "O(1)", note: { vi: "k là số bit cần lật.", en: "k is the number of bits to flip." } },
    code: ["class Solution:", "    def minBitFlips(self, start: int, goal: int) -> int:", "        diff = start ^ goal", "        flips = 0", "        while diff:", "            diff &= diff - 1", "            flips += 1", "        return flips"], builder: buildSteps2220,
  },
};
