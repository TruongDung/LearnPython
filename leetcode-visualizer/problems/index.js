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
  sliding: require("./sliding"),
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
};

const SUPPORTED = {};
const CATEGORY_ORDER = {};

for (const [catKey, mod] of Object.entries(categories)) {
  const { __meta, ...problems } = mod;
  Object.assign(SUPPORTED, problems);
  if (__meta) CATEGORY_ORDER[catKey] = __meta;
}

module.exports = { SUPPORTED, CATEGORY_ORDER };
