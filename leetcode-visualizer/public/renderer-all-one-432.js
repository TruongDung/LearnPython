"use strict";

// LeetCode 432 — All O`one. Picture-first renderer: bucket chain (SVG), hash maps,
// and a current-line strip (line number, effect, branch, stack, locals). The Python source itself
// is shown once, in the shared #codePanel, which script.js highlights from step.codeLines.

// Number of lines in the builder source (problem.code); the shared #codePanel shows the code itself.
const AO432_LINE_COUNT = 74;

// Preset inputs: [input, Vietnamese label, English label]. The first preset is the default input
// (up to 4 buckets, several holding 2-4 keys); the second executes every non-blank line.
const AO432_CASES = Object.freeze([
  ["inc a | inc b | inc c | inc d | inc a | inc b | inc c | inc a | inc b | inc e | inc f | inc d | inc a | inc b | getMaxKey | getMinKey | dec b | dec a | dec e | dec f | dec x | getMaxKey | getMinKey", "Ví dụ", "Example"],
  ["getMinKey | getMaxKey | inc a | inc b | inc a | inc a | getMaxKey | getMinKey | dec b | dec x | dec a | dec a | dec a | getMaxKey", "Chạy hết mọi dòng", "Every code line"],
  ["inc a | inc b | inc c | getMaxKey | inc b | getMaxKey | getMinKey", "Nhiều key cùng count", "Tied counts"],
  ["inc a | inc a | inc b | getMaxKey | dec a | getMinKey", "Ngắn", "Short"],
]);

const AO432_COUNTERS = Object.freeze([
  ["operations", "Thao tác", "Operations"],
  ["bucketInsertions", "Chèn bucket", "Bucket inserts"],
  ["bucketRemovals", "Xóa bucket", "Bucket removals"],
  ["pointerWrites", "Ghi pointer", "Pointer writes"],
  ["keyCountWrites", "Ghi keyCount", "keyCount writes"],
  ["keyBucketWrites", "Ghi keyBucket", "keyBucket writes"],
  ["mapDeletes", "Xóa map", "Map deletes"],
  ["neighborReuses", "Dùng lại bucket kề", "Neighbor reuses"],
]);

const AO432_COPY = Object.freeze({
  vi: Object.freeze({
    chain: "Chuỗi bucket · count tăng dần →",
    maps: "Hash map",
    code: "Dòng đang chạy",
    ops: "Thao tác",
    consistent: "Khớp",
    midUpdate: "Đang cập nhật",
    invalid: "Lỗi",
    setup: "Khởi tạo",
    detached: "chưa nối / đã tách",
    noKeys: "chưa có key",
    written: "vừa ghi",
    oneWay: "một chiều",
    countLegend: "số = count",
    examples: "Ví dụ",
    jumps: [["line", "Dòng →"], ["op", "Thao tác →"], ["link", "Pointer →"], ["result", "Kết quả ↠"]],
    details: "Bất biến · bộ đếm",
    checks: [
      ["sentinelsValid", "HEAD/TAIL rỗng ở hai đầu"],
      ["reciprocalLinks", "next/prev khớp hai chiều"],
      ["increasingCounts", "count tăng dần"],
      ["nonemptyBuckets", "không có bucket rỗng"],
      ["uniqueKeys", "mỗi key một chỗ"],
      ["mapsAgree", "map khớp bucket"],
    ],
    pending: "chưa kiểm tra",
  }),
  en: Object.freeze({
    chain: "Bucket chain · count grows →",
    maps: "Hash maps",
    code: "Current line",
    ops: "Operations",
    consistent: "Consistent",
    midUpdate: "Mid-update",
    invalid: "Broken",
    setup: "Setup",
    detached: "unlinked / removed",
    noKeys: "no keys yet",
    written: "just written",
    oneWay: "one-way",
    countLegend: "number = count",
    examples: "Examples",
    jumps: [["line", "Line →"], ["op", "Next op →"], ["link", "Pointer →"], ["result", "Result ↠"]],
    details: "Invariants · counters",
    checks: [
      ["sentinelsValid", "HEAD/TAIL empty at both ends"],
      ["reciprocalLinks", "next/prev agree both ways"],
      ["increasingCounts", "counts increase"],
      ["nonemptyBuckets", "no empty bucket"],
      ["uniqueKeys", "each key in one place"],
      ["mapsAgree", "maps match buckets"],
    ],
    pending: "not checked yet",
  }),
});

function ao432Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function ao432IsVi() {
  return typeof lang !== "undefined" && lang === "vi";
}

function ao432Integer(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function ao432Boolean(value) {
  return typeof value === "boolean" ? value : null;
}

function ao432Key(value) {
  return typeof value === "string" && /^[a-z]{1,10}$/.test(value) ? value : null;
}

function ao432Id(value) {
  return typeof value === "string" && /^(?:head|tail|b\d{1,3})$/.test(value) ? value : null;
}

function ao432Primitive(value) {
  if (value === null || typeof value === "boolean" || Number.isSafeInteger(value)) return value;
  if (typeof value === "string") return value.slice(0, 40);
  return null;
}

function ao432UniqueKeys(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.slice(0, 24).flatMap((item) => {
    const key = ao432Key(item);
    if (!key || seen.has(key)) return [];
    seen.add(key);
    return [key];
  });
}

// Validates the builder's view model so malformed data can never reach innerHTML unescaped.
function ao432Normalize(step) {
  const raw = step && step.allOne432View && typeof step.allOne432View === "object" ? step.allOne432View : {};
  const sourceRaw = raw.source && typeof raw.source === "object" ? raw.source : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = ao432Integer(sourceRaw.line, 1, AO432_LINE_COUNT)
    ?? ao432Integer(fallbackLine, 1, AO432_LINE_COUNT)
    ?? 1;
  const event = typeof raw.event === "string" && /^[a-z-]{1,40}$/.test(raw.event) ? raw.event : "";
  const phase = ["setup", "helper", "operation", "query", "done"].includes(raw.phase) ? raw.phase : "setup";
  const conditionRaw = raw.condition && typeof raw.condition === "object" ? raw.condition : {};

  const inputRaw = raw.input && typeof raw.input === "object" ? raw.input : {};
  const commands = Array.isArray(inputRaw.commands) ? inputRaw.commands.slice(0, 24).flatMap((item) => {
    const command = item && typeof item === "object" ? item : {};
    const op = ["inc", "dec", "getMaxKey", "getMinKey"].includes(command.op) ? command.op : null;
    const key = op === "inc" || op === "dec" ? ao432Key(command.key) : null;
    if (!op || ((op === "inc" || op === "dec") && !key)) return [];
    return [{ op, key }];
  }) : [];

  const structureRaw = raw.structure && typeof raw.structure === "object" ? raw.structure : {};
  const recordsRaw = Array.isArray(structureRaw.buckets) ? structureRaw.buckets.slice(0, 64) : [];
  const seenIds = new Set();
  const records = recordsRaw.flatMap((item) => {
    const bucket = item && typeof item === "object" ? item : {};
    const id = ao432Id(bucket.id);
    if (!id || seenIds.has(id)) return [];
    seenIds.add(id);
    const sentinel = bucket.sentinel === "head" || bucket.sentinel === "tail" ? bucket.sentinel : null;
    return [{
      id,
      count: ao432Integer(bucket.count, 0, 24),
      sentinel,
      prev: ao432Id(bucket.prev),
      next: ao432Id(bucket.next),
      keys: ao432UniqueKeys(bucket.keys),
    }];
  });
  const byId = new Map(records.map((bucket) => [bucket.id, bucket]));
  const order = [];
  if (Array.isArray(structureRaw.order)) {
    structureRaw.order.slice(0, records.length).forEach((value) => {
      const id = ao432Id(value);
      if (id && byId.has(id) && !order.includes(id)) order.push(id);
    });
  }
  const known = (value) => {
    const id = ao432Id(value);
    return id && byId.has(id) ? id : null;
  };
  const buckets = records.map((bucket) => ({ ...bucket, prev: known(bucket.prev), next: known(bucket.next) }));

  const mapsRaw = raw.maps && typeof raw.maps === "object" ? raw.maps : {};
  const keyCount = Array.isArray(mapsRaw.keyCount) ? mapsRaw.keyCount.slice(0, 24).flatMap((item) => {
    const entry = item && typeof item === "object" ? item : {};
    const key = ao432Key(entry.key);
    const count = ao432Integer(entry.count, 1, 24);
    return key && count !== null ? [{ key, count }] : [];
  }) : [];
  const keyBucket = Array.isArray(mapsRaw.keyBucket) ? mapsRaw.keyBucket.slice(0, 24).flatMap((item) => {
    const entry = item && typeof item === "object" ? item : {};
    const key = ao432Key(entry.key);
    const bucket = known(entry.bucket);
    return key && bucket ? [{ key, bucket }] : [];
  }) : [];

  const operationRaw = raw.operation && typeof raw.operation === "object" ? raw.operation : {};
  const total = commands.length;
  const name = ["AllOne", "inc", "dec", "getMaxKey", "getMinKey"].includes(operationRaw.name) ? operationRaw.name : "AllOne";
  const outputs = Array.isArray(operationRaw.outputs) ? operationRaw.outputs.slice(0, total).map((value) => {
    if (value === null || value === "") return value;
    return ao432Key(value);
  }) : [];
  const operation = {
    index: ao432Integer(operationRaw.index, 0, total) ?? 0,
    name,
    key: name === "inc" || name === "dec" ? ao432Key(operationRaw.key) : null,
    outputs,
  };

  const localsRaw = raw.locals && typeof raw.locals === "object" ? raw.locals : {};
  const locals = {
    oldCount: ao432Integer(localsRaw.oldCount, 1, 24),
    bucket: known(localsRaw.bucket),
    target: known(localsRaw.target),
    newBucket: known(localsRaw.newBucket),
    predecessor: known(localsRaw.predecessor),
    successor: known(localsRaw.successor),
  };
  const mutationRaw = raw.mutation && typeof raw.mutation === "object" ? raw.mutation : {};
  const mutationKinds = ["idle", "field-write", "pointer-write", "map-allocate", "map-write", "map-delete", "key-add", "key-remove"];
  const mutation = {
    kind: mutationKinds.includes(mutationRaw.kind) ? mutationRaw.kind : "idle",
    object: typeof mutationRaw.object === "string" ? mutationRaw.object.slice(0, 24) : null,
    field: typeof mutationRaw.field === "string" ? mutationRaw.field.slice(0, 24) : null,
    before: ao432Primitive(mutationRaw.before),
    after: ao432Primitive(mutationRaw.after),
  };

  const queryRaw = raw.query && typeof raw.query === "object" ? raw.query : {};
  const query = {
    kind: queryRaw.kind === "max" || queryRaw.kind === "min" ? queryRaw.kind : null,
    empty: ao432Boolean(queryRaw.empty),
    bucket: known(queryRaw.bucket),
    chosen: queryRaw.chosen === "" ? "" : ao432Key(queryRaw.chosen),
  };

  const invariantsRaw = raw.invariants && typeof raw.invariants === "object" ? raw.invariants : {};
  const invariants = { checked: invariantsRaw.checked === true, stable: ao432Boolean(invariantsRaw.stable), expectedStable: invariantsRaw.expectedStable === true };
  AO432_COPY.en.checks.forEach(([key]) => {
    invariants[key] = ao432Boolean(invariantsRaw[key]);
  });

  const countersRaw = raw.counters && typeof raw.counters === "object" ? raw.counters : {};
  const counters = {};
  AO432_COUNTERS.forEach(([key]) => {
    counters[key] = ao432Integer(countersRaw[key], 0, 100000) ?? 0;
  });

  return {
    line,
    event,
    phase,
    condition: ao432Boolean(conditionRaw.result),
    commands,
    operation,
    structure: { order, buckets, byId, constructing: known(structureRaw.constructing) },
    maps: { keyCountAllocated: mapsRaw.keyCountAllocated === true, keyBucketAllocated: mapsRaw.keyBucketAllocated === true, keyCount, keyBucket },
    locals,
    mutation,
    query,
    invariants,
    counters,
    final: raw.final === true || Boolean(step && step.final),
  };
}

function ao432Label(state, id) {
  if (!id) return "None";
  const bucket = state.structure.byId.get(id);
  if (!bucket) return "?";
  if (bucket.sentinel) return bucket.sentinel.toUpperCase();
  return `[${bucket.count ?? "?"}]`;
}

function ao432Status(state, copy) {
  if (!state.invariants.checked) return { kind: "setup", icon: "⚙", label: copy.setup };
  if (state.invariants.stable) return { kind: "stable", icon: "✓", label: copy.consistent };
  if (!state.invariants.expectedStable) return { kind: "transient", icon: "⏳", label: copy.midUpdate };
  return { kind: "invalid", icon: "✗", label: copy.invalid };
}

function ao432CallText(op, key) {
  if (op === "inc" || op === "dec") return `${op}("${key}")`;
  return op === "AllOne" ? "AllOne()" : `${op}()`;
}

function ao432Roles(state, id) {
  const roles = [];
  if (id === state.locals.bucket) roles.push("bucket");
  if (id === state.locals.target) roles.push("target");
  if (id === state.locals.newBucket && id !== "head" && id !== "tail") roles.push("new_bucket");
  return roles;
}

// ---------- Picture: bucket chain ----------

function ao432Picture(state, copy) {
  const { byId, order } = state.structure;
  const linked = new Set(order);
  const L = state.locals;
  const M = state.mutation;
  if (!state.structure.buckets.length) {
    return `<div class="ao432-empty-chain">AllOne()</div>`;
  }
  // Detached buckets are drawn only while code still references them (Python would garbage-collect the rest).
  const referenced = new Set([
    L.bucket, L.target, L.newBucket, L.predecessor, L.successor,
    M.object, state.structure.constructing,
    ...state.maps.keyBucket.map((entry) => entry.bucket),
  ].filter(Boolean));
  const detached = state.structure.buckets.filter((bucket) => !linked.has(bucket.id) && referenced.has(bucket.id));
  const ghostKey = (bucket) => (M.kind === "key-remove" && M.object === bucket.id && ao432Key(M.before) && !bucket.keys.includes(M.before) ? M.before : null);
  const keysOf = (bucket) => {
    const ghost = ghostKey(bucket);
    return ghost ? [...bucket.keys, ghost] : [...bucket.keys];
  };
  const size = (bucket) => {
    if (bucket.sentinel) return { w: 52, h: 46 };
    const keys = keysOf(bucket);
    const longest = keys.reduce((max, key) => Math.max(max, key.length), 1);
    return { w: Math.max(56, Math.round(longest * 7.6 + 34)), h: 42 + Math.max(1, keys.length) * 24 };
  };

  // Compact spacing so HEAD, four buckets and TAIL fit the chain card at desktop width.
  const GAP = 40;
  const PAD = 12;
  const TOP = 44;
  const boxes = new Map();
  let cursor = PAD;
  let rowHeight = 46;
  order.forEach((id, index) => {
    const bucket = byId.get(id);
    const dims = size(bucket);
    boxes.set(id, { ...dims, x: cursor, y: TOP, bucket, index });
    cursor += dims.w + GAP;
    rowHeight = Math.max(rowHeight, dims.h);
  });
  const rowWidth = cursor - GAP + PAD;
  const lowerY = TOP + rowHeight + 84;
  const wanted = detached.map((bucket) => {
    const dims = size(bucket);
    const prev = boxes.get(bucket.prev);
    const next = boxes.get(bucket.next);
    const anchor = boxes.get(L.predecessor) || boxes.get(L.bucket);
    let center = PAD + dims.w / 2;
    if (prev && next) center = (prev.x + prev.w + next.x) / 2;
    else if (prev) center = prev.x + prev.w + GAP / 2;
    else if (next) center = next.x - GAP / 2;
    else if (anchor) center = anchor.x + anchor.w + GAP / 2;
    return { bucket, dims, center };
  }).sort((left, right) => left.center - right.center);
  let lowerCursor = PAD;
  let lowerHeight = 0;
  wanted.forEach(({ bucket, dims, center }) => {
    const x = Math.max(lowerCursor, Math.round(center - dims.w / 2));
    boxes.set(bucket.id, { ...dims, x, y: lowerY, bucket, index: -1 });
    lowerCursor = x + dims.w + 26;
    lowerHeight = Math.max(lowerHeight, dims.h);
  });
  const width = Math.max(rowWidth, lowerCursor - 26 + PAD, 300);
  const height = detached.length ? lowerY + lowerHeight + 30 : TOP + rowHeight + 34;

  const arrows = [];
  boxes.forEach((from, id) => {
    ["next", "prev"].forEach((field) => {
      const targetId = from.bucket[field];
      const to = targetId ? boxes.get(targetId) : null;
      if (!to) return;
      const reverse = field === "next" ? "prev" : "next";
      const mutual = to.bucket[reverse] === id;
      const written = M.kind === "pointer-write" && M.object === id && M.field === field;
      const sign = field === "next" ? 1 : -1;
      let path;
      if (from.y === to.y && from.index >= 0 && to.index >= 0 && Math.abs(from.index - to.index) === 1 && Math.sign(to.x - from.x) === sign) {
        const y = from.y + (field === "next" ? 15 : 32);
        path = field === "next" ? `M${from.x + from.w},${y}H${to.x - 3}` : `M${from.x},${y}H${to.x + to.w + 3}`;
      } else if (from.y === to.y) {
        const startX = from.x + from.w / 2 + sign * 10;
        const endX = to.x + to.w / 2 + sign * 10;
        const lift = field === "next" ? -34 : 34;
        const y = field === "next" ? from.y : from.y + Math.min(from.h, to.h);
        path = `M${startX},${y}C${startX},${y + lift} ${endX},${y + lift} ${endX},${y + (field === "next" ? -3 : 3)}`;
      } else {
        const down = to.y > from.y;
        const startX = from.x + from.w / 2 + sign * 12;
        const endX = to.x + to.w / 2 + sign * 12;
        const startY = down ? from.y + from.h : from.y;
        const endY = down ? to.y - 3 : to.y + to.h + 3;
        const bend = down ? 38 : -38;
        path = `M${startX},${startY}C${startX},${startY + bend} ${endX},${endY - bend} ${endX},${endY}`;
      }
      const classes = ["ao432-ptr", `is-${field}`, written ? "is-written" : "", mutual ? "" : "is-oneway"].filter(Boolean).join(" ");
      arrows.push(`<path class="${classes}" d="${path}" data-pointer-from="${id}" data-pointer-field="${field}" data-pointer-to="${targetId}" marker-end="url(#ao432-tip-${written ? "written" : field})"/>`);
    });
  });

  const realOrder = order.filter((id) => !byId.get(id).sentinel);
  const minId = realOrder[0] ?? null;
  const maxId = realOrder[realOrder.length - 1] ?? null;
  const shapes = [];
  boxes.forEach((box, id) => {
    const bucket = box.bucket;
    const roles = ao432Roles(state, id);
    const isExtreme = state.query.bucket === id;
    const classes = [
      "ao432-box",
      bucket.sentinel ? "is-sentinel" : "is-real",
      linked.has(id) ? "" : "is-detached",
      state.structure.constructing === id ? "is-constructing" : "",
      isExtreme ? "is-extreme" : "",
      ...roles.map((role) => `role-${role.replace("_", "-")}`),
    ].filter(Boolean).join(" ");
    const cx = box.x + box.w / 2;
    let inner;
    if (bucket.sentinel) {
      inner = `<text class="ao432-sentinel-label" x="${cx}" y="${box.y + 28}">${bucket.sentinel.toUpperCase()}</text>`;
    } else {
      const pills = keysOf(bucket).map((key, index) => {
        const y = box.y + 38 + index * 24;
        const pillClasses = [
          "ao432-pill",
          key === ghostKey(bucket) ? "is-ghost" : "",
          key === state.operation.key ? "is-current" : "",
          M.kind === "key-add" && M.object === id && M.after === key ? "is-added" : "",
          isExtreme && state.query.chosen === key ? "is-chosen" : "",
        ].filter(Boolean).join(" ");
        return `<g class="${pillClasses}" data-key="${ao432Escape(key)}"><rect x="${box.x + 8}" y="${y}" width="${box.w - 16}" height="20" rx="10"/><text x="${cx}" y="${y + 14}">${ao432Escape(key)}</text></g>`;
      }).join("");
      inner = `<text class="ao432-count" x="${cx}" y="${box.y + 23}">${bucket.count ?? "?"}</text><line class="ao432-divider" x1="${box.x + 8}" x2="${box.x + box.w - 8}" y1="${box.y + 31}" y2="${box.y + 31}"/>${pills || `<text class="ao432-none" x="${cx}" y="${box.y + 52}">∅</text>`}`;
    }
    // Linked boxes carry labels above (incoming cross-row arrows use the bottom edge);
    // detached boxes carry them below (incoming arrows use the top edge).
    // Roles sit on the line next to the box and min/max on a second line, so labels on neighbouring boxes do not collide.
    const labels = roles.map((role) => `<tspan class="tag-${role.replace("_", "-")}">${role}</tspan>`);
    const tagY = linked.has(id) ? box.y - 9 : box.y + box.h + 16;
    let tags = labels.length
      ? `<text class="ao432-tags" x="${cx}" y="${tagY}">${labels.join('<tspan class="tag-sep"> · </tspan>')}</text>`
      : "";
    if (linked.has(id) && !bucket.sentinel && (id === minId || id === maxId)) {
      const extreme = id === minId && id === maxId ? "min=max" : id === minId ? "min" : "max";
      tags += `<text class="ao432-tags" x="${cx}" y="${labels.length ? tagY - 13 : tagY}"><tspan class="tag-extreme">${extreme}</tspan></text>`;
    }
    const crown = isExtreme ? `<text class="ao432-crown" x="${box.x + box.w - 4}" y="${box.y + 4}">★</text>` : "";
    shapes.push(`<g class="${classes}" data-bucket-id="${id}"><rect class="ao432-frame" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="11"/>${inner}${tags}${crown}</g>`);
  });

  const lowerLabel = detached.length ? `<text class="ao432-lower-label" x="${PAD}" y="${lowerY - 26}">${ao432Escape(copy.detached)}</text>` : "";
  const markers = ["next", "prev", "written"].map((name) => `<marker id="ao432-tip-${name}" class="ao432-tip-${name}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10Z"/></marker>`).join("");
  return `<svg class="ao432-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${ao432Escape(order.map((id) => ao432Label(state, id)).join(" ⇄ "))}"><defs>${markers}</defs>${lowerLabel}${arrows.join("")}${shapes.join("")}</svg>`;
}

// ---------- Hash maps ----------

function ao432Maps(state, copy) {
  const M = state.mutation;
  const counts = new Map(state.maps.keyCount.map((entry) => [entry.key, entry.count]));
  const places = new Map(state.maps.keyBucket.map((entry) => [entry.key, entry.bucket]));
  const deletedKey = M.kind === "map-delete" && ao432Key(M.field) ? M.field : null;
  const keys = [...new Set([...counts.keys(), ...places.keys(), ...(deletedKey ? [deletedKey] : [])])].sort();
  if (!state.maps.keyCountAllocated) return `<div class="ao432-map-empty">keyCount · keyBucket = ?</div>`;
  if (!keys.length) return `<div class="ao432-map-empty">{ } · ${ao432Escape(copy.noKeys)}</div>`;
  const rows = keys.map((key) => {
    const countWritten = M.kind === "map-write" && M.object === "keyCount" && M.field === key;
    const bucketWritten = M.kind === "map-write" && M.object === "keyBucket" && M.field === key;
    const countDeleted = deletedKey === key && M.object === "keyCount";
    const bucketDeleted = deletedKey === key && M.object === "keyBucket";
    const count = counts.get(key);
    const place = places.get(key);
    let countCell;
    if (countDeleted) countCell = `<s>${ao432Escape(M.before)}</s>`;
    else if (count === undefined) countCell = "—";
    else if (countWritten && M.before !== null) countCell = `<s>${ao432Escape(M.before)}</s><i>→</i><b>${count}</b>`;
    else countCell = `<b>${count}</b>`;
    let bucketCell;
    if (bucketDeleted) bucketCell = `<s>${ao432Escape(ao432Label(state, ao432Id(M.before)))}</s>`;
    else if (!place) bucketCell = "—";
    else if (bucketWritten && ao432Id(M.before)) bucketCell = `<s>${ao432Escape(ao432Label(state, M.before))}</s><i>→</i><b>${ao432Escape(ao432Label(state, place))}</b>`;
    else bucketCell = `<b>${ao432Escape(ao432Label(state, place))}</b>`;
    const placeCount = place ? state.structure.byId.get(place).count : null;
    const stale = count !== undefined && place && placeCount !== count;
    const classes = [
      "ao432-entry",
      key === state.operation.key ? "is-current" : "",
      countWritten || bucketWritten ? "is-written" : "",
      countDeleted || bucketDeleted ? "is-deleted" : "",
      stale ? "is-stale" : "",
    ].filter(Boolean).join(" ");
    return `<li class="${classes}" data-map-key="${key}"><code class="ao432-entry-key">${key}</code><span class="ao432-entry-count">${countCell}</span><span class="ao432-entry-bucket">${bucketCell}${stale ? '<em aria-hidden="true">⚠</em>' : ""}</span></li>`;
  }).join("");
  return `<ul class="ao432-map" role="list"><li class="ao432-map-head" aria-hidden="true"><span>key</span><span>keyCount</span><span>keyBucket</span></li>${rows}</ul>`;
}

// ---------- Current-line strip (source lives in the shared #codePanel) ----------

function ao432Effect(state) {
  const M = state.mutation;
  const label = (id) => ao432Label(state, ao432Id(id));
  if (state.phase === "query" && state.query.chosen !== null) {
    return `return "${state.query.chosen}"`;
  }
  switch (M.kind) {
    case "pointer-write": return `${label(M.object)}.${M.field} → ${M.after === null ? "None" : label(M.after)}`;
    case "field-write": return `${label(M.object)}.${M.field} = ${M.field === "keys" ? "{}" : M.after}`;
    case "map-allocate": return `${M.field} = {}`;
    case "map-write": return M.object === "keyBucket"
      ? `keyBucket["${M.field}"] → ${label(M.after)}`
      : `keyCount["${M.field}"]: ${M.before === null ? "∅" : M.before} → ${M.after}`;
    case "map-delete": return `del ${M.object}["${M.field}"]`;
    case "key-add": return `"${M.after}" → ${label(M.object)}`;
    case "key-remove": return `"${M.before}" ✕ ${label(M.object)}`;
    default: return "";
  }
}

function ao432Stack(state) {
  if (state.event.startsWith("bind-")) return [];
  const line = state.line;
  const stack = [state.operation.name === "AllOne" ? "__init__" : state.operation.name];
  const constructing = state.structure.constructing;
  if (line >= 17 && line <= 23) stack.push("insert_after");
  if (line >= 25 && line <= 27) stack.push("remove_bucket");
  if (line >= 2 && line <= 6) {
    if (constructing && constructing !== "head" && constructing !== "tail") stack.push("insert_after");
    stack.push("Bucket()");
  }
  return stack;
}

function ao432Code(state, copy) {
  const line = state.line;
  const effect = ao432Effect(state);
  const badge = state.condition !== null
    ? `<b class="ao432-branch is-${state.condition ? "true" : "false"}">${state.condition ? "True" : "False"}</b>`
    : "";
  const now = `<div class="ao432-now" data-code-line="${line}" aria-current="step"><span class="ao432-lineno">L${line}</span>${effect ? `<code class="ao432-effect">↳ ${ao432Escape(effect)}</code>` : ""}${badge}</div>`;
  const stack = ao432Stack(state);
  const crumbs = stack.length ? `<span class="ao432-stack">${stack.map((name) => `<code>${ao432Escape(name)}</code>`).join("<i>▸</i>")}</span>` : "";
  const L = state.locals;
  const chips = state.operation.name === "AllOne" ? [] : [
    ["key", state.operation.key ? `"${state.operation.key}"` : null, "key"],
    ["old_count", L.oldCount, "plain"],
    ["bucket", L.bucket ? ao432Label(state, L.bucket) : null, "bucket"],
    ["target", L.target ? ao432Label(state, L.target) : null, "target"],
    ["new_bucket", L.newBucket && L.newBucket !== "head" && L.newBucket !== "tail" ? ao432Label(state, L.newBucket) : null, "new-bucket"],
  ].filter(([, value]) => value !== null && value !== undefined);
  const locals = chips.length
    ? `<div class="ao432-locals">${chips.map(([name, value, kind]) => `<span class="chip-${kind}"><code>${name}</code><b>${ao432Escape(value)}</b></span>`).join("")}</div>`
    : "";
  return `<header><b>${ao432Escape(copy.code)}</b>${crumbs}</header>${now}${locals}`;
}

// ---------- Operations strip ----------

function ao432Operations(state) {
  const outputs = state.operation.outputs;
  const setupDone = state.operation.index > 0 || state.invariants.checked;
  const first = `<li><button type="button" class="ao432-op ${state.operation.index === 0 ? "is-current" : ""} ${setupDone ? "is-done" : ""}" data-ao432-op="0"><code>AllOne()</code><b>${setupDone ? "✓" : "…"}</b></button></li>`;
  const items = state.commands.map((command, index) => {
    const position = index + 1;
    const done = index < outputs.length;
    const value = outputs[index];
    const result = !done ? "…" : value === null ? "✓" : `"${value}"`;
    const classes = ["ao432-op", position === state.operation.index ? "is-current" : "", done ? "is-done" : "", done && value !== null && value !== undefined ? "is-answer" : ""].filter(Boolean).join(" ");
    return `<li><button type="button" class="${classes}" data-ao432-op="${position}" data-operation-index="${position}"${position === state.operation.index ? ' aria-current="step"' : ""}><code>${ao432Escape(ao432CallText(command.op, command.key))}</code><b>${ao432Escape(result)}</b></button></li>`;
  }).join("");
  return `<ol class="ao432-ops" role="list">${first}${items}</ol>`;
}

// ---------- Details (collapsed by default) ----------

function ao432Details(state, copy, vi) {
  const checks = state.invariants.checked
    ? copy.checks.map(([key, label]) => {
      const value = state.invariants[key];
      return `<li class="is-${value === true ? "yes" : value === false ? "no" : "unknown"}"><b>${value === true ? "✓" : value === false ? "✗" : "·"}</b>${ao432Escape(label)}</li>`;
    }).join("")
    : `<li>${ao432Escape(copy.pending)}</li>`;
  const counters = AO432_COUNTERS.map(([key, viLabel, enLabel]) => `<li><small>${ao432Escape(vi ? viLabel : enLabel)}</small><b>${state.counters[key]}</b></li>`).join("");
  return `<details class="ao432-details"><summary>${ao432Escape(copy.details)}</summary><ul class="ao432-checks" role="list">${checks}</ul><ul class="ao432-counters" role="list">${counters}</ul></details>`;
}

// ---------- Navigation (same contract as other line-by-line renderers) ----------

function ao432Next(kind) {
  if (typeof steps === "undefined" || !Array.isArray(steps) || typeof stepIndex === "undefined") return -1;
  const current = steps[stepIndex] && steps[stepIndex].allOne432View;
  const currentOp = current && current.operation ? current.operation.index : -1;
  return steps.findIndex((step, index) => {
    const view = step && step.allOne432View;
    if (index <= stepIndex || !view) return false;
    if (kind === "line") return true;
    if (kind === "op") return view.operation && view.operation.index !== currentOp;
    if (kind === "link") return view.mutation && view.mutation.kind === "pointer-write";
    if (kind === "result") return Boolean(step.final);
    return false;
  });
}

function ao432Go(index) {
  if (index < 0 || typeof steps === "undefined" || !steps[index]) return;
  if (typeof stopPlay === "function") stopPlay();
  stepIndex = index;
  if (typeof renderStep === "function") renderStep();
}

function ao432Bind(host) {
  if (!host || typeof host.querySelectorAll !== "function") return;
  const bind = (selector, handler) => host.querySelectorAll(selector).forEach((element) => {
    element.addEventListener("click", () => handler(element));
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        handler(element);
      }
    });
  });
  host.querySelectorAll("summary").forEach((element) => element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") event.stopPropagation();
  }));
  bind("[data-ao432-jump]", (element) => ao432Go(ao432Next(element.dataset.ao432Jump)));
  bind("[data-ao432-op]", (element) => {
    const target = Number(element.dataset.ao432Op);
    ao432Go(steps.findIndex((step) => step.allOne432View && step.allOne432View.operation.index === target));
  });
  bind("[data-ao432-case]", (element) => {
    const preset = AO432_CASES[Number(element.dataset.ao432Case)];
    const input = typeof document !== "undefined" ? document.getElementById("arrInput") : null;
    if (!preset || !input) return;
    input.value = preset[0];
    if (typeof runViz === "function") runViz();
  });
}

function renderAllOne432View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const vi = ao432IsVi();
  const copy = AO432_COPY[vi ? "vi" : "en"];
  const state = ao432Normalize(step);
  const status = ao432Status(state, copy);
  const query = typeof host.querySelector === "function" ? host.querySelector.bind(host) : () => null;
  const scrolls = new Map(["chain", "ops"].map((name) => {
    const element = query(`[data-ao432-scroll="${name}"]`);
    return [name, element ? { x: element.scrollLeft, y: element.scrollTop } : null];
  }));
  const detailsOpen = Boolean(query(".ao432-details") && query(".ao432-details").open);
  const command = state.operation.index > 0 ? state.commands[state.operation.index - 1] : null;
  const heading = command ? ao432CallText(command.op, command.key) : "AllOne()";
  const presets = AO432_CASES.map((preset, index) => `<button type="button" data-ao432-case="${index}">${ao432Escape(vi ? preset[1] : preset[2])}</button>`).join("");
  const jumps = copy.jumps.map(([kind, label]) => `<button type="button" data-ao432-jump="${kind}"${ao432Next(kind) < 0 ? " disabled" : ""}>${ao432Escape(label)}</button>`).join("");
  const legend = `<div class="ao432-legend" aria-hidden="true"><span class="lg-next">→ next</span><span class="lg-prev">← prev</span><span class="lg-written">→ ${ao432Escape(copy.written)}</span><span class="lg-oneway">⇢ ${ao432Escape(copy.oneWay)}</span><span class="lg-count">${ao432Escape(copy.countLegend)}</span></div>`;

  host.innerHTML = `<article class="ao432-viz ao432-status-${status.kind}${state.final ? " is-final" : ""}" data-problem-id="432" data-source-line="${state.line}" data-phase="${state.phase}" role="region" aria-label="LeetCode 432 · line ${state.line}">`
    + `<header class="ao432-head"><div><small>LEETCODE 432 · ALL O\`ONE</small><h2><code>${ao432Escape(heading)}</code></h2></div><span class="ao432-status" title="${ao432Escape(status.label)}">${status.icon} ${ao432Escape(status.label)}</span></header>`
    + `<nav class="ao432-presets" aria-label="${ao432Escape(copy.examples)}">${presets}</nav>`
    + `<section class="ao432-card ao432-ops-card" aria-label="${ao432Escape(copy.ops)}"><div class="ao432-scroll" data-ao432-scroll="ops" tabindex="0">${ao432Operations(state)}</div></section>`
    + `<section class="ao432-card ao432-chain-card" aria-label="${ao432Escape(copy.chain)}"><header><b>${ao432Escape(copy.chain)}</b></header><div class="ao432-scroll" data-ao432-scroll="chain" tabindex="0">${ao432Picture(state, copy)}</div>${legend}</section>`
    + `<div class="ao432-split"><section class="ao432-card ao432-code-card" aria-label="${ao432Escape(copy.code)}">${ao432Code(state, copy)}</section>`
    + `<section class="ao432-card ao432-maps-card" aria-label="${ao432Escape(copy.maps)}"><header><b>${ao432Escape(copy.maps)}</b></header>${ao432Maps(state, copy)}</section></div>`
    + `${ao432Details(state, copy, vi)}<footer class="ao432-foot">${jumps}</footer></article>`;

  const restored = typeof host.querySelector === "function" ? host.querySelector(".ao432-details") : null;
  if (restored) restored.open = detailsOpen;
  if (typeof host.querySelectorAll === "function") {
    host.querySelectorAll("[data-ao432-scroll]").forEach((element) => {
      const saved = scrolls.get(element.dataset.ao432Scroll);
      if (saved) {
        element.scrollLeft = saved.x;
        element.scrollTop = saved.y;
      }
      const focus = element.querySelector(".is-current, .is-written, .is-constructing");
      if (focus && typeof focus.getBoundingClientRect === "function") {
        const outer = element.getBoundingClientRect();
        const inner = focus.getBoundingClientRect();
        if (inner.left < outer.left + 8) element.scrollLeft -= outer.left + 8 - inner.left;
        if (inner.right > outer.right - 8) element.scrollLeft += inner.right - outer.right + 8;
      }
    });
  }
  ao432Bind(host);
}
