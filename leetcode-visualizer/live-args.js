"use strict";

const UI_ONLY_PARAMS = new Set(["approach"]);

function splitPythonParams(source) {
  const parts = [];
  let current = "";
  let depth = 0;
  for (const char of source) {
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
    if ("([{<".includes(char)) depth += 1;
    if (")]}>".includes(char)) depth -= 1;
  }
  if (current.trim()) parts.push(current);
  return parts
    .map((part) => {
      const match = part.match(/^\s*([A-Za-z_]\w*)/);
      return match ? match[1] : null;
    })
    .filter(Boolean);
}

function liveCodeFor(problem, codeBlock) {
  if (Number(codeBlock) === 3 && Array.isArray(problem.code3)) return problem.code3;
  if (Number(codeBlock) === 2 && Array.isArray(problem.code2)) return problem.code2;
  return problem.code || [];
}

function extractLiveMethod(problem, codeBlock = 1) {
  const source = liveCodeFor(problem, codeBlock).join("\n");
  const match = source.match(/class\s+Solution\b[\s\S]*?def\s+(\w+)\s*\(\s*self\s*(?:,\s*([^)]*))?\)/);
  if (!match) return null;
  return { name: match[1], params: splitPythonParams(match[2] || "") };
}

function normalizedKey(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseScalar(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === "true";
  return value;
}

function parseNumberList(value) {
  if (Array.isArray(value)) return value.map(parseScalar);
  if (typeof value !== "string") return value;
  if (!value.trim()) return [];
  return value.split(",").map((item) => parseScalar(item.trim()));
}

function parsePairRows(value, rowSeparator = ";") {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch (_error) {
      // Continue with compact delimiter formats.
    }
  }
  return value.split(rowSeparator).filter(Boolean).map((row) => parseNumberList(row));
}

function parseRecords(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[")) {
      try {
        return JSON.parse(trimmed);
      } catch (_error) {
        // Continue with formats such as 0-1,1-2.
      }
    }
    const separator = trimmed.includes(";") ? ";" : trimmed.includes("|") ? "|" : ",";
    value = trimmed.split(separator).filter(Boolean);
  }
  if (!Array.isArray(value)) return value;
  return value.map((row) => {
    if (Array.isArray(row)) return row.map(parseScalar);
    if (row && typeof row === "object") return row;
    const text = String(row).trim();
    const delimiter = text.includes("->") ? "->" : text.includes("-") ? "-" : text.includes(":") ? ":" : ",";
    return text.split(delimiter).map((item) => parseScalar(item.trim()));
  });
}

function parseMatrix(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch (_error) {
      // Continue with row-delimited input.
    }
  }
  const rowSeparator = trimmed.includes("|") ? "|" : ";";
  return trimmed.split(rowSeparator).filter(Boolean).map((row) => parseNumberList(row));
}

function parseTreeValues(value) {
  const values = Array.isArray(value) ? value : String(value || "").split(",");
  return values.map((item) => {
    const trimmed = String(item).trim();
    if (!trimmed || /^(null|none|#)$/i.test(trimmed)) return null;
    return parseScalar(trimmed);
  });
}

function listMarker(value) {
  return { __viz_type: "linked_list", values: parseNumberList(value) };
}

function treeMarker(value) {
  return { __viz_type: "binary_tree", values: parseTreeValues(value), tree_id: "root" };
}

function convertEdgeObjects(value) {
  if (!Array.isArray(value) || !value.some((item) => item && typeof item === "object" && !Array.isArray(item))) {
    return value;
  }
  return value.map((edge) => {
    if (!edge || typeof edge !== "object" || Array.isArray(edge)) return edge;
    const tail = ["weight", "time", "cost", "probability", "prob", "w"]
      .find((key) => Object.prototype.hasOwnProperty.call(edge, key));
    const from = edge.u ?? edge.from ?? edge.source;
    const to = edge.v ?? edge.to ?? edge.target;
    if (from === undefined || to === undefined) return edge;
    return tail ? [from, to, edge[tail]] : [from, to];
  });
}

function coerceParamValue(problem, paramName, value, context) {
  if (problem.id === 100 && (paramName === "p" || paramName === "q")) {
    return { ...treeMarker(value), tree_id: paramName };
  }

  if (paramName === "root") {
    if (problem.id === 116) return { ...treeMarker(value), __viz_type: "binary_tree_next" };
    return treeMarker(value);
  }
  if (["head", "l1", "l2", "headA", "headB"].includes(paramName)) return listMarker(value);
  if (paramName === "lists") {
    const rows = typeof value === "string" ? value.split(";") : value;
    return (rows || []).map(listMarker);
  }
  if (["p", "q", "target"].includes(paramName) && context.hasRoot && [235, 236, 285, 863, 1644].includes(problem.id)) {
    return { __viz_type: "binary_tree_ref", tree_id: "root", value: parseScalar(value) };
  }
  if (paramName === "nodes" && context.hasRoot) {
    return {
      __viz_type: "binary_tree_refs",
      tree_id: "root",
      values: parseNumberList(value),
    };
  }
  const matrixParams = new Set([
    "board", "dungeon", "graph", "grid", "heights", "image", "isConnected",
    "isWater", "mat", "matrix", "maze", "moveTime", "obstacleGrid", "rooms",
    "routes", "triangle",
  ]);
  if (matrixParams.has(paramName)) return parseMatrix(value);
  const recordParams = new Set([
    "buildings", "connections", "edges", "flights", "intervals", "logs", "moves",
    "points", "prerequisites", "queries", "relations", "richer", "roads", "tickets",
    "times", "updates",
  ]);
  if (recordParams.has(paramName)) {
    if (problem.id === 636 && paramName === "logs") return value;
    const records = convertEdgeObjects(parseRecords(value));
    if (paramName === "queries" && Array.isArray(records) && records.every((row) => Array.isArray(row) && row.length === 1)) {
      return records.map((row) => row[0]);
    }
    return records;
  }
  const listParams = new Set([
    "coins", "cost", "deadends", "dictionary", "fee", "freq", "heaters", "houses",
    "nums1", "nums2", "online", "products", "quiet", "sandwiches", "stones", "succProb",
    "wordDict", "words",
  ]);
  if (listParams.has(paramName) && typeof value === "string") {
    return parseNumberList(value);
  }
  return value;
}

function specialLiveArgs(problem, input, params, primary, sources) {
  switch (problem.id) {
    case 2:
    case 21: {
      const [left = "", right = ""] = String(input).split(";");
      return [listMarker(left), listMarker(right)];
    }
    case 133:
      return [{
        __viz_type: "graph_node",
        n: sources.n,
        edges: sources.edges,
        start: sources.start,
      }];
    case 138:
      return [{
        __viz_type: "random_list",
        entries: String(input).split(",").filter(Boolean).map((entry) => entry.split(":").map(Number)),
      }];
    case 160: {
      const [headA = "", headB = "", intersection = ""] = String(input).split(";");
      return [{
        __viz_type: "intersecting_lists",
        head_a: parseNumberList(headA),
        head_b: parseNumberList(headB),
        intersection: parseScalar(intersection),
      }, { __viz_type: "intersecting_lists_ref", head: "b" }];
    }
    case 505:
      return [primary, [params.startR, params.startC], [params.destR, params.destC]];
    case 694:
      return [Array.isArray(primary)
        ? primary.map((row) => row.map((cell) => Number(cell)))
        : parseMatrix(input).map((row) => row.map((cell) => Number(cell)))];
    case 734:
      return [sources.s1, sources.s2, sources.pairs];
    case 1258:
      return [
        String(input).split(",").filter(Boolean).map((pair) => pair.split(":")),
        params.sentence,
      ];
    case 1514: {
      const triples = sources.edges || [];
      return [params.n, triples.map((edge) => edge.slice(0, 2)), triples.map((edge) => edge[2]), params.start_node, params.end_node];
    }
    case 3532:
    case 3534: {
      const nums = Array.isArray(primary) ? primary : parseNumberList(input);
      return [nums.length, nums, params.maxDiff, parseRecords(params.queries)];
    }
    case 3620: {
      const edges = (sources.edges || String(input).split(","))
        .map((edge) => Array.isArray(edge) ? edge : String(edge).split("-").map(Number));
      return [edges, parseNumberList(params.online), params.k];
    }
    case 430:
      return [{
        __viz_type: "multilevel_list",
        values: parseNumberList(input),
        children: params.children,
      }];
    case 1236:
      return [params.startUrl, {
        __viz_type: "html_parser",
        edges: String(params.edges).split(";").filter(Boolean).map((edge) => edge.split("->")),
      }];
    case 1650:
      return [{
        __viz_type: "parent_tree_ref",
        values: parseTreeValues(input),
        value: parseScalar(params.p),
        tree_id: "parent_tree",
      }, {
        __viz_type: "parent_tree_existing_ref",
        value: parseScalar(params.q),
        tree_id: "parent_tree",
      }];
    default:
      return null;
  }
}

function splitCallArgs(source) {
  const args = [];
  let current = "";
  let quote = null;
  for (const char of source) {
    if ((char === '"' || char === "'") && (!quote || quote === char)) {
      quote = quote ? null : char;
      current += char;
      continue;
    }
    if (char === "," && !quote) {
      args.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) args.push(current);
  return args.map((arg) => {
    const trimmed = arg.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }
    return parseScalar(trimmed);
  });
}

function parseFunctionOperations(input) {
  return String(input).split(/\s*[;,]\s*(?=[A-Za-z_]\w*\s*\()/).filter(Boolean).map((item) => {
    const match = item.trim().match(/^([A-Za-z_]\w*)\s*\((.*)\)$/);
    return match ? { name: match[1], args: splitCallArgs(match[2]) } : null;
  }).filter(Boolean);
}

function parseSpaceOperations(input) {
  return String(input).split("|").map((item) => item.trim()).filter(Boolean).map((item) => {
    const tokens = item.split(/\s+/);
    return { name: tokens[0], args: tokens.slice(1).map(parseScalar) };
  });
}

function designConfig(className, constructorArgs, operations) {
  return { className, constructorArgs, operations };
}

function prepareDesignLiveRun(problem, input, params = {}, codeBlock = 1) {
  const words = (value) => String(value).split(",").map((item) => item.trim()).filter(Boolean);
  switch (problem.id) {
    case 146:
      return designConfig("LRUCache", [params.capacity], parseSpaceOperations(input));
    case 155:
    case 346:
    case 362:
    case 641:
    case 933:
    case 1670: {
      const operations = parseFunctionOperations(input);
      const constructor = operations.shift() || { args: [] };
      const classNames = { 155: "MinStack", 346: "MovingAverage", 362: "HitCounter", 641: "MyCircularDeque", 933: "RecentCounter", 1670: "FrontMiddleBackQueue" };
      return designConfig(classNames[problem.id], constructor.args, operations);
    }
    case 208:
      return designConfig("Trie", [], [
        ...words(input).map((word) => ({ name: "insert", args: [word] })),
        { name: "search", args: [params.search] },
        { name: "startsWith", args: [params.prefix] },
      ]);
    case 211:
      return designConfig("WordDictionary", [], [
        ...words(input).map((word) => ({ name: "addWord", args: [word] })),
        { name: "search", args: [params.search] },
      ]);
    case 297:
      return designConfig("Codec", [], [
        { name: "serialize", args: [treeMarker(input)] },
        { name: "deserialize", args: [{ __viz_type: "previous_result" }] },
      ]);
    case 303:
      return designConfig("NumArray", [input], [{ name: "sumRange", args: [params.left, params.right] }]);
    case 304:
      return designConfig("NumMatrix", [parseMatrix(input)], [{ name: "sumRegion", args: [params.row1, params.col1, params.row2, params.col2] }]);
    case 307:
      return designConfig("NumArray", [input], parseSpaceOperations(params.operations));
    case 355:
      return designConfig("Twitter", [], parseFunctionOperations(input));
    case 432:
      return designConfig("AllOne", [], parseSpaceOperations(input));
    case 588: {
      const aliases = { add: "addContentToFile", read: "readContentFromFile" };
      const operations = parseFunctionOperations(input).map((operation) => ({ ...operation, name: aliases[operation.name] || operation.name }));
      return designConfig("FileSystem", [], operations);
    }
    case 676:
      return designConfig("MagicDictionary", [], [
        { name: "buildDict", args: [words(input)] },
        ...words(params.search).map((word) => ({ name: "search", args: [word] })),
      ]);
    case 911:
      return designConfig("TopVotedCandidate", [input, parseNumberList(params.times)],
        parseNumberList(params.queries).map((query) => ({ name: "q", args: [query] })));
    case 1166: {
      const aliases = { create: "createPath" };
      const operations = parseFunctionOperations(input).map((operation) => ({ ...operation, name: aliases[operation.name] || operation.name }));
      return designConfig("FileSystem", [], operations);
    }
    case 1472: {
      const parts = String(input).split("|").map((item) => item.trim()).filter(Boolean);
      const homepage = parts.shift();
      const className = Number(codeBlock) === 2 && liveCodeFor(problem, codeBlock).join("\n").includes("class BrowserHistoryArray")
        ? "BrowserHistoryArray"
        : "BrowserHistory";
      return designConfig(className, [homepage], parseSpaceOperations(parts.join(" | ")));
    }
    case 1797:
      return designConfig("AuthenticationManager", [params.ttl], parseSpaceOperations(input));
    case 1804:
      return designConfig("Trie", [], [
        ...words(input).map((word) => ({ name: "insert", args: [word] })),
        { name: "countWordsEqualTo", args: [params.countWord] },
        { name: "countWordsStartingWith", args: [params.countPrefix] },
        { name: "erase", args: [params.erase] },
      ]);
    case 3829: {
      const operations = parseFunctionOperations(input);
      if (operations[0] && operations[0].name === "RideSharingSystem") operations.shift();
      return designConfig("RideSharingSystem", [], operations);
    }
    case 9001:
      return {
        functionName: "get_highest_earning_experiences",
        args: [input, words(params.experiences).map((value) => value === "-" ? "" : value), parseNumberList(params.deltas)],
      };
    default:
      return null;
  }
}

function prepareGenericLiveArgs(problem, input, params = {}, codeBlock = 1) {
  const method = extractLiveMethod(problem, codeBlock);
  if (!method) {
    throw new Error("Live runner supports code with class Solution and one public method.");
  }

  let built = {};
  try {
    built = problem.builder(input, params) || {};
  } catch (_error) {
    // The solve endpoint owns validation. Falling back to the raw values here
    // still gives edited code a useful chance to run.
  }

  const nestedOriginal = built.original && typeof built.original === "object" && !Array.isArray(built.original)
    ? built.original
    : {};
  const sources = { ...built, ...nestedOriginal };
  for (const [key, value] of Object.entries(params)) {
    if (!UI_ONLY_PARAMS.has(key) && sources[key] === undefined) sources[key] = value;
  }
  const normalizedSources = new Map(
    Object.entries(sources).map(([key, value]) => [normalizedKey(key), value]),
  );
  let primary = built.original !== undefined
    ? built.original
    : built.input !== undefined
      ? built.input
      : problem.singleInput && Array.isArray(input)
        ? input[0]
        : input;
  if (problem.singleInput && Array.isArray(primary)) primary = primary[0];

  const special = specialLiveArgs(problem, input, params, primary, sources);
  if (special) return special;

  const unresolved = [];
  const values = method.params.map((paramName, index) => {
    let value = normalizedSources.get(normalizedKey(paramName));
    if (value === undefined && paramName === "targetSum") value = normalizedSources.get("target");
    if (value === undefined) unresolved.push(index);
    return value;
  });

  if (unresolved.length === 1) values[unresolved[0]] = primary;
  if (unresolved.length > 1) {
    throw new Error(`Could not prepare live arguments: ${unresolved.map((index) => method.params[index]).join(", ")}`);
  }

  const context = { hasRoot: method.params.includes("root") };
  return values.map((value, index) => coerceParamValue(problem, method.params[index], value, context));
}

module.exports = {
  extractLiveMethod,
  prepareDesignLiveRun,
  prepareGenericLiveArgs,
};
