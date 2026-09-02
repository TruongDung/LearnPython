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

function parseIntegerArray(value, name, fallback = []) {
  const source = Array.isArray(value) ? value : String(value ?? "").split(",");
  const values = source.map((item) => Number(String(item).trim())).filter((item) => Number.isFinite(item));
  if (!values.length && fallback.length) return [...fallback];
  if (!values.length || values.some((item) => !Number.isInteger(item))) {
    throw new Error(`${name} must be a comma-separated integer list.`);
  }
  return values;
}

function parseWordArray(value, name = "words") {
  const source = Array.isArray(value) ? value : String(value ?? "").split(",");
  const words = source.map((word) => String(word).trim()).filter(Boolean);
  if (!words.length || words.some((word) => !/^[a-z]+$/.test(word))) {
    throw new Error(`${name} must contain lowercase words separated by commas.`);
  }
  return words;
}

function popcount(value) {
  let bits = unsigned(value);
  let count = 0;
  while (bits) {
    bits &= bits - 1;
    count += 1;
  }
  return count;
}

function gcd(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b) [a, b] = [b, a % b];
  return a;
}

function addAdvancedStep(steps, config) {
  steps.push({
    title: config.title,
    note: config.note,
    final: Boolean(config.final),
    arr: config.arr || [],
    sub: config.sub || [],
    highlight: config.highlight || [],
    mark: config.mark || [],
    codeLines: config.codeLines || [],
    vars: config.vars || [],
    advancedBitmaskView: {
      problemId: config.problemId,
      mode: config.mode,
      phase: config.phase,
      stages: config.stages || [],
      stageIndex: config.stageIndex || 0,
      rule: config.rule,
      lanes: config.lanes || [],
      masks: config.masks || [],
      operation: config.operation || null,
      states: config.states || null,
      result: config.result || null,
      traceTruncated: Boolean(config.traceTruncated),
    },
  });
}

function letterMask(word) {
  let mask = 0;
  for (const char of word) mask |= 1 << (char.charCodeAt(0) - 97);
  return unsigned(mask);
}

function letterMaskBits(mask) {
  return Array.from({ length: 26 }, (_, index) => ({
    label: String.fromCharCode(97 + index),
    on: Boolean(mask & (1 << index)),
  }));
}

function buildSteps318(input) {
  const words = parseWordArray(input);
  if (words.length > 8) throw new Error("Use at most 8 words for this visualization.");
  const masks = words.map(letterMask);
  const steps = [];
  const stages = [
    { vi: "1. Mã hóa từ", en: "1. Encode words" },
    { vi: "2. Chọn cặp", en: "2. Pick a pair" },
    { vi: "3. AND mask", en: "3. AND masks" },
    { vi: "4. Cập nhật max", en: "4. Update maximum" },
    { vi: "5. Kết quả", en: "5. Result" },
  ];
  const rule = {
    vi: "Mỗi chữ cái là một bit. Hai từ không chung chữ cái khi mask1 & mask2 = 0.",
    en: "Each letter is one bit. Two words share no letters exactly when mask1 & mask2 = 0.",
  };
  const candidates = [];
  let best = 0;
  let bestPair = [];
  const wordItems = (active = [], bestIndexes = bestPair) => words.map((word, index) => ({
    label: word,
    value: word.length,
    sub: `mask ${masks[index].toString(2)}`,
    badge: `${new Set(word).size} letters`,
    state: active.includes(index) ? "active" : bestIndexes.includes(index) ? "success" : "",
  }));

  for (let index = 0; index < words.length; index++) {
    addAdvancedStep(steps, {
      problemId: 318, mode: "word-product", phase: "encode", stages, stageIndex: 0, rule,
      title: { vi: `Mã hóa "${words[index]}"`, en: `Encode "${words[index]}"` },
      codeLines: [4, 5, 6],
      vars: [{ name: "word", value: words[index] }, { name: "mask", value: masks[index] }],
      lanes: [{ title: { vi: "WORDS", en: "WORDS" }, hint: { vi: "số lớn = độ dài", en: "large number = length" }, items: wordItems([index], []) }],
      masks: [{ title: words[index], value: masks[index], bits: letterMaskBits(masks[index]), tone: "active" }],
      operation: {
        eyebrow: { vi: "WORD → MASK", en: "WORD → MASK" },
        formula: [...new Set(words[index])].sort().join(" + "),
        detail: { vi: "Chữ xuất hiện nhiều lần vẫn chỉ bật một bit.", en: "Repeated letters still turn on only one bit." },
        status: "info",
      },
      note: { vi: `Mask của "${words[index]}" bật các bit chữ cái có mặt trong từ.`, en: `The mask for "${words[index]}" turns on every letter present in the word.` },
    });
  }

  for (let left = 0; left < words.length; left++) {
    for (let right = left + 1; right < words.length; right++) {
      const overlap = unsigned(masks[left] & masks[right]);
      const compatible = overlap === 0;
      const product = words[left].length * words[right].length;
      if (compatible) {
        candidates.push({ label: `${words[left]} × ${words[right]}`, mask: 0, value: product, sub: `${words[left].length} × ${words[right].length}`, state: product > best ? "active" : "success" });
        if (product > best) {
          best = product;
          bestPair = [left, right];
        }
      }
      addAdvancedStep(steps, {
        problemId: 318, mode: "word-product", phase: compatible ? "compatible" : "overlap", stages, stageIndex: compatible ? 3 : 2, rule,
        title: { vi: `So sánh "${words[left]}" và "${words[right]}"`, en: `Compare "${words[left]}" and "${words[right]}"` },
        codeLines: [8, 9, 10],
        vars: [{ name: "left", value: words[left] }, { name: "right", value: words[right] }, { name: "mask AND", value: overlap }, { name: "best", value: best }],
        lanes: [{ title: { vi: "CẶP TỪ ĐANG XÉT", en: "CURRENT WORD PAIR" }, hint: { vi: "vàng = đang so sánh", en: "amber = comparing" }, items: wordItems([left, right]) }],
        masks: [
          { title: words[left], value: masks[left], bits: letterMaskBits(masks[left]), tone: "source" },
          { title: words[right], value: masks[right], bits: letterMaskBits(masks[right]), tone: "source" },
          { title: "AND", value: overlap, bits: letterMaskBits(overlap), tone: compatible ? "success" : "danger" },
        ],
        operation: {
          eyebrow: { vi: "KIỂM TRA GIAO NHAU", en: "OVERLAP CHECK" },
          formula: `${masks[left]} & ${masks[right]} = ${overlap}`,
          detail: compatible
            ? { vi: `Không chung chữ → product = ${words[left].length} × ${words[right].length} = ${product}; best = ${best}.`, en: `No shared letters → product = ${words[left].length} × ${words[right].length} = ${product}; best = ${best}.` }
            : { vi: "AND khác 0 nên có ít nhất một chữ chung; bỏ cặp này.", en: "A non-zero AND means at least one letter is shared; skip this pair." },
          status: compatible ? "success" : "danger",
        },
        states: { title: { vi: "CẶP HỢP LỆ", en: "VALID PAIRS" }, hint: { vi: `best = ${best}`, en: `best = ${best}` }, items: candidates.slice(-8) },
        note: compatible
          ? { vi: `Hai mask không giao nhau; cặp này tạo tích ${product}.`, en: `The masks do not overlap; this pair produces ${product}.` }
          : { vi: "Hai từ có chữ cái chung nên không thể dùng.", en: "The words share a letter, so this pair is invalid." },
      });
    }
  }

  addAdvancedStep(steps, {
    problemId: 318, mode: "word-product", phase: "done", stages, stageIndex: 4, rule, final: true,
    title: { vi: `Tích lớn nhất = ${best}`, en: `Maximum product = ${best}` }, codeLines: [11],
    vars: [{ name: "answer", value: best }],
    lanes: [{ title: { vi: "CẶP TỐT NHẤT", en: "BEST PAIR" }, hint: { vi: "không chung chữ cái", en: "no shared letters" }, items: wordItems([], bestPair) }],
    masks: bestPair.length ? bestPair.map((index) => ({ title: words[index], value: masks[index], bits: letterMaskBits(masks[index]), tone: "success" })) : [],
    operation: { eyebrow: { vi: "MAX PRODUCT", en: "MAX PRODUCT" }, formula: bestPair.length ? `${words[bestPair[0]].length} × ${words[bestPair[1]].length} = ${best}` : "0", detail: { vi: "Đã xét mọi cặp từ.", en: "Every word pair has been checked." }, status: "success" },
    states: { title: { vi: "CẶP HỢP LỆ", en: "VALID PAIRS" }, hint: { vi: `${candidates.length} cặp`, en: `${candidates.length} pairs` }, items: candidates.slice(-8) },
    result: { label: { vi: "TÍCH LỚN NHẤT", en: "MAX PRODUCT" }, value: best, detail: bestPair.length ? `${words[bestPair[0]]} × ${words[bestPair[1]]}` : "", status: "success" },
    note: { vi: `Kết quả là ${best}.`, en: `The answer is ${best}.` },
  });
  return { original: words, answer: best, steps };
}

function buildSteps526(input) {
  const n = readNumber(input, 4);
  if (n < 1 || n > 8) throw new Error("Use n from 1 to 8 for this visualization.");
  const steps = [];
  const stages = [
    { vi: "1. Chọn vị trí", en: "1. Pick position" },
    { vi: "2. Thử số", en: "2. Try number" },
    { vi: "3. Bật bit", en: "3. Set used bit" },
    { vi: "4. Quay lui", en: "4. Backtrack" },
    { vi: "5. Đếm", en: "5. Count" },
  ];
  const rule = {
    vi: "Tại position, số num hợp lệ nếu position chia hết cho num hoặc num chia hết cho position.",
    en: "At a position, num is valid when position divides num or num divides position.",
  };
  const placement = Array(n + 1).fill(null);
  const solutions = [];
  const TRACE_LIMIT = 260;
  let traceTruncated = false;

  const snapshot = ({ phase, position, usedMask, candidate = null, valid = null, line, title, note, final = false }) => {
    if (!final && steps.length >= TRACE_LIMIT) { traceTruncated = true; return; }
    const positionItems = Array.from({ length: n }, (_, offset) => {
      const pos = offset + 1;
      return { label: `pos ${pos}`, value: placement[pos] ?? "?", sub: placement[pos] == null ? "empty" : `num ${placement[pos]}`, state: pos === position ? "active" : placement[pos] != null ? "success" : "" };
    });
    const numberItems = Array.from({ length: n }, (_, index) => {
      const num = index + 1;
      const used = Boolean(usedMask & (1 << index));
      return { label: `num ${num}`, value: num, sub: used ? "used" : "available", state: num === candidate ? valid === false ? "danger" : "active" : used ? "muted" : "" };
    });
    addAdvancedStep(steps, {
      problemId: 526, mode: "arrangement", phase, stages,
      stageIndex: phase === "try" ? 1 : phase === "choose" ? 2 : phase === "backtrack" ? 3 : phase === "solution" || phase === "done" ? 4 : 0,
      rule, title, note, final, codeLines: [line], traceTruncated,
      vars: [{ name: "position", value: position }, { name: "used mask", value: usedMask.toString(2).padStart(n, "0") }, { name: "count", value: solutions.length }],
      lanes: [
        { title: { vi: "CÁC VỊ TRÍ", en: "POSITIONS" }, hint: { vi: "điền từ trái sang phải", en: "fill left to right" }, items: positionItems },
        { title: { vi: "CÁC SỐ 1..n", en: "NUMBERS 1..n" }, hint: { vi: "mỗi số dùng một lần", en: "use each once" }, items: numberItems },
      ],
      masks: [{ title: { vi: "USED MASK", en: "USED MASK" }, value: usedMask, bits: Array.from({ length: n }, (_, index) => ({ label: String(index + 1), on: Boolean(usedMask & (1 << index)), state: index + 1 === candidate ? "active" : "" })), tone: phase === "solution" ? "success" : "source" }],
      operation: candidate == null ? null : {
        eyebrow: { vi: `POSITION ${position}`, en: `POSITION ${position}` },
        formula: `${position} % ${candidate} = ${position % candidate}  |  ${candidate} % ${position} = ${candidate % position}`,
        detail: valid ? { vi: `${candidate} hợp lệ và chưa dùng.`, en: `${candidate} is valid and unused.` } : { vi: `${candidate} không thỏa điều kiện chia hết.`, en: `${candidate} fails the divisibility rule.` },
        status: valid ? "success" : "danger",
      },
      states: { title: { vi: "ARRANGEMENT ĐÃ TÌM", en: "FOUND ARRANGEMENTS" }, hint: { vi: `${solutions.length} cách`, en: `${solutions.length} ways` }, items: solutions.slice(-8).map((solution, index) => ({ label: `#${Math.max(1, solutions.length - 7 + index)}`, value: solution.join(" · "), sub: "valid", state: "success" })) },
      result: final ? { label: { vi: "SỐ ARRANGEMENT", en: "ARRANGEMENT COUNT" }, value: solutions.length, detail: traceTruncated ? "trace limited" : "", status: "success" } : null,
    });
  };

  const backtrack = (position, usedMask) => {
    if (position > n) {
      solutions.push(placement.slice(1));
      snapshot({ phase: "solution", position: n, usedMask, line: 5, title: { vi: `Tìm thấy arrangement #${solutions.length}`, en: `Found arrangement #${solutions.length}` }, note: { vi: `[${placement.slice(1).join(", ")}] thỏa mọi vị trí.`, en: `[${placement.slice(1).join(", ")}] satisfies every position.` } });
      return;
    }
    for (let num = 1; num <= n; num++) {
      if (usedMask & (1 << (num - 1))) continue;
      const valid = position % num === 0 || num % position === 0;
      snapshot({ phase: "try", position, usedMask, candidate: num, valid, line: 7, title: { vi: `Thử num ${num} tại position ${position}`, en: `Try num ${num} at position ${position}` }, note: valid ? { vi: "Điều kiện đúng, có thể chọn.", en: "The rule passes, so choose it." } : { vi: "Điều kiện sai, thử số kế tiếp.", en: "The rule fails, so try the next number." } });
      if (!valid) continue;
      placement[position] = num;
      const nextMask = usedMask | (1 << (num - 1));
      snapshot({ phase: "choose", position, usedMask: nextMask, candidate: num, valid: true, line: 8, title: { vi: `Chọn ${num}; bật bit ${num - 1}`, en: `Choose ${num}; set bit ${num - 1}` }, note: { vi: `used mask ghi rằng số ${num} đã được dùng.`, en: `The used mask now records that ${num} is taken.` } });
      backtrack(position + 1, nextMask);
      placement[position] = null;
      snapshot({ phase: "backtrack", position, usedMask, candidate: num, valid: true, line: 10, title: { vi: `Quay lui: bỏ ${num} khỏi position ${position}`, en: `Backtrack: remove ${num} from position ${position}` }, note: { vi: "Tắt bit và thử lựa chọn khác.", en: "Clear the bit and try another choice." } });
    }
  };

  snapshot({ phase: "start", position: 1, usedMask: 0, line: 3, title: { vi: "Bắt đầu từ position 1", en: "Start at position 1" }, note: { vi: "used mask ban đầu bằng 0: chưa dùng số nào.", en: "The initial used mask is 0: no number has been used." } });
  backtrack(1, 0);
  snapshot({ phase: "done", position: n, usedMask: 0, line: 11, title: { vi: `Có ${solutions.length} arrangement`, en: `${solutions.length} arrangements` }, note: { vi: `Đã duyệt toàn bộ cây lựa chọn.`, en: `The full choice tree has been explored.` }, final: true });
  return { original: n, answer: solutions.length, steps };
}

function buildSteps698(input, params = {}) {
  const rawNums = parseIntegerArray(input, "nums");
  const k = Number(params.k ?? 4);
  if (rawNums.length > 10 || rawNums.some((value) => value <= 0) || !Number.isInteger(k) || k < 1 || k > rawNums.length) {
    throw new Error("Use 1 to 10 positive nums and an integer k from 1 to nums.length.");
  }
  const sorted = rawNums.map((value, originalIndex) => ({ value, originalIndex })).sort((left, right) => right.value - left.value);
  const nums = sorted.map((item) => item.value);
  const total = nums.reduce((sum, value) => sum + value, 0);
  const target = total / k;
  const fullMask = (1 << nums.length) - 1;
  const steps = [];
  const stages = [
    { vi: "1. Tính target", en: "1. Compute target" },
    { vi: "2. Chọn số", en: "2. Pick a number" },
    { vi: "3. Đổ vào bucket", en: "3. Fill a bucket" },
    { vi: "4. Quay lui", en: "4. Backtrack" },
    { vi: "5. Kết luận", en: "5. Decide" },
  ];
  const rule = {
    vi: "Mỗi bucket phải có tổng target. used mask đảm bảo mỗi phần tử chỉ được dùng một lần.",
    en: "Every bucket must sum to target. The used mask ensures each element is used once.",
  };
  const buckets = Array.from({ length: k }, () => []);
  const memo = new Set();
  const memoTrail = [];
  const TRACE_LIMIT = 280;
  let traceTruncated = false;
  let solutionBuckets = null;

  const snapshot = ({ phase, bucketIndex = 0, usedMask = 0, activeIndex = -1, currentSum = 0, line, title, note, status = "info", final = false, answer = null }) => {
    if (!final && steps.length >= TRACE_LIMIT) { traceTruncated = true; return; }
    const numberItems = sorted.map((item, index) => ({
      label: `#${item.originalIndex}`,
      value: item.value,
      sub: usedMask & (1 << index) ? "used" : "available",
      badge: `bit ${index}`,
      state: index === activeIndex ? status === "danger" ? "danger" : "active" : usedMask & (1 << index) ? "muted" : "",
    }));
    const bucketItems = buckets.map((bucket, index) => {
      const sum = bucket.reduce((acc, item) => acc + item.value, 0);
      return {
        label: `bucket ${index + 1}`,
        value: `${sum}/${Number.isInteger(target) ? target : "?"}`,
        sub: bucket.length ? bucket.map((item) => item.value).join(" + ") : "empty",
        badge: sum === target ? "complete" : index === bucketIndex ? "current" : "pending",
        state: sum === target ? "success" : index === bucketIndex ? "active" : "",
      };
    });
    addAdvancedStep(steps, {
      problemId: 698, mode: "k-subsets", phase, stages,
      stageIndex: phase === "start" ? 0 : phase === "try" ? 1 : phase === "choose" || phase === "bucket-complete" ? 2 : phase === "backtrack" || phase === "memo" ? 3 : 4,
      rule, title, note, final, codeLines: [line], traceTruncated,
      vars: [{ name: "target", value: Number.isInteger(target) ? target : "not integer" }, { name: "bucket", value: bucketIndex + 1 }, { name: "current sum", value: currentSum }, { name: "used mask", value: usedMask.toString(2).padStart(nums.length, "0") }],
      lanes: [
        { title: { vi: "CÁC PHẦN TỬ", en: "ELEMENTS" }, hint: { vi: "đã sort giảm dần", en: "sorted descending" }, items: numberItems },
        { title: { vi: `${k} BUCKET CÓ CÙNG TARGET`, en: `${k} BUCKETS WITH THE SAME TARGET` }, hint: { vi: `tổng mỗi bucket = ${Number.isInteger(target) ? target : "?"}`, en: `each bucket sum = ${Number.isInteger(target) ? target : "?"}` }, items: bucketItems },
      ],
      masks: [{ title: { vi: "USED ELEMENTS", en: "USED ELEMENTS" }, value: usedMask, bits: sorted.map((item, index) => ({ label: `#${item.originalIndex}:${item.value}`, on: Boolean(usedMask & (1 << index)), state: index === activeIndex ? "active" : "" })), tone: final && answer ? "success" : "source" }],
      operation: activeIndex < 0 ? {
        eyebrow: { vi: "TARGET", en: "TARGET" },
        formula: `${total} / ${k} = ${Number.isInteger(target) ? target : "not integer"}`,
        detail: Number.isInteger(target) ? { vi: "Tổng chia đều được; bắt đầu lấp từng bucket.", en: "The total divides evenly; start filling buckets." } : { vi: "Không thể chia tổng thành k phần bằng nhau.", en: "The total cannot be split into k equal integer sums." },
        status: Number.isInteger(target) ? "info" : "danger",
      } : {
        eyebrow: { vi: `BUCKET ${bucketIndex + 1}`, en: `BUCKET ${bucketIndex + 1}` },
        formula: `${currentSum} + ${nums[activeIndex]} ${currentSum + nums[activeIndex] <= target ? "≤" : ">"} ${target}`,
        detail: status === "danger" ? { vi: "Vượt target nên không chọn.", en: "This exceeds target, so skip it." } : { vi: "Vẫn không vượt target; bật bit và đi sâu.", en: "It still fits; set the bit and recurse." },
        status,
      },
      states: { title: { vi: "MEMO DEAD STATES", en: "MEMOIZED DEAD STATES" }, hint: { vi: `${memo.size} state`, en: `${memo.size} states` }, items: memoTrail.slice(-10).map((entry) => ({ label: `bucket ${entry.bucket + 1}`, mask: entry.mask, value: entry.sum, sub: entry.bits, state: "muted" })) },
      result: final ? { label: { vi: "CHIA ĐƯỢC?", en: "CAN PARTITION?" }, value: answer ? "True" : "False", detail: answer ? `${k} buckets × ${target}` : "", status: answer ? "success" : "danger" } : null,
    });
  };

  if (!Number.isInteger(target) || nums[0] > target) {
    snapshot({ phase: "done", line: 4, title: { vi: "Không thể chia đều", en: "Equal partition is impossible" }, note: { vi: !Number.isInteger(target) ? `Tổng ${total} không chia hết cho k=${k}.` : `Số lớn nhất ${nums[0]} vượt target ${target}.`, en: !Number.isInteger(target) ? `Total ${total} is not divisible by k=${k}.` : `Largest value ${nums[0]} exceeds target ${target}.` }, final: true, answer: false, status: "danger" });
    return { original: rawNums, answer: false, steps };
  }

  const dfs = (bucketIndex, currentSum, usedMask) => {
    if (bucketIndex === k - 1) {
      const remaining = sorted.filter((_, index) => !(usedMask & (1 << index)));
      buckets[bucketIndex].push(...remaining);
      solutionBuckets = buckets.map((bucket) => bucket.map((item) => item.value));
      snapshot({ phase: "done", bucketIndex, usedMask: fullMask, currentSum: target, line: 8, title: { vi: "Bucket cuối nhận các số còn lại", en: "The last bucket takes all remaining numbers" }, note: { vi: "Vì các bucket trước đều đạt target và tổng toàn mảng đúng k × target, bucket cuối tự động đúng.", en: "Previous buckets hit target and the total is k × target, so the last bucket is automatically valid." }, status: "success" });
      return true;
    }
    if (currentSum === target) {
      snapshot({ phase: "bucket-complete", bucketIndex, usedMask, currentSum, line: 9, title: { vi: `Bucket ${bucketIndex + 1} đã đủ ${target}`, en: `Bucket ${bucketIndex + 1} reached ${target}` }, note: { vi: "Chuyển sang bucket kế tiếp với sum = 0.", en: "Move to the next bucket with sum = 0." }, status: "success" });
      return dfs(bucketIndex + 1, 0, usedMask);
    }
    const key = `${usedMask}|${currentSum}`;
    if (memo.has(key)) {
      snapshot({ phase: "memo", bucketIndex, usedMask, currentSum, line: 10, title: { vi: "State đã biết là ngõ cụt", en: "This state is a known dead end" }, note: { vi: "Bỏ qua toàn bộ nhánh nhờ memo.", en: "Memoization skips the entire branch." }, status: "danger" });
      return false;
    }
    let previous = -1;
    for (let index = 0; index < nums.length; index++) {
      if (usedMask & (1 << index) || nums[index] === previous) continue;
      if (currentSum + nums[index] > target) {
        snapshot({ phase: "try", bucketIndex, usedMask, activeIndex: index, currentSum, line: 13, title: { vi: `Thử ${nums[index]} nhưng vượt target`, en: `Try ${nums[index]}, but it exceeds target` }, note: { vi: `${currentSum} + ${nums[index]} > ${target}.`, en: `${currentSum} + ${nums[index]} > ${target}.` }, status: "danger" });
        continue;
      }
      buckets[bucketIndex].push(sorted[index]);
      const nextMask = usedMask | (1 << index);
      snapshot({ phase: "choose", bucketIndex, usedMask: nextMask, activeIndex: index, currentSum: currentSum + nums[index], line: 14, title: { vi: `Đặt ${nums[index]} vào bucket ${bucketIndex + 1}`, en: `Place ${nums[index]} into bucket ${bucketIndex + 1}` }, note: { vi: "Bật bit của phần tử rồi tiếp tục lấp bucket.", en: "Set the element's bit and continue filling the bucket." }, status: "success" });
      if (dfs(bucketIndex, currentSum + nums[index], nextMask)) return true;
      buckets[bucketIndex].pop();
      snapshot({ phase: "backtrack", bucketIndex, usedMask, activeIndex: index, currentSum, line: 16, title: { vi: `Quay lui: lấy ${nums[index]} ra`, en: `Backtrack: remove ${nums[index]}` }, note: { vi: "Nhánh này không hoàn tất được các bucket còn lại.", en: "This branch cannot complete the remaining buckets." }, status: "danger" });
      previous = nums[index];
      if (currentSum === 0) break;
    }
    memo.add(key);
    memoTrail.push({ bucket: bucketIndex, mask: usedMask, sum: currentSum, bits: usedMask.toString(2).padStart(nums.length, "0") });
    return false;
  };

  snapshot({ phase: "start", line: 3, title: { vi: `target = ${total} / ${k} = ${target}`, en: `target = ${total} / ${k} = ${target}` }, note: { vi: "Sort giảm dần để nhánh sai bị phát hiện sớm.", en: "Sort descending so bad branches fail early." } });
  const answer = dfs(0, 0, 0);
  if (answer && solutionBuckets) {
    for (let index = 0; index < k; index++) buckets[index] = solutionBuckets[index].map((value) => ({ value, originalIndex: -1 }));
  }
  snapshot({ phase: "done", bucketIndex: Math.max(0, k - 1), usedMask: answer ? fullMask : 0, currentSum: answer ? target : 0, line: 18, title: { vi: answer ? "Chia được thành k subset bằng nhau" : "Không có cách chia hợp lệ", en: answer ? "Partitioned into k equal subsets" : "No valid partition exists" }, note: answer ? { vi: `Mỗi bucket có tổng ${target}.`, en: `Every bucket sums to ${target}.` } : { vi: "Mọi nhánh đều bế tắc.", en: "Every branch dead-ends." }, final: true, answer, status: answer ? "success" : "danger" });
  return { original: rawNums, answer, steps };
}

function parsePeople1125(value) {
  const groups = String(value ?? "").split(";").map((group) => group.trim()).filter(Boolean);
  if (!groups.length) throw new Error("people must use semicolons between people and commas between skills.");
  return groups.map((group) => group.split(",").map((skill) => skill.trim()).filter(Boolean));
}

function buildSteps1125(input, params = {}) {
  const reqSkills = parseWordArray(input, "req_skills");
  const people = parsePeople1125(params.people);
  if (reqSkills.length > 10 || people.length > 12) throw new Error("Use at most 10 skills and 12 people for this visualization.");
  const skillIndex = new Map(reqSkills.map((skill, index) => [skill, index]));
  const peopleMasks = people.map((skills) => skills.reduce((mask, skill) => skillIndex.has(skill) ? mask | (1 << skillIndex.get(skill)) : mask, 0));
  const fullMask = (1 << reqSkills.length) - 1;
  const dp = new Map([[0, []]]);
  const steps = [];
  const stages = [
    { vi: "1. Mã hóa skill", en: "1. Encode skills" },
    { vi: "2. Chọn người", en: "2. Pick a person" },
    { vi: "3. OR mask", en: "3. OR masks" },
    { vi: "4. Giữ team nhỏ", en: "4. Keep smaller team" },
    { vi: "5. Kết quả", en: "5. Result" },
  ];
  const rule = {
    vi: "dp[mask] lưu team nhỏ nhất phủ đúng các skill trong mask. OR thêm skill của một người.",
    en: "dp[mask] stores the smallest team covering mask. OR in one person's skills.",
  };

  const snapshot = ({ phase, personIndex = -1, fromMask = 0, newMask = 0, team = [], updated = false, line, title, note, final = false }) => {
    const peopleItems = people.map((skills, index) => ({
      label: `P${index}`,
      value: skills.length,
      sub: skills.join(", ") || "no required skill",
      badge: peopleMasks[index].toString(2).padStart(reqSkills.length, "0"),
      state: index === personIndex ? "active" : team.includes(index) ? "success" : peopleMasks[index] === 0 ? "muted" : "",
    }));
    const dpItems = [...dp.entries()].sort((left, right) => left[0] - right[0]).slice(-14).map(([mask, members]) => ({
      label: mask.toString(2).padStart(reqSkills.length, "0"),
      mask,
      value: members.length,
      sub: members.length ? members.map((index) => `P${index}`).join(" + ") : "empty team",
      state: mask === newMask && updated ? "active" : mask === fullMask ? "success" : "",
    }));
    addAdvancedStep(steps, {
      problemId: 1125, mode: "team", phase, stages,
      stageIndex: phase === "encode" ? 0 : phase === "person" ? 1 : phase === "update" ? 3 : 4,
      rule, title, note, final, codeLines: [line],
      vars: [{ name: "person", value: personIndex }, { name: "from mask", value: fromMask.toString(2).padStart(reqSkills.length, "0") }, { name: "new mask", value: newMask.toString(2).padStart(reqSkills.length, "0") }, { name: "dp states", value: dp.size }],
      lanes: [
        { title: { vi: "REQUIRED SKILLS", en: "REQUIRED SKILLS" }, hint: { vi: "mỗi skill là một bit", en: "one bit per skill" }, items: reqSkills.map((skill, index) => ({ label: skill, value: index, sub: `bit ${index}`, state: newMask & (1 << index) ? "success" : "" })) },
        { title: { vi: "PEOPLE", en: "PEOPLE" }, hint: { vi: "badge = skill mask", en: "badge = skill mask" }, items: peopleItems },
      ],
      masks: personIndex < 0 ? [{ title: "FULL SKILLS", value: fullMask, bits: reqSkills.map((skill) => ({ label: skill, on: true })), tone: final ? "success" : "source" }] : [
        { title: { vi: "ĐÃ PHỦ", en: "COVERED" }, value: fromMask, bits: reqSkills.map((skill, index) => ({ label: skill, on: Boolean(fromMask & (1 << index)) })), tone: "source" },
        { title: `P${personIndex}`, value: peopleMasks[personIndex], bits: reqSkills.map((skill, index) => ({ label: skill, on: Boolean(peopleMasks[personIndex] & (1 << index)) })), tone: "active" },
        { title: { vi: "SAU OR", en: "AFTER OR" }, value: newMask, bits: reqSkills.map((skill, index) => ({ label: skill, on: Boolean(newMask & (1 << index)) })), tone: updated ? "success" : "muted" },
      ],
      operation: personIndex < 0 ? null : {
        eyebrow: { vi: "THÊM NGƯỜI VÀO TEAM", en: "ADD PERSON TO TEAM" },
        formula: `${fromMask.toString(2).padStart(reqSkills.length, "0")} | ${peopleMasks[personIndex].toString(2).padStart(reqSkills.length, "0")} = ${newMask.toString(2).padStart(reqSkills.length, "0")}`,
        detail: updated ? { vi: `Team mới [${team.map((index) => `P${index}`).join(", ")}] nhỏ hơn team cũ của mask này.`, en: `New team [${team.map((index) => `P${index}`).join(", ")}] is smaller for this mask.` } : { vi: "State này đã có team bằng hoặc nhỏ hơn, nên không cập nhật.", en: "This state already has an equal or smaller team, so skip the update." },
        status: updated ? "success" : "muted",
      },
      states: { title: { vi: "DP: TEAM NHỎ NHẤT CHO MỖI MASK", en: "DP: SMALLEST TEAM PER MASK" }, hint: { vi: `${dp.size} state`, en: `${dp.size} states` }, items: dpItems },
      result: final ? { label: { vi: "SMALLEST TEAM", en: "SMALLEST TEAM" }, value: `[${(dp.get(fullMask) || []).join(", ")}]`, detail: `${(dp.get(fullMask) || []).length} people`, status: dp.has(fullMask) ? "success" : "danger" } : null,
    });
  };

  for (let personIndex = 0; personIndex < people.length; personIndex++) {
    snapshot({ phase: "encode", personIndex, fromMask: 0, newMask: peopleMasks[personIndex], line: 5, title: { vi: `P${personIndex} → skill mask`, en: `P${personIndex} → skill mask` }, note: { vi: `P${personIndex} có các skill: ${people[personIndex].join(", ") || "không có skill cần thiết"}.`, en: `P${personIndex} has: ${people[personIndex].join(", ") || "no required skills"}.` } });
  }
  for (let personIndex = 0; personIndex < people.length; personIndex++) {
    const personMask = peopleMasks[personIndex];
    if (personMask === 0) continue;
    const entries = [...dp.entries()];
    snapshot({ phase: "person", personIndex, fromMask: 0, newMask: personMask, line: 9, title: { vi: `Xét P${personIndex}`, en: `Process P${personIndex}` }, note: { vi: "Thử thêm người này vào từng team hiện có.", en: "Try adding this person to every existing team." } });
    for (const [mask, members] of entries) {
      const newMask = mask | personMask;
      const candidate = [...members, personIndex];
      const current = dp.get(newMask);
      const updated = !current || candidate.length < current.length;
      if (updated) dp.set(newMask, candidate);
      snapshot({ phase: "update", personIndex, fromMask: mask, newMask, team: candidate, updated, line: 12, title: { vi: updated ? `Cập nhật mask ${newMask.toString(2)}` : `Không cần cập nhật mask ${newMask.toString(2)}`, en: updated ? `Update mask ${newMask.toString(2)}` : `Keep existing mask ${newMask.toString(2)}` }, note: updated ? { vi: "Đây là team đầu tiên hoặc nhỏ hơn cho mask mới.", en: "This is the first or a smaller team for the new mask." } : { vi: "Team hiện có đã tốt hơn.", en: "The existing team is already better." } });
    }
  }
  const answer = dp.get(fullMask) || [];
  snapshot({ phase: "done", fromMask: fullMask, newMask: fullMask, team: answer, updated: true, line: 14, title: { vi: `Team nhỏ nhất: [${answer.join(", ")}]`, en: `Smallest team: [${answer.join(", ")}]` }, note: { vi: `Full mask được phủ bằng ${answer.length} người.`, en: `The full mask is covered by ${answer.length} people.` }, final: true });
  return { original: reqSkills, answer, steps };
}

function buildSteps1799(input) {
  const nums = parseIntegerArray(input, "nums");
  if (nums.length < 2 || nums.length > 8 || nums.length % 2 !== 0 || nums.some((value) => value <= 0)) {
    throw new Error("Use an even-length array of 2 to 8 positive integers.");
  }
  const n = nums.length;
  const fullMask = (1 << n) - 1;
  const steps = [];
  const memo = new Map();
  const choice = new Map();
  const TRACE_LIMIT = 320;
  let traceTruncated = false;
  const stages = [
    { vi: "1. Đọc used mask", en: "1. Read used mask" },
    { vi: "2. Chọn một cặp", en: "2. Choose a pair" },
    { vi: "3. Tính điểm lượt", en: "3. Score the operation" },
    { vi: "4. Lưu memo", en: "4. Memoize state" },
    { vi: "5. Cặp tối ưu", en: "5. Optimal pairs" },
  ];
  const rule = {
    vi: "used mask đánh dấu số đã ghép. Ở lượt op, chọn hai số chưa dùng để nhận op × gcd(a, b) điểm.",
    en: "The used mask marks paired numbers. At operation op, choose two unused numbers to gain op × gcd(a, b).",
  };

  const snapshot = ({ phase, usedMask = 0, pair = [], op = 1, pairGcd = null, childScore = null, candidate = null, best = null, updated = false, line, title, note, final = false, optimalPairs = [] }) => {
    if (!final && steps.length >= TRACE_LIMIT) { traceTruncated = true; return; }
    const pairSet = new Set(pair);
    const numberItems = nums.map((value, index) => ({
      label: `index ${index}`,
      value,
      sub: usedMask & (1 << index) ? "paired" : "available",
      badge: `bit ${index}`,
      state: pairSet.has(index) ? "active" : usedMask & (1 << index) ? "muted" : "",
    }));
    const nextMask = pair.length === 2 ? usedMask | (1 << pair[0]) | (1 << pair[1]) : usedMask;
    const memoItems = [...memo.entries()].slice(-14).map(([mask, score]) => ({
      label: mask.toString(2).padStart(n, "0"),
      mask,
      value: score,
      sub: `${popcount(mask) / 2} pair(s) used`,
      state: mask === usedMask ? "active" : "",
    }));
    const pairItems = optimalPairs.map((item) => ({
      label: `op ${item.op}`,
      value: `${item.leftValue}, ${item.rightValue}`,
      sub: `${item.op} × gcd(${item.leftValue}, ${item.rightValue}) = ${item.score}`,
      badge: `+${item.score}`,
      state: "success",
    }));
    addAdvancedStep(steps, {
      problemId: 1799, mode: "gcd-pairs", phase, stages,
      stageIndex: phase === "start" ? 0 : phase === "choose" ? 1 : phase === "score" ? 2 : phase === "memo" ? 3 : 4,
      rule, title, note, final, codeLines: [line], traceTruncated,
      vars: [
        { name: "op", value: op },
        { name: "used mask", value: usedMask.toString(2).padStart(n, "0") },
        { name: "gcd", value: pairGcd ?? "-" },
        { name: "best", value: best ?? 0 },
      ],
      lanes: [
        { title: { vi: "CÁC SỐ", en: "NUMBERS" }, hint: { vi: "mờ = đã ghép", en: "dimmed = already paired" }, items: numberItems },
        ...(pairItems.length ? [{ title: { vi: "CÁC CẶP TỐI ƯU", en: "OPTIMAL PAIRS" }, hint: { vi: "thứ tự op làm thay đổi điểm", en: "operation order changes the score" }, items: pairItems }] : []),
      ],
      masks: [
        { title: { vi: "ĐÃ DÙNG", en: "USED BEFORE" }, value: usedMask, bits: nums.map((value, index) => ({ label: `${index}:${value}`, on: Boolean(usedMask & (1 << index)), state: pairSet.has(index) ? "active" : "" })), tone: "source" },
        ...(pair.length === 2 ? [{ title: { vi: "SAU KHI CHỌN CẶP", en: "AFTER CHOOSING PAIR" }, value: nextMask, bits: nums.map((value, index) => ({ label: `${index}:${value}`, on: Boolean(nextMask & (1 << index)), state: pairSet.has(index) ? "active" : "" })), tone: updated ? "success" : "active" }] : []),
      ],
      operation: pair.length === 2 ? {
        eyebrow: { vi: `ĐIỂM Ở OP ${op}`, en: `SCORE AT OP ${op}` },
        formula: `${op} × gcd(${nums[pair[0]]}, ${nums[pair[1]]}) + ${childScore} = ${candidate}`,
        detail: updated
          ? { vi: `Ứng viên ${candidate} lớn hơn best cũ, nên giữ cặp này.`, en: `Candidate ${candidate} beats the old best, so keep this pair.` }
          : { vi: `Ứng viên ${candidate} không vượt best ${best}.`, en: `Candidate ${candidate} does not beat best ${best}.` },
        status: updated ? "success" : "muted",
      } : null,
      states: { title: { vi: "MEMO: ĐIỂM TỐT NHẤT TỪ MASK", en: "MEMO: BEST SCORE FROM MASK" }, hint: { vi: `${memo.size} state`, en: `${memo.size} states` }, items: memoItems },
      result: final ? { label: { vi: "ĐIỂM LỚN NHẤT", en: "MAXIMUM SCORE" }, value: best, detail: optimalPairs.map((item) => `+${item.score}`).join(" "), status: "success" } : null,
    });
  };

  const dfs = (usedMask) => {
    if (usedMask === fullMask) return 0;
    if (memo.has(usedMask)) return memo.get(usedMask);
    const op = popcount(usedMask) / 2 + 1;
    let best = 0;
    let bestPair = null;
    for (let first = 0; first < n; first++) {
      if (usedMask & (1 << first)) continue;
      for (let second = first + 1; second < n; second++) {
        if (usedMask & (1 << second)) continue;
        snapshot({ phase: "choose", usedMask, pair: [first, second], op, pairGcd: gcd(nums[first], nums[second]), childScore: "?", candidate: "?", best, updated: false, line: 9, title: { vi: `Op ${op}: thử cặp (${nums[first]}, ${nums[second]})`, en: `Op ${op}: try pair (${nums[first]}, ${nums[second]})` }, note: { vi: "Hai bit đều đang tắt nên cả hai số còn dùng được.", en: "Both bits are off, so both numbers are available." } });
        const nextMask = usedMask | (1 << first) | (1 << second);
        const pairGcd = gcd(nums[first], nums[second]);
        const childScore = dfs(nextMask);
        const candidate = op * pairGcd + childScore;
        const updated = candidate > best;
        if (updated) {
          best = candidate;
          bestPair = [first, second];
        }
        snapshot({ phase: "score", usedMask, pair: [first, second], op, pairGcd, childScore, candidate, best, updated, line: 14, title: { vi: `Điểm ứng viên = ${candidate}`, en: `Candidate score = ${candidate}` }, note: { vi: `Điểm cặp hiện tại là ${op} × ${pairGcd}; phần còn lại tốt nhất là ${childScore}.`, en: `The current pair scores ${op} × ${pairGcd}; the best remainder is ${childScore}.` } });
      }
    }
    memo.set(usedMask, best);
    choice.set(usedMask, bestPair);
    snapshot({ phase: "memo", usedMask, op, best, line: 15, title: { vi: `Memo[${usedMask.toString(2).padStart(n, "0")}] = ${best}`, en: `Memo[${usedMask.toString(2).padStart(n, "0")}] = ${best}` }, note: { vi: "Lần sau gặp lại used mask này, trả kết quả ngay.", en: "If this used mask appears again, return the stored result immediately." } });
    return best;
  };

  snapshot({ phase: "start", usedMask: 0, op: 1, best: 0, line: 4, title: { vi: "Chưa ghép số nào", en: "No numbers are paired yet" }, note: { vi: "used mask = 0; bắt đầu operation 1.", en: "used mask = 0; start operation 1." } });
  const answer = dfs(0);
  const optimalPairs = [];
  let mask = 0;
  while (mask !== fullMask) {
    const pair = choice.get(mask);
    if (!pair) break;
    const op = optimalPairs.length + 1;
    const pairGcd = gcd(nums[pair[0]], nums[pair[1]]);
    optimalPairs.push({ op, leftValue: nums[pair[0]], rightValue: nums[pair[1]], score: op * pairGcd });
    mask |= (1 << pair[0]) | (1 << pair[1]);
  }
  snapshot({ phase: "done", usedMask: fullMask, op: n / 2, best: answer, line: 17, title: { vi: `Điểm lớn nhất = ${answer}`, en: `Maximum score = ${answer}` }, note: { vi: "Đi theo choice đã lưu trong mỗi memo state để dựng lại các cặp tối ưu.", en: "Follow the saved choice in each memo state to reconstruct the optimal pairs." }, final: true, optimalPairs });
  return { original: nums, answer, steps };
}

function buildSteps1879(input, params = {}) {
  const nums1 = parseIntegerArray(input, "nums1");
  const nums2 = parseIntegerArray(params.nums2, "nums2");
  if (nums1.length !== nums2.length || nums1.length < 1 || nums1.length > 8 || [...nums1, ...nums2].some((value) => value < 0)) {
    throw new Error("Use two equal-length arrays of 1 to 8 non-negative integers.");
  }
  const n = nums1.length;
  const fullMask = (1 << n) - 1;
  const dp = Array(1 << n).fill(Infinity);
  const parent = Array(1 << n).fill(null);
  dp[0] = 0;
  const steps = [];
  const TRACE_LIMIT = 320;
  let traceTruncated = false;
  const stages = [
    { vi: "1. Đọc mask", en: "1. Read mask" },
    { vi: "2. Chọn nums2[j]", en: "2. Pick nums2[j]" },
    { vi: "3. Tính XOR", en: "3. Compute XOR" },
    { vi: "4. Cập nhật DP", en: "4. Update DP" },
    { vi: "5. Ghép tối ưu", en: "5. Optimal matching" },
  ];
  const rule = {
    vi: "Có popcount(mask) phần tử đầu của nums1 đã ghép. Bit j bật nghĩa là nums2[j] đã được dùng.",
    en: "The first popcount(mask) values of nums1 are assigned. Set bit j means nums2[j] is already used.",
  };

  const snapshot = ({ phase, mask = 0, index1 = 0, index2 = -1, nextMask = mask, xorCost = null, candidate = null, updated = false, line, title, note, final = false, pairs = [] }) => {
    if (!final && steps.length >= TRACE_LIMIT) { traceTruncated = true; return; }
    const nums1Items = nums1.map((value, index) => ({
      label: `nums1[${index}]`, value, sub: index < index1 ? "assigned" : index === index1 && !final ? "current" : "waiting",
      state: index === index1 && !final ? "active" : index < index1 || final ? "success" : "",
    }));
    const nums2Items = nums2.map((value, index) => ({
      label: `nums2[${index}]`, value, sub: mask & (1 << index) ? "used" : index === index2 ? "candidate" : "available",
      badge: `bit ${index}`,
      state: index === index2 ? "active" : mask & (1 << index) || final ? "success" : "",
    }));
    const finiteStates = dp.map((value, stateMask) => ({ value, stateMask })).filter((item) => Number.isFinite(item.value));
    const stateItems = finiteStates.slice(-16).map((item) => ({
      label: item.stateMask.toString(2).padStart(n, "0"),
      mask: item.stateMask,
      value: item.value,
      sub: `${popcount(item.stateMask)} assignment(s)`,
      state: item.stateMask === nextMask && updated ? "active" : item.stateMask === fullMask ? "success" : "",
    }));
    const pairItems = pairs.map((pair) => ({
      label: `i=${pair.index1}, j=${pair.index2}`,
      value: `${pair.left} ⊕ ${pair.right}`,
      sub: `cost ${pair.cost}`,
      badge: `+${pair.cost}`,
      state: "success",
    }));
    addAdvancedStep(steps, {
      problemId: 1879, mode: "xor-assignment", phase, stages,
      stageIndex: phase === "start" ? 0 : phase === "pick" ? 1 : phase === "xor" ? 2 : phase === "update" ? 3 : 4,
      rule, title, note, final, codeLines: [line], traceTruncated,
      vars: [
        { name: "i", value: index1 },
        { name: "used nums2", value: mask.toString(2).padStart(n, "0") },
        { name: "dp[mask]", value: Number.isFinite(dp[mask]) ? dp[mask] : "∞" },
        { name: "XOR cost", value: xorCost ?? "-" },
      ],
      lanes: [
        { title: "NUMS1", hint: { vi: "xử lý từ trái sang phải", en: "process left to right" }, items: nums1Items },
        { title: "NUMS2", hint: { vi: "bit ngăn dùng lại một index", en: "bits prevent reusing an index" }, items: nums2Items },
        ...(pairItems.length ? [{ title: { vi: "CÁC CẶP TỐI ƯU", en: "OPTIMAL ASSIGNMENTS" }, hint: { vi: "tổng các cost là đáp án", en: "costs sum to the answer" }, items: pairItems }] : []),
      ],
      masks: [
        { title: { vi: "NUMS2 ĐÃ DÙNG", en: "USED NUMS2 BEFORE" }, value: mask, bits: nums2.map((value, index) => ({ label: `${index}:${value}`, on: Boolean(mask & (1 << index)), state: index === index2 ? "active" : "" })), tone: "source" },
        ...(index2 >= 0 ? [{ title: { vi: "SAU KHI BẬT BIT j", en: "AFTER SETTING BIT j" }, value: nextMask, bits: nums2.map((value, index) => ({ label: `${index}:${value}`, on: Boolean(nextMask & (1 << index)), state: index === index2 ? "active" : "" })), tone: updated ? "success" : "active" }] : []),
      ],
      operation: index2 >= 0 ? {
        eyebrow: { vi: `GHÉP NUMS1[${index1}] VỚI NUMS2[${index2}]`, en: `PAIR NUMS1[${index1}] WITH NUMS2[${index2}]` },
        formula: `${dp[mask]} + (${nums1[index1]} ^ ${nums2[index2]} = ${xorCost}) = ${candidate}`,
        detail: updated
          ? { vi: `Chi phí ${candidate} nhỏ hơn dp của mask mới, nên cập nhật.`, en: `Cost ${candidate} is smaller for the new mask, so update it.` }
          : { vi: `Mask mới đã có chi phí bằng hoặc thấp hơn ${candidate}.`, en: `The new mask already has an equal or lower cost than ${candidate}.` },
        status: updated ? "success" : "muted",
      } : null,
      states: { title: { vi: "DP: XOR SUM NHỎ NHẤT CHO MỖI MASK", en: "DP: MIN XOR SUM FOR EACH MASK" }, hint: { vi: `${finiteStates.length} state đã tới`, en: `${finiteStates.length} reached states` }, items: stateItems },
      result: final ? { label: { vi: "XOR SUM NHỎ NHẤT", en: "MINIMUM XOR SUM" }, value: dp[fullMask], detail: pairs.map((pair) => `+${pair.cost}`).join(" "), status: "success" } : null,
    });
  };

  snapshot({ phase: "start", mask: 0, index1: 0, line: 3, title: { vi: "Bắt đầu với mask 0", en: "Start from mask 0" }, note: { vi: "Chưa dùng phần tử nào của nums2 và tổng XOR hiện tại bằng 0.", en: "No nums2 value is used and the current XOR sum is 0." } });
  for (let mask = 0; mask <= fullMask; mask++) {
    if (!Number.isFinite(dp[mask])) continue;
    const index1 = popcount(mask);
    if (index1 === n) continue;
    for (let index2 = 0; index2 < n; index2++) {
      if (mask & (1 << index2)) continue;
      const nextMask = mask | (1 << index2);
      const xorCost = nums1[index1] ^ nums2[index2];
      snapshot({ phase: "pick", mask, index1, index2, nextMask, xorCost, candidate: dp[mask] + xorCost, updated: false, line: 8, title: { vi: `Thử nums2[${index2}] = ${nums2[index2]}`, en: `Try nums2[${index2}] = ${nums2[index2]}` }, note: { vi: `Bit ${index2} đang tắt, nên index này chưa được dùng.`, en: `Bit ${index2} is off, so this index is still available.` } });
      const candidate = dp[mask] + xorCost;
      const updated = candidate < dp[nextMask];
      if (updated) {
        dp[nextMask] = candidate;
        parent[nextMask] = { previousMask: mask, index1, index2, cost: xorCost };
      }
      snapshot({ phase: "update", mask, index1, index2, nextMask, xorCost, candidate, updated, line: 11, title: { vi: updated ? `Cập nhật dp[${nextMask.toString(2).padStart(n, "0")}] = ${candidate}` : "Giữ chi phí cũ", en: updated ? `Update dp[${nextMask.toString(2).padStart(n, "0")}] = ${candidate}` : "Keep the old cost" }, note: updated ? { vi: "Lưu cả parent để cuối cùng dựng lại các cặp.", en: "Store the parent too, so the matching can be reconstructed." } : { vi: "Đường đi này không tốt hơn.", en: "This transition is not better." } });
    }
  }
  const pairs = [];
  let mask = fullMask;
  while (mask) {
    const edge = parent[mask];
    if (!edge) break;
    pairs.push({ index1: edge.index1, index2: edge.index2, left: nums1[edge.index1], right: nums2[edge.index2], cost: edge.cost });
    mask = edge.previousMask;
  }
  pairs.reverse();
  snapshot({ phase: "done", mask: fullMask, nextMask: fullMask, index1: n, line: 13, title: { vi: `Minimum XOR sum = ${dp[fullMask]}`, en: `Minimum XOR sum = ${dp[fullMask]}` }, note: { vi: "Lần ngược parent từ full mask để thấy chính xác mỗi nums1[i] ghép với nums2[j] nào.", en: "Follow parent links backward from the full mask to see the exact matching." }, final: true, pairs });
  return { original: nums1, answer: dp[fullMask], steps };
}

module.exports = {
  318: {
    id: 318, difficulty: "medium", slug: "maximum-product-of-word-lengths", category, tags: [bitmaskTag, { key: "string", vi: "Chuỗi", en: "String" }],
    title: { vi: "Maximum Product of Word Lengths", en: "Maximum Product of Word Lengths" }, titleVi: { vi: "Tích lớn nhất của độ dài hai từ", en: "Maximum product of word lengths" },
    statement: { vi: "Chọn hai từ không có chữ cái chung sao cho tích độ dài của chúng lớn nhất.", en: "Choose two words sharing no letters with the maximum product of their lengths." },
    defaultInput: "abcw,baz,foo,bar,xtfn,abcdef", inputKind: "string", inputLabel: { vi: "words (cách nhau bằng dấu phẩy)", en: "words (comma-separated)" }, extraParams: [],
    approach: [{ vi: "Mã hóa tập chữ cái của mỗi từ bằng 26 bit.", en: "Encode each word's letters with 26 bits." }, { vi: "Nếu mask[i] & mask[j] = 0, hai từ không có chữ chung.", en: "If mask[i] & mask[j] = 0, the words share no letter." }],
    complexity: { time: "O(total chars + n²)", space: "O(n)", note: { vi: "Mỗi cặp từ chỉ cần một phép AND.", en: "Each pair needs only one AND operation." } },
    code: ["class Solution:", "    def maxProduct(self, words):", "        masks = []", "        for word in words:", "            mask = 0", "            for ch in word:", "                mask |= 1 << (ord(ch) - ord('a'))", "            masks.append(mask)", "        answer = 0", "        for i in range(len(words)):", "            for j in range(i + 1, len(words)):", "                if masks[i] & masks[j] == 0:", "                    answer = max(answer, len(words[i]) * len(words[j]))", "        return answer"],
    liveArgs: (input) => [parseWordArray(input)], builder: buildSteps318,
  },
  526: {
    id: 526, difficulty: "medium", slug: "beautiful-arrangement", category, tags: [bitmaskTag, { key: "backtracking", vi: "Quay lui", en: "Backtracking" }],
    title: { vi: "Beautiful Arrangement", en: "Beautiful Arrangement" }, titleVi: { vi: "Hoán vị đẹp", en: "Beautiful arrangement" },
    statement: { vi: "Đếm hoán vị 1..n mà tại mỗi vị trí, position chia hết cho num hoặc num chia hết cho position.", en: "Count permutations of 1..n where position divides num or num divides position at every position." },
    defaultInput: [4], inputKind: "positive", inputLabel: { vi: "n", en: "n" }, singleInput: true, maxInput: 8, extraParams: [],
    approach: [{ vi: "Điền từng vị trí bằng backtracking.", en: "Fill one position at a time with backtracking." }, { vi: "used mask đánh dấu các số đã xuất hiện trong hoán vị.", en: "A used mask marks numbers already placed." }],
    complexity: { time: "O(n!)", space: "O(n)", note: { vi: "Điều kiện chia hết cắt bỏ nhiều nhánh.", en: "The divisibility rule prunes many branches." } },
    code: ["class Solution:", "    def countArrangement(self, n):", "        def backtrack(position, used):", "            if position > n:", "                return 1", "            total = 0", "            for num in range(1, n + 1):", "                bit = 1 << (num - 1)", "                if not used & bit and (position % num == 0 or num % position == 0):", "                    total += backtrack(position + 1, used | bit)", "            return total", "        return backtrack(1, 0)"],
    liveArgs: (input) => [readNumber(input, 4)], builder: buildSteps526,
  },
  698: {
    id: 698, difficulty: "medium", slug: "partition-to-k-equal-sum-subsets", category, tags: [bitmaskTag, { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" }],
    title: { vi: "Partition to K Equal Sum Subsets", en: "Partition to K Equal Sum Subsets" }, titleVi: { vi: "Chia thành k tập con có tổng bằng nhau", en: "Partition into k equal-sum subsets" },
    statement: { vi: "Kiểm tra nums có thể chia thành k tập con không rỗng có cùng tổng hay không.", en: "Decide whether nums can be partitioned into k non-empty subsets with equal sums." },
    defaultInput: [4, 3, 2, 3, 5, 2, 1], inputKind: "positive", inputLabel: { vi: "nums", en: "nums" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 4 }],
    approach: [{ vi: "Mỗi bucket phải đạt total/k.", en: "Each bucket must reach total/k." }, { vi: "Backtracking theo used mask và memo các state không thể hoàn tất.", en: "Backtrack on the used mask and memoize dead states." }],
    complexity: { time: "O(n·2ⁿ)", space: "O(2ⁿ)", note: { vi: "Sort giảm dần giúp phát hiện nhánh sai sớm.", en: "Descending sort exposes bad branches early." } },
    code: ["class Solution:", "    def canPartitionKSubsets(self, nums, k):", "        total = sum(nums)", "        if total % k: return False", "        target = total // k", "        nums.sort(reverse=True)", "        dead = set()", "        def dfs(used, bucket_sum, buckets_done):", "            if buckets_done == k - 1: return True", "            if bucket_sum == target:", "                return dfs(used, 0, buckets_done + 1)", "            if (used, bucket_sum) in dead: return False", "            for i, num in enumerate(nums):", "                if not used >> i & 1 and bucket_sum + num <= target:", "                    if dfs(used | 1 << i, bucket_sum + num, buckets_done): return True", "            dead.add((used, bucket_sum))", "            return False", "        return dfs(0, 0, 0)"],
    liveArgs: (input, params = {}) => [parseIntegerArray(input, "nums"), Number(params.k)], builder: buildSteps698,
  },
  1125: {
    id: 1125, difficulty: "hard", slug: "smallest-sufficient-team", category, tags: [bitmaskTag, { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" }],
    title: { vi: "Smallest Sufficient Team", en: "Smallest Sufficient Team" }, titleVi: { vi: "Nhóm nhỏ nhất đủ kỹ năng", en: "Smallest sufficient team" },
    statement: { vi: "Chọn ít người nhất để phủ toàn bộ required skills.", en: "Choose the fewest people whose skills cover every required skill." },
    defaultInput: "java,nodejs,reactjs", inputKind: "string", inputLabel: { vi: "required skills", en: "required skills" },
    extraParams: [{ key: "people", type: "string", label: { vi: "people (; ngăn người, , ngăn skill)", en: "people (; between people, , between skills)" }, default: "java;nodejs;nodejs,reactjs" }],
    approach: [{ vi: "Mỗi skill là một bit; mỗi người có một skill mask.", en: "Each skill is a bit; each person has a skill mask." }, { vi: "dp[mask] giữ team nhỏ nhất phủ mask đó.", en: "dp[mask] keeps the smallest team covering that mask." }],
    complexity: { time: "O(p·2ˢ)", space: "O(2ˢ)", note: { vi: "p là số người, s là số skill.", en: "p is people count and s is skill count." } },
    code: ["class Solution:", "    def smallestSufficientTeam(self, req_skills, people):", "        index = {skill: i for i, skill in enumerate(req_skills)}", "        dp = {0: []}", "        for person, skills in enumerate(people):", "            person_mask = 0", "            for skill in skills:", "                if skill in index: person_mask |= 1 << index[skill]", "            for mask, team in list(dp.items()):", "                new_mask = mask | person_mask", "                candidate = team + [person]", "                if new_mask not in dp or len(candidate) < len(dp[new_mask]):", "                    dp[new_mask] = candidate", "        return dp[(1 << len(req_skills)) - 1]"],
    liveArgs: (input, params = {}) => [parseWordArray(input, "req_skills"), parsePeople1125(params.people)], builder: buildSteps1125,
  },
  1799: {
    id: 1799, difficulty: "hard", slug: "maximize-score-after-n-operations", category, tags: [bitmaskTag, { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" }],
    title: { vi: "Maximize Score After N Operations", en: "Maximize Score After N Operations" }, titleVi: { vi: "Tối đa hóa điểm sau n thao tác", en: "Maximize score after n operations" },
    statement: { vi: "Mỗi lượt chọn hai số chưa dùng và nhận op × gcd(a, b). Tìm tổng điểm lớn nhất.", en: "At each operation choose two unused numbers and gain op × gcd(a, b). Maximize the total score." },
    defaultInput: [1, 2, 3, 4, 5, 6], inputKind: "positive", inputLabel: { vi: "nums (số lượng chẵn)", en: "nums (even length)" }, extraParams: [],
    approach: [{ vi: "used mask xác định các số đã ghép và suy ra số thứ tự operation.", en: "The used mask identifies paired values and determines the operation number." }, { vi: "Thử các cặp còn lại và memo điểm tốt nhất của từng mask.", en: "Try remaining pairs and memoize the best score for each mask." }],
    complexity: { time: "O(n²·2ⁿ)", space: "O(2ⁿ)", note: { vi: "Mỗi mask thử các cặp số chưa dùng.", en: "Each mask tries pairs of unused values." } },
    code: ["from math import gcd", "class Solution:", "    def maxScore(self, nums):", "        memo = {}", "        def dfs(used):", "            if used in memo: return memo[used]", "            op = used.bit_count() // 2 + 1", "            best = 0", "            for i in range(len(nums)):", "                if used >> i & 1: continue", "                for j in range(i + 1, len(nums)):", "                    if used >> j & 1: continue", "                    next_mask = used | 1 << i | 1 << j", "                    best = max(best, op * gcd(nums[i], nums[j]) + dfs(next_mask))", "            memo[used] = best", "            return best", "        return dfs(0)"],
    liveArgs: (input) => [parseIntegerArray(input, "nums")], builder: buildSteps1799,
  },
  1879: {
    id: 1879, difficulty: "hard", slug: "minimum-xor-sum-of-two-arrays", category, tags: [bitmaskTag, { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" }],
    title: { vi: "Minimum XOR Sum of Two Arrays", en: "Minimum XOR Sum of Two Arrays" }, titleVi: { vi: "Tổng XOR nhỏ nhất của hai mảng", en: "Minimum XOR sum of two arrays" },
    statement: { vi: "Hoán vị nums2 để tổng nums1[i] XOR nums2[i] nhỏ nhất.", en: "Permute nums2 to minimize the sum of nums1[i] XOR nums2[i]." },
    defaultInput: [1, 2, 3], inputKind: "nonneg", inputLabel: { vi: "nums1", en: "nums1" },
    extraParams: [{ key: "nums2", type: "string", label: { vi: "nums2", en: "nums2" }, default: "3,2,1" }],
    approach: [{ vi: "popcount(mask) cho biết index tiếp theo của nums1.", en: "popcount(mask) gives the next nums1 index." }, { vi: "Thử ghép với từng nums2[j] chưa dùng và cập nhật dp[newMask].", en: "Pair it with each unused nums2[j] and update dp[newMask]." }],
    complexity: { time: "O(n·2ⁿ)", space: "O(2ⁿ)", note: { vi: "Mỗi mask thử tối đa n phần tử nums2.", en: "Each mask tries at most n nums2 values." } },
    code: ["class Solution:", "    def minimumXORSum(self, nums1, nums2):", "        n = len(nums1)", "        dp = [float('inf')] * (1 << n)", "        dp[0] = 0", "        for mask in range(1 << n):", "            i = mask.bit_count()", "            if i == n: continue", "            for j in range(n):", "                if not mask >> j & 1:", "                    new_mask = mask | 1 << j", "                    cost = nums1[i] ^ nums2[j]", "                    dp[new_mask] = min(dp[new_mask], dp[mask] + cost)", "        return dp[-1]"],
    liveArgs: (input, params = {}) => [parseIntegerArray(input, "nums1"), parseIntegerArray(params.nums2, "nums2")], builder: buildSteps1879,
  },
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
