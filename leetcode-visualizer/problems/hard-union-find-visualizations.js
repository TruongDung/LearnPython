"use strict";

const {
  DSU,
  bi,
  createTracer,
  fail,
  formatMask,
  parseIntegerArray,
  parsePlainParams,
  parseStringArray,
} = require("./hard-viz-shared");

const ALPHABET_SIZE = 26;

const DEFAULT_WORDS_2157 = Object.freeze(["a", "b", "ab", "cde"]);
const DEFAULT_NUMS_2382 = Object.freeze([1, 2, 5, 6, 1]);
const DEFAULT_REMOVALS_2382 = Object.freeze([0, 3, 2, 4, 1]);

const LIMITS_2157 = Object.freeze({
  maxWords: 240,
  maxTraceSteps: 240,
  maxMaskRows: 18,
  maxGraphNodes: 32,
  maxGraphEdges: 48,
  maxComponentGroups: 10,
  maxMembersPerComponent: 8,
  maxMaskScanFrames: 36,
  maxUnionFrames: 144,
  maxTransitionHistory: 16,
});

const LIMITS_2382 = Object.freeze({
  maxNums: 160,
  maxValue: 1_000_000_000,
  maxTraceSteps: 240,
  maxTimelineRows: 20,
  maxGraphNodes: 40,
  maxComponentGroups: 12,
  maxMembersPerComponent: 14,
  maxEventHistory: 16,
  maxSequenceItems: 64,
});

const PHASES_2157 = Object.freeze([
  bi("Mã hóa từ", "Encode words"),
  bi("Gộp mask trùng", "Compress duplicate masks"),
  bi("Nối thêm hoặc xóa", "Union add/delete neighbors"),
  bi("Nối thay thế", "Union replacement neighbors"),
  bi("Kết quả", "Result"),
]);

const PHASES_2382 = Object.freeze([
  bi("Khởi tạo trạng thái rỗng", "Initialize the empty state"),
  bi("Ghi đáp án theo thời gian", "Record the timeline answer"),
  bi("Kích hoạt ngược", "Reverse-activate an index"),
  bi("Gộp đoạn kề", "Union adjacent segments"),
  bi("Cập nhật tổng lớn nhất", "Update the maximum sum"),
  bi("Kết quả", "Result"),
]);

const SOURCE_2157 = Object.freeze([
  "from collections import Counter",
  "from typing import List",
  "",
  "class Solution:",
  "    def groupStrings(self, words: List[str]) -> List[int]:",
  "        counts = Counter()",
  "        for word in words:",
  "            mask = 0",
  "            for char in word:",
  "                mask |= 1 << (ord(char) - ord('a'))",
  "            counts[mask] += 1",
  "",
  "        masks = list(counts)",
  "        index = {mask: i for i, mask in enumerate(masks)}",
  "        parent = list(range(len(masks)))",
  "        size = [counts[mask] for mask in masks]",
  "        groups = len(masks)",
  "        largest = max(size)",
  "",
  "        def find(node):",
  "            while parent[node] != node:",
  "                parent[node] = parent[parent[node]]",
  "                node = parent[node]",
  "            return node",
  "",
  "        def union(left, right):",
  "            nonlocal groups, largest",
  "            left, right = find(left), find(right)",
  "            if left == right:",
  "                return",
  "            if size[left] < size[right]:",
  "                left, right = right, left",
  "            parent[right] = left",
  "            size[left] += size[right]",
  "            groups -= 1",
  "            largest = max(largest, size[left])",
  "",
  "        deleted_owner = {}",
  "        for mask in masks:",
  "            node = index[mask]",
  "            for bit in range(26):",
  "                neighbor = mask ^ (1 << bit)",
  "                if neighbor in index:",
  "                    union(node, index[neighbor])",
  "            for bit in range(26):",
  "                if mask & (1 << bit):",
  "                    deleted = mask ^ (1 << bit)",
  "                    if deleted in deleted_owner:",
  "                        union(node, deleted_owner[deleted])",
  "                    else:",
  "                        deleted_owner[deleted] = node",
  "        return [groups, largest]",
]);

const SOURCE_2382 = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def maximumSegmentSum(self, nums: List[int], removeQueries: List[int]) -> List[int]:",
  "        n = len(nums)",
  "        parent = list(range(n))",
  "        size = [1] * n",
  "        segment_sum = [0] * n",
  "        active = [False] * n",
  "        answer = [0] * n",
  "        maximum = 0",
  "",
  "        def find(node):",
  "            while parent[node] != node:",
  "                parent[node] = parent[parent[node]]",
  "                node = parent[node]",
  "            return node",
  "",
  "        def union(left, right):",
  "            left, right = find(left), find(right)",
  "            if left == right:",
  "                return left",
  "            if size[left] < size[right]:",
  "                left, right = right, left",
  "            parent[right] = left",
  "            size[left] += size[right]",
  "            segment_sum[left] += segment_sum[right]",
  "            return left",
  "",
  "        for step in range(n - 1, -1, -1):",
  "            answer[step] = maximum",
  "            index = removeQueries[step]",
  "            active[index] = True",
  "            segment_sum[index] = nums[index]",
  "            if index > 0 and active[index - 1]:",
  "                union(index, index - 1)",
  "            if index + 1 < n and active[index + 1]:",
  "                union(index, index + 1)",
  "            root = find(index)",
  "            maximum = max(maximum, segment_sum[root])",
  "        return answer",
]);

function boundedIndices(length, anchors, limit) {
  const selected = new Set();
  const add = (index) => {
    if (selected.size >= limit || !Number.isSafeInteger(index) || index < 0 || index >= length) return;
    selected.add(index);
  };
  anchors.forEach(add);
  const pivot = anchors.find((index) => Number.isSafeInteger(index) && index >= 0 && index < length) ?? 0;
  for (let distance = 1; selected.size < limit && (pivot - distance >= 0 || pivot + distance < length); distance += 1) {
    add(pivot - distance);
    add(pivot + distance);
  }
  for (let index = 0; selected.size < limit && index < length; index += 1) add(index);
  return [...selected].sort((left, right) => left - right);
}

function bitCount(mask) {
  let value = mask >>> 0;
  let count = 0;
  while (value) {
    value &= value - 1;
    count += 1;
  }
  return count;
}

function maskLetters(mask) {
  const letters = [];
  for (let bit = 0; bit < ALPHABET_SIZE; bit += 1) {
    if ((mask & (1 << bit)) !== 0) letters.push(String.fromCharCode(97 + bit));
  }
  return letters.join("") || "∅";
}

function wordToMask(word) {
  let mask = 0;
  for (const character of word) mask |= 1 << (character.charCodeAt(0) - 97);
  return mask;
}

function parseGroupsOfStrings2157Input(input, params = {}) {
  parsePlainParams(params, 2157);
  const words = parseStringArray(input, {
    problemId: 2157,
    name: "words",
    minLength: 1,
    maxLength: LIMITS_2157.maxWords,
    minWordLength: 1,
    maxWordLength: ALPHABET_SIZE,
    lowercase: true,
    distinct: false,
  });
  words.forEach((word, index) => {
    if (new Set(word).size !== word.length) {
      fail(
        2157,
        RangeError,
        `words[${index}] không được lặp chữ cái`,
        `words[${index}] must not repeat a letter`,
      );
    }
  });
  return { words: [...words] };
}

function parseMaximumSegmentSum2382Input(input, params = {}) {
  const safeParams = parsePlainParams(params, 2382);
  let rawNums = input;
  let rawRemoveQueries = Object.prototype.hasOwnProperty.call(safeParams, "removeQueries")
    ? safeParams.removeQueries
    : JSON.stringify(DEFAULT_REMOVALS_2382);

  if (input !== null && typeof input === "object" && !Array.isArray(input)) {
    const objectInput = parsePlainParams(input, 2382);
    if (!Object.prototype.hasOwnProperty.call(objectInput, "nums")) {
      fail(2382, TypeError, "input object phải có nums", "an input object must contain nums");
    }
    rawNums = objectInput.nums;
    if (Object.prototype.hasOwnProperty.call(objectInput, "removeQueries")) {
      rawRemoveQueries = objectInput.removeQueries;
    }
  }

  const nums = parseIntegerArray(rawNums, {
    problemId: 2382,
    name: "nums",
    minLength: 1,
    maxLength: LIMITS_2382.maxNums,
    minValue: 1,
    maxValue: LIMITS_2382.maxValue,
  });
  const removeQueries = parseIntegerArray(rawRemoveQueries, {
    problemId: 2382,
    name: "removeQueries",
    minLength: nums.length,
    maxLength: nums.length,
    minValue: 0,
    maxValue: nums.length - 1,
  });
  if (new Set(removeQueries).size !== nums.length) {
    fail(
      2382,
      RangeError,
      "removeQueries phải là hoán vị của 0..n-1",
      "removeQueries must be a permutation of 0..n-1",
    );
  }
  return { nums: [...nums], removeQueries: [...removeQueries] };
}

function components2157(dsu, masks, frequencies) {
  const byRoot = new Map();
  for (let node = 0; node < masks.length; node += 1) {
    const root = dsu.find(node);
    if (!byRoot.has(root)) byRoot.set(root, { root, members: [], total: 0 });
    const component = byRoot.get(root);
    component.members.push(node);
    component.total += frequencies[node];
  }
  return [...byRoot.values()].sort((left, right) => left.members[0] - right.members[0]);
}

function buildSteps2157(input, params = {}) {
  const { words } = parseGroupsOfStrings2157Input(input, params);
  const wordMasks = words.map(wordToMask);
  const maskCounts = new Map();
  const wordsByMask = new Map();
  const positionsByMask = new Map();

  wordMasks.forEach((mask, index) => {
    maskCounts.set(mask, (maskCounts.get(mask) || 0) + 1);
    if (!wordsByMask.has(mask)) wordsByMask.set(mask, []);
    if (!positionsByMask.has(mask)) positionsByMask.set(mask, []);
    wordsByMask.get(mask).push(words[index]);
    positionsByMask.get(mask).push(index);
  });

  const masks = [...maskCounts.keys()];
  const maskToNode = new Map(masks.map((mask, node) => [mask, node]));
  const frequencies = masks.map((mask) => maskCounts.get(mask));
  const dsu = new DSU(masks.length, frequencies, true);
  const processedNodes = new Set();
  const successfulEdges = [];
  const transitionHistory = [];
  let activeTransition = null;
  let transitionSerial = 0;
  let groupCount = masks.length;
  let largestGroup = Math.max(...frequencies);
  let finalAnswer = null;

  const tracer = createTracer({
    problemId: 2157,
    source: SOURCE_2157,
    phases: PHASES_2157,
    maxSteps: LIMITS_2157.maxTraceSteps,
    baseArray: wordMasks,
    legend: [
      { label: bi("Mask đang xét", "Active mask"), state: "active" },
      { label: bi("Mask láng giềng", "Neighbor mask"), state: "candidate" },
      { label: bi("Vừa gộp component", "Component merged"), state: "updated" },
      { label: bi("Gốc component", "Component root"), state: "success" },
    ],
  });

  function visibleMaskNodes(currentNode, targetNode) {
    const componentRoots = components2157(dsu, masks, frequencies).map((component) => component.root);
    return boundedIndices(
      masks.length,
      [currentNode, targetNode, ...componentRoots],
      LIMITS_2157.maxGraphNodes,
    );
  }

  function maskTable(currentNode, targetNode) {
    const rows = boundedIndices(
      masks.length,
      [currentNode, targetNode, 0, masks.length - 1],
      LIMITS_2157.maxMaskRows,
    );
    return {
      title: bi("Mask đã nén và component hiện tại", "Compressed masks and current components"),
      columns: [
        bi("Chữ cái", "Letters"),
        bi("Mask 26 bit", "26-bit mask"),
        bi("Số từ", "Multiplicity"),
        bi("Gốc", "Root"),
        bi("Cỡ nhóm", "Group size"),
      ],
      rows: rows.map((node) => {
        const root = dsu.find(node);
        let state = processedNodes.has(node) ? "computed" : "pending";
        if (node === targetNode) state = "candidate";
        if (node === currentNode) state = "active";
        return {
          label: `m${node}`,
          state,
          cells: [
            maskLetters(masks[node]),
            formatMask(masks[node]),
            frequencies[node],
            { value: `m${root}`, state: root === node ? "success" : "computed" },
            { value: dsu.sum[root], state: node === currentNode || node === targetNode ? "updated" : "info" },
          ],
        };
      }),
    };
  }

  function maskGraph(currentNode, targetNode) {
    const visible = visibleMaskNodes(currentNode, targetNode);
    const visibleSet = new Set(visible);
    const activePair = activeTransition
      ? new Set([activeTransition.left, activeTransition.right])
      : new Set();
    return {
      layout: "circle",
      nodes: visible.map((node) => {
        const root = dsu.find(node);
        let state = processedNodes.has(node) ? "computed" : "idle";
        if (root === node) state = "success";
        if (node === targetNode) state = "candidate";
        if (node === currentNode) state = "active";
        return {
          id: node,
          label: `m${node}`,
          sub: `${maskLetters(masks[node])} · ×${frequencies[node]} · root m${root}`,
          state,
        };
      }),
      edges: successfulEdges
        .filter((edge) => visibleSet.has(edge.u) && visibleSet.has(edge.v))
        .slice(-LIMITS_2157.maxGraphEdges)
        .map((edge) => ({
          u: edge.u,
          v: edge.v,
          directed: false,
          label: edge.kind,
          state: activePair.has(edge.u) && activePair.has(edge.v) ? "active" : "computed",
        })),
    };
  }

  function componentGroups() {
    const snapshot = components2157(dsu, masks, frequencies);
    const groups = [
      {
        title: bi("Chuyển Union-Find hiện tại", "Current Union-Find transition"),
        items: activeTransition
          ? [
            { label: bi("Phép biến đổi", "Operation"), value: activeTransition.kind, state: activeTransition.merged ? "updated" : "info" },
            { label: bi("Hai mask", "Mask pair"), value: `m${activeTransition.left} ↔ m${activeTransition.right}`, state: "active" },
            { label: bi("Chi tiết", "Detail"), value: activeTransition.detail, state: "candidate" },
            { label: bi("Kết quả union", "Union result"), value: activeTransition.merged ? `root m${activeTransition.root}, size ${activeTransition.total}` : "đã cùng component / already connected", state: activeTransition.merged ? "success" : "muted" },
          ]
          : [{ label: bi("Chưa có union", "No union yet"), value: "—", state: "pending" }],
      },
    ];

    snapshot.slice(0, LIMITS_2157.maxComponentGroups).forEach((component) => {
      const visibleMembers = component.members.slice(0, LIMITS_2157.maxMembersPerComponent);
      const items = visibleMembers.map((node) => ({
        label: `m${node}: ${maskLetters(masks[node])}`,
        value: `${formatMask(masks[node])} · ×${frequencies[node]}`,
        state: node === component.root ? "success" : "computed",
      }));
      if (component.members.length > visibleMembers.length) {
        items.push({
          label: bi("Mask còn lại", "More masks"),
          value: `+${component.members.length - visibleMembers.length}`,
          state: "muted",
        });
      }
      groups.push({
        title: bi(
          `Component m${component.root} · ${component.total} từ`,
          `Component m${component.root} · ${component.total} words`,
        ),
        items,
      });
    });
    if (snapshot.length > LIMITS_2157.maxComponentGroups) {
      groups.push({
        title: bi("Component chưa hiển thị", "Hidden components"),
        items: [{
          label: bi("Số lượng", "Count"),
          value: snapshot.length - LIMITS_2157.maxComponentGroups,
          state: "muted",
        }],
      });
    }
    return groups;
  }

  function transitionSequence() {
    if (!transitionHistory.length) {
      return [{ label: "union", value: "—", state: "pending" }];
    }
    return transitionHistory.slice(-LIMITS_2157.maxTransitionHistory).map((transition) => ({
      label: `U${transition.serial}`,
      value: `m${transition.left} ↔ m${transition.right} · ${transition.kind}`,
      state: transition.merged ? "updated" : "muted",
    }));
  }

  function emit(options) {
    const final = Boolean(options.final);
    if (!final && tracer.steps.length >= LIMITS_2157.maxTraceSteps - 1) {
      tracer.truncate();
      return false;
    }
    const currentNode = options.currentNode ?? null;
    const targetNode = options.targetNode ?? null;
    const involvedMasks = new Set();
    if (currentNode !== null) involvedMasks.add(masks[currentNode]);
    if (targetNode !== null) involvedMasks.add(masks[targetNode]);
    const highlight = wordMasks
      .map((mask, index) => involvedMasks.has(mask) ? index : -1)
      .filter((index) => index >= 0);
    const mark = wordMasks
      .map((mask, index) => processedNodes.has(maskToNode.get(mask)) ? index : -1)
      .filter((index) => index >= 0);

    return tracer.emit({
      phaseIndex: options.phaseIndex,
      title: options.title,
      note: options.note,
      action: options.action,
      formula: options.formula,
      codeLines: options.codeLines,
      vars: [
        { name: bi("mask hiện tại", "current mask"), value: currentNode === null ? "—" : formatMask(masks[currentNode]) },
        { name: bi("mask láng giềng", "neighbor mask"), value: targetNode === null ? "—" : formatMask(masks[targetNode]) },
        { name: bi("số component", "components"), value: groupCount },
        { name: bi("nhóm lớn nhất", "largest group"), value: largestGroup },
      ],
      arr: wordMasks,
      sub: words.map((word, index) => `${word} · ${formatMask(wordMasks[index])}`),
      highlight,
      mark,
      graph: maskGraph(currentNode, targetNode),
      table: maskTable(currentNode, targetNode),
      groups: componentGroups(),
      sequence: transitionSequence(),
      metrics: [
        { label: bi("Số từ", "Words"), value: words.length },
        { label: bi("Mask duy nhất", "Unique masks"), value: masks.length },
        { label: bi("Mask trùng đã nén", "Compressed duplicates"), value: words.length - masks.length, state: "info" },
        { label: bi("Component", "Components"), value: groupCount, state: "active" },
        { label: bi("Nhóm lớn nhất", "Largest group"), value: largestGroup, state: "success" },
      ],
      legend: [
        { label: bi("Mask đang xét", "Active mask"), state: "active" },
        { label: bi("Mask láng giềng", "Neighbor mask"), state: "candidate" },
        { label: bi("Union thành công", "Successful union"), state: "updated" },
        { label: bi("Gốc component", "Component root"), state: "success" },
      ],
      final,
      answer: final ? [...finalAnswer] : null,
    });
  }

  emit({
    phaseIndex: 0,
    title: bi("Mã hóa mỗi từ thành mask 26 bit", "Encode every word as a 26-bit mask"),
    note: bi(
      "Mỗi chữ cái bật đúng một bit; thứ tự chữ cái không ảnh hưởng mask, nên các anagram có cùng mask.",
      "Each letter sets one bit; letter order does not affect the mask, so anagrams share a mask.",
    ),
    action: bi("Quét chữ cái và đếm số lần xuất hiện của từng mask.", "Scan letters and count each mask's multiplicity."),
    formula: bi("mask |= 1 << (ord(char) − ord('a'))", "mask |= 1 << (ord(char) − ord('a'))"),
    codeLines: [6, 7, 8, 9, 10, 11],
  });

  const duplicateNode = frequencies.findIndex((frequency) => frequency > 1);
  emit({
    phaseIndex: 1,
    title: bi("Nén các từ có cùng mask", "Compress words with the same mask"),
    note: bi(
      "Mỗi mask duy nhất trở thành một node DSU; trọng số node là multiplicity để kích thước nhóm vẫn đếm số từ.",
      "Each unique mask becomes one DSU node; its weight is the multiplicity so component sizes still count words.",
    ),
    action: bi("Tạo index mask, parent và size có trọng số.", "Create the mask index, parent array, and weighted sizes."),
    formula: bi("size[node(mask)] = counts[mask]", "size[node(mask)] = counts[mask]"),
    codeLines: [13, 14, 15, 16, 17, 18],
    currentNode: duplicateNode >= 0 ? duplicateNode : null,
  });

  let tracedMaskScans = 0;
  let tracedUnions = 0;

  function attemptUnion(left, right, kind, detail, phaseIndex, codeLines) {
    const rootLeft = dsu.find(left);
    const rootRight = dsu.find(right);
    const merged = rootLeft !== rootRight;
    let root = rootLeft;
    if (merged) {
      root = dsu.union(left, right);
      groupCount -= 1;
      largestGroup = Math.max(largestGroup, dsu.sum[root]);
      successfulEdges.push({ u: left, v: right, kind });
    }
    transitionSerial += 1;
    activeTransition = {
      serial: transitionSerial,
      left,
      right,
      kind,
      detail,
      merged,
      root: dsu.find(left),
      total: dsu.sum[dsu.find(left)],
    };
    transitionHistory.push({ ...activeTransition });
    if (transitionHistory.length > LIMITS_2157.maxTransitionHistory) transitionHistory.shift();

    if (tracedUnions < LIMITS_2157.maxUnionFrames) {
      emit({
        phaseIndex,
        title: merged
          ? bi(`Gộp m${left} và m${right}`, `Union m${left} and m${right}`)
          : bi(`m${left} và m${right} đã liên thông`, `m${left} and m${right} are already connected`),
        note: merged
          ? bi(
            `Hai mask nối được bằng phép ${kind}; tổng số từ của component mới là ${activeTransition.total}.`,
            `The masks are adjacent by ${kind}; the new component contains ${activeTransition.total} words.`,
          )
          : bi(
            "Cạnh biến đổi hợp lệ nhưng hai node đã có cùng gốc, nên union không đổi cấu trúc.",
            "The transformation edge is valid, but both nodes already share a root, so union changes nothing.",
          ),
        action: bi("So sánh hai gốc rồi union theo kích thước.", "Compare roots, then union by size."),
        formula: bi(detail, detail),
        codeLines,
        currentNode: left,
        targetNode: right,
      });
      tracedUnions += 1;
    } else {
      tracer.truncate();
    }
  }

  const deletedOwner = new Map();
  for (let node = 0; node < masks.length; node += 1) {
    const mask = masks[node];
    if (tracedMaskScans < LIMITS_2157.maxMaskScanFrames) {
      emit({
        phaseIndex: 2,
        title: bi(`Duyệt láng giềng của m${node}`, `Scan neighbors of m${node}`),
        note: bi(
          "Lật một bit tạo đúng phép thêm hoặc xóa một chữ cái; chỉ union nếu mask kết quả tồn tại.",
          "Toggling one bit performs exactly one add or delete; union only when the resulting mask exists.",
        ),
        action: bi("Thử 26 mask cách một bit.", "Try all 26 one-bit neighbors."),
        formula: bi("neighbor = mask XOR (1 << bit)", "neighbor = mask XOR (1 << bit)"),
        codeLines: [39, 40, 41, 42, 43, 44],
        currentNode: node,
      });
      tracedMaskScans += 1;
    } else {
      tracer.truncate();
    }

    for (let bit = 0; bit < ALPHABET_SIZE; bit += 1) {
      const neighborMask = mask ^ (1 << bit);
      const neighborNode = maskToNode.get(neighborMask);
      if (neighborNode === undefined || node >= neighborNode) continue;
      const letter = String.fromCharCode(97 + bit);
      const kind = (mask & (1 << bit)) !== 0 ? "delete" : "add";
      attemptUnion(
        node,
        neighborNode,
        kind,
        `${maskLetters(mask)} ${kind === "add" ? "+" : "−"} ${letter} = ${maskLetters(neighborMask)}`,
        2,
        [41, 42, 43, 44],
      );
    }

    for (let bit = 0; bit < ALPHABET_SIZE; bit += 1) {
      if ((mask & (1 << bit)) === 0) continue;
      const deleted = mask ^ (1 << bit);
      if (deletedOwner.has(deleted)) {
        const owner = deletedOwner.get(deleted);
        if (owner !== node) {
          attemptUnion(
            node,
            owner,
            "replace",
            `${maskLetters(masks[node])} → ${maskLetters(deleted)} ← ${maskLetters(masks[owner])}`,
            3,
            [45, 46, 47, 48, 49],
          );
        }
      } else {
        deletedOwner.set(deleted, node);
      }
    }
    processedNodes.add(node);
  }

  const finalComponents = components2157(dsu, masks, frequencies);
  const recomputedLargest = Math.max(...finalComponents.map((component) => component.total));
  const totalMultiplicity = finalComponents.reduce((total, component) => total + component.total, 0);
  if (finalComponents.length !== groupCount || recomputedLargest !== largestGroup || totalMultiplicity !== words.length) {
    throw new Error("#2157: DSU component invariants do not match the weighted masks");
  }
  for (let left = 0; left < masks.length; left += 1) {
    for (let right = left + 1; right < masks.length; right += 1) {
      const difference = masks[left] ^ masks[right];
      const adjacent = bitCount(difference) === 1
        || (bitCount(difference) === 2 && bitCount(masks[left]) === bitCount(masks[right]));
      if (adjacent && dsu.find(left) !== dsu.find(right)) {
        throw new Error(`#2157: transform-adjacent masks m${left} and m${right} were not connected`);
      }
    }
  }

  finalAnswer = [groupCount, largestGroup];
  activeTransition = null;
  emit({
    phaseIndex: 4,
    title: bi(
      `${groupCount} nhóm, nhóm lớn nhất có ${largestGroup} từ`,
      `${groupCount} groups, largest size ${largestGroup}`,
    ),
    note: tracer.truncated
      ? bi(
        "Trace union đã được rút gọn, nhưng mọi mask, phép thêm/xóa/thay thế và multiplicity vẫn được xử lý đầy đủ.",
        "The union trace was shortened, but every mask, add/delete/replace edge, and multiplicity was fully processed.",
      )
      : bi(
        "Số gốc DSU là số nhóm; tổng trọng số lớn nhất của một gốc là kích thước nhóm lớn nhất.",
        "The number of DSU roots is the group count; the largest root weight is the largest group size.",
      ),
    action: bi("Trả số component và kích thước lớn nhất.", "Return the component count and largest size."),
    formula: bi(`[groups, largest] = [${groupCount}, ${largestGroup}]`, `[groups, largest] = [${groupCount}, ${largestGroup}]`),
    codeLines: [52],
    final: true,
  });

  return {
    original: [...words],
    answer: [...finalAnswer],
    steps: tracer.finish(),
  };
}

function components2382(dsu, active) {
  const byRoot = new Map();
  for (let index = 0; index < active.length; index += 1) {
    if (!active[index]) continue;
    const root = dsu.find(index);
    if (!byRoot.has(root)) byRoot.set(root, { root, members: [], total: dsu.sum[root] });
    byRoot.get(root).members.push(index);
  }
  return [...byRoot.values()].sort((left, right) => left.members[0] - right.members[0]);
}

function forwardMaximumSegmentSums(nums, removeQueries) {
  const present = Array(nums.length).fill(true);
  const result = [];
  for (const removed of removeQueries) {
    present[removed] = false;
    let best = 0;
    let running = 0;
    for (let index = 0; index < nums.length; index += 1) {
      if (present[index]) {
        running += nums[index];
        best = Math.max(best, running);
      } else {
        running = 0;
      }
    }
    result.push(best);
  }
  return result;
}

function buildSteps2382(input, params = {}) {
  const { nums, removeQueries } = parseMaximumSegmentSum2382Input(input, params);
  const n = nums.length;
  const dsu = new DSU(n, null, false);
  const active = Array(n).fill(false);
  const answer = Array(n).fill(0);
  const eventHistory = [];
  let activeCount = 0;
  let currentMaximum = 0;
  let resolvedStart = n;
  let currentStep = null;
  let currentIndex = null;
  let currentNeighbor = null;
  let activeTransition = null;

  const tracer = createTracer({
    problemId: 2382,
    source: SOURCE_2382,
    phases: PHASES_2382,
    maxSteps: LIMITS_2382.maxTraceSteps,
    baseArray: nums,
    legend: [
      { label: bi("Index vừa kích hoạt", "Newly activated index"), state: "active" },
      { label: bi("Đoạn kề sắp gộp", "Adjacent segment to union"), state: "candidate" },
      { label: bi("Đoạn đã gộp", "Merged segment"), state: "updated" },
      { label: bi("Đoạn đang hoạt động", "Active segment"), state: "success" },
    ],
  });

  function rememberEvent(label, value, state) {
    eventHistory.push({ label, value, state });
    if (eventHistory.length > LIMITS_2382.maxEventHistory) eventHistory.shift();
  }

  function visibleArrayIndices() {
    return boundedIndices(
      n,
      [currentIndex, currentNeighbor, 0, n - 1],
      LIMITS_2382.maxGraphNodes,
    );
  }

  function timelineTable() {
    const rows = boundedIndices(
      n,
      [currentStep, 0, n - 1, resolvedStart],
      LIMITS_2382.maxTimelineRows,
    );
    return {
      title: bi("Timeline xóa xuôi / kích hoạt ngược", "Forward-removal / reverse-activation timeline"),
      columns: [
        bi("removeQueries[step]", "removeQueries[step]"),
        bi("Trạng thái reverse", "Reverse status"),
        bi("Đáp án sau khi xóa", "Maximum after removal"),
      ],
      rows: rows.map((step) => {
        const resolved = step >= resolvedStart;
        let state = resolved ? "computed" : "pending";
        if (step === currentStep) state = "active";
        let reverseStatus = "chờ / pending";
        if (resolved) reverseStatus = step === currentStep ? "đang dựng / current" : "đã dựng / restored";
        return {
          label: `q${step}`,
          state,
          cells: [
            removeQueries[step],
            { value: reverseStatus, state },
            { value: resolved ? answer[step] : "—", state: resolved ? "success" : "pending" },
          ],
        };
      }),
    };
  }

  function segmentGraph() {
    const visible = visibleArrayIndices();
    const visibleSet = new Set(visible);
    return {
      layout: "circle",
      nodes: visible.map((index) => {
        let state = active[index] ? "success" : "idle";
        if (index === currentNeighbor) state = "candidate";
        if (index === currentIndex) state = "active";
        const root = active[index] ? dsu.find(index) : -1;
        return {
          id: index,
          label: String(index),
          sub: active[index] ? `v=${nums[index]} · root=${root} · Σ=${dsu.sum[root]}` : `v=${nums[index]} · removed`,
          state,
        };
      }),
      edges: Array.from({ length: Math.max(0, n - 1) }, (_, index) => [index, index + 1])
        .filter(([left, right]) => visibleSet.has(left) && visibleSet.has(right))
        .map(([left, right]) => {
          const isCurrentUnion = activeTransition
            && activeTransition.kind === "union"
            && ((activeTransition.left === left && activeTransition.right === right)
              || (activeTransition.left === right && activeTransition.right === left));
          const connected = active[left] && active[right] && dsu.find(left) === dsu.find(right);
          return {
            u: left,
            v: right,
            directed: false,
            label: connected ? "same segment" : "boundary",
            state: isCurrentUnion ? "active" : connected ? "computed" : "muted",
          };
        }),
    };
  }

  function activeComponentGroups(snapshot) {
    const groups = [
      {
        title: bi("Chuyển trạng thái hiện tại", "Current transition"),
        items: activeTransition
          ? [
            { label: bi("Loại", "Kind"), value: activeTransition.kind, state: "active" },
            { label: bi("Index", "Index"), value: activeTransition.index, state: "candidate" },
            { label: bi("Chi tiết", "Detail"), value: activeTransition.detail, state: activeTransition.kind === "union" ? "updated" : "info" },
            { label: bi("Tổng lớn nhất", "Maximum sum"), value: currentMaximum, state: "success" },
          ]
          : [{ label: bi("Chưa kích hoạt", "No activation yet"), value: "—", state: "pending" }],
      },
    ];

    snapshot.slice(0, LIMITS_2382.maxComponentGroups).forEach((component) => {
      const shown = component.members.slice(0, LIMITS_2382.maxMembersPerComponent);
      const memberText = shown.join(", ")
        + (component.members.length > shown.length ? `, … +${component.members.length - shown.length}` : "");
      groups.push({
        title: bi(
          `Đoạn root ${component.root} · tổng ${component.total}`,
          `Segment root ${component.root} · sum ${component.total}`,
        ),
        items: [
          { label: bi("Chỉ số hoạt động", "Active indices"), value: memberText, state: "success" },
          { label: bi("Số phần tử", "Length"), value: component.members.length, state: "computed" },
          { label: bi("Tổng component", "Component sum"), value: component.total, state: component.total === currentMaximum ? "updated" : "info" },
        ],
      });
    });
    if (!snapshot.length) {
      groups.push({
        title: bi("Không có đoạn hoạt động", "No active segment"),
        items: [{ label: bi("Tổng lớn nhất", "Maximum sum"), value: 0, state: "muted" }],
      });
    } else if (snapshot.length > LIMITS_2382.maxComponentGroups) {
      groups.push({
        title: bi("Đoạn chưa hiển thị", "Hidden segments"),
        items: [{
          label: bi("Số lượng", "Count"),
          value: snapshot.length - LIMITS_2382.maxComponentGroups,
          state: "muted",
        }],
      });
    }
    return groups;
  }

  function emit(options) {
    const final = Boolean(options.final);
    if (!final && tracer.steps.length >= LIMITS_2382.maxTraceSteps - 1) {
      tracer.truncate();
      return false;
    }
    const snapshot = components2382(dsu, active);
    const highlight = [currentIndex, currentNeighbor]
      .filter((index) => Number.isSafeInteger(index));
    const mark = active
      .map((isActive, index) => isActive ? index : -1)
      .filter((index) => index >= 0);
    const sequenceIndices = boundedIndices(
      n,
      [currentIndex, currentNeighbor, 0, n - 1],
      LIMITS_2382.maxSequenceItems,
    );

    return tracer.emit({
      phaseIndex: options.phaseIndex,
      title: options.title,
      note: options.note,
      action: options.action,
      formula: options.formula,
      codeLines: options.codeLines,
      vars: [
        { name: bi("reverse step", "reverse step"), value: currentStep === null ? "—" : currentStep },
        { name: bi("index", "index"), value: currentIndex === null ? "—" : currentIndex },
        { name: bi("số index hoạt động", "active indices"), value: activeCount },
        { name: bi("số component", "components"), value: snapshot.length },
        { name: bi("maximum", "maximum"), value: currentMaximum },
      ],
      arr: nums,
      sub: nums.map((value, index) => {
        if (!active[index]) return `i${index}: ${value} · removed`;
        const root = dsu.find(index);
        return `i${index}: ${value} · root ${root} · Σ=${dsu.sum[root]}`;
      }),
      highlight,
      mark,
      graph: segmentGraph(),
      table: timelineTable(),
      queue: eventHistory.length
        ? eventHistory.map((event) => ({ ...event }))
        : [{ label: "reverse", sub: "waiting", state: "pending" }],
      groups: activeComponentGroups(snapshot),
      sequence: sequenceIndices.map((index) => {
        let state = active[index] ? "success" : "idle";
        if (index === currentNeighbor) state = "candidate";
        if (index === currentIndex) state = "active";
        return {
          label: `i${index}`,
          value: active[index] ? `${nums[index]} · Σ${dsu.sum[dsu.find(index)]}` : `${nums[index]} · removed`,
          state,
        };
      }),
      metrics: [
        { label: bi("Độ dài", "Length"), value: n },
        { label: bi("Reverse step", "Reverse step"), value: currentStep === null ? "—" : currentStep, state: "active" },
        { label: bi("Index hoạt động", "Active indices"), value: `${activeCount}/${n}` },
        { label: bi("Đoạn hoạt động", "Active segments"), value: snapshot.length },
        { label: bi("Tổng lớn nhất", "Maximum sum"), value: currentMaximum, state: "success" },
      ],
      legend: [
        { label: bi("Vừa kích hoạt", "Newly activated"), state: "active" },
        { label: bi("Láng giềng", "Neighbor"), state: "candidate" },
        { label: bi("Vừa gộp", "Just merged"), state: "updated" },
        { label: bi("Đoạn hoạt động", "Active segment"), state: "success" },
        { label: bi("Đã bị xóa", "Removed"), state: "idle" },
      ],
      final,
      answer: final ? [...answer] : null,
    });
  }

  emit({
    phaseIndex: 0,
    title: bi("Bắt đầu từ mảng đã bị xóa hoàn toàn", "Start from the fully removed array"),
    note: bi(
      "Ta đảo thời gian: ban đầu không index nào hoạt động, rồi thêm lại removeQueries từ phải sang trái.",
      "Reverse time: initially no index is active, then add removeQueries back from right to left.",
    ),
    action: bi("Tạo DSU bất hoạt và mảng answer bằng 0.", "Create an inactive DSU and a zero-filled answer array."),
    formula: bi("active = [False] × n; maximum = 0", "active = [False] × n; maximum = 0"),
    codeLines: [5, 6, 7, 8, 9, 10, 11],
  });

  for (let step = n - 1; step >= 0; step -= 1) {
    currentStep = step;
    currentIndex = removeQueries[step];
    currentNeighbor = null;
    answer[step] = currentMaximum;
    resolvedStart = step;
    activeTransition = {
      kind: "record",
      index: currentIndex,
      left: currentIndex,
      right: currentIndex,
      detail: `answer[${step}] = ${currentMaximum}`,
    };
    rememberEvent(`q${step}`, `answer=${currentMaximum}`, "computed");
    emit({
      phaseIndex: 1,
      title: bi(`Ghi answer[${step}] = ${currentMaximum}`, `Record answer[${step}] = ${currentMaximum}`),
      note: bi(
        "Trước khi thêm lại removeQueries[step], DSU đúng bằng trạng thái mảng sau khi đã xóa các truy vấn 0..step.",
        "Before restoring removeQueries[step], the DSU exactly matches the array after removals 0..step.",
      ),
      action: bi("Chụp tổng đoạn lớn nhất hiện tại vào timeline.", "Write the current maximum segment sum into the timeline."),
      formula: bi(`answer[${step}] = maximum = ${currentMaximum}`, `answer[${step}] = maximum = ${currentMaximum}`),
      codeLines: [29, 30, 31],
    });

    dsu.activate(currentIndex, nums[currentIndex]);
    active[currentIndex] = true;
    activeCount += 1;
    activeTransition = {
      kind: "activate",
      index: currentIndex,
      left: currentIndex,
      right: currentIndex,
      detail: `segment_sum[${currentIndex}] = ${nums[currentIndex]}`,
    };
    rememberEvent(`+i${currentIndex}`, `value=${nums[currentIndex]}`, "active");
    emit({
      phaseIndex: 2,
      title: bi(`Kích hoạt index ${currentIndex}`, `Activate index ${currentIndex}`),
      note: bi(
        `Index này tạo một component một phần tử có tổng ${nums[currentIndex]}.`,
        `This index starts a singleton component with sum ${nums[currentIndex]}.`,
      ),
      action: bi("Bật index và đặt tổng component ban đầu.", "Activate the index and seed its component sum."),
      formula: bi(`sum(root ${currentIndex}) = nums[${currentIndex}] = ${nums[currentIndex]}`, `sum(root ${currentIndex}) = nums[${currentIndex}] = ${nums[currentIndex]}`),
      codeLines: [31, 32, 33],
    });

    const neighbors = [currentIndex - 1, currentIndex + 1];
    for (const neighbor of neighbors) {
      if (neighbor < 0 || neighbor >= n || !active[neighbor]) continue;
      currentNeighbor = neighbor;
      const rootIndex = dsu.find(currentIndex);
      const rootNeighbor = dsu.find(neighbor);
      if (rootIndex === rootNeighbor) continue;
      const sumBefore = dsu.sum[rootIndex] + dsu.sum[rootNeighbor];
      const root = dsu.union(currentIndex, neighbor);
      if (dsu.sum[root] !== sumBefore) {
        throw new Error("#2382: union did not preserve the sum of both adjacent components");
      }
      activeTransition = {
        kind: "union",
        index: currentIndex,
        left: currentIndex,
        right: neighbor,
        detail: `Σ${rootIndex} + Σ${rootNeighbor} = ${dsu.sum[root]}`,
      };
      rememberEvent(`i${currentIndex}↔i${neighbor}`, `sum=${dsu.sum[root]}`, "updated");
      emit({
        phaseIndex: 3,
        title: bi(`Gộp index ${currentIndex} với ${neighbor}`, `Union index ${currentIndex} with ${neighbor}`),
        note: bi(
          "Hai index kề nhau đều hoạt động nên các component của chúng tạo thành một đoạn liên tiếp duy nhất.",
          "Both adjacent indices are active, so their components form one contiguous segment.",
        ),
        action: bi("Union theo kích thước và cộng tổng component.", "Union by size and add component sums."),
        formula: bi(activeTransition.detail, activeTransition.detail),
        codeLines: neighbor < currentIndex ? [34, 35] : [36, 37],
      });
    }

    currentNeighbor = null;
    const root = dsu.find(currentIndex);
    const previousMaximum = currentMaximum;
    currentMaximum = Math.max(currentMaximum, dsu.sum[root]);
    activeTransition = {
      kind: "maximum",
      index: currentIndex,
      left: currentIndex,
      right: currentIndex,
      detail: `max(${previousMaximum}, ${dsu.sum[root]}) = ${currentMaximum}`,
    };
    rememberEvent(`max@q${step}`, String(currentMaximum), currentMaximum > previousMaximum ? "updated" : "computed");
    emit({
      phaseIndex: 4,
      title: currentMaximum > previousMaximum
        ? bi(`Tổng lớn nhất tăng thành ${currentMaximum}`, `Maximum sum increases to ${currentMaximum}`)
        : bi(`Giữ tổng lớn nhất ${currentMaximum}`, `Keep maximum sum ${currentMaximum}`),
      note: bi(
        "Chỉ component chứa index vừa kích hoạt có thể là đoạn mới lớn hơn; các component khác không đổi.",
        "Only the component containing the newly activated index can become a new maximum; all others are unchanged.",
      ),
      action: bi("So sánh maximum với tổng tại gốc mới.", "Compare maximum with the new root sum."),
      formula: bi(activeTransition.detail, activeTransition.detail),
      codeLines: [38, 39],
    });
  }

  const expected = forwardMaximumSegmentSums(nums, removeQueries);
  if (answer.some((value, index) => value !== expected[index])) {
    throw new Error("#2382: reverse-activation timeline disagrees with forward removal semantics");
  }
  const finalComponents = components2382(dsu, active);
  const total = nums.reduce((sum, value) => sum + value, 0);
  if (activeCount !== n || finalComponents.length !== 1 || finalComponents[0].total !== total || currentMaximum !== total) {
    throw new Error("#2382: final active DSU does not reconstruct the complete array");
  }

  currentStep = null;
  currentIndex = null;
  currentNeighbor = null;
  activeTransition = {
    kind: "result",
    index: "—",
    left: 0,
    right: n - 1,
    detail: `[${answer.join(", ")}]`,
  };
  emit({
    phaseIndex: 5,
    title: bi("Hoàn tất timeline tổng đoạn lớn nhất", "Complete the maximum-segment-sum timeline"),
    note: tracer.truncated
      ? bi(
        "Trace đã được rút gọn, nhưng mọi lần kích hoạt, union và giá trị answer vẫn được tính đầy đủ rồi kiểm tra với mô phỏng xóa xuôi.",
        "The trace was shortened, but every activation, union, and answer value was fully computed and checked against forward removals.",
      )
      : bi(
        "Mỗi answer[step] được ghi trước khi thêm lại removeQueries[step], nên nó đúng với trạng thái ngay sau lần xóa đó.",
        "Each answer[step] is recorded before restoring removeQueries[step], so it matches the state immediately after that removal.",
      ),
    action: bi("Trả toàn bộ timeline theo thứ tự xóa ban đầu.", "Return the timeline in the original removal order."),
    formula: bi(`answer = [${answer.join(", ")}]`, `answer = [${answer.join(", ")}]`),
    codeLines: [40],
    final: true,
  });

  return {
    original: { nums: [...nums], removeQueries: [...removeQueries] },
    answer: [...answer],
    steps: tracer.finish(),
  };
}

module.exports = {
  2157: {
    id: 2157,
    difficulty: "hard",
    slug: "groups-of-strings",
    category: { key: "union-find", vi: "Hợp nhất tập hợp", en: "Union-Find" },
    tags: [
      { key: "union-find", vi: "Hợp nhất tập hợp", en: "Union-Find" },
      { key: "bitmask", vi: "Bitmask", en: "Bitmask" },
      { key: "hash-table", vi: "Bảng băm", en: "Hash Table" },
    ],
    title: bi("Nhóm các chuỗi", "Groups of Strings"),
    titleVi: bi("Nhóm chuỗi bằng mask và Union-Find", "Group strings with masks and Union-Find"),
    statement: bi(
      "Hai chuỗi cùng nhóm nếu có thể biến đổi qua một chuỗi phép thêm, xóa hoặc thay thế đúng một chữ cái. Trả số nhóm và kích thước nhóm lớn nhất.",
      "Two strings share a group when a sequence of single-letter additions, deletions, or replacements connects them. Return the group count and largest group size.",
    ),
    defaultInput: [...DEFAULT_WORDS_2157],
    defaults: { input: [...DEFAULT_WORDS_2157] },
    expectedOutput: [2, 3],
    inputKind: "stringArray",
    inputLabel: bi("words (chữ thường, mỗi từ không lặp chữ)", "words (lowercase, no repeated letter per word)"),
    extraParams: [],
    visualizationLimits: { ...LIMITS_2157 },
    approach: [
      bi("Mã hóa tập chữ cái của mỗi từ bằng mask 26 bit và nén mọi mask trùng với multiplicity của nó.", "Encode each word's letter set as a 26-bit mask and compress duplicate masks with their multiplicities."),
      bi("Mỗi lần lật một bit nối hai mask cách nhau một phép thêm hoặc xóa.", "Toggling one bit connects masks separated by one addition or deletion."),
      bi("Hai mask cùng kích thước có thể thay thế một chữ nếu chúng tạo cùng mask sau khi xóa một bit; map deleted_owner nối các mask đó.", "Two equal-sized masks permit one replacement when deleting one bit yields the same mask; deleted_owner connects those masks."),
      bi("DSU mang trọng số multiplicity để số component và tổng trọng số lớn nhất cho đúng hai giá trị cần trả.", "The DSU carries multiplicity weights, so its component count and largest root weight give the requested pair."),
    ],
    complexity: {
      time: "O(26 · totalWords + 26 · uniqueMasks)",
      space: "O(uniqueMasks)",
      note: bi(
        "Thuật toán xử lý đầy đủ mọi mask; chỉ số frame, node graph, hàng bảng và component hiển thị bị giới hạn.",
        "The algorithm processes every mask; only emitted frames, graph nodes, table rows, and displayed components are bounded.",
      ),
    },
    code: SOURCE_2157,
    debugMode: "semantic",
    parser: parseGroupsOfStrings2157Input,
    parseGroupsOfStrings2157Input,
    liveArgs: (input, params = {}) => {
      const parsed = parseGroupsOfStrings2157Input(input, params);
      return [[...parsed.words]];
    },
    builder: buildSteps2157,
  },

  2382: {
    id: 2382,
    difficulty: "hard",
    slug: "maximum-segment-sum-after-removals",
    category: { key: "union-find", vi: "Hợp nhất tập hợp", en: "Union-Find" },
    tags: [
      { key: "union-find", vi: "Hợp nhất tập hợp", en: "Union-Find" },
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "reverse-processing", vi: "Xử lý đảo chiều", en: "Reverse Processing" },
    ],
    title: bi("Tổng đoạn lớn nhất sau các lần xóa", "Maximum Segment Sum After Removals"),
    titleVi: bi("Dựng ngược các đoạn hoạt động bằng Union-Find", "Reverse-build active segments with Union-Find"),
    statement: bi(
      "Sau mỗi lần xóa removeQueries[i], tìm tổng lớn nhất của một đoạn liên tiếp còn hoạt động. Trả timeline của các tổng lớn nhất.",
      "After each removal removeQueries[i], find the largest sum of a remaining contiguous segment. Return the timeline of maximum sums.",
    ),
    defaultInput: [...DEFAULT_NUMS_2382],
    defaults: {
      input: [...DEFAULT_NUMS_2382],
      removeQueries: JSON.stringify(DEFAULT_REMOVALS_2382),
    },
    expectedOutput: [14, 7, 2, 2, 0],
    inputKind: "positive",
    inputLabel: bi("nums (các số nguyên dương)", "nums (positive integers)"),
    extraParams: [
      {
        key: "removeQueries",
        type: "string",
        default: JSON.stringify(DEFAULT_REMOVALS_2382),
        label: bi("removeQueries (hoán vị JSON của 0..n-1)", "removeQueries (JSON permutation of 0..n-1)"),
      },
    ],
    visualizationLimits: { ...LIMITS_2382 },
    approach: [
      bi("Đảo thứ tự truy vấn: bắt đầu từ mảng rỗng và kích hoạt lại từng index từ phải sang trái.", "Reverse the queries: start from an empty array and reactivate indices from right to left."),
      bi("Khi kích hoạt một index, tạo component có trọng số nums[index], rồi union với mỗi láng giềng đang hoạt động.", "When an index activates, create a component weighted by nums[index], then union it with each active neighbor."),
      bi("Chỉ component vừa tạo hoặc mở rộng có thể tăng maximum; ghi answer[step] trước khi kích hoạt removeQueries[step].", "Only the newly created or expanded component can increase the maximum; record answer[step] before activating removeQueries[step]."),
      bi("Timeline ngược tương ứng chính xác với trạng thái sau từng lần xóa xuôi.", "The reverse timeline exactly matches the state after each forward removal."),
    ],
    complexity: {
      time: "O(n · α(n))",
      space: "O(n)",
      note: bi(
        "Mỗi index được kích hoạt một lần và có tối đa hai union; trace, timeline và component preview đều có giới hạn hữu hạn.",
        "Each index activates once and performs at most two unions; the trace, timeline, and component previews are finitely bounded.",
      ),
    },
    code: SOURCE_2382,
    debugMode: "semantic",
    parser: parseMaximumSegmentSum2382Input,
    parseMaximumSegmentSum2382Input,
    liveArgs: (input, params = {}) => {
      const parsed = parseMaximumSegmentSum2382Input(input, params);
      return [[...parsed.nums], [...parsed.removeQueries]];
    },
    builder: buildSteps2382,
  },
};
