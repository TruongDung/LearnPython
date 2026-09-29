"use strict";

const bi = (vi, en) => ({ vi, en });

function fail(problemId, ErrorType, vi, en) {
  throw new ErrorType(`#${problemId}: ${vi} / ${en}`);
}

function parsePlainParams(params, problemId) {
  if (params === undefined) return {};
  if (params === null || typeof params !== "object" || Array.isArray(params)) {
    fail(problemId, TypeError, "params phải là object", "params must be an object");
  }
  const prototype = Object.getPrototypeOf(params);
  if (prototype !== Object.prototype && prototype !== null) {
    fail(problemId, TypeError, "params phải là object thuần", "params must be a plain object");
  }
  return params;
}

function parseInteger(value, options = {}) {
  const {
    problemId = "?", name = "value", min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
  } = options;
  let parsed = value;
  if (typeof parsed === "string" && /^-?(0|[1-9]\d*)$/.test(parsed.trim())) {
    parsed = Number(parsed.trim());
  }
  if (!Number.isSafeInteger(parsed)) {
    fail(problemId, TypeError, `${name} phải là số nguyên an toàn`, `${name} must be a safe integer`);
  }
  if (parsed < min || parsed > max) {
    fail(problemId, RangeError, `${name} phải thuộc [${min}, ${max}]`, `${name} must be in [${min}, ${max}]`);
  }
  return parsed;
}

function parseIntegerArray(input, options = {}) {
  const {
    problemId = "?", name = "input", minLength = 1, maxLength = 100,
    minValue = Number.MIN_SAFE_INTEGER, maxValue = Number.MAX_SAFE_INTEGER,
  } = options;
  let values = input;
  if (typeof values === "string") {
    const text = values.trim();
    if (text.startsWith("[")) {
      try { values = JSON.parse(text); } catch (_error) {
        fail(problemId, TypeError, `${name} không phải JSON hợp lệ`, `${name} is not valid JSON`);
      }
    } else {
      values = text ? text.split(",").map((part) => part.trim()) : [];
    }
  }
  if (!Array.isArray(values)) {
    fail(problemId, TypeError, `${name} phải là mảng`, `${name} must be an array`);
  }
  if (values.length < minLength || values.length > maxLength) {
    fail(problemId, RangeError, `${name} phải có ${minLength}..${maxLength} phần tử`, `${name} must contain ${minLength}..${maxLength} values`);
  }
  return values.map((value, index) => parseInteger(value, {
    problemId, name: `${name}[${index}]`, min: minValue, max: maxValue,
  }));
}

function parseStringArray(input, options = {}) {
  const {
    problemId = "?", name = "words", minLength = 1, maxLength = 100,
    minWordLength = 1, maxWordLength = 100, lowercase = true, distinct = false,
  } = options;
  let words = input;
  if (typeof words === "string") {
    const text = words.trim();
    if (text.startsWith("[")) {
      try { words = JSON.parse(text); } catch (_error) {
        fail(problemId, TypeError, `${name} không phải JSON hợp lệ`, `${name} is not valid JSON`);
      }
    } else {
      words = text ? text.split(",").map((word) => word.trim()) : [];
    }
  }
  if (!Array.isArray(words) || words.length < minLength || words.length > maxLength) {
    fail(problemId, RangeError, `${name} phải là mảng ${minLength}..${maxLength} chuỗi`, `${name} must be an array of ${minLength}..${maxLength} strings`);
  }
  const result = words.map((word, index) => {
    if (typeof word !== "string" || word.length < minWordLength || word.length > maxWordLength) {
      fail(problemId, RangeError, `${name}[${index}] có độ dài không hợp lệ`, `${name}[${index}] has an invalid length`);
    }
    if (lowercase && !/^[a-z]+$/.test(word)) {
      fail(problemId, TypeError, `${name}[${index}] chỉ được chứa a-z`, `${name}[${index}] must contain only a-z`);
    }
    return word;
  });
  if (distinct && new Set(result).size !== result.length) {
    fail(problemId, RangeError, `${name} phải gồm các chuỗi khác nhau`, `${name} must contain distinct strings`);
  }
  return result;
}

function parseRows(input, options = {}) {
  const {
    problemId = "?", name = "rows", columns = null, minRows = 1, maxRows = 100,
    minValue = Number.MIN_SAFE_INTEGER, maxValue = Number.MAX_SAFE_INTEGER,
  } = options;
  let rows = input;
  if (typeof rows === "string") {
    const text = rows.trim();
    if (text.startsWith("[")) {
      try { rows = JSON.parse(text); } catch (_error) {
        fail(problemId, TypeError, `${name} không phải JSON hợp lệ`, `${name} is not valid JSON`);
      }
    } else {
      rows = text ? text.split(";").filter(Boolean).map((row) => row.split(",")) : [];
    }
  }
  if (!Array.isArray(rows) || rows.length < minRows || rows.length > maxRows) {
    fail(problemId, RangeError, `${name} phải có ${minRows}..${maxRows} hàng`, `${name} must contain ${minRows}..${maxRows} rows`);
  }
  return rows.map((row, rowIndex) => {
    if (!Array.isArray(row) || (columns !== null && row.length !== columns)) {
      fail(problemId, TypeError, `${name}[${rowIndex}] sai số cột`, `${name}[${rowIndex}] has an invalid column count`);
    }
    return row.map((value, columnIndex) => parseInteger(value, {
      problemId, name: `${name}[${rowIndex}][${columnIndex}]`, min: minValue, max: maxValue,
    }));
  });
}

function cloneJsonSafe(value, path = "$", active = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(`${path} must contain a finite number`);
    return value;
  }
  if (typeof value !== "object" || active.has(value)) throw new TypeError(`${path} must be a non-cyclic JSON value`);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== Array.prototype && prototype !== null) {
    throw new TypeError(`${path} must contain only arrays and plain objects`);
  }
  active.add(value);
  const clone = Array.isArray(value)
    ? value.map((entry, index) => cloneJsonSafe(entry, `${path}[${index}]`, active))
    : Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneJsonSafe(entry, `${path}.${key}`, active)]));
  active.delete(value);
  return clone;
}

function validateBilingual(value, name, problemId) {
  if (!value || typeof value !== "object" || typeof value.vi !== "string" || typeof value.en !== "string") {
    throw new TypeError(`#${problemId}: ${name} must be bilingual {vi,en}`);
  }
}

function normalizeIndices(values, length, problemId, name) {
  if (!Array.isArray(values)) throw new TypeError(`#${problemId}: ${name} must be an array`);
  return [...new Set(values.map((value) => parseInteger(value, {
    problemId, name, min: 0, max: Math.max(0, length - 1),
  })))].sort((left, right) => left - right);
}

function createTracer(options) {
  const {
    problemId, source, phases, maxSteps = 260, baseArray = [],
    legend = [
      { label: bi("Đang xét", "Active"), state: "active" },
      { label: bi("Ứng viên", "Candidate"), state: "candidate" },
      { label: bi("Đã cập nhật", "Updated"), state: "updated" },
      { label: bi("Hoàn tất", "Completed"), state: "success" },
    ],
  } = options;
  if (!Number.isSafeInteger(problemId) || !Array.isArray(source) || !source.length || !Array.isArray(phases) || !phases.length) {
    throw new TypeError("createTracer requires problemId, source, and phases");
  }
  phases.forEach((phase, index) => validateBilingual(phase, `phases[${index}]`, problemId));
  const steps = [];
  let traceTruncated = false;

  function truncate() { traceTruncated = true; }

  function emit(config) {
    const final = Boolean(config.final);
    if (!final && steps.length >= maxSteps - 1) {
      traceTruncated = true;
      return false;
    }
    if (final && steps.length >= maxSteps) throw new Error(`#${problemId}: no room for final trace frame`);
    const phaseIndex = parseInteger(config.phaseIndex ?? 0, {
      problemId, name: "phaseIndex", min: 0, max: phases.length - 1,
    });
    const title = config.title || phases[phaseIndex];
    const note = config.note || config.action || title;
    const action = config.action || title;
    const formula = config.formula || bi("—", "—");
    [title, note, action, formula].forEach((value, index) => validateBilingual(value, ["title", "note", "action", "formula"][index], problemId));
    const codeLines = Array.isArray(config.codeLines) && config.codeLines.length ? config.codeLines : [1];
    codeLines.forEach((line) => parseInteger(line, { problemId, name: "codeLine", min: 1, max: source.length }));
    const arr = config.arr === undefined ? baseArray : config.arr;
    if (!Array.isArray(arr) || arr.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
      throw new TypeError(`#${problemId}: arr must contain finite numbers`);
    }
    const sub = config.sub === undefined ? arr.map(() => "") : config.sub;
    if (!Array.isArray(sub) || sub.length !== arr.length) throw new TypeError(`#${problemId}: arr and sub must be parallel arrays`);
    const view = {
      problemId,
      phaseIndex,
      phases: phases.map((phase) => ({ ...phase })),
      phase: { ...phases[phaseIndex] },
      action,
      formula,
      metrics: config.metrics || [],
      legend: config.legend || legend,
      answer: final ? config.answer : null,
      traceTruncated,
    };
    for (const key of ["graph", "table", "queue", "groups", "sequence"]) {
      if (Object.prototype.hasOwnProperty.call(config, key)) view[key] = config[key];
    }
    const step = {
      title,
      note,
      codeLines: [...codeLines],
      vars: config.vars || [],
      arr: [...arr],
      sub: [...sub],
      highlight: normalizeIndices(config.highlight || [], arr.length, problemId, "highlight"),
      mark: normalizeIndices(config.mark || [], arr.length, problemId, "mark"),
      final,
      hardProblemView: view,
    };
    steps.push(cloneJsonSafe(step));
    return true;
  }

  function finish() {
    if (!steps.length || !steps.at(-1).final || steps.slice(0, -1).some((step) => step.final)) {
      throw new Error(`#${problemId}: trace must have exactly one final frame at the end`);
    }
    if (steps.length > maxSteps) throw new Error(`#${problemId}: trace exceeds ${maxSteps} frames`);
    JSON.stringify(steps);
    return steps;
  }

  return { steps, emit, finish, truncate, get truncated() { return traceTruncated; } };
}

function lowerBound(values, target) {
  let left = 0;
  let right = values.length;
  while (left < right) {
    const middle = left + Math.floor((right - left) / 2);
    if (values[middle] < target) left = middle + 1;
    else right = middle;
  }
  return left;
}

function upperBound(values, target) {
  let left = 0;
  let right = values.length;
  while (left < right) {
    const middle = left + Math.floor((right - left) / 2);
    if (values[middle] <= target) left = middle + 1;
    else right = middle;
  }
  return left;
}

class Fenwick {
  constructor(size) { this.tree = Array(size + 1).fill(0); }
  add(index, delta) {
    for (let current = index + 1; current < this.tree.length; current += current & -current) this.tree[current] += delta;
  }
  prefix(index) {
    let sum = 0;
    for (let current = index + 1; current > 0; current -= current & -current) sum += this.tree[current];
    return sum;
  }
}

class DSU {
  constructor(size, weights = null, activeByDefault = true) {
    this.parent = Array.from({ length: size }, (_, index) => activeByDefault ? index : -1);
    this.size = Array(size).fill(activeByDefault ? 1 : 0);
    this.sum = Array.from({ length: size }, (_, index) => activeByDefault ? Number(weights?.[index] || 0) : 0);
  }
  activate(index, weight = 0) {
    if (this.parent[index] !== -1) return false;
    this.parent[index] = index; this.size[index] = 1; this.sum[index] = weight; return true;
  }
  isActive(index) { return this.parent[index] !== -1; }
  find(index) {
    if (!this.isActive(index)) return -1;
    let root = index;
    while (this.parent[root] !== root) root = this.parent[root];
    while (this.parent[index] !== index) { const next = this.parent[index]; this.parent[index] = root; index = next; }
    return root;
  }
  union(left, right) {
    let rootLeft = this.find(left); let rootRight = this.find(right);
    if (rootLeft === -1 || rootRight === -1 || rootLeft === rootRight) return rootLeft;
    if (this.size[rootLeft] < this.size[rootRight]) [rootLeft, rootRight] = [rootRight, rootLeft];
    this.parent[rootRight] = rootLeft;
    this.size[rootLeft] += this.size[rootRight];
    this.sum[rootLeft] += this.sum[rootRight];
    return rootLeft;
  }
}

class MinHeap {
  constructor(compare = (left, right) => left[0] - right[0]) { this.values = []; this.compare = compare; }
  get size() { return this.values.length; }
  push(value) {
    this.values.push(value);
    let index = this.values.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.values[parent], value) <= 0) break;
      this.values[index] = this.values[parent]; index = parent;
    }
    this.values[index] = value;
  }
  pop() {
    if (!this.values.length) return null;
    const root = this.values[0]; const tail = this.values.pop();
    if (this.values.length) {
      let index = 0;
      while (true) {
        let child = index * 2 + 1;
        if (child >= this.values.length) break;
        if (child + 1 < this.values.length && this.compare(this.values[child + 1], this.values[child]) < 0) child += 1;
        if (this.compare(tail, this.values[child]) <= 0) break;
        this.values[index] = this.values[child]; index = child;
      }
      this.values[index] = tail;
    }
    return root;
  }
  snapshot(limit = 12) { return this.values.slice(0, limit).map((value) => Array.isArray(value) ? [...value] : value); }
}

function formatFinite(value) { return Number.isFinite(value) ? value : "∞"; }
function formatMask(mask, width = 26) { return `0b${(mask >>> 0).toString(2).padStart(width, "0")}`; }
function preview(values, limit = 12) { return values.slice(0, limit); }

module.exports = {
  bi, fail, parsePlainParams, parseInteger, parseIntegerArray, parseStringArray, parseRows,
  cloneJsonSafe, createTracer, lowerBound, upperBound, Fenwick, DSU, MinHeap,
  formatFinite, formatMask, preview,
};
