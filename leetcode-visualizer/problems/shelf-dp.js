// LeetCode 1105: prefix DP, trying every valid start for the last shelf.

const label = (vi, en) => ({ vi, en });
const MAX_TRACE_STEPS = 650;

function parseBooks(input) {
  let books;
  if (Array.isArray(input)) {
    books = input;
  } else {
    const raw = String(input ?? "").trim();
    try {
      books = raw.startsWith("[")
        ? JSON.parse(raw)
        : raw.split(";").map((pair) => pair.split(",").map((value) => Number(value.trim())));
    } catch (_error) {
      throw new Error("books must be a JSON array like [[1,1],[2,3]] or thickness,height pairs separated by semicolons");
    }
  }
  if (!Array.isArray(books) || books.length < 1 || books.length > 1000
    || books.some((book) => !Array.isArray(book) || book.length !== 2
      || book.some((value) => !Number.isInteger(value) || value < 1 || value > 1000))) {
    throw new Error("books must contain 1–1000 [thickness, height] pairs with values in [1, 1000]");
  }
  return books.map((book) => [...book]);
}

function buildSteps1105(input, params = {}) {
  const books = parseBooks(input);
  const shelfWidth = Number(params.shelfWidth ?? 4);
  if (!Number.isInteger(shelfWidth) || shelfWidth < 1 || shelfWidth > 1000
    || books.some(([thickness]) => thickness > shelfWidth)) {
    throw new Error("shelfWidth must be in [1, 1000] and at least as wide as every book");
  }

  const n = books.length;
  const dp = [0, ...Array(n).fill(Infinity)];
  const choice = Array(n + 1).fill(-1);
  const steps = [];
  let i = null;
  let j = null;
  let width = null;
  let height = null;
  let candidate = null;
  let omitted = false;

  function shelvesFor(prefix) {
    const shelves = [];
    let end = prefix;
    while (end > 0 && choice[end] >= 0) {
      const start = choice[end];
      const items = books.slice(start, end).map(([thickness, bookHeight], index) => ({
        index: start + index, thickness, height: bookHeight,
      }));
      shelves.push({ start, end: end - 1, width: items.reduce((sum, item) => sum + item.thickness, 0),
        height: Math.max(...items.map((item) => item.height)), books: items });
      end = start;
    }
    return shelves.reverse();
  }

  function record(phase, title, line, note, options = {}) {
    if (steps.length >= MAX_TRACE_STEPS && !options.final) {
      omitted = true;
      return;
    }
    const visibleBooks = books.slice(0, 24).map(([thickness, bookHeight], index) => ({ index, thickness, height: bookHeight }));
    const best = i !== null && Number.isFinite(dp[i]) ? dp[i] : null;
    const vars = [{ name: "n", value: n }, { name: "shelfWidth", value: shelfWidth },
      { name: "dp", value: `[${dp.map((value) => Number.isFinite(value) ? value : "∞").join(", ")}]` }];
    if (i !== null) vars.push({ name: "i", value: i });
    if (j !== null) vars.push({ name: "j", value: j });
    if (width !== null) vars.push({ name: "width", value: width }, { name: "height", value: height });
    if (candidate !== null) vars.push({ name: "candidate", value: candidate });
    if (options.final) vars.push({ name: "answer", value: dp[n] });
    steps.push({
      title, arr: [], highlight: [], mark: [], codeLines: [line], vars, note,
      final: Boolean(options.final),
      shelfDp1105View: {
        phase, shelfWidth, n, books: visibleBooks, i, j, width, height, candidate, best,
        previous: j === null ? null : dp[j],
        dp: dp.map((value) => Number.isFinite(value) ? value : null),
        shelves: options.final ? shelvesFor(n) : best === null ? [] : shelvesFor(i),
        answer: options.final ? dp[n] : null, omitted,
      },
    });
  }

  record("init", label(`n = ${n}`, `n = ${n}`), 3,
    label("Giữ nguyên thứ tự sách; chỉ quyết định vị trí ngắt kệ.", "Keep book order; only choose where each shelf ends."));
  record("init", label("dp[0] = 0, các trạng thái khác = ∞", "dp[0] = 0, other states = ∞"), 4,
    label("dp[i] là tổng chiều cao nhỏ nhất của i quyển đầu.", "dp[i] is the minimum height for the first i books."));

  for (let prefix = 1; prefix <= n; prefix++) {
    i = prefix;
    j = null;
    width = null;
    height = null;
    candidate = null;
    record("prefix", label(`Tính dp[${i}]`, `Compute dp[${i}]`), 5,
      label("Thử để vài quyển cuối cùng cùng nằm trên một kệ.", "Try different starts for the final shelf."));
    width = 0;
    record("reset", label("width = 0", "width = 0"), 6,
      label("Bắt đầu một kệ cuối rỗng.", "Start with an empty last shelf."));
    height = 0;
    record("reset", label("height = 0", "height = 0"), 7,
      label("Chiều cao kệ là sách cao nhất trên kệ đó.", "A shelf is as tall as its tallest book."));

    for (let start = i - 1; start >= 0; start--) {
      j = start;
      candidate = null;
      record("try", label(`Thử kệ cuối bắt đầu ở sách ${j}`, `Try last shelf from book ${j}`), 8,
        label(`Các sách [${j}..${i - 1}] phải nằm liền nhau và đúng thứ tự.`, `Books [${j}..${i - 1}] stay contiguous and in order.`));
      width += books[j][0];
      record("width", label(`width += ${books[j][0]} → ${width}`, `width += ${books[j][0]} → ${width}`), 9,
        label("Thêm sách bên trái vào kệ đang thử.", "Extend the trial shelf one book to the left."));
      const tooWide = width > shelfWidth;
      record("check", label(`${width} > ${shelfWidth}? ${tooWide}`, `${width} > ${shelfWidth}? ${tooWide}`), 10,
        tooWide
          ? label("Kệ đã quá rộng; thêm sách bên trái chỉ làm rộng hơn.", "The shelf is too wide; adding more books on the left cannot help.")
          : label("Kệ còn hợp lệ; tính chiều cao của nó.", "The shelf still fits; update its height."));
      if (tooWide) {
        record("break", label("Dừng mở rộng kệ cuối", "Stop extending the last shelf"), 11,
          label("Bỏ các vị trí j nhỏ hơn vì độ rộng chỉ tăng.", "Skip smaller j values because width only increases."));
        break;
      }
      height = Math.max(height, books[j][1]);
      record("height", label(`height = max(..., ${books[j][1]}) = ${height}`, `height = max(..., ${books[j][1]}) = ${height}`), 12,
        label("Một kệ đóng góp chiều cao bằng quyển cao nhất của nó.", "A shelf contributes the height of its tallest book."));
      candidate = dp[j] + height;
      record("candidate", label(`dp[${j}] + ${height} = ${candidate}`, `dp[${j}] + ${height} = ${candidate}`), 13,
        label("Lấy phương án tối ưu cho j sách đầu, rồi thêm một kệ cuối.", "Use the optimal first j books, then add the final shelf."));
      if (candidate < dp[i]) {
        dp[i] = candidate;
        choice[i] = j;
      }
      record("best", label(`dp[${i}] = ${dp[i]}`, `dp[${i}] = ${dp[i]}`), 14,
        choice[i] === j
          ? label(`Kệ cuối [${j}..${i - 1}] đang cho chiều cao tốt nhất.`, `Last shelf [${j}..${i - 1}] currently gives the best height.`)
          : label("Phương án này không tốt hơn; giữ cách chia kệ trước.", "This candidate is not better; keep the previous shelf split."));
    }
  }

  i = n;
  j = null;
  width = null;
  height = null;
  candidate = null;
  record("done", label(`Trả về dp[${n}] = ${dp[n]}`, `Return dp[${n}] = ${dp[n]}`), 15,
    omitted
      ? label("Trace dài đã được rút gọn; đáp án và cách xếp tối ưu vẫn được tính đầy đủ.", "The long trace was shortened; the optimal height and arrangement are still complete.")
      : label("Ghép các kệ đã chọn để thấy một cách xếp tối ưu.", "Reconstruct the chosen shelves to show an optimal arrangement."),
    { final: true });
  return { original: books, shelfWidth, answer: dp[n], steps };
}

module.exports = {
  1105: {
    id: 1105,
    difficulty: "medium",
    slug: "filling-bookcase-shelves",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    ],
    title: label("Filling Bookcase Shelves", "Filling Bookcase Shelves"),
    titleVi: label("Xếp sách lên kệ với chiều cao nhỏ nhất", "Minimum-height bookshelf"),
    statement: label(
      "Mỗi sách có [độ dày, chiều cao]. Xếp sách đúng thứ tự lên các kệ rộng tối đa shelfWidth. Chiều cao mỗi kệ bằng sách cao nhất trên kệ. Tìm tổng chiều cao nhỏ nhất.",
      "Each book has [thickness, height]. Place books in order on shelves of width at most shelfWidth. A shelf's height is its tallest book. Minimize the total height."
    ),
    defaultInput: "[[1,1],[2,3],[2,3],[1,1],[1,1],[1,1],[1,2]]",
    inputKind: "string",
    inputLabel: label("books: [[độ dày, chiều cao], ...]", "books: [[thickness, height], ...]"),
    extraParams: [{ key: "shelfWidth", label: label("shelfWidth (độ rộng kệ)", "shelfWidth"), default: 4 }],
    approach: [
      label("dp[i] = chiều cao ít nhất của i quyển đầu; dp[0] = 0.", "dp[i] is the minimum height of the first i books; dp[0] = 0."),
      label("Với mỗi i, lùi j để thử các nhóm sách [j..i−1] làm kệ cuối, đến khi quá rộng.", "For each i, move j left to try books [j..i−1] as the last shelf until it becomes too wide."),
      label("Cập nhật dp[i] = min(dp[i], dp[j] + chiều cao lớn nhất của kệ cuối).", "Update dp[i] = min(dp[i], dp[j] + tallest height on the last shelf)."),
    ],
    complexity: {
      time: "O(n²)", space: "O(n)",
      note: label("Mỗi tiền tố thử tối đa n vị trí bắt đầu kệ cuối; chỉ cần mảng dp.", "Each prefix tries up to n starts for its last shelf; only the dp array is needed."),
    },
    code: [
      "class Solution:",
      "    def minHeightShelves(self, books, shelfWidth):",
      "        n = len(books)",
      "        dp = [0] + [float('inf')] * n",
      "        for i in range(1, n + 1):",
      "            width = 0",
      "            height = 0",
      "            for j in range(i - 1, -1, -1):",
      "                width += books[j][0]",
      "                if width > shelfWidth:",
      "                    break",
      "                height = max(height, books[j][1])",
      "                candidate = dp[j] + height",
      "                dp[i] = min(dp[i], candidate)",
      "        return dp[n]",
    ],
    builder: buildSteps1105,
  },
};
