"use strict";

const {
  bi,
  fail,
  parsePlainParams,
  parseInteger,
} = require("./hard-viz-shared");

const { buildCommon1923 } = require("./common-subpath-1923-runtime");

const PROBLEM_ID = 1923;
const DEFAULT_N = 5;
const DEFAULT_INPUT = "[[0,1,2,3,4],[2,3,4],[4,0,1,2,3]]";
const MAX_PATHS = 100000;
const MAX_PATH_LENGTH = 100000;
const MAX_TOTAL_CITIES = 100000;
const MAX_WINDOW_SAMPLES = 8;
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const LONGEST_COMMON_SUBPATH_1923_SOURCE = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def longestCommonSubpath(self, n: int, paths: List[List[int]]) -> int:",
  "        ordered = sorted(paths, key=len)",
  "        base, mod1, mod2 = 100003, 1000000007, 1000000009",
  "        limit = len(ordered[0])",
  "        power1 = [1] * (limit + 1)",
  "        power2 = [1] * (limit + 1)",
  "        for length in range(1, limit + 1):",
  "            power1[length] = power1[length - 1] * base % mod1",
  "            power2[length] = power2[length - 1] * base % mod2",
  "",
  "        prefixes = []",
  "        for path in ordered:",
  "            first = [0]",
  "            second = [0]",
  "            for city in path:",
  "                value = city + 1",
  "                first.append((first[-1] * base + value) % mod1)",
  "                second.append((second[-1] * base + value) % mod2)",
  "            prefixes.append((first, second))",
  "",
  "        def hash_at(path_index: int, start: int, length: int):",
  "            first, second = prefixes[path_index]",
  "            end = start + length",
  "            hash1 = (first[end] - first[start] * power1[length]) % mod1",
  "            hash2 = (second[end] - second[start] * power2[length]) % mod2",
  "            return hash1, hash2",
  "",
  "        def exists(length: int) -> bool:",
  "            if length == 0:",
  "                return True",
  "            starts_by_hash = {}",
  "            for start in range(len(ordered[0]) - length + 1):",
  "                key = hash_at(0, start, length)",
  "                starts_by_hash.setdefault(key, []).append(start)",
  "            common = set(starts_by_hash)",
  "",
  "            for path_index in range(1, len(ordered)):",
  "                present = set()",
  "                for start in range(len(ordered[path_index]) - length + 1):",
  "                    key = hash_at(path_index, start, length)",
  "                    if key in common:",
  "                        present.add(key)",
  "                common &= present",
  "                if not common:",
  "                    return False",
  "",
  "            # Hashes filter candidates; slices below make the result exact.",
  "            for key in sorted(common):",
  "                for representative_start in starts_by_hash[key]:",
  "                    representative = ordered[0][representative_start:representative_start + length]",
  "                    exact_everywhere = True",
  "                    for path_index in range(1, len(ordered)):",
  "                        found = False",
  "                        for start in range(len(ordered[path_index]) - length + 1):",
  "                            same_hash = hash_at(path_index, start, length) == key",
  "                            same_slice = same_hash and ordered[path_index][start:start + length] == representative",
  "                            if same_hash and same_slice:",
  "                                found = True",
  "                                break",
  "                        if not found:",
  "                            exact_everywhere = False",
  "                            break",
  "                    if exact_everywhere:",
  "                        return True",
  "            return False",
  "",
  "        low, high = 0, limit",
  "        while low < high:",
  "            middle = (low + high + 1) // 2",
  "            if exists(middle):",
  "                low = middle",
  "            else:",
  "                high = middle - 1",
  "        return low",
]);

function parseLongestCommonSubpath1923(input, params) {
  const parsedParams = parsePlainParams(params, PROBLEM_ID);
  const n = parseInteger(hasOwn(parsedParams, "n") ? parsedParams.n : DEFAULT_N, {
    problemId: PROBLEM_ID,
    name: "n",
    min: 1,
    max: 100_000,
  });

  if (typeof input !== "string") {
    fail(PROBLEM_ID, TypeError, "input phải là chuỗi JSON", "input must be a JSON string");
  }
  const text = input.trim();
  if (!text) {
    fail(PROBLEM_ID, RangeError, "input JSON không được rỗng", "the JSON input must not be empty");
  }

  let decoded;
  try {
    decoded = JSON.parse(text);
  } catch (_error) {
    fail(PROBLEM_ID, TypeError, "paths không phải JSON hợp lệ", "paths is not valid JSON");
  }
  if (!Array.isArray(decoded)) {
    fail(PROBLEM_ID, TypeError, "paths phải là ma trận JSON", "paths must be a JSON matrix");
  }
  if (decoded.length < 2 || decoded.length > MAX_PATHS) {
    fail(
      PROBLEM_ID,
      RangeError,
      `paths phải có 2..${MAX_PATHS} đường đi`,
      `paths must contain 2..${MAX_PATHS} paths`,
    );
  }

  let totalCities = 0;
  const paths = decoded.map((path, pathIndex) => {
    if (!Array.isArray(path)) {
      fail(
        PROBLEM_ID,
        TypeError,
        `paths[${pathIndex}] phải là mảng`,
        `paths[${pathIndex}] must be an array`,
      );
    }
    if (path.length < 1 || path.length > MAX_PATH_LENGTH) {
      fail(
        PROBLEM_ID,
        RangeError,
        `paths[${pathIndex}] phải có 1..${MAX_PATH_LENGTH} thành phố`,
        `paths[${pathIndex}] must contain 1..${MAX_PATH_LENGTH} cities`,
      );
    }
    totalCities += path.length;
    return path.map((city, cityIndex) => {
      if (!Number.isSafeInteger(city)) {
        fail(
          PROBLEM_ID,
          TypeError,
          `paths[${pathIndex}][${cityIndex}] phải là số nguyên an toàn`,
          `paths[${pathIndex}][${cityIndex}] must be a safe integer`,
        );
      }
      if (city < 0 || city >= n) {
        fail(
          PROBLEM_ID,
          RangeError,
          `thành phố ${city} phải thuộc [0, ${n - 1}]`,
          `city ${city} must be in [0, ${n - 1}]`,
        );
      }
      return city;
    });
  });

  if (totalCities > MAX_TOTAL_CITIES) {
    fail(
      PROBLEM_ID,
      RangeError,
      `tổng độ dài paths không được vượt ${MAX_TOTAL_CITIES}`,
      `the total paths length must not exceed ${MAX_TOTAL_CITIES}`,
    );
  }

  return { n, paths };
}

function buildLongestCommonSubpath1923(input, params) {
  return buildCommon1923(parseLongestCommonSubpath1923(input, params), LONGEST_COMMON_SUBPATH_1923_SOURCE);
}

module.exports = {
  1923: {
    id: 1923,
    difficulty: "hard",
    slug: "longest-common-subpath",
    category: { key: "string", ...bi("Chuỗi / Rolling Hash", "String / Rolling Hash") },
    tags: [
      { key: "binary-search", ...bi("Tìm kiếm nhị phân", "Binary Search") },
      { key: "rolling-hash", ...bi("Băm cuộn", "Rolling Hash") },
      { key: "hash-table", ...bi("Bảng băm", "Hash Table") },
      { key: "array", ...bi("Mảng", "Array") },
    ],
    title: bi("Đường đi con chung dài nhất", "Longest Common Subpath"),
    titleVi: bi(
      "Binary search độ dài với double rolling hash",
      "Binary-search the length with double rolling hash",
    ),
    statement: bi(
      "Cho n thành phố và nhiều đường đi. Tìm độ dài lớn nhất của một dãy thành phố liên tiếp xuất hiện trong mọi đường đi.",
      "Given n cities and several paths, find the maximum length of a contiguous city sequence appearing in every path.",
    ),
    defaultInput: DEFAULT_INPUT,
    defaults: { input: DEFAULT_INPUT, n: DEFAULT_N },
    expectedAnswer: 2,
    inputKind: "string",
    inputLabel: bi(
      "paths · ma trận JSON",
      "paths · JSON matrix",
    ),
    maxInput: MAX_PATH_LENGTH,
    visualizationLimits: {
      maxPaths: MAX_PATHS,
      maxPathLength: MAX_PATH_LENGTH,
      maxTotalCities: MAX_TOTAL_CITIES,
      detailedTotalCities: 24,
      maxWindowSamplesPerFrame: MAX_WINDOW_SAMPLES,
      note: bi(
        "Debug đủ mọi dòng khi tổng độ dài ≤ 24; dữ liệu lớn gộp vòng lặp và giữ các dòng quyết định.",
        "Every line is traced for total length ≤ 24; larger inputs summarize loops and retain decision lines.",
      ),
    },
    extraParams: [
      {
        key: "n",
        type: "number",
        min: 1,
        max: 100_000,
        default: DEFAULT_N,
        label: bi("n (số thành phố)", "n (number of cities)"),
      },
    ],
    approach: [
      bi(
        "Sắp các path theo độ dài và binary search đáp án trong [0, độ dài path ngắn nhất] bằng upper mid.",
        "Sort paths by length and binary-search the answer in [0, shortest path length] with an upper midpoint.",
      ),
      bi(
        "Với mỗi độ dài thử, tính cặp rolling hash cho mọi cửa sổ rồi giao tập key qua từng path.",
        "For each candidate length, compute a pair of rolling hashes for every window and intersect keys path by path.",
      ),
      bi(
        "Mỗi key giữ đại diện mảng thật; một đại diện chỉ sống sót khi có cửa sổ bằng exact trên path kế tiếp, nên va chạm hash không thể tạo đáp án sai.",
        "Each key retains actual-array representatives; a representative survives only an exact window match in the next path, so hash collisions cannot produce a false answer.",
      ),
    ],
    complexity: {
      time: "Expected O(S log L)",
      space: "O(S)",
      note: bi(
        "S là tổng độ dài paths và L là path ngắn nhất. Exact verification chỉ chạy cho key trùng; trường hợp va chạm đối kháng có thể tốn thêm O(S·L·log L).",
        "S is the total path length and L is the shortest path. Exact verification runs only for matching keys; adversarial collisions can add O(S·L·log L) work.",
      ),
    },
    debugMode: "line-by-line",
    code: LONGEST_COMMON_SUBPATH_1923_SOURCE,
    liveArgs: (input, params) => {
      const parsed = parseLongestCommonSubpath1923(input, params);
      return [parsed.n, parsed.paths.map((path) => [...path])];
    },
    builder: buildLongestCommonSubpath1923,
  },
};
