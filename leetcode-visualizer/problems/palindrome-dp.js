function validate2472Input(input, params = {}) {
  const s = String(input ?? "");
  const k = Number(params.k);
  if (!/^[a-z]+$/.test(s)) {
    throw new Error("s must contain only lowercase English letters.");
  }
  if (s.length > 16) {
    throw new Error("Use at most 16 characters for this visualization.");
  }
  if (!Number.isInteger(k) || k < 1 || k > s.length) {
    throw new Error("k must be an integer between 1 and the length of s.");
  }
  return { s, k };
}

function buildSteps2472(input, params = {}) {
  const { s, k } = validate2472Input(input, params);
  const n = s.length;
  const palindrome = Array.from({ length: n }, () => Array(n).fill(null));
  const dp = Array(n + 1).fill(null);
  const parent = Array(n + 1).fill(null);
  const steps = [];

  const chosenIntervals = (prefixLength) => {
    const intervals = [];
    let cursor = prefixLength;
    while (cursor > 0 && parent[cursor]) {
      const link = parent[cursor];
      if (link.interval) intervals.push([...link.interval]);
      cursor = link.previous;
    }
    return intervals.reverse();
  };

  const snapshot = ({ phase, operation, codeLine, title, note, current = null, inner = null,
    activePrefix = -1, candidate = null, final = false }) => {
    steps.push({
      title,
      codeLines: [codeLine],
      palindrome2472View: {
        s,
        k,
        phase,
        operation,
        palindrome: palindrome.map((row) => [...row]),
        dp: [...dp],
        current,
        inner,
        activePrefix,
        candidate,
        selected: chosenIntervals(activePrefix >= 0 ? activePrefix : 0),
        answer: final ? dp[n] : null,
        final,
      },
      vars: [
        { name: "s", value: s },
        { name: "k", value: k },
        ...(current ? [{ name: "substring", value: s.slice(current[0], current[1] + 1) }] : []),
        ...(activePrefix >= 0 ? [{ name: `dp[${activePrefix}]`, value: dp[activePrefix] }] : []),
      ],
      note,
      final,
    });
  };

  snapshot({
    phase: "palindrome",
    operation: "init-palindrome",
    codeLine: 4,
    title: { vi: "Tạo bảng palindrome", en: "Create the palindrome table" },
    note: {
      vi: "Ô pal[left][right] cho biết s[left..right] có đọc giống nhau từ hai phía hay không.",
      en: "Cell pal[left][right] records whether s[left..right] reads the same from both ends.",
    },
  });

  for (let length = 1; length <= n; length += 1) {
    for (let left = 0; left + length <= n; left += 1) {
      const right = left + length - 1;
      const edgeMatch = s[left] === s[right];
      const inner = length <= 2 ? null : [left + 1, right - 1];
      const innerPalindrome = length <= 2 || palindrome[left + 1][right - 1] === true;
      palindrome[left][right] = edgeMatch && innerPalindrome;
      snapshot({
        phase: "palindrome",
        operation: palindrome[left][right] ? "palindrome-yes" : "palindrome-no",
        codeLine: 8,
        current: [left, right],
        inner,
        title: {
          vi: `“${s.slice(left, right + 1)}” ${palindrome[left][right] ? "là" : "không là"} palindrome`,
          en: `“${s.slice(left, right + 1)}” is ${palindrome[left][right] ? "a palindrome" : "not a palindrome"}`,
        },
        note: {
          vi: length <= 2
            ? `So s[${left}] và s[${right}]: ${edgeMatch ? "giống nhau" : "khác nhau"}. Đoạn dài ${length} không cần kiểm tra phần trong.`
            : `Hai đầu ${edgeMatch ? "khớp" : "không khớp"}; phần trong pal[${left + 1}][${right - 1}] = ${palindrome[left + 1][right - 1]}.`,
          en: length <= 2
            ? `Compare s[${left}] and s[${right}]: they ${edgeMatch ? "match" : "differ"}. A length-${length} span has no inner substring to verify.`
            : `The endpoints ${edgeMatch ? "match" : "do not match"}; the inner cell pal[${left + 1}][${right - 1}] is ${palindrome[left + 1][right - 1]}.`,
        },
      });
    }
  }

  dp[0] = 0;
  parent[0] = { previous: 0, interval: null };
  snapshot({
    phase: "prefix",
    operation: "init-dp",
    codeLine: 10,
    activePrefix: 0,
    title: { vi: "Khởi tạo dp[0] = 0", en: "Initialize dp[0] = 0" },
    note: {
      vi: "dp[p] là số palindrome không giao nhau nhiều nhất trong prefix s[0..p-1]. Prefix rỗng có giá trị 0.",
      en: "dp[p] is the maximum number of non-overlapping palindromes in prefix s[0..p-1]. The empty prefix has value 0.",
    },
  });

  for (let end = 0; end < n; end += 1) {
    const prefixLength = end + 1;
    dp[prefixLength] = dp[prefixLength - 1];
    parent[prefixLength] = { previous: prefixLength - 1, interval: null };
    snapshot({
      phase: "prefix",
      operation: "skip",
      codeLine: 12,
      activePrefix: prefixLength,
      title: { vi: `Bỏ qua ký tự ${end}`, en: `Skip character ${end}` },
      note: {
        vi: `Chưa chọn đoạn kết thúc tại ${end}: dp[${prefixLength}] = dp[${prefixLength - 1}] = ${dp[prefixLength]}.`,
        en: `Before taking a palindrome ending at ${end}, carry forward dp[${prefixLength}] = dp[${prefixLength - 1}] = ${dp[prefixLength]}.`,
      },
    });

    for (let start = 0; start + k - 1 <= end; start += 1) {
      const isPalindrome = palindrome[start][end] === true;
      const value = isPalindrome ? dp[start] + 1 : null;
      const improves = isPalindrome && value > dp[prefixLength];
      snapshot({
        phase: "prefix",
        operation: isPalindrome ? "candidate" : "reject",
        codeLine: 14,
        current: [start, end],
        activePrefix: prefixLength,
        candidate: { start, end, isPalindrome, value, improves },
        title: {
          vi: isPalindrome ? `Thử chọn “${s.slice(start, end + 1)}”` : `Loại “${s.slice(start, end + 1)}”`,
          en: isPalindrome ? `Try taking “${s.slice(start, end + 1)}”` : `Reject “${s.slice(start, end + 1)}”`,
        },
        note: isPalindrome
          ? {
              vi: `Đoạn này hợp lệ. Ghép với lời giải của prefix dài ${start}: dp[${start}] + 1 = ${value}${improves ? ", tốt hơn giá trị hiện tại" : ", không tốt hơn giá trị hiện tại"}.`,
              en: `This span is valid. Append it after the best solution for prefix length ${start}: dp[${start}] + 1 = ${value}${improves ? ", which improves the current value" : ", which does not improve the current value"}.`,
            }
          : {
              vi: `Độ dài đã đủ k=${k}, nhưng bảng pal cho biết s[${start}..${end}] không phải palindrome.`,
              en: `Its length reaches k=${k}, but the pal table says s[${start}..${end}] is not a palindrome.`,
            },
      });

      if (improves) {
        dp[prefixLength] = value;
        parent[prefixLength] = { previous: start, interval: [start, end] };
        snapshot({
          phase: "prefix",
          operation: "update",
          codeLine: 17,
          current: [start, end],
          activePrefix: prefixLength,
          candidate: { start, end, isPalindrome: true, value, improves: true },
          title: { vi: `Cập nhật dp[${prefixLength}] = ${value}`, en: `Update dp[${prefixLength}] = ${value}` },
          note: {
            vi: `Chọn “${s.slice(start, end + 1)}”; mọi đoạn trước đó nằm hoàn toàn trong s[0..${start - 1}], nên không giao nhau.`,
            en: `Take “${s.slice(start, end + 1)}”; every earlier chosen span lies completely in s[0..${start - 1}], so there is no overlap.`,
          },
        });
      }
    }
  }

  snapshot({
    phase: "done",
    operation: "return",
    codeLine: 18,
    activePrefix: n,
    final: true,
    title: { vi: `Kết quả: ${dp[n]} đoạn`, en: `Result: ${dp[n]} substrings` },
    note: {
      vi: `dp[${n}] = ${dp[n]}; các đoạn được tô xanh tạo thành một lựa chọn tối ưu không giao nhau.`,
      en: `dp[${n}] = ${dp[n]}; the green spans form one optimal non-overlapping selection.`,
    },
  });

  return { answer: dp[n], intervals: chosenIntervals(n), steps };
}

module.exports = {
  2472: {
    id: 2472,
    difficulty: "hard",
    slug: "maximum-number-of-non-overlapping-palindrome-substrings",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "string", vi: "Chuỗi", en: "String" },
      { key: "palindrome", vi: "Palindrome", en: "Palindrome" },
    ],
    title: { vi: "Maximum Number of Non-overlapping Palindrome Substrings", en: "Maximum Number of Non-overlapping Palindrome Substrings" },
    titleVi: { vi: "Số chuỗi con palindrome không giao nhau lớn nhất", en: "Maximum number of non-overlapping palindrome substrings" },
    statement: {
      vi: "Cho chuỗi s và số nguyên dương k. Chọn nhiều chuỗi con không giao nhau nhất sao cho mỗi chuỗi có độ dài ít nhất k và là palindrome.",
      en: "Given a string s and a positive integer k, select the maximum number of non-overlapping substrings whose lengths are at least k and which are palindromes.",
    },
    defaultInput: "abaccdbbd",
    inputKind: "string",
    inputLabel: { vi: "s (chữ thường, tối đa 16 ký tự)", en: "s (lowercase, up to 16 characters)" },
    extraParams: [
      { key: "k", type: "number", label: { vi: "k (độ dài tối thiểu)", en: "k (minimum length)" }, default: 3, min: 1, max: 16 },
    ],
    approach: [
      { vi: "Điền pal[left][right] từ đoạn ngắn đến dài để nhận biết palindrome trong O(1) cho mỗi đoạn.", en: "Fill pal[left][right] from shorter spans to longer ones so each palindrome test takes O(1)." },
      { vi: "dp[p] là số đoạn tốt nhất trong prefix dài p; luôn có thể bỏ qua ký tự cuối bằng dp[p] = dp[p-1].", en: "dp[p] is the best count in a prefix of length p; skipping the last character gives dp[p] = dp[p-1]." },
      { vi: "Với mỗi palindrome s[start..end] dài ít nhất k, thử dp[end+1] = max(dp[end+1], dp[start] + 1).", en: "For every palindrome s[start..end] of length at least k, try dp[end+1] = max(dp[end+1], dp[start] + 1)." },
    ],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: {
        vi: "Bảng palindrome và các chuyển tiếp prefix đều xét O(n²) cặp chỉ số.",
        en: "The palindrome table and prefix transitions each examine O(n²) index pairs.",
      },
    },
    debugMode: "semantic",
    code: [
      "class Solution:",
      "    def maxPalindromes(self, s: str, k: int) -> int:",
      "        n = len(s)",
      "        pal = [[False] * n for _ in range(n)]",
      "        for length in range(1, n + 1):",
      "            for left in range(n - length + 1):",
      "                right = left + length - 1",
      "                pal[left][right] = s[left] == s[right] and (length <= 2 or pal[left + 1][right - 1])",
      "",
      "        dp = [0] * (n + 1)",
      "        for end in range(n):",
      "            dp[end + 1] = dp[end]",
      "            for start in range(end - k + 2):",
      "                if pal[start][end]:",
      "                    candidate = dp[start] + 1",
      "                    if candidate > dp[end + 1]:",
      "                        dp[end + 1] = candidate",
      "        return dp[n]",
    ],
    liveArgs: (input, params) => {
      const parsed = validate2472Input(input, params);
      return [parsed.s, parsed.k];
    },
    builder: buildSteps2472,
  },
};
