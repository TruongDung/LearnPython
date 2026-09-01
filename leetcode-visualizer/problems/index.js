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
  dp: require("./dp"),
  sliding: Object.assign(require("./sliding"), require("./sliding-advanced"), require("./sliding-missing")),
  graph: require("./graph"),
  math: require("./math"),
  "two-pointer": require("./two-pointer"),
  array: require("./array"),
  trie: require("./trie"),
  hashmap: require("./hashmap"),
  greedy: require("./greedy"),
  string: require("./string"),
  backtracking: require("./backtracking"),
  bst: require("./bst"),
  "binary-tree": require("./tree"),
  heap: require("./heap"),
  "union-find": require("./union-find"),
  "linked-list": require("./linked-list"),
  "binary-lifting": require("./binary-lifting"),
  "binary-search": require("./binary-search"),
  "monotonic-stack": require("./monotonic-stack"),
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
  3113, 3430,
]);

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

module.exports = { SUPPORTED, CATEGORY_ORDER };
