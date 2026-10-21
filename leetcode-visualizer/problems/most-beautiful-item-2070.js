"use strict";

const bi = (vi, en) => ({ vi, en });
const MAX_ITEMS_2070 = 14;
const MAX_QUERIES_2070 = 10;
const MAX_VALUE_2070 = 1_000_000_000;

const CODE_2070 = Object.freeze([
  "class Solution:",
  "    def maximumBeauty(self, items, queries):",
  "        items.sort()",
  "        ordered = sorted((query, index) for index, query in enumerate(queries))",
  "        answer = [0] * len(queries)",
  "        best = 0",
  "        item = 0",
  "        for query, index in ordered:",
  "            while item < len(items) and items[item][0] <= query:",
  "                best = max(best, items[item][1])",
  "                item += 1",
  "            answer[index] = best",
  "        return answer",
]);

const CODE_2070_PREFIX_BINARY = Object.freeze([
  "class Solution:",
  "    def maximumBeauty(self, items, queries):",
  "        items.sort()",
  "        prices = []",
  "        prefix = []",
  "        best = 0",
  "        for price, beauty in items:",
  "            best = max(best, beauty)",
  "            prices.append(price)",
  "            prefix.append(best)",
  "        answer = []",
  "        for query in queries:",
  "            lo, hi = 0, len(prices)",
  "            while lo < hi:",
  "                mid = (lo + hi) // 2",
  "                if prices[mid] <= query:",
  "                    lo = mid + 1",
  "                else:",
  "                    hi = mid",
  "            answer.append(prefix[lo - 1] if lo else 0)",
  "        return answer",
]);

function parse2070Input(input) {
  let data = input;
  if (typeof input === "string") {
    try {
      data = JSON.parse(input);
    } catch (_error) {
      throw new Error('2070: enter JSON like {"items":[[1,2],[3,5]],"queries":[2,3]}.');
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("2070: input must be an object with items and queries arrays.");
  }
  const { items, queries } = data;
  if (!Array.isArray(items) || items.length < 1 || items.length > MAX_ITEMS_2070) {
    throw new Error(`2070: enter 1–${MAX_ITEMS_2070} [price, beauty] items.`);
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > MAX_QUERIES_2070) {
    throw new Error(`2070: enter 1–${MAX_QUERIES_2070} queries.`);
  }
  const parsedItems = items.map((item, index) => {
    if (!Array.isArray(item) || item.length !== 2
      || item.some((value) => !Number.isSafeInteger(value) || value < 1 || value > MAX_VALUE_2070)) {
      throw new Error(`2070: item ${index + 1} must be [price, beauty] with values in [1, ${MAX_VALUE_2070}].`);
    }
    return [...item];
  });
  if (queries.some((query) => !Number.isSafeInteger(query) || query < 1 || query > MAX_VALUE_2070)) {
    throw new Error(`2070: every query must be an integer in [1, ${MAX_VALUE_2070}].`);
  }
  return { items: parsedItems, queries: [...queries] };
}

function buildSteps2070(input) {
  const { items, queries } = parse2070Input(input);
  const originalItems = items.map(([price, beauty], id) => ({ id, price, beauty }));
  const sortedItems = originalItems
    .map((item) => ({ ...item }))
    .sort((left, right) => left.price - right.price || left.beauty - right.beauty || left.id - right.id);
  const orderedQueries = queries
    .map((value, originalIndex) => ({ value, originalIndex }))
    .sort((left, right) => left.value - right.value || left.originalIndex - right.originalIndex);
  const answers = Array(queries.length).fill(0);
  const resolved = Array(queries.length).fill(false);
  const steps = [];
  let itemsSorted = false;
  let queriesSorted = false;
  let best = 0;
  let pointer = 0;
  let queryOrderIndex = -1;
  let activeItemIndex = null;
  let comparison = null;
  let previousBest = 0;

  function emit(event, line, final = false) {
    const activeQuery = queryOrderIndex >= 0 && queryOrderIndex < orderedQueries.length
      ? orderedQueries[queryOrderIndex]
      : null;
    steps.push({
      title: bi("Quét giá, giữ món đẹp nhất", "Sweep prices, keep the best beauty"),
      note: bi("", ""),
      codeLines: [line],
      final,
      arr: [],
      sub: [],
      highlight: [],
      mark: [],
      vars: [
        { name: "query", value: activeQuery?.value ?? "—" },
        { name: "item", value: pointer },
        { name: "best", value: best },
        { name: "answer", value: answers.map((value, index) => resolved[index] ? value : "—").join(", ") },
      ],
      mostBeautifulItem2070View: {
        approach: 1,
        event,
        items: originalItems.map((item) => ({ ...item })),
        sortedItems: sortedItems.map((item) => ({ ...item })),
        itemsSorted,
        queries: [...queries],
        orderedQueries: orderedQueries.map((query) => ({ ...query })),
        queriesSorted,
        answers: [...answers],
        resolved: [...resolved],
        queryOrderIndex,
        activeQuery: activeQuery ? { ...activeQuery } : null,
        pointer,
        activeItemIndex,
        comparison: comparison ? { ...comparison } : null,
        best,
        previousBest,
        final,
      },
    });
  }

  emit("bind-class", 1);
  emit("enter-method", 2);
  itemsSorted = true;
  emit("sort-items", 3);
  queriesSorted = true;
  emit("sort-queries", 4);
  emit("allocate-answer", 5);
  emit("seed-best", 6);
  emit("seed-pointer", 7);

  for (queryOrderIndex = 0; queryOrderIndex < orderedQueries.length; queryOrderIndex += 1) {
    const activeQuery = orderedQueries[queryOrderIndex];
    activeItemIndex = null;
    comparison = null;
    emit("pick-query", 8);
    while (pointer < sortedItems.length && sortedItems[pointer].price <= activeQuery.value) {
      activeItemIndex = pointer;
      comparison = {
        price: sortedItems[pointer].price,
        query: activeQuery.value,
        allowed: true,
      };
      emit("open-gate", 9);
      previousBest = best;
      best = Math.max(best, sortedItems[pointer].beauty);
      emit("raise-best", 10);
      pointer += 1;
      emit("advance-item", 11);
    }
    activeItemIndex = pointer < sortedItems.length ? pointer : null;
    comparison = pointer < sortedItems.length ? {
      price: sortedItems[pointer].price,
      query: activeQuery.value,
      allowed: false,
    } : { price: null, query: activeQuery.value, allowed: false };
    emit("close-gate", 9);
    answers[activeQuery.originalIndex] = best;
    resolved[activeQuery.originalIndex] = true;
    activeItemIndex = null;
    emit("place-answer", 12);
  }

  queryOrderIndex = orderedQueries.length;
  activeItemIndex = null;
  comparison = null;
  emit("return-answer", 13, true);
  return {
    original: { items: items.map((item) => [...item]), queries: [...queries] },
    answer: answers,
    steps,
  };
}

function buildPrefixBinarySteps2070(input) {
  const { items, queries } = parse2070Input(input);
  const originalItems = items.map(([price, beauty], id) => ({ id, price, beauty }));
  const sortedItems = originalItems
    .map((item) => ({ ...item }))
    .sort((left, right) => left.price - right.price || left.beauty - right.beauty || left.id - right.id);
  const prices = [];
  const prefix = [];
  const answers = Array(queries.length).fill(0);
  const resolved = Array(queries.length).fill(false);
  const steps = [];
  let itemsSorted = false;
  let best = 0;
  let previousBest = 0;
  let activeItemIndex = null;
  let queryOrderIndex = -1;
  let activeQuery = null;
  let lo = null;
  let hi = null;
  let mid = null;
  let selectedIndex = null;
  let comparison = null;
  let searchPath = [];

  function emit(event, line, final = false) {
    steps.push({
      title: bi("Sort → Prefix Max → Binary Search", "Sort → Prefix Max → Binary Search"),
      note: bi("", ""),
      codeLines: [line],
      codeBlock: 2,
      final,
      arr: [],
      sub: [],
      highlight: [],
      mark: [],
      vars: [
        { name: "query", value: activeQuery?.value ?? "—" },
        { name: "lo", value: lo ?? "—" },
        { name: "hi", value: hi ?? "—" },
        { name: "mid", value: mid ?? "—" },
        { name: "best", value: best },
        { name: "answer", value: answers.map((value, index) => resolved[index] ? value : "—").join(", ") },
      ],
      mostBeautifulItem2070View: {
        approach: 2,
        event,
        items: originalItems.map((item) => ({ ...item })),
        sortedItems: sortedItems.map((item) => ({ ...item })),
        itemsSorted,
        prices: [...prices],
        prefix: [...prefix],
        queries: [...queries],
        orderedQueries: queries.map((value, originalIndex) => ({ value, originalIndex })),
        queriesSorted: false,
        answers: [...answers],
        resolved: [...resolved],
        queryOrderIndex,
        activeQuery: activeQuery ? { ...activeQuery } : null,
        activeItemIndex,
        pointer: prefix.length,
        comparison: comparison ? { ...comparison } : null,
        best,
        previousBest,
        lo,
        hi,
        mid,
        selectedIndex,
        searchPath: [...searchPath],
        final,
      },
    });
  }

  emit("bind-class", 1);
  emit("enter-method", 2);
  itemsSorted = true;
  emit("sort-items", 3);
  emit("make-prices", 4);
  emit("make-prefix", 5);
  emit("seed-best", 6);

  for (let index = 0; index < sortedItems.length; index += 1) {
    activeItemIndex = index;
    emit("prefix-item", 7);
    previousBest = best;
    best = Math.max(best, sortedItems[index].beauty);
    emit("prefix-best", 8);
    prices.push(sortedItems[index].price);
    emit("append-price", 9);
    prefix.push(best);
    emit("append-prefix", 10);
  }

  activeItemIndex = null;
  emit("make-answer", 11);
  for (queryOrderIndex = 0; queryOrderIndex < queries.length; queryOrderIndex += 1) {
    activeQuery = { value: queries[queryOrderIndex], originalIndex: queryOrderIndex };
    lo = null;
    hi = null;
    mid = null;
    selectedIndex = null;
    comparison = null;
    searchPath = [];
    emit("pick-query-bs", 12);
    lo = 0;
    hi = prices.length;
    emit("init-search", 13);
    while (lo < hi) {
      emit("check-search", 14);
      mid = Math.floor((lo + hi) / 2);
      searchPath.push(mid);
      emit("pick-mid", 15);
      comparison = { price: prices[mid], query: activeQuery.value, allowed: prices[mid] <= activeQuery.value };
      emit("compare-mid", 16);
      if (comparison.allowed) {
        lo = mid + 1;
        emit("move-right", 17);
      } else {
        hi = mid;
        emit("move-left", 19);
      }
    }
    selectedIndex = lo - 1;
    comparison = null;
    emit("search-done", 14);
    answers[queryOrderIndex] = selectedIndex >= 0 ? prefix[selectedIndex] : 0;
    resolved[queryOrderIndex] = true;
    emit("place-answer-bs", 20);
  }

  queryOrderIndex = queries.length;
  activeQuery = null;
  mid = null;
  comparison = null;
  emit("return-answer-bs", 21, true);
  return {
    original: { items: items.map((item) => [...item]), queries: [...queries] },
    answer: answers,
    steps,
  };
}

const DEFAULT_INPUT_2070 = {
  items: [[1, 2], [3, 2], [2, 4], [5, 6], [3, 5]],
  queries: [1, 2, 3, 4, 5, 6],
};

module.exports = {
  2070: {
    id: 2070,
    difficulty: "medium",
    slug: "most-beautiful-item-for-each-query",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
      { key: "offline-query", vi: "Truy vấn offline", en: "Offline Query" },
    ],
    title: bi("Most Beautiful Item for Each Query", "Most Beautiful Item for Each Query"),
    titleVi: bi("Món đồ đẹp nhất trong ngân sách", "Most beautiful item within each budget"),
    statement: bi(
      `Mỗi món có [giá, độ đẹp]. Với từng ngân sách, tìm độ đẹp lớn nhất trong các món có giá không vượt ngân sách. Visualization hỗ trợ tối đa ${MAX_ITEMS_2070} món và ${MAX_QUERIES_2070} truy vấn.`,
      `Each item has [price, beauty]. For every budget, return the greatest beauty among items whose price does not exceed it. This visualization supports up to ${MAX_ITEMS_2070} items and ${MAX_QUERIES_2070} queries.`,
    ),
    inputKind: "string",
    inputLabel: bi(
      'JSON: {"items":[[giá,đẹp],...],"queries":[...]}',
      'JSON: {"items":[[price,beauty],...],"queries":[...]}',
    ),
    defaultInput: JSON.stringify(DEFAULT_INPUT_2070),
    extraParams: [{
      key: "approach",
      label: bi("Cách giải", "Approach"),
      type: "select",
      default: "1",
      options: [
        { value: "1", label: bi("1 · Sort query + quét giá", "1 · Sort queries + price sweep") },
        { value: "2", label: bi("2 · Prefix Max + Binary Search", "2 · Prefix Max + Binary Search") },
      ],
    }],
    debugMode: "line-by-line",
    approach: [
      bi("Cách 1: xếp cả món và query; kéo cổng giá sang phải, mỗi món đi qua một lần.", "Approach 1: sort items and queries; sweep the price gate so each item passes once."),
      bi("Cách 2: Sort → Prefix Max → Binary Search.", "Approach 2: Sort → Prefix Max → Binary Search."),
      bi("prefix[i] là beauty lớn nhất đến giá i; mỗi query tìm giá cuối cùng không vượt ngân sách.", "prefix[i] is the best beauty through price i; each query finds the last affordable price."),
    ],
    complexity: {
      time: "O(n log n + q log q)",
      space: "O(q)",
      note: bi("Sau khi sắp xếp, con trỏ đi qua mỗi món đúng một lần.", "After sorting, the pointer visits each item exactly once."),
    },
    complexity2: {
      time: "O(n log n + q log n)",
      space: "O(n + q)",
      note: bi("Dựng prefix max một lần; mỗi query tìm kiếm nhị phân độc lập.", "Build prefix maxima once; each query runs an independent binary search."),
    },
    code: CODE_2070,
    codeLabel: bi("Cách 1 · Sort query + quét giá", "Approach 1 · Sort queries + price sweep"),
    code2: CODE_2070_PREFIX_BINARY,
    code2Label: bi("Cách 2 · Sort → Prefix Max → Binary Search", "Approach 2 · Sort → Prefix Max → Binary Search"),
    liveArgs: (input) => {
      const parsed = parse2070Input(input);
      return [parsed.items, parsed.queries];
    },
    parseInput: parse2070Input,
    builder: buildSteps2070,
    builder2: buildPrefixBinarySteps2070,
  },
};
