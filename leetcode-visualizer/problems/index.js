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
  dp: Object.assign(require("./dp"), require("./ones-and-zeroes-474"), require("./target-sum-494"), require("./picture-lis-ii-2407"), require("./minimum-swaps-801"), require("./longest-increasing-subsequence-300"), require("./good-subsequences"), require("./weighted-intervals"), require("./palindrome-dp"), require("./counting-dp"), require("./shelf-dp"), require("./longest-line-matrix"), require("./freedom-trail-514"), require("./race-car-818"), require("./k-inverse-pairs-629"), require("./strange-printer-664"), require("./count-different-palindromic-subsequences-730"), require("./cherry-pickup-741"), require("./maximum-value-k-coins-2218"), require("./longest-subsequence-target-2915"), require("./valid-parentheses-path-2267"), require("./hard-dp-visualizations"), require("./hard-dp-3117"), require("./increasing-paths-2328"), require("./increasing-cells-2713"), require("./great-partitions-2518"), require("./number-of-ways-earn-points-2585"), require("./ways-to-express-powers-2787"), require("./original-typed-string-ii-3333"), require("./closest-dessert-cost-1774"), require("./minimize-difference-1981"), require("./split-array-same-average-805"), require("./closest-subsequence-sum-1755"), require("./partition-array-minimize-difference-2035"), require("./tallest-billboard-956"), require("./painting-walls-2742"), require("./sum-power-subsequences-3082"), require("./maximum-total-reward-3180"), require("./maximum-total-reward-3181"), require("./trading-stocks-2291"), require("./guess-number-ii-375"), require("./can-i-win-464")),
  sliding: Object.assign(require("./sliding"), require("./sliding-advanced"), {2444: require("./picture-arrays")[2444]}, require("./sliding-missing"), require("./visible-points-1610"), require("./hard-range-visualizations"), require("./vowel-substrings-3306"), require("./distinct-triplets-1876")),
  graph: Object.assign(require("./graph"), require("./divisible-islands-3619"), require("./minimum-height-trees-310"), require("./sequence-reconstruction-444"), require("./word-ladder-127"), require("./picture-keys-864"), require("./cracking-safe-753"), require("./number-bfs"), require("./node-sequence-score"), require("./picture-node-score-2242"), require("./largest-color-value-1857"), require("./hard-graph-visualizations"), require("./hard-graph-2699"), require("./springboard-matrix-9020"), require("./all-paths-destination-1059"), require("./sort-items-groups-1203"), require("./strange-printer-ii-1591"), require("./rank-transform-matrix-1632"), require("./safest-path-grid-2812")),
  math: Object.assign(require("./math"), require("./gcd-pairs-3867"), require("./minimum-cost-cooking-time-2162"), require("./maximum-even-split-2178")),
  "two-pointer": Object.assign(require("./two-pointer"), require("./sorted-squares-977"), require("./valid-palindrome-ii-680"), require("./heaters-475"), require("./maximum-distance-1855"), require("./reverse-vowels-345"), require("./reverse-only-letters-917"), require("./backspace-compare-844"), require("./longest-dictionary-word-524"), require("./minimum-length-1750")),
  array: Object.assign(require("./array"), require("./rotate-image-48"), require("./spiral-matrix-54"), require("./search-matrix-74"), require("./search-matrix-ii-240"), require("./set-matrix-zeroes-73"), require("./daily-temperatures-739"), require("./calendar"), require("./calendar-two"), require("./adjacent-increasing"), require("./digit-sum-index"), require("./maximum-sum-permutation"), require("./disappeared-numbers-448"), require("./remove-ones-2128"), require("./range-sum-query-2d-mutable-308"), require("./continuous-increasing-674")),
  trie: Object.assign(require("./trie"), require("./word-dictionary-211"), require("./map-sum-677"), require("./prefix-scores-2416"), require("./hard-trie-3045"), require("./design-file-system-1166")),
  hashmap: Object.assign(require("./hashmap"), require("./subarray-sum-560")),
  greedy: Object.assign(require("./greedy"), require("./hard-greedy-2589"), require("./hard-geometry-3027"), require("./valid-parenthesis-string-678"), require("./furthest-houses-2078"), require("./unique-categories-2782"), require("./queue-reconstruction-406")),
  string: Object.assign(require("./string"), require("./minimum-add-parentheses-921"), {3170: require("./picture-arrays")[3170]}, require("./atoi-8"), require("./string-chunking"), require("./brace-expansion-ii"), require("./basic-calculator-iv-770"), require("./special-binary-string-761"), require("./text-justification-68"), require("./hard-string-1923"), require("./special-characters-3121"), require("./match-substring-replacement-2301"), require("./find-replace-string-833"), require("./crossword-placement-2018"), require("./remove-outermost-parentheses-1021"), require("./score-parentheses-856"), require("./minimum-insertions-parentheses-1541"), require("./locked-parentheses-2116"), require("./minimize-expression-2232"), require("./different-parentheses-241"), require("./apply-substitutions-3481"), require("./to-lower-case-709"), require("./defanging-ip-1108"), require("./unique-email-addresses-929"), require("./equivalent-string-arrays-1662"), require("./goal-parser-1678"), require("./reverse-string-ii-541"), require("./reverse-words-iii-557"), require("./reverse-words-151"), require("./valid-anagram-242"), require("./find-the-difference-389"), require("./longest-palindrome-409"), require("./word-pattern-290"), require("./frequency-sort-451"), require("./close-strings-1657"), require("./count-words-2135"), require("./longest-string-chain-1048")),
  backtracking: Object.assign(require("./backtracking"), require("./subsets-78"), require("./generate-parentheses-22"), require("./matchsticks-to-square-473")),
  bst: Object.assign(require("./bst"), require("./picture-bst-173")),
  "binary-tree": Object.assign(require("./tree"), require("./flatten-tree-114"), require("./hard-tree-visualizations"), require("./hard-tree-2872"), require("./equal-value-components-2440")),
  heap: Object.assign(require("./heap"), require("./kth-smallest-matrix-378"), require("./skyline-218"), require("./median-finder-295"), require("./top-k-frequent-347"), require("./design-twitter-355"), require("./merge-k-lists-23"), require("./kth-largest-215"), require("./server-heap"), require("./meeting-rooms-iii"), require("./minimum-interval-1851")),
  "union-find": Object.assign(require("./union-find"), require("./hard-union-find-visualizations"), require("./number-of-good-paths-2421"), require("./similar-string-groups-839")),
  "linked-list": Object.assign(require("./linked-list"), require("./swap-nodes-24")),
  "binary-lifting": Object.assign(require("./binary-lifting"), require("./minimum-edge-weight-equilibrium-queries-2846")),
  "binary-search": Object.assign(require("./binary-search"), require("./sqrt-69"), require("./range-module"), require("./full-bloom-flowers-2251"), require("./most-beautiful-item-2070"), require("./arranging-coins-441"), require("./guess-number-374"), require("./repair-cars-2594"), require("./divide-chocolate-1231"), require("./kth-missing-positive-1539"), require("./smallest-divisor-1283"), require("./min-days-bouquets-1482"), require("./magnetic-force-1552")),
  "monotonic-stack": Object.assign(require("./monotonic-stack"), require("./good-subarray-1793"), require("./ocean-view-1762")),
  bitmask: Object.assign(require("./bitmask"), require("./hard-bitmask-visualizations"), require("./hard-bitmask-1723"), require("./wonderful-substrings-1915"), require("./maximize-squares-2897"), require("./maximum-k-sort-3644")),
  design: Object.assign(require("./food-ratings-2353"), require("./music-player"), require("./sparse-vector"), require("./server-allocator-9018"), require("./lib-register-9019"), require("./smallest-infinite-set-2336"), require("./seat-manager-1845"), require("./phone-directory-379"), require("./number-containers-2349"), require("./stock-price-2034"), require("./snapshot-array-1146"), require("./detect-squares-2013"), require("./log-system-635"), require("./design-excel-sum-formula-631"), require("./prefix-suffix-search-745")),
  interview: Object.assign(require("./interview"), require("./requested-visualizations"), require("./k-sum-2386"), require("./next-word-predictor-9005"), require("./safe-level-path-9021"), require("./underpaid-managers-9022"), require("./directory-size-9023")),
};

const SUPPORTED = {};
const CATEGORY_ORDER = {};
const { PREFIX_MAX_TAG, PREFIX_MAX_ROSTER, PREFIX_MAX_ORDER, PREFIX_MAX_ORDER_LABEL, PREFIX_MAX_GUIDE, prefixMaxSubTabs } = require('./prefix-max-catalog');
const DP_TAG = { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" };
const FENWICK_TREE_TAG = { key: "fenwick-tree", vi: "Fenwick Tree", en: "Fenwick Tree" };
const FREQUENCY_COUNT_TAG = { key: "frequency-count", vi: "Đếm tần suất", en: "Frequency Count" };
const SEGMENT_TREE_TAG = { key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" };
// Full Segment Tree study roster. Built problems receive the tag; unbuilt ones
// stay in the roster so the catalog can render them as dimmed placeholders.
// Format: [id, title, difficulty]
const SEGMENT_TREE_ROSTER_RAW = [
  [218, "The Skyline Problem", "hard"],
  [307, "Range Sum Query - Mutable", "medium"],
  [308, "Range Sum Query 2D - Mutable", "medium"],
  [315, "Count of Smaller Numbers After Self", "hard"],
  [327, "Count of Range Sum", "hard"],
  [406, "Queue Reconstruction by Height", "medium"],
  [493, "Reverse Pairs", "hard"],
  [673, "Number of Longest Increasing Subsequence", "medium"],
  [683, "K Empty Slots", "hard"],
  [699, "Falling Squares", "hard"],
  [715, "Range Module", "hard"],
  [729, "My Calendar I", "medium"],
  [731, "My Calendar II", "medium"],
  [732, "My Calendar III", "hard"],
  [850, "Rectangle Area II", "hard"],
  [1157, "Online Majority Element In Subarray", "hard"],
  [1395, "Count Number of Teams", "medium"],
  [1505, "Minimum Possible Integer After at Most K Adjacent Swaps On Digits", "hard"],
  [1521, "Find a Value of a Mysterious Function Closest to Target", "hard"],
  [1622, "Fancy Sequence", "hard"],
  [1649, "Create Sorted Array through Instructions", "hard"],
  [1687, "Delivering Boxes from Storage to Ports", "hard"],
  [2031, "Count Subarrays With More Ones Than Zeros", "medium"],
  [2080, "Range Frequency Queries", "medium"],
  [2158, "Amount of New Area Painted Each Day", "hard"],
  [2179, "Count Good Triplets in an Array", "hard"],
  [2213, "Longest Substring of One Repeating Character", "hard"],
  [2276, "Count Integers in Intervals", "hard"],
  [2286, "Booking Concert Tickets in Groups", "hard"],
  [2407, "Longest Increasing Subsequence II", "hard"],
  [2424, "Longest Uploaded Prefix", "medium"],
  [2426, "Number of Pairs Satisfying Inequality", "hard"],
  [2519, "Count the Number of K-Big Indices", "hard"],
  [2569, "Handling Sum Queries After Update", "hard"],
  [2659, "Make Array Empty", "hard"],
  [2736, "Maximum Sum Queries", "hard"],
  [2907, "Maximum Profitable Triplets With Increasing Prices I", "medium"],
  [2913, "Subarrays Distinct Element Sum of Squares I", "easy"],
  [2916, "Subarrays Distinct Element Sum of Squares II", "hard"],
  [2921, "Maximum Profitable Triplets With Increasing Prices II", "hard"],
  [2926, "Maximum Balanced Subsequence Sum", "hard"],
  [2940, "Find Building Where Alice and Bob Can Meet", "hard"],
  [3072, "Distribute Elements Into Two Arrays II", "hard"],
  [3109, "Find the Index of Permutation", "medium"],
  [3117, "Minimum Sum of Values by Dividing Array", "hard"],
  [3161, "Block Placement Queries", "hard"],
  [3165, "Maximum Sum of Subsequence With Non-adjacent Elements", "hard"],
  [3171, "Find Subarray With Bitwise OR Closest to K", "hard"],
  [3187, "Peaks in Array", "hard"],
  [3209, "Number of Subarrays With AND Value of K", "hard"],
  [3291, "Minimum Number of Valid Strings to Form Target I", "medium"],
  [3292, "Minimum Number of Valid Strings to Form Target II", "hard"],
  [3380, "Maximum Area Rectangle With Point Constraints I", "medium"],
  [3382, "Maximum Area Rectangle With Point Constraints II", "hard"],
  [3410, "Maximize Subarray Sum After Removing All Occurrences of One Element", "hard"],
  [3420, "Count Non-Decreasing Subarrays After K Operations", "hard"],
  [3454, "Separate Squares II", "hard"],
  [3477, "Fruits Into Baskets II", "easy"],
  [3479, "Fruits Into Baskets III", "medium"],
  [3480, "Maximize Subarrays After Removing One Conflicting Pair", "hard"],
  [3501, "Maximize Active Section with Trade II", "hard"],
  [3515, "Shortest Path in a Weighted Tree", "hard"],
  [3520, "Minimum Threshold for Inversion Pairs Count", "medium"],
  [3525, "Find X Value of Array II", "hard"],
  [3569, "Maximize Count of Distinct Primes After Split", "hard"],
  [3605, "Minimum Stability Factor of Array", "hard"],
  [3624, "Number of Integers With Popcount-Depth Equal to K II", "hard"],
  [3691, "Maximum Total Subarray Value II", "hard"],
  [3719, "Longest Balanced Subarray I", "medium"],
  [3721, "Longest Balanced Subarray II", "hard"],
  [3737, "Count Subarrays With Majority Element I", "medium"],
  [3739, "Count Subarrays With Majority Element II", "hard"],
  [3762, "Minimum Operations to Equalize Subarrays", "hard"],
  [3768, "Minimum Inversion Count in Subarrays of Fixed Length", "hard"],
  [3777, "Minimum Deletions to Make Alternating Substring", "hard"],
  [3841, "Palindromic Path Queries in a Tree", "hard"],
  [3901, "Good Subsequence Queries", "hard"],
  [3915, "Maximum Sum of Alternating Subsequence With Distance at Least K", "hard"],
  [3930, "Power Update After K-th Largest Insertion II", "hard"],
  [3935, "Power Update After K-th Largest Insertion I", "medium"],
  [4011, "Count Subarrays With Even Odd Ratio I", "medium"],
  [4013, "Count Subarrays With Even Odd Ratio II", "hard"],
  [4017, "Peaks in Array II", "hard"],
  [4033, "Valid K-Unique Subarrays I", "hard"],
  [4042, "Valid K-Unique Subarrays II", "hard"],
  [4051, "Count Subarrays with Distant Sums", "hard"],
  [4055, "Count Shadow Pairs II", "hard"],
];
const SEGMENT_TREE_IDS = new Set(SEGMENT_TREE_ROSTER_RAW.map(([id]) => id));
const TOPOLOGICAL_SORT_TAG = { key: "topological-sort", vi: "Topological Sort", en: "Topological Sort" };
// Full requested study roster. Built problems receive the tag; unbuilt ones
// remain in the roster so the catalog can render them as dimmed placeholders.
const TOPOLOGICAL_SORT_ROSTER_RAW = [
  [207, "Course Schedule", "medium"],
  [210, "Course Schedule II", "medium"],
  [269, "Alien Dictionary", "hard"],
  [310, "Minimum Height Trees", "medium"],
  [329, "Longest Increasing Path in a Matrix", "hard"],
  [444, "Sequence Reconstruction", "medium"],
  [631, "Design Excel Sum Formula", "hard"],
  [802, "Find Eventual Safe States", "medium"],
  [851, "Loud and Rich", "medium"],
  [913, "Cat and Mouse", "hard"],
  [1059, "All Paths from Source Lead to Destination", "medium"],
  [1136, "Parallel Courses", "medium"],
  [1203, "Sort Items by Groups Respecting Dependencies", "hard"],
  [1245, "Tree Diameter", "medium"],
  [1462, "Course Schedule IV", "medium"],
  [1591, "Strange Printer II", "hard"],
  [1632, "Rank Transform of a Matrix", "hard"],
  [1728, "Cat and Mouse II", "hard"],
  [1786, "Number of Restricted Paths From First to Last Node", "medium"],
  [1857, "Largest Color Value in a Directed Graph", "hard"],
  [1916, "Count Ways to Build Rooms in an Ant Colony", "hard"],
  [1976, "Number of Ways to Arrive at Destination", "medium"],
  [2050, "Parallel Courses III", "hard"],
  [2115, "Find All Possible Recipes from Given Supplies", "medium"],
  [2127, "Maximum Employees to Be Invited to a Meeting", "hard"],
  [2192, "All Ancestors of a Node in a Directed Acyclic Graph", "medium"],
  [2204, "Distance to a Cycle in Undirected Graph", "hard"],
  [2246, "Longest Path With Different Adjacent Characters", "hard"],
  [2328, "Number of Increasing Paths in a Grid", "hard"],
  [2360, "Longest Cycle in a Graph", "hard"],
  [2371, "Minimize Maximum Value in a Grid", "hard"],
  [2392, "Build a Matrix With Conditions", "hard"],
  [2603, "Collect Coins in a Tree", "hard"],
  [2876, "Count Visited Nodes in a Directed Graph", "hard"],
  [3383, "Minimum Runes to Add to Cast Spell", "hard"],
  [3435, "Frequencies of Shortest Supersequences", "hard"],
  [3481, "Apply Substitutions", "medium"],
  [3530, "Maximum Profit from Valid Topological Order in DAG", "hard"],
  [3620, "Network Recovery Pathways", "hard"],
  [3812, "Minimum Edge Toggles on a Tree", "hard"],
];
const TOPOLOGICAL_SORT_IDS = new Set(TOPOLOGICAL_SORT_ROSTER_RAW.map(([id]) => id));
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
const KNAPSACK_TAG = { key: "0-1-knapsack", vi: "Balo 0/1", en: "0/1 Knapsack" };
// Problems with a built visualization that belong to the 0/1 Knapsack pattern.
// Add more IDs here as new visualizations are built.
const KNAPSACK_IDS = new Set([
  // Nhóm A — kinh điển
  416,  // Partition Equal Subset Sum
  494,  // Target Sum
  474,  // Ones and Zeroes
  1049, // Last Stone Weight II
  2915, // Length of the Longest Subsequence That Sums to Target
  2291, // Maximum Profit From Trading Stocks
  // Nhóm B — Subset / Counting / Partition
  698,  // Partition to K Equal Sum Subsets
  2518, // Number of Great Partitions
  879,  // Profitable Schemes
  2585, // Number of Ways to Earn Points
  // Nhóm C — biến thể nâng cao
  2218, // Maximum Value of K Coins From Piles
  473,  // Matchsticks to Square
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
      [2812, "Find the Safest Path in a Grid", "medium"],
      [1283, "Find the Smallest Divisor Given a Threshold", "medium"],
      [1482, "Minimum Number of Days to Make m Bouquets", "medium"],
      [1552, "Magnetic Force Between Two Balls", "medium"],
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
      [2846, "Minimum Edge Weight Equilibrium Queries in a Tree", "hard"],
      [1915, "Number of Wonderful Substrings", "medium"],
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

for (const { id } of PREFIX_MAX_ROSTER) {
  const problem = SUPPORTED[id];
  if (!problem) continue;
  const tags = Array.isArray(problem.tags) ? problem.tags : [];
  if (!tags.some(tag => tag && tag.key === PREFIX_MAX_TAG.key)) problem.tags = [...tags, PREFIX_MAX_TAG];
}
CATEGORY_ORDER[PREFIX_MAX_TAG.key] = { order: PREFIX_MAX_ORDER, label: PREFIX_MAX_ORDER_LABEL, guide: PREFIX_MAX_GUIDE };
const PREFIX_MAX_SUBTABS = prefixMaxSubTabs(SUPPORTED);

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

for (const id of KNAPSACK_IDS) {
  const problem = SUPPORTED[id];
  if (!problem) continue;
  const tags = Array.isArray(problem.tags) ? problem.tags : [];
  if (!tags.some((tag) => tag && tag.key === KNAPSACK_TAG.key)) {
    problem.tags = [...tags, KNAPSACK_TAG];
  }
}

for (const id of SEGMENT_TREE_IDS) {
  const problem = SUPPORTED[id];
  if (!problem) continue;
  if (problem.category && problem.category.key === SEGMENT_TREE_TAG.key) continue;
  const tags = Array.isArray(problem.tags) ? problem.tags : [];
  if (!tags.some((tag) => tag && tag.key === SEGMENT_TREE_TAG.key)) {
    problem.tags = [...tags, SEGMENT_TREE_TAG];
  }
}

for (const id of TOPOLOGICAL_SORT_IDS) {
  const problem = SUPPORTED[id];
  if (!problem) continue;
  const tags = Array.isArray(problem.tags) ? problem.tags : [];
  if (!tags.some((tag) => tag && tag.key === TOPOLOGICAL_SORT_TAG.key)) {
    problem.tags = [...tags, TOPOLOGICAL_SORT_TAG];
  }
}

// Keep aliases from splitting one visible catalog label into multiple groups.
// These canonical topic objects keep aliases and translated labels from splitting groups.
for (const problem of Object.values(SUPPORTED)) {
  if (!problem || typeof problem !== "object") continue;
  if (problem.category && ["dp", "dynamic-programming"].includes(problem.category.key)) {
    problem.category = DP_TAG;
  }
  if (problem.category && ["fenwick", "fenwick-tree", "binary-indexed-tree"].includes(problem.category.key)) {
    problem.category = FENWICK_TREE_TAG;
  }
  if (problem.category && ["knapsack", "0-1-knapsack"].includes(problem.category.key)) {
    problem.category = KNAPSACK_TAG;
  }
  if (problem.category && ["frequency", "frequency-count"].includes(problem.category.key)) {
    problem.category = FREQUENCY_COUNT_TAG;
  }
  if (problem.category && problem.category.key === "segment-tree") {
    problem.category = SEGMENT_TREE_TAG;
  }
  if (!Array.isArray(problem.tags)) continue;
  const seenTagKeys = new Set();
  problem.tags = problem.tags
    .map((tag) => {
      if (tag && ["dp", "dynamic-programming"].includes(tag.key)) return DP_TAG;
      if (tag && ["fenwick", "fenwick-tree", "binary-indexed-tree"].includes(tag.key)) return FENWICK_TREE_TAG;
      if (tag && ["knapsack", "0-1-knapsack"].includes(tag.key)) return KNAPSACK_TAG;
      if (tag && ["frequency", "frequency-count"].includes(tag.key)) return FREQUENCY_COUNT_TAG;
      if (tag && tag.key === "segment-tree") return SEGMENT_TREE_TAG;
      if (tag && tag.key === "topological-sort") return TOPOLOGICAL_SORT_TAG;
      return tag;
    })
    .filter((tag) => {
      if (!tag || !tag.key || seenTagKeys.has(tag.key)) return false;
      seenTagKeys.add(tag.key);
      return true;
    });
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

// ─── 0/1 Knapsack learning path ──────────────────────────────────────────────
// 24 problems ordered from the core take/skip recurrence through counting,
// grouped choices, richer partition states, and advanced optimizations.
// Entries whose id is not in SUPPORTED still appear as dimmed catalog chips.
// Format: [id, title, difficulty]
const KNAPSACK_ROSTER_RAW = [
  // Stage 1 — Core one-dimensional take/skip
  [416,  "Partition Equal Subset Sum",                                      "medium"],
  [1049, "Last Stone Weight II",                                             "medium"],
  [494,  "Target Sum",                                                       "medium"],
  [2915, "Length of the Longest Subsequence That Sums to Target",           "medium"],
  // Stage 2 — Counting and extra dimensions
  [474,  "Ones and Zeroes",                                                  "medium"],
  [2787, "Ways to Express an Integer as Sum of Powers",                     "medium"],
  [879,  "Profitable Schemes",                                              "hard"],
  [2518, "Number of Great Partitions",                                      "hard"],
  [2585, "Number of Ways to Earn Points",                                   "hard"],
  // Stage 3 — Bounded and grouped choices
  [1774, "Closest Dessert Cost",                                            "medium"],
  [2291, "Maximum Profit From Trading Stocks",                              "medium"],
  [2218, "Maximum Value of K Coins From Piles",                            "hard"],
  [1981, "Minimize the Difference Between Target and Chosen Elements",      "medium"],
  [3333, "Find the Original Typed String II",                               "hard"],
  // Stage 4 — Richer partition state
  [473,  "Matchsticks to Square",                                           "medium"],
  [698,  "Partition to K Equal Sum Subsets",                                "medium"],
  [805,  "Split Array With Same Average",                                   "hard"],
  [956,  "Tallest Billboard",                                               "hard"],
  // Stage 5 — Advanced optimization
  [2742, "Painting the Walls",                                              "hard"],
  [3082, "Find the Sum of the Power of All Subsequences",                   "hard"],
  [3180, "Maximum Total Reward Using Operations I",                         "medium"],
  [3181, "Maximum Total Reward Using Operations II",                        "hard"],
  [1755, "Closest Subsequence Sum",                                         "hard"],
  [2035, "Partition Array Into Two Arrays to Minimize Sum Difference",      "hard"],
];

const KNAPSACK_ORDER_LABEL = {
  vi: "Lộ trình 0/1 Knapsack: nền tảng → đếm & nhiều chiều → lựa chọn theo nhóm → partition → tối ưu nâng cao",
  en: "0/1 Knapsack path: foundations → counting & dimensions → grouped choices → partition → advanced optimization",
};

const KNAPSACK_GUIDE = {
  vi: {
    intro:
      "Học theo 24 bài dưới đây. Trước tiên hãy thuộc invariant cốt lõi: mỗi món chỉ được dùng tối đa một lần, nên khi tối ưu DP theo capacity phải duyệt capacity từ lớn xuống nhỏ. Sau đó mới mở rộng state, số cách chọn và kỹ thuật tối ưu.",
    patterns: [
      { id: 416, name: "Partition Equal Subset Sum", pattern: "Boolean subset sum · nền tảng" },
      { id: 1049, name: "Last Stone Weight II", pattern: "Subset gần total / 2 nhất" },
      { id: 494, name: "Target Sum", pattern: "Biến đổi dấu ± thành đếm subset" },
      { id: 2915, name: "Longest Subsequence That Sums to Target", pattern: "Exact sum · tối đa số món" },
      { id: 474, name: "Ones and Zeroes", pattern: "0/1 Knapsack hai capacity" },
      { id: 2787, name: "Ways to Express an Integer as Sum of Powers", pattern: "Đếm subset với item sinh trước" },
      { id: 879, name: "Profitable Schemes", pattern: "Hai chiều · profit được cap" },
      { id: 2518, name: "Number of Great Partitions", pattern: "Đếm phần bù của partition xấu" },
      { id: 2585, name: "Number of Ways to Earn Points", pattern: "Bounded knapsack · đếm cách" },
      { id: 1774, name: "Closest Dessert Cost", pattern: "Mỗi item dùng 0/1/2 lần" },
      { id: 2291, name: "Maximum Profit From Trading Stocks", pattern: "Budget → tối đa profit" },
      { id: 2218, name: "Maximum Value of K Coins From Piles", pattern: "Group knapsack · chọn prefix" },
      { id: 1981, name: "Minimize the Difference", pattern: "Chọn đúng một item mỗi hàng" },
      { id: 3333, name: "Find the Original Typed String II", pattern: "Bounded choices + prefix sum" },
      { id: 473, name: "Matchsticks to Square", pattern: "Partition thành 4 bucket" },
      { id: 698, name: "Partition to K Equal Sum Subsets", pattern: "Partition k bucket · memo/bitmask" },
      { id: 805, name: "Split Array With Same Average", pattern: "Subset theo cả count và sum" },
      { id: 956, name: "Tallest Billboard", pattern: "DP theo hiệu hai phía" },
      { id: 2742, name: "Painting the Walls", pattern: "Đổi bài toán thành capacity được bù" },
      { id: 3082, name: "Sum of the Power of All Subsequences", pattern: "Contribution DP + combinatorics" },
      { id: 3180, name: "Maximum Total Reward I", pattern: "Reachability có điều kiện" },
      { id: 3181, name: "Maximum Total Reward II", pattern: "Bitset-optimized reachability" },
      { id: 1755, name: "Closest Subsequence Sum", pattern: "Meet-in-the-middle subset sums" },
      { id: 2035, name: "Partition Array Into Two Arrays", pattern: "Meet-in-the-middle theo cardinality" },
    ],
    stages: [
      {
        title: "Giai đoạn 1 — Thuộc công thức Take / Skip",
        description: "Tự viết được dp[s] dạng boolean, max và count; giải thích vì sao vòng capacity phải chạy giảm dần để không dùng lại cùng một item.",
        problems: [416, 1049, 494, 2915],
      },
      {
        title: "Giai đoạn 2 — Đếm cách và mở rộng chiều",
        description: "Thêm capacity thứ hai, state profit bị cap và số lượng mỗi loại; phân biệt boolean DP, optimization DP và counting DP.",
        problems: [474, 2787, 879, 2518, 2585],
      },
      {
        title: "Giai đoạn 3 — Bounded và Group Knapsack",
        description: "Mỗi nhóm có nhiều lựa chọn nhưng chỉ được chốt một phương án: 0/1/2 món, một giao dịch, một prefix hoặc đúng một phần tử mỗi hàng.",
        problems: [1774, 2291, 2218, 1981, 3333],
      },
      {
        title: "Giai đoạn 4 — Partition với state giàu hơn",
        description: "State không còn chỉ là một tổng: theo dõi bucket, số phần tử đã chọn hoặc chênh lệch giữa hai phía.",
        problems: [473, 698, 805, 956],
      },
      {
        title: "Giai đoạn 5 — Tối ưu hóa nâng cao",
        description: "Học biến đổi capacity, contribution DP, bitset và meet-in-the-middle khi tổng hoặc n vượt giới hạn của DP cổ điển.",
        problems: [2742, 3082, 3180, 3181, 1755, 2035],
      },
    ],
    conclusion:
      "Sau lộ trình này, bạn nên nhận ra bốn câu hỏi trước khi code: item dùng được mấy lần, state cần lưu gì, thứ tự duyệt capacity ra sao, và constraint có buộc dùng bitset hoặc meet-in-the-middle hay không.",
  },
  en: {
    intro:
      "Work through these 24 problems in order. First internalize the core invariant: each item may be used at most once, so a space-optimized capacity loop must run from high to low. Then extend the state, count choices, and learn the major optimizations.",
    patterns: [
      { id: 416, name: "Partition Equal Subset Sum", pattern: "Boolean subset sum · foundation" },
      { id: 1049, name: "Last Stone Weight II", pattern: "Subset closest to total / 2" },
      { id: 494, name: "Target Sum", pattern: "Transform ± signs into subset counting" },
      { id: 2915, name: "Longest Subsequence That Sums to Target", pattern: "Exact sum · maximize item count" },
      { id: 474, name: "Ones and Zeroes", pattern: "Two-capacity 0/1 Knapsack" },
      { id: 2787, name: "Ways to Express an Integer as Sum of Powers", pattern: "Count subsets of generated items" },
      { id: 879, name: "Profitable Schemes", pattern: "Two dimensions · capped profit" },
      { id: 2518, name: "Number of Great Partitions", pattern: "Count the complement of bad partitions" },
      { id: 2585, name: "Number of Ways to Earn Points", pattern: "Bounded knapsack · count ways" },
      { id: 1774, name: "Closest Dessert Cost", pattern: "Use each item zero, one, or two times" },
      { id: 2291, name: "Maximum Profit From Trading Stocks", pattern: "Budget → maximize profit" },
      { id: 2218, name: "Maximum Value of K Coins From Piles", pattern: "Group knapsack · choose a prefix" },
      { id: 1981, name: "Minimize the Difference", pattern: "Choose exactly one item per row" },
      { id: 3333, name: "Find the Original Typed String II", pattern: "Bounded choices + prefix sums" },
      { id: 473, name: "Matchsticks to Square", pattern: "Partition into four buckets" },
      { id: 698, name: "Partition to K Equal Sum Subsets", pattern: "K buckets · memo/bitmask" },
      { id: 805, name: "Split Array With Same Average", pattern: "Subset by both count and sum" },
      { id: 956, name: "Tallest Billboard", pattern: "DP on the difference between sides" },
      { id: 2742, name: "Painting the Walls", pattern: "Transform into compensated capacity" },
      { id: 3082, name: "Sum of the Power of All Subsequences", pattern: "Contribution DP + combinatorics" },
      { id: 3180, name: "Maximum Total Reward I", pattern: "Conditional reachability" },
      { id: 3181, name: "Maximum Total Reward II", pattern: "Bitset-optimized reachability" },
      { id: 1755, name: "Closest Subsequence Sum", pattern: "Meet-in-the-middle subset sums" },
      { id: 2035, name: "Partition Array Into Two Arrays", pattern: "Meet-in-the-middle by cardinality" },
    ],
    stages: [
      {
        title: "Stage 1 — Master the Take / Skip recurrence",
        description: "Write boolean, maximum, and counting forms of dp[s], and explain why capacity runs backward to avoid reusing the current item.",
        problems: [416, 1049, 494, 2915],
      },
      {
        title: "Stage 2 — Count ways and add dimensions",
        description: "Add a second capacity, capped profit, and bounded quantities; distinguish feasibility, optimization, and counting DP.",
        problems: [474, 2787, 879, 2518, 2585],
      },
      {
        title: "Stage 3 — Bounded and Group Knapsack",
        description: "A group offers several choices but only one decision is committed: zero/one/two items, one trade, one prefix, or one value per row.",
        problems: [1774, 2291, 2218, 1981, 3333],
      },
      {
        title: "Stage 4 — Partition with richer state",
        description: "The state is no longer only a sum: track buckets, selected cardinality, or the difference between two sides.",
        problems: [473, 698, 805, 956],
      },
      {
        title: "Stage 5 — Advanced optimization",
        description: "Learn capacity transformations, contribution DP, bitsets, and meet-in-the-middle when classic pseudo-polynomial DP no longer fits.",
        problems: [2742, 3082, 3180, 3181, 1755, 2035],
      },
    ],
    conclusion:
      "After this path, ask four questions before coding: how often may each item be used, what must the state remember, which direction should capacity iterate, and do the constraints require a bitset or meet-in-the-middle approach?",
  },
};

// Single "All" tab — same shape as COMPANY_SUBTABS so server.js / app-core.js
// can reuse the same subTabs rendering path.
const KNAPSACK_SUBTABS = [
  {
    key: "all",
    vi: "Tất cả",
    en: "All",
    roster: KNAPSACK_ROSTER_RAW.map(([id, title, difficulty]) => ({
      id,
      title,
      difficulty,
      available: Boolean(SUPPORTED[id]),
    })),
  },
];

const TOPOLOGICAL_SORT_SUBTABS = [
  {
    key: "all",
    vi: "Tất cả",
    en: "All",
    roster: TOPOLOGICAL_SORT_ROSTER_RAW.map(([id, title, difficulty]) => ({
      id,
      title,
      difficulty,
      available: Boolean(SUPPORTED[id]),
    })),
  },
];

const SEGMENT_TREE_SUBTABS = [
  {
    key: "all",
    vi: "Tất cả",
    en: "All",
    roster: SEGMENT_TREE_ROSTER_RAW.map(([id, title, difficulty]) => ({
      id,
      title,
      difficulty,
      available: Boolean(SUPPORTED[id]),
    })),
  },
];

module.exports = {
  SUPPORTED,
  CATEGORY_ORDER,
  PREFIX_MAX_TAG,
  PREFIX_MAX_SUBTABS,
  COMPANY_SUBTABS,
  COMPANY_TAG,
  KNAPSACK_SUBTABS,
  KNAPSACK_TAG,
  KNAPSACK_ORDER_LABEL,
  KNAPSACK_GUIDE,
  SEGMENT_TREE_SUBTABS,
  SEGMENT_TREE_TAG,
  TOPOLOGICAL_SORT_SUBTABS,
  TOPOLOGICAL_SORT_TAG,
};
