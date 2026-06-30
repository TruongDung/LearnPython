// Aggregator for all problem categories.
// Each category file exports problem entries as an object.
// Optional `__meta` key in the export carries category-wide metadata
// (recommended learning order, learning guide, etc.).
//
// Output:
//   SUPPORTED       — { [problemId]: problem }
//   CATEGORY_ORDER  — { [categoryKey]: meta }

const fileToCategory = {
  "./dp": "dp",
  "./sliding": "sliding",
  "./graph": "graph",
  "./math": "math",
  "./two-pointer": "two-pointer",
  "./array": "array",
  "./trie": "trie",
  "./hashmap": "hashmap",
  "./greedy": "greedy",
  "./string": "string",
  "./backtracking": "backtracking",
};

const SUPPORTED = {};
const CATEGORY_ORDER = {};

for (const [file, catKey] of Object.entries(fileToCategory)) {
  const mod = require(file);
  const { __meta, ...problems } = mod;
  Object.assign(SUPPORTED, problems);
  if (__meta) CATEGORY_ORDER[catKey] = __meta;
}

module.exports = { SUPPORTED, CATEGORY_ORDER };
