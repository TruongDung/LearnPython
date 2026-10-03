// Aggregator for all problem categories.
// Each category file exports problem entries as an object.
// Optional `__meta` key in the export carries category-wide metadata
// (recommended learning order, learning guide, etc.).
//
// Output:
//   SUPPORTED       — { [problemId]: problem }
//   CATEGORY_ORDER  — { [categoryKey]: meta }
//
// Note: use literal require() calls (not dynamic) so bundlers like Vercel
// can statically detect and include all category files.

const categories = {
  dp: Object.assign(require("./dp"), require("./good-subsequences"), require("./weighted-intervals"), require("./palindrome-dp"), require("./counting-dp"), require("./shelf-dp"), require("./longest-line-matrix"), require("./freedom-trail-514"), require("./race-car-818"), require("./k-inverse-pairs-629"), require("./strange-printer-664"), require("./count-different-palindromic-subsequences-730"), require("./cherry-pickup-741"), require("./maximum-value-k-coins-2218"), require("./valid-parentheses-path-2267"), require("./hard-dp-visualizations"), require("./hard-dp-3117")),
  sliding: Object.assign(require("./sliding"), require("./sliding-advanced"), require("./sliding-missing"), require("./visible-points-1610"), require("./hard-range-visualizations")),
  graph: Object.assign(require("./graph"), require("./cracking-safe-753"), require("./number-bfs"), require("./node-sequence-score"), require("./hard-graph-visualizations"), require("./hard-graph-2699")),
  math: require("./math"),
  "two-pointer": require("./two-pointer"),
  array: Object.assign(require("./array"), require("./calendar"), require("./calendar-two"), require("./adjacent-increasing"), require("./digit-sum-index"), require("./maximum-sum-permutation"), require("./disappeared-numbers-448")),
  trie: Object.assign(require("./trie"), require("./prefix-scores-2416"), require("./hard-trie-3045")),
  hashmap: require("./hashmap"),
  greedy: Object.assign(require("./greedy"), require("./hard-greedy-2589"), require("./hard-geometry-3027")),
  string: Object.assign(require("./string"), require("./string-chunking"), require("./brace-expansion-ii"), require("./basic-calculator-iv-770"), require("./special-binary-string-761"), require("./text-justification-68"), require("./hard-string-1923"), require("./special-characters-3121")),
  backtracking: Object.assign(require("./backtracking"), require("./generate-parentheses-22")),
  bst: require("./bst"),
  "binary-tree": Object.assign(require("./tree"), require("./hard-tree-visualizations"), require("./hard-tree-2872")),
  heap: Object.assign(require("./heap"), require("./server-heap"), require("./meeting-rooms-iii")),
  "union-find": Object.assign(require("./union-find"), require("./hard-union-find-visualizations")),
  "linked-list": require("./linked-list"),
  "binary-lifting": require("./binary-lifting"),
  "binary-search": Object.assign(require("./binary-search"), require("./range-module")),
  "monotonic-stack": require("./monotonic-stack"),
  bitmask: Object.assign(require("./bitmask"), require("./hard-bitmask-visualizations"), require("./hard-bitmask-1723")),
  design: Object.assign(require("./music-player"), require("./sparse-vector"), require("./server-allocator-9018"), require("./smallest-infinite-set-2336"), require("./seat-manager-1845"), require("./phone-directory-379"), require("./number-containers-2349"), require("./log-system-635")),
  interview: Object.assign(require("./interview"), require("./requested-visualizations")),
};

const SUPPORTED = {};
const CATEGORY_ORDER = {};
const MONOTONIC_STACK_TAG = { key: "monotonic-stack", vi: "Monotonic Stack", en: "Monotonic Stack" };
const MONOTONIC_STACK_IDS = new Set([
  496, 1475, 316, 402, 456, 503, 581, 654, 739, 769, 853, 901, 907, 962,
  1008, 1019, 1081, 1124, 1130, 1504, 1574, 1673, 1856, 1996, 2104, 2289,
  2487, 2865, 2866, 255, 1762, 1950, 2282, 2297, 2345, 2832, 2863, 42,
  84, 85, 321, 768, 975, 1526, 1776, 1793, 1944, 2281, 2334, 2454, 2617,
  2736, 2818, 2940, 2945, 1063, 2030, 2355,
  3113, 3205, 3221, 3359, 3430,
]);
const BITMASK_TAG = { key: "bitmask", vi: "Bitmask", en: "Bitmask" };
const BITMASK_IDS = new Set([
  78, 136, 191, 231, 268, 318, 338, 461, 476, 526, 693, 698, 868,
  1125, 1342, 1799, 1879, 2220,
]);

// ─── Company tag ────────────────────────────────────────────────────────────
// One top-level "Company" group that the catalog renders with a sub-tab per
// company. Ids that are not implemented yet are simply skipped, so a list can
// be filled in ahead of the visualizations being built.
const COMPANY_TAG = { key: "company", vi: "Công ty", en: "Company" };
// Each roster entry is [id, title, difficulty]. Entries whose problem is not
// implemented yet are still listed — the catalog shows them greyed out so the
// full company list stays visible while visualizations are added over time.
const COMPANY_LISTS = {
  google: {
    key: "google",
    vi: "Google",
    en: "Google",
    roster: [
      [1293, "Shortest Path in a Grid with Obstacles Elimination", "hard"],
      [528, "Random Pick with Weight", "medium"],
      [1937, "Maximum Number of Points with Cost", "medium"],
      [777, "Swap Adjacent in LR String", "medium"],
      [778, "Swim in Rising Water", "hard"],
      [539, "Minimum Time Difference", "medium"],
      [1055, "Shortest Way to Form String", "medium"],
      [2101, "Detonate the Maximum Bombs", "medium"],
      [1554, "Strings Differ by One Character", "medium"],
      [418, "Sentence Screen Fitting", "medium"],
      [419, "Battleships in a Board", "medium"],
      [552, "Student Attendance Record II", "hard"],
      [792, "Number of Matching Subsequences", "medium"],
      [900, "RLE Iterator", "medium"],
      [2096, "Step-By-Step Directions From a Binary Tree Node to Another", "medium"],
      [1105, "Filling Bookcase Shelves", "medium"],
      [2115, "Find All Possible Recipes from Given Supplies", "medium"],
      [1606, "Find Servers That Handled Most Number of Requests", "hard"],
      [2402, "Meeting Rooms III", "hard"],
      [2242, "Maximum Score of a Node Sequence", "hard"],
      [562, "Longest Line of Consecutive One in Matrix", "medium"],
      [1101, "The Earliest Moment When Everyone Become Friends", "medium"],
      [2416, "Sum of Prefix Scores of Strings", "hard"],
      [68, "Text Justification", "hard"],
      [818, "Race Car", "hard"],
      [1610, "Maximum Number of Visible Points", "hard"],
      [329, "Longest Increasing Path in a Matrix", "hard"],
      [2421, "Number of Good Paths", "hard"],
      [715, "Range Module", "hard"],
      [1996, "The Number of Weak Characters in the Game", "medium"],
      [1387, "Sort Integers by The Power Value", "medium"],
      [2135, "Count Words Obtained After Adding a Letter", "medium"],
      [729, "My Calendar I", "medium"],
      [2162, "Minimum Cost to Set Cooking Time", "medium"],
      [2013, "Detect Squares", "medium"],
      [2128, "Remove All Ones With Row and Column Flips", "medium"],
      [833, "Find And Replace in String", "medium"],
      [489, "Robot Room Cleaner", "hard"],
      [1146, "Snapshot Array", "medium"],
      [2018, "Check if Word Can Be Placed In Crossword", "medium"],
      [839, "Similar String Groups", "hard"],
      [359, "Logger Rate Limiter", "easy"],
      [2178, "Maximum Split of Positive Even Integers", "medium"],
      [843, "Guess the Word", "hard"],
      [1048, "Longest String Chain", "medium"],
      [366, "Find Leaves of Binary Tree", "medium"],
      [2034, "Stock Price Fluctuation", "medium"],
      [2172, "Maximum AND Sum of Array", "hard"],
      [2158, "Amount of New Area Painted Each Day", "hard"],
      [253, "Meeting Rooms II", "medium"],
      [834, "Sum of Distances in Tree", "hard"],
      [2386, "Find the K-Sum of an Array", "hard"],
      [9005, "Next Word Predictor", "medium"],
      [9006, "Graph BFS Shortest Path", "medium"],
      [921, "Minimum Add to Make Parentheses Valid", "medium"],
    ],
  },
  microsoft: {
    key: "microsoft",
    vi: "Microsoft",
    en: "Microsoft",
    roster: [
      [1570, "Dot Product of Two Sparse Vectors", "medium"],
      [9006, "Graph BFS Shortest Path", "medium"],
      [1, "Two Sum", "easy"],
      [167, "Two Sum II - Input Array Is Sorted", "medium"],
    ],
  },
  apple: {
    key: "apple",
    vi: "Apple",
    en: "Apple",
    roster: [
      [208, "Implement Trie (Prefix Tree)", "medium"],
      [9011, "On-Disk Key-Value Store", "medium"],
      [9012, "Vending Machine Change", "medium"],
      [9013, "Perfect-Square Arrangement", "hard"],
    ],
  },
  netflix: {
    key: "netflix",
    vi: "Netflix",
    en: "Netflix",
    roster: [
      [9014, "Loyal Customers from Daily Logs", "medium"],
      [9015, "Interval Overlap Counter", "medium"],
      [9016, "Movie-History Friends", "hard"],
      [9017, "Ad Promotion Metrics System", "hard"],
    ],
  },
};

for (const [catKey, mod] of Object.entries(categories)) {
  const { __meta, ...problems } = mod;
  Object.assign(SUPPORTED, problems);
  if (__meta) {
    CATEGORY_ORDER[catKey] = __meta;
    if (__meta.extraCategories) {
      Object.assign(CATEGORY_ORDER, __meta.extraCategories);
    }
  }
}

for (const id of MONOTONIC_STACK_IDS) {
  const problem = SUPPORTED[id];
  if (!problem) continue;
  const tags = Array.isArray(problem.tags) ? problem.tags : [];
  if (!tags.some((tag) => tag && tag.key === MONOTONIC_STACK_TAG.key)) {
    problem.tags = [...tags, MONOTONIC_STACK_TAG];
  }
}

for (const id of BITMASK_IDS) {
  const problem = SUPPORTED[id];
  if (!problem) continue;
  const tags = Array.isArray(problem.tags) ? problem.tags : [];
  if (!tags.some((tag) => tag && tag.key === BITMASK_TAG.key)) {
    problem.tags = [...tags, BITMASK_TAG];
  }
}

// COMPANY_SUBTABS carries the full roster (including not-yet-built problems) so
// the catalog can render the complete company list.
const COMPANY_SUBTABS = Object.values(COMPANY_LISTS).map((list) => ({
  key: list.key,
  vi: list.vi,
  en: list.en,
  roster: list.roster.map(([id, title, difficulty]) => ({
    id,
    title,
    difficulty,
    available: Boolean(SUPPORTED[id]),
  })),
}));

// Only a `companies` list is attached to each problem. The company axis is
// deliberately kept OUT of `problem.tags`: tags describe the algorithm, and
// mixing "Google" in there both pollutes the tag chips shown on a problem and
// makes every "these are this problem's tags" assertion depend on which company
// rosters happen to mention it. server.js builds the Company group from
// COMPANY_SUBTABS instead.
for (const list of Object.values(COMPANY_LISTS)) {
  for (const [id] of list.roster) {
    const problem = SUPPORTED[id];
    if (!problem) continue;
    const companies = Array.isArray(problem.companies) ? problem.companies : [];
    if (!companies.includes(list.key)) problem.companies = [...companies, list.key];
  }
}

module.exports = { SUPPORTED, CATEGORY_ORDER, COMPANY_SUBTABS, COMPANY_TAG };
