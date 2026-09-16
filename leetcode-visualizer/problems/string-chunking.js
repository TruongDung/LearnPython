function validate2138Input(input, params = {}) {
  const s = String(input ?? "");
  const k = Number(params.k);
  const fill = String(params.fill ?? "");

  if (!/^[a-z]+$/.test(s) || s.length > 24) {
    throw new Error("s must contain 1 to 24 lowercase English letters for visualization.");
  }
  if (!Number.isInteger(k) || k < 1 || k > 12) {
    throw new Error("k must be an integer between 1 and 12 for visualization.");
  }
  if (!/^[a-z]$/.test(fill)) {
    throw new Error("fill must be exactly one lowercase English letter.");
  }
  return { s, k, fill };
}

function buildSteps2138(input, params = {}) {
  const { s, k, fill } = validate2138Input(input, params);
  const groups = [];
  const steps = [];
  const totalGroups = Math.ceil(s.length / k);

  function snapshot({
    operation,
    line,
    title,
    note,
    start = -1,
    rawGroup = "",
    currentGroup = "",
    missing = 0,
    processedUntil = 0,
    final = false,
  }) {
    const end = start < 0 ? -1 : Math.min(start + k, s.length);
    steps.push({
      title,
      note,
      codeLines: [line],
      final,
      vars: [
        { name: "k", value: k },
        { name: "fill", value: `'${fill}'` },
        ...(start >= 0 ? [{ name: "start", value: start }, { name: "group", value: `'${currentGroup || rawGroup}'` }] : []),
        ...(missing > 0 ? [{ name: "missing", value: missing }] : []),
      ],
      divideString2138View: {
        s,
        k,
        fill,
        operation,
        start,
        end,
        rawGroup,
        currentGroup,
        missing,
        processedUntil,
        groups: [...groups],
        groupIndex: start < 0 ? groups.length : Math.floor(start / k),
        totalGroups,
        answer: final ? [...groups] : null,
        final,
      },
    });
  }

  snapshot({
    operation: "init",
    line: 3,
    title: { vi: "Khởi tạo danh sách kết quả", en: "Initialize the result list" },
    note: {
      vi: "Mỗi nhóm hoàn chỉnh sẽ được thêm vào groups theo thứ tự từ trái sang phải.",
      en: "Each completed group will be appended from left to right.",
    },
  });

  for (let start = 0; start < s.length; start += k) {
    const end = Math.min(start + k, s.length);
    const rawGroup = s.slice(start, start + k);
    const missing = k - rawGroup.length;

    snapshot({
      operation: "window",
      line: 4,
      start,
      processedUntil: start,
      title: { vi: `Mở cửa sổ nhóm ${groups.length + 1}`, en: `Open window for group ${groups.length + 1}` },
      note: {
        vi: `Cửa sổ bắt đầu tại ${start} và lấy tối đa ${k} ký tự.`,
        en: `The window starts at ${start} and takes at most ${k} characters.`,
      },
    });

    snapshot({
      operation: "slice",
      line: 5,
      start,
      rawGroup,
      currentGroup: rawGroup,
      processedUntil: start,
      title: { vi: `Cắt s[${start}:${start + k}] → '${rawGroup}'`, en: `Slice s[${start}:${start + k}] → '${rawGroup}'` },
      note: {
        vi: `Đã đọc các vị trí ${start}..${Math.max(start, end - 1)} từ chuỗi gốc.`,
        en: `Read positions ${start}..${Math.max(start, end - 1)} from the original string.`,
      },
    });

    snapshot({
      operation: "check",
      line: 6,
      start,
      rawGroup,
      currentGroup: rawGroup,
      missing,
      processedUntil: start,
      title: missing > 0
        ? { vi: `Nhóm cuối thiếu ${missing} ký tự`, en: `The final group is missing ${missing} character${missing === 1 ? "" : "s"}` }
        : { vi: `Nhóm đã đủ ${k} ký tự`, en: `The group already has ${k} characters` },
      note: missing > 0
        ? { vi: `len(group) = ${rawGroup.length} < k = ${k}, nên cần padding.`, en: `len(group) = ${rawGroup.length} < k = ${k}, so padding is required.` }
        : { vi: `len(group) = k = ${k}; bỏ qua dòng padding.`, en: `len(group) = k = ${k}; skip the padding line.` },
    });

    let completedGroup = rawGroup;
    if (missing > 0) {
      completedGroup += fill.repeat(missing);
      snapshot({
        operation: "pad",
        line: 7,
        start,
        rawGroup,
        currentGroup: completedGroup,
        missing,
        processedUntil: start,
        title: { vi: `Thêm '${fill}' × ${missing} → '${completedGroup}'`, en: `Append '${fill}' × ${missing} → '${completedGroup}'` },
        note: {
          vi: `Chỉ nhóm cuối được bổ sung; mọi nhóm sau bước này đều có đúng ${k} ký tự.`,
          en: `Only the final group is padded; every group now has exactly ${k} characters.`,
        },
      });
    }

    groups.push(completedGroup);
    snapshot({
      operation: "append",
      line: 8,
      start,
      rawGroup,
      currentGroup: completedGroup,
      missing,
      processedUntil: end,
      title: { vi: `Thêm '${completedGroup}' vào kết quả`, en: `Append '${completedGroup}' to the result` },
      note: {
        vi: `Đã hoàn thành ${groups.length}/${totalGroups} nhóm.`,
        en: `Completed ${groups.length}/${totalGroups} groups.`,
      },
    });
  }

  snapshot({
    operation: "return",
    line: 9,
    processedUntil: s.length,
    final: true,
    title: { vi: `Trả về ${groups.length} nhóm`, en: `Return ${groups.length} groups` },
    note: {
      vi: `Kết quả: [${groups.map((group) => `'${group}'`).join(", ")}].`,
      en: `Result: [${groups.map((group) => `'${group}'`).join(", ")}].`,
    },
  });

  return { answer: groups, steps };
}

module.exports = {
  2138: {
    id: 2138,
    difficulty: "easy",
    slug: "divide-a-string-into-groups-of-size-k",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [
      { key: "simulation", vi: "Mô phỏng", en: "Simulation" },
    ],
    title: { vi: "Divide a String Into Groups of Size k", en: "Divide a String Into Groups of Size k" },
    titleVi: { vi: "Chia chuỗi thành các nhóm kích thước k", en: "Divide a string into groups of size k" },
    statement: {
      vi: "Chia chuỗi s thành các nhóm liên tiếp gồm k ký tự. Nếu nhóm cuối thiếu ký tự, thêm ký tự fill cho đủ k. Trả về tất cả các nhóm theo thứ tự.",
      en: "Divide s into consecutive groups of k characters. If the final group is short, append fill until it has size k. Return all groups in order.",
    },
    defaultInput: "abcdefghij",
    inputKind: "string",
    inputLabel: { vi: "s (1..24 chữ thường)", en: "s (1..24 lowercase letters)" },
    extraParams: [
      { key: "k", type: "number", label: { vi: "k (kích thước nhóm)", en: "k (group size)" }, default: 3, min: 1, max: 12 },
      { key: "fill", type: "string", label: { vi: "fill (một chữ thường)", en: "fill (one lowercase letter)" }, default: "x" },
    ],
    approach: [
      { vi: "Duyệt start = 0, k, 2k, ... và cắt s[start:start+k].", en: "Visit start = 0, k, 2k, ... and slice s[start:start+k]." },
      { vi: "Nếu nhóm cuối ngắn hơn k, thêm fill đúng k - len(group) lần.", en: "If the final group is shorter than k, append fill exactly k - len(group) times." },
      { vi: "Thêm từng nhóm hoàn chỉnh vào kết quả; thứ tự ký tự gốc không thay đổi.", en: "Append each completed group; the original character order never changes." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Mỗi ký tự của s được sao chép đúng một lần; kết quả cũng chứa O(n) ký tự.",
        en: "Each character of s is copied once; the returned groups also contain O(n) characters.",
      },
    },
    code: [
      "class Solution:",
      "    def divideString(self, s: str, k: int, fill: str) -> list[str]:",
      "        groups = []",
      "        for start in range(0, len(s), k):",
      "            group = s[start:start + k]",
      "            if len(group) < k:",
      "                group += fill * (k - len(group))",
      "            groups.append(group)",
      "        return groups",
    ],
    debugMode: "semantic",
    liveArgs: (input, params) => {
      const parsed = validate2138Input(input, params);
      return [parsed.s, parsed.k, parsed.fill];
    },
    builder: buildSteps2138,
  },
};
