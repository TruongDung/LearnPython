"use strict";

const bi = (vi, en) => ({ vi, en });
const MAX_WORDS_839 = 16;
const MAX_WORD_LENGTH_839 = 16;
const SOURCE_839 = [
  "from typing import List",
  "",
  "class Solution:",
  "    def numSimilarGroups(self, strs: List[str]) -> int:",
  "        n = len(strs)",
  "        parent = list(range(n))",
  "        size = [1] * n",
  "",
  "        def find(x):",
  "            while parent[x] != x:",
  "                parent[x] = parent[parent[x]]",
  "                x = parent[x]",
  "            return x",
  "",
  "        def similar(a, b):",
  "            if len(a) != len(b):",
  "                return False",
  "            mismatch = [i for i in range(len(a)) if a[i] != b[i]]",
  "            return len(mismatch) == 0 or (",
  "                len(mismatch) == 2",
  "                and a[mismatch[0]] == b[mismatch[1]]",
  "                and a[mismatch[1]] == b[mismatch[0]]",
  "            )",
  "",
  "        def union(a, b):",
  "            ra, rb = find(a), find(b)",
  "            if ra == rb:",
  "                return",
  "            if size[ra] < size[rb]:",
  "                ra, rb = rb, ra",
  "            parent[rb] = ra",
  "            size[ra] += size[rb]",
  "",
  "        for i in range(n):",
  "            for j in range(i + 1, n):",
  "                if similar(strs[i], strs[j]):",
  "                    union(i, j)",
  "",
  "        return len({find(i) for i in range(n)})",
];

function parseStrings839(input) {
  let strings = input;
  if (typeof input === "string") {
    const raw = input.trim();
    try {
      strings = raw.startsWith("[")
        ? JSON.parse(raw)
        : raw.split(",").map((value) => value.trim());
    } catch (error) {
      throw new Error('839: strs must be a JSON string array, e.g. ["tars","rats","arts","star"].');
    }
  }
  if (!Array.isArray(strings)
    || strings.length < 1
    || strings.length > MAX_WORDS_839
    || strings.some((word) => typeof word !== "string"
      || word.length < 1
      || word.length > MAX_WORD_LENGTH_839
      || !/^[a-z]+$/.test(word))) {
    throw new Error(`839: enter 1–${MAX_WORDS_839} nonempty lowercase words, each at most ${MAX_WORD_LENGTH_839} letters.`);
  }
  return [...strings];
}

function buildSteps839(input) {
  const strings = parseStrings839(input);
  const n = strings.length;
  const parent = Array.from({ length: n }, (_, index) => index);
  const size = new Array(n).fill(1);
  const comparisons = [];
  const steps = [];

  const rootOf = (node) => {
    let root = node;
    while (parent[root] !== root) root = parent[root];
    return root;
  };
  const groups = () => {
    const byRoot = new Map();
    for (let node = 0; node < n; node++) {
      const root = rootOf(node);
      if (!byRoot.has(root)) byRoot.set(root, []);
      byRoot.get(root).push(node);
    }
    return [...byRoot.entries()]
      .map(([root, members]) => ({ root, members, size: members.length }))
      .sort((a, b) => a.members[0] - b.members[0]);
  };

  function emit({
    phase,
    event,
    title,
    note,
    activePair = null,
    mismatch = [],
    activeRoots = [],
    union = null,
    final = false,
  }) {
    const components = groups();
    steps.push({
      title,
      note,
      codeLines: event === "intro" ? [4] : event === "initialize" ? [5, 6, 7] : event === "compare" ? [15, 16, 17, 18, 19, 20, 21, 22, 23] : event.startsWith("union") ? [26, 27, 28, 29, 30, 31, 32] : event === "complete" ? [39] : [34, 35, 36],
      final,
      arr: [...parent],
      sub: [...size],
      highlight: activePair ? [...activePair] : [],
      mark: components.map((component) => component.root),
      vars: [
        { name: "strs", value: JSON.stringify(strings) },
        { name: "parent", value: `[${parent.join(", ")}]` },
        { name: "components", value: components.length },
        ...(activePair ? [{ name: "i, j", value: `${activePair[0]}, ${activePair[1]}` }] : []),
        ...(activeRoots.length ? [{ name: "root_i, root_j", value: activeRoots.join(", ") }] : []),
      ],
      similar839View: {
        phase,
        event,
        strings: [...strings],
        parent: [...parent],
        size: [...size],
        components,
        comparisons: comparisons.map((pair) => ({ ...pair, mismatch: [...pair.mismatch] })),
        activePair: activePair ? [...activePair] : null,
        mismatch: [...mismatch],
        activeRoots: [...activeRoots],
        union: union ? { ...union } : null,
        answer: final ? components.length : null,
      },
    });
  }

  emit({
    phase: "intro",
    event: "intro",
    title: bi("Mỗi từ là một node", "Each word is a node"),
    note: bi(
      `Có ${n} từ. Nối hai node khi hai từ giống nhau hoặc đổi đúng hai vị trí sẽ biến từ này thành từ kia.`,
      `There are ${n} words. Connect two nodes when the words are identical or one swap of two positions makes them equal.`,
    ),
  });
  emit({
    phase: "initialize",
    event: "initialize",
    title: bi("Khởi tạo DSU", "Initialize the DSU"),
    note: bi(
      "parent[i] = i: ban đầu mỗi từ là một nhóm riêng. Quét mọi cặp (i, j) để tìm kết nối trực tiếp.",
      "parent[i] = i: every word starts in its own group. Scan each pair (i, j) for a direct connection.",
    ),
  });

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const left = strings[i];
      const right = strings[j];
      const mismatch = [];
      if (left.length === right.length) {
        for (let index = 0; index < left.length; index++) {
          if (left[index] !== right[index]) mismatch.push(index);
          if (mismatch.length > 2) break;
        }
      }
      const sameLength = left.length === right.length;
      const similar = sameLength && (
        mismatch.length === 0
        || (mismatch.length === 2
          && left[mismatch[0]] === right[mismatch[1]]
          && left[mismatch[1]] === right[mismatch[0]])
      );
      const pair = {
        i,
        j,
        status: "checking",
        mismatch: [...mismatch],
        similar,
      };
      comparisons.push(pair);
      emit({
        phase: "compare",
        event: "compare",
        title: bi(`So sánh strs[${i}] và strs[${j}]`, `Compare strs[${i}] and strs[${j}]`),
        note: !sameLength
          ? bi(`Độ dài ${left.length} và ${right.length} khác nhau, nên hai từ không thể giống nhau.`, `Lengths ${left.length} and ${right.length} differ, so the words cannot be similar.`)
          : mismatch.length === 0
            ? bi("Không có vị trí khác nhau: hai từ trùng khớp.", "No positions differ: the words are identical.")
            : mismatch.length === 2 && similar
              ? bi(`Chỉ khác vị trí ${mismatch.join(" và ")}; đổi chéo hai ký tự này sẽ làm hai từ bằng nhau.`, `Only positions ${mismatch.join(" and ")} differ; swapping those two characters makes the words equal.`)
              : bi(`Khác ${mismatch.length > 2 ? "hơn hai" : "đúng hai"} vị trí nhưng không tạo thành một phép đổi chéo hợp lệ.`, `They differ at ${mismatch.length > 2 ? "more than two" : "exactly two"} positions, but those characters do not form a valid cross-swap.`),
        activePair: [i, j],
        mismatch,
      });

      if (!similar) {
        pair.status = "different";
        emit({
          phase: "compare",
          event: "different",
          title: bi("Không có cạnh giữa hai từ", "No edge between these words"),
          note: bi("Cặp này không thỏa điều kiện tương tự; DSU không thay đổi.", "This pair is not similar, so the DSU does not change."),
          activePair: [i, j],
          mismatch,
        });
        continue;
      }

      const rootI = rootOf(i);
      const rootJ = rootOf(j);
      const merged = rootI !== rootJ;
      if (merged) {
        let parentRoot = rootI;
        let childRoot = rootJ;
        if (size[parentRoot] < size[childRoot]) [parentRoot, childRoot] = [childRoot, parentRoot];
        pair.status = "merged";
        pair.rootI = rootI;
        pair.rootJ = rootJ;
        parent[childRoot] = parentRoot;
        size[parentRoot] += size[childRoot];
        emit({
          phase: "union",
          event: "union-merge",
          title: bi(`Gộp nhóm ${rootI} và ${rootJ}`, `Merge groups ${rootI} and ${rootJ}`),
          note: bi(
            `Các từ ${i} và ${j} tương tự, nên gắn root ${childRoot} vào root ${parentRoot}. Số nhóm giảm còn ${groups().length}.`,
            `Words ${i} and ${j} are similar, so attach root ${childRoot} to root ${parentRoot}. The group count is now ${groups().length}.`,
          ),
          activePair: [i, j],
          mismatch,
          activeRoots: [rootI, rootJ],
          union: { parent: parentRoot, child: childRoot },
        });
      } else {
        pair.status = "connected";
        pair.rootI = rootI;
        pair.rootJ = rootJ;
        emit({
          phase: "union",
          event: "union-skip",
          title: bi("Hai từ đã cùng nhóm", "The words are already in one group"),
          note: bi(
            `Cặp này vẫn có cạnh, nhưng hai node đã cùng root ${rootI}; không cần union thêm.`,
            `This pair is connected, but both nodes already have root ${rootI}; no additional union is needed.`,
          ),
          activePair: [i, j],
          mismatch,
          activeRoots: [rootI, rootJ],
        });
      }
    }
  }

  const answer = groups().length;
  emit({
    phase: "done",
    event: "complete",
    title: bi(`Có ${answer} nhóm chuỗi tương tự`, `${answer} similar string groups`),
    note: bi(
      "Các từ trong cùng nhóm có thể nối với nhau qua một chuỗi các phép đổi hai vị trí. Số root còn lại chính là đáp án.",
      "Words in one group are connected through a sequence of two-position swaps. The number of remaining roots is the answer.",
    ),
    final: true,
  });
  return { strings, answer, steps };
}

module.exports = {
  839: {
    id: 839,
    difficulty: "hard",
    slug: "similar-string-groups",
    category: { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" },
    tags: [
      { key: "graph", vi: "Đồ thị", en: "Graph" },
      { key: "string", vi: "Chuỗi", en: "String" },
    ],
    title: bi("Similar String Groups", "Similar String Groups"),
    titleVi: bi("Nhóm các chuỗi tương tự", "Group similar strings"),
    statement: bi(
      `Cho danh sách chuỗi chữ thường. Hai chuỗi tương tự nếu giống hệt nhau hoặc có thể đổi chéo đúng hai ký tự để bằng nhau. Đếm số nhóm liên thông. Bản trực quan hóa giới hạn ${MAX_WORDS_839} từ, mỗi từ tối đa ${MAX_WORD_LENGTH_839} ký tự.`,
      `Given lowercase strings, two are similar if they are identical or one swap of exactly two characters makes them equal. Count the connected groups. This visualization supports up to ${MAX_WORDS_839} words of at most ${MAX_WORD_LENGTH_839} characters each.`,
    ),
    inputKind: "stringArray",
    inputLabel: bi('strs — JSON array, ví dụ ["tars","rats","arts","star"]', 'strs — JSON array, e.g. ["tars","rats","arts","star"]'),
    defaultInput: ["tars", "rats", "arts", "star"],
    debugMode: "line-by-line",
    approach: [
      bi("Mỗi chuỗi là một node; so sánh từng cặp để tìm cạnh tương tự.", "Treat each string as a node; compare each pair to find similar-string edges."),
      bi("Hai vị trí khác nhau là điều kiện cần. Kiểm tra hai ký tự có đổi chéo cho nhau không; hai chuỗi giống hệt cũng được nối.", "Two mismatched positions are necessary. Check whether those characters cross-match; identical strings are also connected."),
      bi("Dùng Union-Find để gộp các node nối trực tiếp. Tính bắc cầu tự động gom cả nhóm.", "Use Union-Find to merge directly connected nodes. Transitivity collects each full group."),
      bi("Số root cuối cùng là số nhóm; việc quét mọi cặp tốn O(n²L), với L là độ dài từ.", "The final root count is the number of groups; checking every pair takes O(n²L), where L is word length."),
    ],
    complexity: {
      time: "O(n²L + n α(n))",
      space: "O(n)",
      note: bi("n là số chuỗi, L là độ dài tối đa. DSU chỉ cần O(n) bộ nhớ ngoài các bước mô phỏng.", "n is the number of strings and L is the maximum word length. DSU uses O(n) extra space, excluding visualization frames."),
    },
    code: SOURCE_839,
    builder: buildSteps839,
    liveArgs: (input) => [parseStrings839(input)],
  },
};
