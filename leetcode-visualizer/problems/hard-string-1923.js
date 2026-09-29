"use strict";

const {
  bi,
  fail,
  parsePlainParams,
  parseInteger,
  createTracer,
} = require("./hard-viz-shared");

const PROBLEM_ID = 1923;
const DEFAULT_N = 5;
const DEFAULT_INPUT = "[[0,1,2,3,4],[2,3,4],[4,0,1,2,3]]";
const MAX_PATHS = 8;
const MAX_PATH_LENGTH = 120;
const MAX_TOTAL_CITIES = 480;
const MAX_TRACE_STEPS = 96;
const MAX_WINDOW_SAMPLES = 12;
const BASE = 100_003n;
const MOD1 = 1_000_000_007n;
const MOD2 = 1_000_000_009n;

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const range = (start, end) => end < start
  ? []
  : Array.from({ length: end - start + 1 }, (_, offset) => start + offset);

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
  "            for key in common:",
  "                for representative_start in starts_by_hash[key]:",
  "                    representative = ordered[0][representative_start:representative_start + length]",
  "                    exact_everywhere = True",
  "                    for path_index in range(1, len(ordered)):",
  "                        found = False",
  "                        for start in range(len(ordered[path_index]) - length + 1):",
  "                            same_hash = hash_at(path_index, start, length) == key",
  "                            same_slice = ordered[path_index][start:start + length] == representative",
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

const LONGEST_COMMON_SUBPATH_1923_PHASES = Object.freeze([
  bi("Chuẩn bị prefix hash", "Prepare prefix hashes"),
  bi("Chọn độ dài bằng binary search", "Choose a length by binary search"),
  bi("Tạo ứng viên từ path ngắn nhất", "Seed candidates from the shortest path"),
  bi("Giao hash và xác minh cửa sổ", "Intersect hashes and verify windows"),
  bi("Cập nhật biên tìm kiếm", "Update search bounds"),
  bi("Hoàn tất", "Complete"),
]);

function sourceLine(fragment) {
  const index = LONGEST_COMMON_SUBPATH_1923_SOURCE.findIndex((line) => line.includes(fragment));
  if (index < 0) throw new Error(`#${PROBLEM_ID}: missing Python source line: ${fragment}`);
  return index + 1;
}

const PYTHON_LINES = Object.freeze({
  prepare: [sourceLine("ordered = sorted"), sourceLine("power1 ="), sourceLine("prefixes = []")],
  choose: [sourceLine("low, high ="), sourceLine("middle =")],
  seed: [sourceLine("starts_by_hash ="), sourceLine("starts_by_hash.setdefault")],
  intersect: [sourceLine("for path_index in range(1"), sourceLine("common &= present")],
  verify: [sourceLine("Hashes filter candidates"), sourceLine("same_hash ="), sourceLine("same_slice =")],
  update: [sourceLine("if exists(middle)"), sourceLine("low = middle"), sourceLine("high = middle - 1")],
  finish: [sourceLine("return low")],
});

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

function sameRepresentativeAt(representative, path, start) {
  if (start + representative.length > path.length) return false;
  for (let offset = 0; offset < representative.length; offset += 1) {
    if (representative[offset] !== path[start + offset]) return false;
  }
  return true;
}

function representativeCount(candidateMap) {
  let count = 0;
  for (const bucket of candidateMap.values()) count += bucket.length;
  return count;
}

function firstRepresentative(candidateMap) {
  for (const bucket of candidateMap.values()) {
    if (bucket.length) return bucket[0];
  }
  return null;
}

function createHashContext(orderedPaths, limit) {
  const power1 = Array(limit + 1).fill(1n);
  const power2 = Array(limit + 1).fill(1n);
  for (let length = 1; length <= limit; length += 1) {
    power1[length] = (power1[length - 1] * BASE) % MOD1;
    power2[length] = (power2[length - 1] * BASE) % MOD2;
  }

  const prefixes = orderedPaths.map(({ values }) => {
    const first = Array(values.length + 1).fill(0n);
    const second = Array(values.length + 1).fill(0n);
    for (let index = 0; index < values.length; index += 1) {
      const encoded = BigInt(values[index] + 1);
      first[index + 1] = (first[index] * BASE + encoded) % MOD1;
      second[index + 1] = (second[index] * BASE + encoded) % MOD2;
    }
    return { first, second };
  });

  function hashComponent(prefix, powers, modulus, start, length) {
    const end = start + length;
    let result = (prefix[end] - (prefix[start] * powers[length]) % modulus) % modulus;
    if (result < 0n) result += modulus;
    return result;
  }

  function keyAt(pathPosition, start, length) {
    const { first, second } = prefixes[pathPosition];
    const hash1 = hashComponent(first, power1, MOD1, start, length);
    const hash2 = hashComponent(second, power2, MOD2, start, length);
    return `${hash1.toString()}:${hash2.toString()}`;
  }

  return { keyAt };
}

function chooseWindowSamples(records) {
  const chosen = [];
  const seen = new Set();
  const priorities = [
    records.filter((record) => record.verified),
    records.filter((record) => record.hashCandidate),
    records,
  ];
  for (const group of priorities) {
    for (const record of group) {
      if (seen.has(record.start)) continue;
      seen.add(record.start);
      chosen.push(record);
      if (chosen.length === MAX_WINDOW_SAMPLES) return chosen;
    }
  }
  return chosen;
}

function buildLongestCommonSubpath1923(input, params) {
  const { n, paths } = parseLongestCommonSubpath1923(input, params);
  const orderedPaths = paths
    .map((values, originalIndex) => ({ values, originalIndex }))
    .sort((left, right) => left.values.length - right.values.length
      || left.originalIndex - right.originalIndex);
  const shortestLength = orderedPaths[0].values.length;
  const hashes = createHashContext(orderedPaths, shortestLength);
  const attempts = [];

  const tracer = createTracer({
    problemId: PROBLEM_ID,
    source: LONGEST_COMMON_SUBPATH_1923_SOURCE,
    phases: LONGEST_COMMON_SUBPATH_1923_PHASES,
    maxSteps: MAX_TRACE_STEPS,
    baseArray: orderedPaths[0].values,
    legend: [
      { label: bi("Cửa sổ đang xét", "Active window"), state: "active" },
      { label: bi("Trùng cặp hash", "Double-hash candidate"), state: "candidate" },
      { label: bi("Đã xác minh bằng mảng thật", "Verified against actual values"), state: "updated" },
      { label: bi("Ứng viên còn sống", "Surviving candidate"), state: "success" },
      { label: bi("Bị loại", "Rejected"), state: "danger" },
    ],
  });

  function attemptTable(current = null) {
    const rows = attempts.map((attempt, index) => ({
      label: bi(`Lần thử ${index + 1}`, `Probe ${index + 1}`),
      state: attempt.common ? "success" : "danger",
      cells: [
        attempt.low,
        attempt.mid,
        attempt.high,
        attempt.candidates,
        {
          value: attempt.common ? bi("có", "yes") : bi("không", "no"),
          state: attempt.common ? "success" : "danger",
        },
        `[${attempt.nextLow}, ${attempt.nextHigh}]`,
      ],
    }));
    if (current) {
      rows.push({
        label: bi(`Lần thử ${attempts.length + 1}`, `Probe ${attempts.length + 1}`),
        state: "active",
        cells: [
          current.low,
          current.mid,
          current.high,
          current.candidates,
          { value: bi("đang xét", "checking"), state: "active" },
          "—",
        ],
      });
    }
    return {
      title: bi("Các lần thử binary search", "Binary-search probes"),
      columns: [
        bi("low", "low"),
        bi("mid", "mid"),
        bi("high", "high"),
        bi("ứng viên", "candidates"),
        bi("tồn tại?", "exists?"),
        bi("biên kế", "next bounds"),
      ],
      rows,
    };
  }

  function windowText(path, record, length) {
    const values = path.slice(record.start, record.start + length);
    const shown = values.slice(0, 10).join(",");
    const suffix = values.length > 10 ? ",…" : "";
    return `[${shown}${suffix}] · h=(${record.key.replace(":", ", ")})`;
  }

  function emitTrace({
    phaseIndex,
    codeLines,
    title,
    note,
    action,
    formula,
    bounds,
    event = null,
    currentRow = null,
    final = false,
    answer = null,
  }) {
    const activePath = event
      ? orderedPaths[event.pathPosition]
      : orderedPaths[0];
    const records = event ? event.records : [];
    const samples = chooseWindowSamples(records);
    if (records.length > samples.length) tracer.truncate();
    const focus = samples.find((record) => record.verified)
      || samples.find((record) => record.hashCandidate)
      || samples[0]
      || null;
    const focusLength = event ? event.length : 0;
    const candidateSequence = samples.length
      ? samples.map((record) => ({
        label: bi(
          `Cửa sổ [${record.start},${record.end}]`,
          `Window [${record.start},${record.end}]`,
        ),
        value: windowText(activePath.values, record, focusLength),
        state: record.verified ? "success" : record.hashCandidate ? "candidate" : "muted",
      }))
      : [{
        label: bi("Chưa có cửa sổ ứng viên", "No candidate window yet"),
        value: "—",
        state: "muted",
      }];

    const intersectionItems = event
      ? [
        {
          label: bi("Path đang giao", "Path being intersected"),
          value: `paths[${activePath.originalIndex}]`,
          state: "active",
        },
        {
          label: bi("Số cửa sổ đã quét", "Windows scanned"),
          value: event.records.length,
          state: "default",
        },
        {
          label: bi("Cặp hash trước giao", "Double-hash keys before"),
          value: event.keysBefore,
          state: "candidate",
        },
        {
          label: bi("Cặp hash sau giao", "Double-hash keys after"),
          value: event.keysAfter,
          state: event.keysAfter ? "updated" : "danger",
        },
        {
          label: bi("Ứng viên exact còn lại", "Exact representatives left"),
          value: event.representativesAfter,
          state: event.representativesAfter ? "success" : "danger",
        },
        {
          label: bi("So sánh mảng thật", "Exact array comparisons"),
          value: event.exactChecks,
          state: event.exactChecks ? "updated" : "muted",
        },
        {
          label: bi("Va chạm hash bị loại", "Hash collisions rejected"),
          value: event.collisionRejects,
          state: event.collisionRejects ? "danger" : "muted",
        },
      ]
      : [{
        label: bi("Thứ tự xử lý", "Processing order"),
        value: orderedPaths.map((path) => `paths[${path.originalIndex}]`).join(" → "),
        state: "default",
      }];

    const midValue = bounds.mid === null ? "—" : bounds.mid;
    const survivorValue = event ? event.representativesAfter : "—";
    const activePathValue = event ? activePath.originalIndex : "—";
    const highlight = focus ? range(focus.start, focus.end) : [];
    const verifiedStarts = samples
      .filter((record) => record.verified)
      .map((record) => record.start);

    tracer.emit({
      phaseIndex,
      codeLines,
      title,
      note,
      action,
      formula,
      arr: activePath.values,
      sub: activePath.values.map((_, index) => {
        if (!focus) return "";
        if (index === focus.start && index === focus.end) return "start=end";
        if (index === focus.start) return "start";
        if (index === focus.end) return "end";
        return index > focus.start && index < focus.end ? "window" : "";
      }),
      highlight,
      mark: verifiedStarts,
      vars: [
        { name: "low", value: bounds.low },
        { name: "mid", value: midValue },
        { name: "high", value: bounds.high },
        { name: "path_index", value: activePathValue },
        { name: "common_hashes", value: event ? event.keysAfter : "—" },
        { name: "exact_candidates", value: survivorValue },
      ],
      metrics: [
        { label: bi("Biên thấp", "Low"), value: bounds.low, state: "default" },
        { label: bi("Độ dài thử", "Mid length"), value: midValue, state: "active" },
        { label: bi("Biên cao", "High"), value: bounds.high, state: "default" },
        {
          label: bi("Path hiện tại", "Current path"),
          value: event ? `#${activePath.originalIndex}` : "—",
          state: event ? "info" : "muted",
        },
        {
          label: bi("Giao hash", "Hash intersection"),
          value: event ? event.keysAfter : "—",
          state: event && event.keysAfter ? "candidate" : "muted",
        },
        {
          label: bi("Ứng viên exact", "Exact candidates"),
          value: survivorValue,
          state: event && event.representativesAfter ? "success" : "muted",
        },
        {
          label: bi("Đáp án", "Answer"),
          value: final ? answer : bounds.low,
          state: final ? "answer" : "default",
        },
      ],
      groups: [
        {
          title: bi("Trạng thái binary search", "Binary-search state"),
          items: [
            { label: bi("low", "low"), value: bounds.low, state: "default" },
            { label: bi("mid", "mid"), value: midValue, state: "active" },
            { label: bi("high", "high"), value: bounds.high, state: "default" },
            {
              label: bi("Khoảng còn lại", "Remaining interval"),
              value: `[${bounds.low}, ${bounds.high}]`,
              state: final ? "success" : "updated",
            },
          ],
        },
        {
          title: bi("Giao double hash + kiểm chứng", "Double-hash intersection + verification"),
          items: intersectionItems,
        },
      ],
      table: attemptTable(currentRow),
      sequence: candidateSequence,
      final,
      answer: final ? answer : null,
    });
  }

  function checkLength(length, observer) {
    const firstPath = orderedPaths[0].values;
    let nextRepresentativeId = 0;
    let candidates = new Map();
    const seedRecords = [];

    for (let start = 0; start + length <= firstPath.length; start += 1) {
      const key = hashes.keyAt(0, start, length);
      let bucket = candidates.get(key);
      if (!bucket) {
        bucket = [];
        candidates.set(key, bucket);
      }
      let representative = bucket.find((entry) => sameRepresentativeAt(entry.values, firstPath, start));
      if (!representative) {
        representative = {
          id: nextRepresentativeId,
          key,
          pathPosition: 0,
          pathIndex: orderedPaths[0].originalIndex,
          start,
          values: firstPath.slice(start, start + length),
        };
        nextRepresentativeId += 1;
        bucket.push(representative);
      }
      seedRecords.push({
        start,
        end: start + length - 1,
        key,
        hashCandidate: true,
        verified: true,
      });
    }

    observer({
      kind: "seed",
      length,
      pathPosition: 0,
      records: seedRecords,
      keysBefore: candidates.size,
      keysAfter: candidates.size,
      representativesBefore: representativeCount(candidates),
      representativesAfter: representativeCount(candidates),
      exactChecks: 0,
      collisionRejects: 0,
    });

    for (let pathPosition = 1; pathPosition < orderedPaths.length; pathPosition += 1) {
      const path = orderedPaths[pathPosition].values;
      const keysBefore = candidates.size;
      const representativesBefore = representativeCount(candidates);
      const matched = new Set();
      const records = [];
      let exactChecks = 0;
      let collisionRejects = 0;

      for (let start = 0; start + length <= path.length; start += 1) {
        const key = hashes.keyAt(pathPosition, start, length);
        const bucket = candidates.get(key);
        let verified = false;
        if (bucket) {
          for (const representative of bucket) {
            if (matched.has(representative.id)) continue;
            exactChecks += 1;
            if (sameRepresentativeAt(representative.values, path, start)) {
              matched.add(representative.id);
              verified = true;
            } else {
              collisionRejects += 1;
            }
          }
        }
        records.push({
          start,
          end: start + length - 1,
          key,
          hashCandidate: Boolean(bucket),
          verified,
        });
      }

      const nextCandidates = new Map();
      for (const [key, bucket] of candidates.entries()) {
        const survivors = bucket.filter((representative) => matched.has(representative.id));
        if (survivors.length) nextCandidates.set(key, survivors);
      }
      candidates = nextCandidates;

      observer({
        kind: "intersect",
        length,
        pathPosition,
        records,
        keysBefore,
        keysAfter: candidates.size,
        representativesBefore,
        representativesAfter: representativeCount(candidates),
        exactChecks,
        collisionRejects,
      });

      if (!candidates.size) {
        return { common: false, representative: null, candidateKeys: 0, candidates: 0 };
      }
    }

    return {
      common: candidates.size > 0,
      representative: firstRepresentative(candidates),
      candidateKeys: candidates.size,
      candidates: representativeCount(candidates),
    };
  }

  let low = 0;
  let high = shortestLength;
  let bestRepresentative = null;

  emitTrace({
    phaseIndex: 0,
    codeLines: PYTHON_LINES.prepare,
    title: bi("Sắp path theo độ dài và tạo prefix hash", "Sort paths and build prefix hashes"),
    note: bi(
      `Path ngắn nhất dài ${shortestLength}; mọi đáp án nằm trong [0, ${shortestLength}]. Hai modulus được tính bằng BigInt để không mất chính xác.`,
      `The shortest path has length ${shortestLength}; every answer lies in [0, ${shortestLength}]. Both moduli use BigInt arithmetic without precision loss.`,
    ),
    action: bi("Tiền xử lý hai prefix hash cho mỗi path", "Precompute two prefix hashes for every path"),
    formula: bi(
      "H[i+1] = (H[i] × base + city + 1) mod M",
      "H[i+1] = (H[i] × base + city + 1) mod M",
    ),
    bounds: { low, mid: null, high },
  });

  while (low < high) {
    const probeLow = low;
    const probeHigh = high;
    const mid = Math.floor((probeLow + probeHigh + 1) / 2);
    let lastEvent = null;

    emitTrace({
      phaseIndex: 1,
      codeLines: PYTHON_LINES.choose,
      title: bi(`Thử độ dài mid = ${mid}`, `Probe length mid = ${mid}`),
      note: bi(
        `Dùng upper mid trên [${probeLow}, ${probeHigh}] để tránh vòng lặp khi độ dài ${mid} tồn tại.`,
        `Use the upper midpoint of [${probeLow}, ${probeHigh}] to make progress when length ${mid} exists.`,
      ),
      action: bi("Chọn độ dài ứng viên", "Choose a candidate length"),
      formula: bi(
        `mid = floor((${probeLow} + ${probeHigh} + 1) / 2) = ${mid}`,
        `mid = floor((${probeLow} + ${probeHigh} + 1) / 2) = ${mid}`,
      ),
      bounds: { low: probeLow, mid, high: probeHigh },
      currentRow: { low: probeLow, mid, high: probeHigh, candidates: "—" },
    });

    const result = checkLength(mid, (event) => {
      lastEvent = event;
      const isSeed = event.kind === "seed";
      emitTrace({
        phaseIndex: isSeed ? 2 : 3,
        codeLines: isSeed
          ? PYTHON_LINES.seed
          : [...PYTHON_LINES.intersect, ...PYTHON_LINES.verify],
        title: isSeed
          ? bi(
            `Tạo ${event.representativesAfter} ứng viên exact độ dài ${mid}`,
            `Seed ${event.representativesAfter} exact candidates of length ${mid}`,
          )
          : bi(
            `Giao với paths[${orderedPaths[event.pathPosition].originalIndex}]`,
            `Intersect with paths[${orderedPaths[event.pathPosition].originalIndex}]`,
          ),
        note: isSeed
          ? bi(
            `Path ngắn nhất cho ${event.keysAfter} key double-hash; các cửa sổ trùng nội dung được gộp thành ${event.representativesAfter} đại diện.`,
            `The shortest path yields ${event.keysAfter} double-hash keys; equal windows are deduplicated into ${event.representativesAfter} representatives.`,
          )
          : bi(
            `Còn ${event.keysAfter} key và ${event.representativesAfter} đại diện sau ${event.exactChecks} phép so sánh mảng thật; loại ${event.collisionRejects} lần chỉ trùng hash.`,
            `${event.keysAfter} keys and ${event.representativesAfter} representatives remain after ${event.exactChecks} exact array comparisons; ${event.collisionRejects} hash-only matches were rejected.`,
          ),
        action: isSeed
          ? bi("Băm mọi cửa sổ của path ngắn nhất", "Hash every window of the shortest path")
          : bi("Giao key rồi kiểm chứng đại diện", "Intersect keys, then verify representatives"),
        formula: isSeed
          ? bi("candidates = {(h1, h2) → các cửa sổ exact}", "candidates = {(h1, h2) → exact windows}")
          : bi(
            "survivors = hash-intersection ∩ exact-equality",
            "survivors = hash-intersection ∩ exact-equality",
          ),
        bounds: { low: probeLow, mid, high: probeHigh },
        event,
        currentRow: {
          low: probeLow,
          mid,
          high: probeHigh,
          candidates: event.representativesAfter,
        },
      });
    });

    if (result.common) {
      low = mid;
      bestRepresentative = result.representative;
    } else {
      high = mid - 1;
    }

    attempts.push({
      low: probeLow,
      mid,
      high: probeHigh,
      candidates: result.candidates,
      common: result.common,
      nextLow: low,
      nextHigh: high,
    });

    emitTrace({
      phaseIndex: 4,
      codeLines: PYTHON_LINES.update,
      title: result.common
        ? bi(`Độ dài ${mid} tồn tại`, `Length ${mid} exists`)
        : bi(`Độ dài ${mid} không tồn tại`, `Length ${mid} does not exist`),
      note: result.common
        ? bi(
          `Ít nhất một đại diện đã khớp mảng thật trên mọi path; tăng low lên ${low}.`,
          `At least one representative matched actual values in every path; raise low to ${low}.`,
        )
        : bi(
          `Không còn đại diện exact chung; hạ high xuống ${high}.`,
          `No exact common representative remains; lower high to ${high}.`,
        ),
      action: result.common
        ? bi("Giữ nửa độ dài lớn hơn", "Keep the larger-length half")
        : bi("Giữ nửa độ dài nhỏ hơn", "Keep the smaller-length half"),
      formula: result.common
        ? bi(`low = mid = ${mid}`, `low = mid = ${mid}`)
        : bi(`high = mid - 1 = ${high}`, `high = mid - 1 = ${high}`),
      bounds: { low, mid, high },
      event: lastEvent,
    });
  }

  const answer = low;
  let finalEvent = null;
  if (bestRepresentative && answer > 0) {
    const finalKey = bestRepresentative.key;
    finalEvent = {
      kind: "final",
      length: answer,
      pathPosition: bestRepresentative.pathPosition,
      records: [{
        start: bestRepresentative.start,
        end: bestRepresentative.start + answer - 1,
        key: finalKey,
        hashCandidate: true,
        verified: true,
      }],
      keysBefore: 1,
      keysAfter: 1,
      representativesBefore: 1,
      representativesAfter: 1,
      exactChecks: orderedPaths.length - 1,
      collisionRejects: 0,
    };
  }

  emitTrace({
    phaseIndex: 5,
    codeLines: PYTHON_LINES.finish,
    title: bi(`Đáp án là ${answer}`, `The answer is ${answer}`),
    note: answer > 0
      ? bi(
        `Binary search hội tụ tại ${answer}; cửa sổ đại diện đã được so sánh exact trên đủ ${paths.length} path.`,
        `Binary search converges at ${answer}; the representative window was compared exactly across all ${paths.length} paths.`,
      )
      : bi(
        "Không có thành phố đơn nào xuất hiện trong mọi path, nên chỉ path rỗng là chung.",
        "No single city occurs in every path, so only the empty path is common.",
      ),
    action: bi("Trả về low", "Return low"),
    formula: bi(`answer = low = high = ${answer}`, `answer = low = high = ${answer}`),
    bounds: { low: answer, mid: answer, high: answer },
    event: finalEvent,
    final: true,
    answer,
  });

  return {
    original: { n, paths: paths.map((path) => [...path]) },
    answer,
    steps: tracer.finish(),
  };
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
      `paths (JSON matrix; 2–${MAX_PATHS} path, tối đa ${MAX_TOTAL_CITIES} thành phố)`,
      `paths (JSON matrix; 2–${MAX_PATHS} paths, at most ${MAX_TOTAL_CITIES} cities)`,
    ),
    maxInput: MAX_PATH_LENGTH,
    visualizationLimits: {
      maxPaths: MAX_PATHS,
      maxPathLength: MAX_PATH_LENGTH,
      maxTotalCities: MAX_TOTAL_CITIES,
      maxTraceSteps: MAX_TRACE_STEPS,
      maxWindowSamplesPerFrame: MAX_WINDOW_SAMPLES,
      note: bi(
        "Giới hạn chỉ phục vụ visualization; thuật toán vẫn xử lý đầy đủ mọi input đã được chấp nhận.",
        "These limits bound the visualization; the algorithm still fully processes every accepted input.",
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
    debugMode: "semantic",
    code: LONGEST_COMMON_SUBPATH_1923_SOURCE,
    liveArgs: (input, params) => {
      const parsed = parseLongestCommonSubpath1923(input, params);
      return [parsed.n, parsed.paths.map((path) => [...path])];
    },
    builder: buildLongestCommonSubpath1923,
  },
};
