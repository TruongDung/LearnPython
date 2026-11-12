// LeetCode 432 — All O`one Data Structure focused visualization module.

const ALL_ONE_432_MAX_OPERATIONS = 24;
const ALL_ONE_432_MAX_KEY_LENGTH = 10;
const ALL_ONE_432_SOURCE = Object.freeze([
  "class Bucket:",
  "    def __init__(self, count):",
  "        self.count = count",
  "        self.keys = {}",
  "        self.prev = None",
  "        self.next = None",
  "",
  "class AllOne:",
  "    def __init__(self):",
  "        self.head = Bucket(0)",
  "        self.tail = Bucket(0)",
  "        self.head.next = self.tail",
  "        self.tail.prev = self.head",
  "        self.keyCount = {}",
  "        self.keyBucket = {}",
  "",
  "    def insert_after(self, bucket, count):",
  "        new_bucket = Bucket(count)",
  "        new_bucket.prev = bucket",
  "        new_bucket.next = bucket.next",
  "        bucket.next.prev = new_bucket",
  "        bucket.next = new_bucket",
  "        return new_bucket",
  "",
  "    def remove_bucket(self, bucket):",
  "        bucket.prev.next = bucket.next",
  "        bucket.next.prev = bucket.prev",
  "    def inc(self, key: str) -> None:",
  "        if key not in self.keyCount:",
  "            self.keyCount[key] = 1",
  "            if self.head.next.count != 1:",
  "                self.insert_after(self.head, 1)",
  "            target = self.head.next",
  "        else:",
  "            old_count = self.keyCount[key]",
  "            self.keyCount[key] = old_count + 1",
  "            bucket = self.keyBucket[key]",
  "            del bucket.keys[key]",
  "            target = bucket.next",
  "            if target.count != old_count + 1:",
  "                target = self.insert_after(bucket, old_count + 1)",
  "            if not bucket.keys:",
  "                self.remove_bucket(bucket)",
  "        target.keys[key] = None",
  "        self.keyBucket[key] = target",
  "",
  "    def dec(self, key: str) -> None:",
  "        if key not in self.keyCount:",
  "            return",
  "        old_count = self.keyCount[key]",
  "        bucket = self.keyBucket[key]",
  "        del bucket.keys[key]",
  "        if old_count == 1:",
  "            del self.keyCount[key]",
  "            del self.keyBucket[key]",
  "        else:",
  "            self.keyCount[key] = old_count - 1",
  "            target = bucket.prev",
  "            if target.count != old_count - 1:",
  "                target = self.insert_after(bucket.prev, old_count - 1)",
  "            target.keys[key] = None",
  "            self.keyBucket[key] = target",
  "        if not bucket.keys:",
  "            self.remove_bucket(bucket)",
  "",
  "    def getMaxKey(self) -> str:",
  "        if self.tail.prev is self.head:",
  "            return \"\"",
  "        return next(iter(self.tail.prev.keys))",
  "",
  "    def getMinKey(self) -> str:",
  "        if self.head.next is self.tail:",
  "            return \"\"",
  "        return next(iter(self.head.next.keys))",
]);

function parseAllOne432Operations(input) {
  if (typeof input !== "string") {
    throw new TypeError("AllOne operations must be a pipe-separated string.");
  }
  const text = input.trim();
  if (!text) throw new RangeError("AllOne requires at least one operation.");
  const parts = text.split("|");
  if (parts.some((part) => !part.trim())) {
    throw new TypeError("AllOne operations cannot contain an empty segment.");
  }
  if (parts.length > ALL_ONE_432_MAX_OPERATIONS) {
    throw new RangeError(`AllOne visualization supports at most ${ALL_ONE_432_MAX_OPERATIONS} operations.`);
  }

  return parts.map((part, index) => {
    const command = part.trim();
    const mutation = command.match(/^(inc|dec)\s+([a-z]+)$/);
    if (mutation) {
      const key = mutation[2];
      if (key.length > ALL_ONE_432_MAX_KEY_LENGTH) {
        throw new RangeError(`AllOne key at operation ${index + 1} exceeds ${ALL_ONE_432_MAX_KEY_LENGTH} characters.`);
      }
      return { op: mutation[1], key, args: [key], raw: command };
    }
    if (command === "getMaxKey" || command === "getMinKey") {
      return { op: command, key: null, args: [], raw: command };
    }
    throw new TypeError(
      `Invalid AllOne operation ${index + 1}: use \"inc key\", \"dec key\", \"getMaxKey\", or \"getMinKey\".`,
    );
  });
}

function deepFreezeAllOne432View(value) {
  const copy = JSON.parse(JSON.stringify(value));
  const freeze = (item) => {
    if (!item || typeof item !== "object" || Object.isFrozen(item)) return item;
    Object.values(item).forEach(freeze);
    return Object.freeze(item);
  };
  return freeze(copy);
}

function buildSteps432Exact(input) {
  const commands = parseAllOne432Operations(input);
  const raw = input.trim();
  const steps = [];
  const localized = (en, vi) => ({ en, vi });
  const buckets = new Map();
  let keyCount = null;
  let keyBucket = null;
  let bucketSerial = 0;
  let headId = null;
  let tailId = null;
  let constructingId = null;
  let setupComplete = false;
  let stableExpected = false;
  const outputs = [];
  const counters = {
    operations: 0,
    incCalls: 0,
    decCalls: 0,
    maxQueries: 0,
    minQueries: 0,
    bucketConstructions: 0,
    bucketInsertions: 0,
    bucketRemovals: 0,
    pointerWrites: 0,
    keyCountWrites: 0,
    keyBucketWrites: 0,
    mapDeletes: 0,
    keyAdds: 0,
    keyRemoves: 0,
    neighborReuses: 0,
    queryReturns: 0,
  };
  const blankLocals = () => ({
    key: null,
    count: null,
    oldCount: null,
    bucket: null,
    target: null,
    newBucket: null,
    predecessor: null,
    successor: null,
  });
  const blankMutation = () => ({
    kind: "idle",
    object: null,
    field: null,
    before: null,
    after: null,
    from: null,
    to: null,
  });
  const blankQuery = () => ({
    kind: null,
    empty: null,
    bucket: null,
    count: null,
    candidates: [],
    displayCandidates: [],
    chosen: null,
  });
  let locals = blankLocals();
  let mutation = blankMutation();
  let query = blankQuery();
  let operation = {
    index: 0,
    total: commands.length,
    name: "AllOne",
    key: null,
    raw: "AllOne()",
    status: "setup",
    result: null,
  };

  const bucketOrder = () => {
    if (!headId || !buckets.has(headId)) return [];
    const order = [];
    const seen = new Set();
    let cursor = headId;
    while (cursor && buckets.has(cursor) && !seen.has(cursor) && order.length <= buckets.size) {
      order.push(cursor);
      seen.add(cursor);
      if (cursor === tailId) break;
      cursor = buckets.get(cursor).next;
    }
    return order;
  };
  const bucketName = (id) => {
    if (id === null || !buckets.has(id)) return null;
    if (id === headId || buckets.get(id).sentinel === "head") return "HEAD";
    if (id === tailId || buckets.get(id).sentinel === "tail") return "TAIL";
    return `B${buckets.get(id).count}`;
  };
  const snapshotInvariants = () => {
    if (!setupComplete) {
      return {
        expectedStable: stableExpected,
        checked: false,
        stable: null,
        reciprocalLinks: null,
        increasingCounts: null,
        nonemptyBuckets: null,
        uniqueKeys: null,
        mapsAgree: null,
        sentinelsValid: null,
        issues: [],
      };
    }
    const issues = [];
    const order = bucketOrder();
    const linked = new Set(order);
    const sentinelsValid = order[0] === headId
      && order[order.length - 1] === tailId
      && buckets.get(headId).prev === null
      && buckets.get(tailId).next === null
      && buckets.get(headId).keys.size === 0
      && buckets.get(tailId).keys.size === 0;
    if (!sentinelsValid) issues.push("sentinels");

    let reciprocalLinks = true;
    for (let index = 0; index < order.length - 1; index++) {
      const left = buckets.get(order[index]);
      const right = buckets.get(order[index + 1]);
      if (left.next !== right.id || right.prev !== left.id) reciprocalLinks = false;
    }
    if (!reciprocalLinks) issues.push("reciprocal-links");

    const real = order.slice(1, -1).map((id) => buckets.get(id));
    const increasingCounts = real.every((bucket, index) => index === 0 || real[index - 1].count < bucket.count);
    if (!increasingCounts) issues.push("count-order");
    const nonemptyBuckets = real.every((bucket) => bucket.keys instanceof Set && bucket.keys.size > 0);
    if (!nonemptyBuckets) issues.push("empty-linked-bucket");

    const seenKeys = new Set();
    let uniqueKeys = true;
    real.forEach((bucket) => bucket.keys.forEach((key) => {
      if (seenKeys.has(key)) uniqueKeys = false;
      seenKeys.add(key);
    }));
    if (!uniqueKeys) issues.push("duplicate-key");

    const countKeys = keyCount ? [...keyCount.keys()].sort() : [];
    const bucketKeys = keyBucket ? [...keyBucket.keys()].sort() : [];
    let mapsAgree = JSON.stringify(countKeys) === JSON.stringify(bucketKeys)
      && JSON.stringify(countKeys) === JSON.stringify([...seenKeys].sort());
    if (mapsAgree) {
      mapsAgree = countKeys.every((key) => {
        const id = keyBucket.get(key);
        const bucket = buckets.get(id);
        return linked.has(id) && bucket && bucket.keys.has(key) && bucket.count === keyCount.get(key);
      });
    }
    if (!mapsAgree) issues.push("map-bucket-mismatch");
    return {
      expectedStable: stableExpected,
      checked: true,
      stable: issues.length === 0,
      reciprocalLinks,
      increasingCounts,
      nonemptyBuckets,
      uniqueKeys,
      mapsAgree,
      sentinelsValid,
      issues,
    };
  };
  const snapshotView = ({ line, event, phase, timing, condition, final }) => {
    const order = bucketOrder();
    const linked = new Set(order);
    const records = [...buckets.values()].map((bucket) => ({
      id: bucket.id,
      label: bucketName(bucket.id) || (bucket.sentinel ? bucket.sentinel.toUpperCase() : `B${bucket.count ?? "?"}`),
      count: bucket.count,
      sentinel: bucket.sentinel,
      prev: bucket.prev,
      next: bucket.next,
      keys: bucket.keys instanceof Set ? [...bucket.keys] : [],
      displayKeys: bucket.keys instanceof Set ? [...bucket.keys].sort() : [],
      linked: linked.has(bucket.id),
      constructing: bucket.id === constructingId,
    }));
    const keyCountEntries = keyCount
      ? [...keyCount.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([key, count]) => ({ key, count }))
      : [];
    const keyBucketEntries = keyBucket
      ? [...keyBucket.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([key, bucket]) => ({
        key,
        bucket,
        count: buckets.has(bucket) ? buckets.get(bucket).count : null,
        linked: linked.has(bucket),
      }))
      : [];
    return deepFreezeAllOne432View({
      version: 1,
      problemId: 432,
      source: { line, text: ALL_ONE_432_SOURCE[line - 1] },
      event,
      phase,
      timing,
      condition: condition && typeof condition === "object"
        ? { expression: condition.expression, result: condition.result }
        : { expression: null, result: null },
      input: {
        raw,
        commands: commands.map((command) => ({ op: command.op, key: command.key, raw: command.raw })),
        limits: { maxOperations: ALL_ONE_432_MAX_OPERATIONS, maxKeyLength: ALL_ONE_432_MAX_KEY_LENGTH },
      },
      operation: { ...operation, outputs: [...outputs] },
      structure: {
        head: headId,
        tail: tailId,
        order,
        buckets: records,
        linkedCount: order.length,
        detached: records.filter((bucket) => !bucket.linked).map((bucket) => bucket.id),
        constructing: constructingId,
      },
      maps: {
        keyCountAllocated: keyCount !== null,
        keyBucketAllocated: keyBucket !== null,
        keyCount: keyCountEntries,
        keyBucket: keyBucketEntries,
      },
      locals: { ...locals },
      mutation: { ...mutation },
      query: {
        ...query,
        candidates: [...query.candidates],
        displayCandidates: [...query.displayCandidates],
      },
      invariants: snapshotInvariants(),
      counters: { ...counters },
      final,
    });
  };
  const legacyGraph = (view) => {
    const byId = new Map(view.structure.buckets.map((bucket) => [bucket.id, bucket]));
    const nodes = view.structure.order.map((id) => {
      const bucket = byId.get(id);
      return {
        id,
        label: bucket.sentinel === "head" ? "H" : bucket.sentinel === "tail" ? "T" : String(bucket.count),
        row: "main",
        sub: bucket.sentinel ? "sentinel" : bucket.displayKeys.join(",") || "(empty)",
      };
    });
    const edges = [];
    for (let index = 0; index < view.structure.order.length - 1; index++) {
      const left = view.structure.order[index];
      const right = view.structure.order[index + 1];
      edges.push({ u: left, v: right, w: "next", kind: "next" });
      edges.push({ u: right, v: left, w: "prev", kind: "prev" });
    }
    const focused = [view.locals.bucket, view.locals.target, view.locals.newBucket].filter((id) => id && byId.has(id));
    return {
      nodes,
      edges,
      layout: "linear",
      order: [...view.structure.order],
      caption: `${view.operation.raw} | ${view.structure.order.map((id) => byId.get(id).label).join(" → ")}`,
      annotations: {},
      hlNodes: focused,
      hlEdges: [],
      visitedNodes: [],
    };
  };
  const emit = ({
    line,
    event,
    phase,
    timing = "after",
    condition = null,
    title,
    note,
    final = false,
  }) => {
    const view = snapshotView({ line, event, phase, timing, condition, final });
    steps.push({
      title,
      note,
      arr: [],
      graph: legacyGraph(view),
      highlight: [],
      mark: [],
      final,
      codeLines: [line],
      vars: [
        { name: "operation", value: view.operation.raw },
        { name: "key", value: view.operation.key ?? "—" },
        { name: "old_count", value: view.locals.oldCount ?? "—" },
        { name: "bucket", value: bucketName(view.locals.bucket) ?? "—" },
        { name: "target", value: bucketName(view.locals.target) ?? "—" },
        { name: "outputs", value: JSON.stringify(view.operation.outputs) },
      ],
      allOne432View: view,
    });
  };
  const setMutation = (kind, object, field, before, after, from = null, to = null) => {
    mutation = { kind, object, field, before, after, from, to };
  };
  const clearMutation = () => {
    mutation = blankMutation();
  };

  const constructBucket = (count, id, sentinel = null) => {
    counters.bucketConstructions++;
    constructingId = id;
    const bucket = { id, count: null, keys: null, prev: null, next: null, sentinel };
    buckets.set(id, bucket);
    locals.newBucket = id;
    emit({
      line: 2,
      event: "bucket-init-entry",
      phase: "helper",
      timing: "before",
      title: localized(`Enter Bucket.__init__(${count})`, `Vào Bucket.__init__(${count})`),
      note: localized("Fill 4 fields, one per line.", "Gán 4 field, mỗi dòng một."),
    });
    bucket.count = count;
    setMutation("field-write", id, "count", null, count);
    emit({
      line: 3,
      event: "set-bucket-count",
      phase: "helper",
      title: localized(`Set ${id}.count = ${count}`, `Đặt ${id}.count = ${count}`),
      note: localized("Count sets list position.", "Count quyết định vị trí."),
    });
    bucket.keys = new Set();
    setMutation("field-write", id, "keys", null, "ordered-dict");
    emit({
      line: 4,
      event: "allocate-key-dict",
      phase: "helper",
      title: localized("Allocate an empty ordered key dictionary", "Tạo dictionary key có thứ tự rỗng"),
      note: localized("Ordered dict, O(1) ops.", "Dict có thứ tự, O(1)."),
    });
    counters.pointerWrites++;
    setMutation("pointer-write", id, "prev", null, null);
    emit({
      line: 5,
      event: "initialize-prev",
      phase: "helper",
      title: localized("Initialize prev = None", "Khởi tạo prev = None"),
      note: localized("Not linked yet.", "Chưa nối."),
    });
    counters.pointerWrites++;
    setMutation("pointer-write", id, "next", null, null);
    emit({
      line: 6,
      event: "initialize-next",
      phase: "helper",
      title: localized("Initialize next = None", "Khởi tạo next = None"),
      note: localized("Both links empty.", "Hai liên kết rỗng."),
    });
    constructingId = null;
    return id;
  };

  const traceInsertAfter = (anchorId, count, callLine, assignTarget) => {
    locals.bucket = anchorId;
    locals.count = count;
    locals.predecessor = anchorId;
    locals.successor = buckets.get(anchorId).next;
    clearMutation();
    emit({
      line: callLine,
      event: "insert-call",
      phase: "helper",
      timing: "before",
      title: localized(`Call insert_after(${bucketName(anchorId)}, ${count})`, `Gọi insert_after(${bucketName(anchorId)}, ${count})`),
      note: localized("Helper does 4 pointer writes.", "Helper ghi 4 pointer."),
    });
    emit({
      line: 17,
      event: "insert-entry",
      phase: "helper",
      timing: "before",
      title: localized("Enter insert_after", "Vào insert_after"),
      note: localized(`Insert [${count}] between ${bucketName(anchorId)} and ${bucketName(buckets.get(anchorId).next)}.`, `Chèn [${count}] giữa ${bucketName(anchorId)} và ${bucketName(buckets.get(anchorId).next)}.`),
    });
    const newId = `b${bucketSerial++}`;
    emit({
      line: 18,
      event: "new-bucket-call",
      phase: "helper",
      timing: "before",
      title: localized(`Evaluate Bucket(${count})`, `Đánh giá Bucket(${count})`),
      note: localized("Construct first, then assign.", "Tạo xong mới gán."),
    });
    constructBucket(count, newId);
    locals.newBucket = newId;
    emit({
      line: 18,
      event: "new-bucket-assignment",
      phase: "helper",
      title: localized(`new_bucket = ${bucketName(newId)}`, `new_bucket = ${bucketName(newId)}`),
      note: localized("Still detached.", "Vẫn chưa nối."),
    });

    const newBucket = buckets.get(newId);
    newBucket.prev = anchorId;
    counters.pointerWrites++;
    setMutation("pointer-write", newId, "prev", null, anchorId, newId, anchorId);
    emit({
      line: 19,
      event: "link-new-prev",
      phase: "helper",
      title: localized(`new_bucket.prev = ${bucketName(anchorId)}`, `new_bucket.prev = ${bucketName(anchorId)}`),
      note: localized("Link 1 of 4.", "Liên kết 1/4."),
    });

    const successorId = buckets.get(anchorId).next;
    newBucket.next = successorId;
    locals.successor = successorId;
    counters.pointerWrites++;
    setMutation("pointer-write", newId, "next", null, successorId, newId, successorId);
    emit({
      line: 20,
      event: "link-new-next",
      phase: "helper",
      title: localized(`new_bucket.next = ${bucketName(successorId)}`, `new_bucket.next = ${bucketName(successorId)}`),
      note: localized("Link 2 of 4.", "Liên kết 2/4."),
    });

    const successor = buckets.get(successorId);
    const successorPrev = successor.prev;
    successor.prev = newId;
    counters.pointerWrites++;
    setMutation("pointer-write", successorId, "prev", successorPrev, newId, successorId, newId);
    emit({
      line: 21,
      event: "link-successor-prev",
      phase: "helper",
      title: localized(`${bucketName(successorId)}.prev = new_bucket`, `${bucketName(successorId)}.prev = new_bucket`),
      note: localized("Link 3 of 4.", "Liên kết 3/4."),
    });

    const anchor = buckets.get(anchorId);
    const anchorNext = anchor.next;
    anchor.next = newId;
    counters.pointerWrites++;
    counters.bucketInsertions++;
    setMutation("pointer-write", anchorId, "next", anchorNext, newId, anchorId, newId);
    emit({
      line: 22,
      event: "link-predecessor-next",
      phase: "helper",
      title: localized(`${bucketName(anchorId)}.next = new_bucket`, `${bucketName(anchorId)}.next = new_bucket`),
      note: localized("Link 4 of 4: linked.", "Liên kết 4/4: đã nối."),
    });

    emit({
      line: 23,
      event: "insert-return",
      phase: "helper",
      title: localized(`Return ${bucketName(newId)}`, `Trả về ${bucketName(newId)}`),
      note: localized("O(1) splice done.", "Chèn O(1) xong."),
    });
    if (assignTarget) locals.target = newId;
    emit({
      line: callLine,
      event: "insert-call-return",
      phase: "operation",
      title: localized(assignTarget ? `target = ${bucketName(newId)}` : "insert_after returned", assignTarget ? `target = ${bucketName(newId)}` : "insert_after đã trả về"),
      note: localized(assignTarget ? "target = new bucket." : "Return value unused.", assignTarget ? "target = bucket mới." : "Bỏ qua giá trị trả về."),
    });
    return newId;
  };

  const traceRemoveBucket = (bucketId, callLine) => {
    locals.bucket = bucketId;
    const bucket = buckets.get(bucketId);
    locals.predecessor = bucket.prev;
    locals.successor = bucket.next;
    clearMutation();
    emit({
      line: callLine,
      event: "remove-call",
      phase: "helper",
      timing: "before",
      title: localized(`Call remove_bucket(${bucketName(bucketId)})`, `Gọi remove_bucket(${bucketName(bucketId)})`),
      note: localized("Unlink with 2 writes.", "Tháo bằng 2 lần ghi."),
    });
    emit({
      line: 25,
      event: "remove-entry",
      phase: "helper",
      timing: "before",
      title: localized("Enter remove_bucket", "Vào remove_bucket"),
      note: localized(`Join ${bucketName(bucket.prev)} ↔ ${bucketName(bucket.next)}.`, `Nối ${bucketName(bucket.prev)} ↔ ${bucketName(bucket.next)}.`),
    });

    const predecessor = buckets.get(bucket.prev);
    const successorId = bucket.next;
    const beforeNext = predecessor.next;
    predecessor.next = successorId;
    counters.pointerWrites++;
    setMutation("pointer-write", predecessor.id, "next", beforeNext, successorId, predecessor.id, successorId);
    emit({
      line: 26,
      event: "bypass-forward",
      phase: "helper",
      title: localized(`${bucketName(predecessor.id)}.next = ${bucketName(successorId)}`, `${bucketName(predecessor.id)}.next = ${bucketName(successorId)}`),
      note: localized("Link 1 of 2.", "Liên kết 1/2."),
    });

    const successor = buckets.get(successorId);
    const beforePrev = successor.prev;
    successor.prev = predecessor.id;
    counters.pointerWrites++;
    counters.bucketRemovals++;
    setMutation("pointer-write", successorId, "prev", beforePrev, predecessor.id, successorId, predecessor.id);
    emit({
      line: 27,
      event: "bypass-backward",
      phase: "helper",
      title: localized(`${bucketName(successorId)}.prev = ${bucketName(predecessor.id)}`, `${bucketName(successorId)}.prev = ${bucketName(predecessor.id)}`),
      note: localized("Link 2 of 2: unlinked.", "Liên kết 2/2: đã tháo."),
    });
    emit({
      line: callLine,
      event: "remove-call-return",
      phase: "operation",
      title: localized(`${bucketName(bucketId)} is detached`, `${bucketName(bucketId)} đã tách khỏi chain`),
      note: localized("Back to caller.", "Về hàm gọi."),
    });
  };

  const completeOperation = (line, event, title, note, final) => {
    operation.status = "complete";
    stableExpected = true;
    clearMutation();
    emit({ line, event, phase: "operation", title, note, final });
    const invariant = steps[steps.length - 1].allOne432View.invariants;
    if (!invariant.stable) throw new Error(`AllOne stable invariant failed after operation ${operation.index}.`);
  };

  // Class body binding events.
  emit({ line: 1, event: "bind-bucket-class", phase: "setup", title: localized("Bind Bucket class", "Liên kết lớp Bucket"), note: localized("count + keys + prev/next.", "count + keys + prev/next.") });
  emit({ line: 2, event: "bind-bucket-init", phase: "setup", title: localized("Bind Bucket.__init__", "Liên kết Bucket.__init__"), note: localized("Constructor defined.", "Định nghĩa constructor.") });
  emit({ line: 8, event: "bind-allone-class", phase: "setup", title: localized("Bind AllOne class", "Liên kết lớp AllOne"), note: localized("One sorted bucket chain.", "Một chain bucket có thứ tự.") });
  [
    [9, "bind-allone-init", "AllOne.__init__"],
    [17, "bind-insert-method", "insert_after"],
    [25, "bind-remove-method", "remove_bucket"],
    [28, "bind-inc-method", "inc"],
    [47, "bind-dec-method", "dec"],
    [66, "bind-max-method", "getMaxKey"],
    [71, "bind-min-method", "getMinKey"],
  ].forEach(([line, event, name]) => emit({
    line,
    event,
    phase: "setup",
    title: localized(`Bind ${name}`, `Liên kết ${name}`),
    note: localized("Definition only.", "Chỉ định nghĩa."),
  }));

  operation.status = "running";
  emit({ line: 9, event: "allone-init-entry", phase: "setup", timing: "before", title: localized("Enter AllOne.__init__", "Vào AllOne.__init__"), note: localized("2 sentinels + 2 maps.", "2 sentinel + 2 map.") });
  emit({ line: 10, event: "head-constructor-call", phase: "setup", timing: "before", title: localized("Evaluate Bucket(0) for head", "Đánh giá Bucket(0) cho head"), note: localized("Build HEAD.", "Tạo HEAD.") });
  constructBucket(0, "head", "head");
  headId = "head";
  locals.newBucket = headId;
  emit({ line: 10, event: "assign-head", phase: "setup", title: localized("Assign the HEAD sentinel", "Gán sentinel HEAD"), note: localized("Low end, no keys.", "Đầu thấp, không key.") });

  emit({ line: 11, event: "tail-constructor-call", phase: "setup", timing: "before", title: localized("Evaluate Bucket(0) for tail", "Đánh giá Bucket(0) cho tail"), note: localized("Build TAIL.", "Tạo TAIL.") });
  constructBucket(0, "tail", "tail");
  tailId = "tail";
  locals.newBucket = tailId;
  emit({ line: 11, event: "assign-tail", phase: "setup", title: localized("Assign the TAIL sentinel", "Gán sentinel TAIL"), note: localized("High end, no keys.", "Đầu cao, không key.") });

  buckets.get(headId).next = tailId;
  counters.pointerWrites++;
  setMutation("pointer-write", headId, "next", null, tailId, headId, tailId);
  emit({ line: 12, event: "connect-head-next", phase: "setup", title: localized("HEAD.next = TAIL", "HEAD.next = TAIL"), note: localized("Forward link.", "Liên kết xuôi.") });
  buckets.get(tailId).prev = headId;
  counters.pointerWrites++;
  setMutation("pointer-write", tailId, "prev", null, headId, tailId, headId);
  emit({ line: 13, event: "connect-tail-prev", phase: "setup", title: localized("TAIL.prev = HEAD", "TAIL.prev = HEAD"), note: localized("Backward link.", "Liên kết ngược.") });
  keyCount = new Map();
  setMutation("map-allocate", "AllOne", "keyCount", null, "{}");
  emit({ line: 14, event: "allocate-key-count", phase: "setup", title: localized("Allocate keyCount", "Cấp phát keyCount"), note: localized("key → count.", "key → count.") });
  keyBucket = new Map();
  setupComplete = true;
  stableExpected = true;
  operation.status = "complete";
  setMutation("map-allocate", "AllOne", "keyBucket", null, "{}");
  emit({ line: 15, event: "allocate-key-bucket", phase: "setup", title: localized("Allocate keyBucket", "Cấp phát keyBucket"), note: localized("key → bucket. Ready.", "key → bucket. Sẵn sàng.") });
  if (!steps[steps.length - 1].allOne432View.invariants.stable) throw new Error("AllOne initialization invariant failed.");

  commands.forEach((command, commandIndex) => {
    const isFinalOperation = commandIndex === commands.length - 1;
    operation = {
      index: commandIndex + 1,
      total: commands.length,
      name: command.op,
      key: command.key,
      raw: command.key ? `${command.op} ${command.key}` : command.op,
      status: "running",
      result: null,
    };
    locals = blankLocals();
    locals.key = command.key;
    mutation = blankMutation();
    query = blankQuery();
    stableExpected = command.op === "getMaxKey" || command.op === "getMinKey";
    counters.operations++;

    if (command.op === "inc") {
      counters.incCalls++;
      const key = command.key;
      emit({ line: 28, event: "inc-entry", phase: "operation", timing: "before", title: localized(`Enter inc(${key})`, `Vào inc(${key})`), note: localized("Move key one bucket right.", "Dời key sang phải 1 bucket.") });
      const isNew = !keyCount.has(key);
      emit({ line: 29, event: isNew ? "inc-new-key" : "inc-existing-key", phase: "operation", condition: { expression: `${key} not in keyCount`, result: isNew }, title: localized(`Is ${key} new? ${isNew}`, `${key} là key mới? ${isNew}`), note: isNew ? localized("A new key starts at count 1.", "Key mới bắt đầu tại count 1.") : localized("Existing key.", "Key đã có.") });

      let targetId = null;
      if (isNew) {
        const before = null;
        keyCount.set(key, 1);
        counters.keyCountWrites++;
        setMutation("map-write", "keyCount", key, before, 1);
        emit({ line: 30, event: "create-key-count", phase: "operation", title: localized(`keyCount[${key}] = 1`, `keyCount[${key}] = 1`), note: localized("Map first, bucket later.", "Map trước, bucket sau.") });
        const headNext = buckets.get(headId).next;
        const needBucket = buckets.get(headNext).count !== 1;
        locals.target = headNext;
        emit({ line: 31, event: needBucket ? "count-one-missing" : "count-one-present", phase: "operation", condition: { expression: `${bucketName(headNext)}.count != 1`, result: needBucket }, title: localized(`Need count-1 bucket? ${needBucket}`, `Cần bucket count-1? ${needBucket}`), note: needBucket ? localized("No [1] yet: insert.", "Chưa có [1]: chèn.") : localized("Reuse [1].", "Dùng lại [1].") });
        if (needBucket) {
          traceInsertAfter(headId, 1, 32, false);
        } else {
          counters.neighborReuses++;
        }
        targetId = buckets.get(headId).next;
        locals.target = targetId;
        clearMutation();
        emit({ line: 33, event: "select-count-one", phase: "operation", title: localized(`target = ${bucketName(targetId)}`, `target = ${bucketName(targetId)}`), note: localized("Target is [1].", "Đích là [1].") });
      } else {
        emit({ line: 34, event: "inc-else", phase: "operation", timing: "before", title: localized("Enter existing-key branch", "Vào nhánh key đã tồn tại"), note: localized("Existing key branch.", "Nhánh key đã có.") });
        const oldCount = keyCount.get(key);
        locals.oldCount = oldCount;
        emit({ line: 35, event: "read-old-count", phase: "operation", title: localized(`old_count = ${oldCount}`, `old_count = ${oldCount}`), note: localized("Save old count.", "Lưu count cũ.") });
        keyCount.set(key, oldCount + 1);
        counters.keyCountWrites++;
        setMutation("map-write", "keyCount", key, oldCount, oldCount + 1);
        emit({ line: 36, event: "increment-key-count", phase: "operation", title: localized(`keyCount[${key}] = ${oldCount + 1}`, `keyCount[${key}] = ${oldCount + 1}`), note: localized("Map first, bucket later.", "Map trước, bucket sau.") });
        const bucketId = keyBucket.get(key);
        locals.bucket = bucketId;
        clearMutation();
        emit({ line: 37, event: "read-key-bucket", phase: "operation", title: localized(`bucket = ${bucketName(bucketId)}`, `bucket = ${bucketName(bucketId)}`), note: localized("O(1) lookup.", "Tra O(1).") });
        buckets.get(bucketId).keys.delete(key);
        counters.keyRemoves++;
        setMutation("key-remove", bucketId, "keys", key, null);
        emit({ line: 38, event: "remove-key-from-old", phase: "operation", title: localized(`Delete ${key} from ${bucketName(bucketId)}`, `Xóa ${key} khỏi ${bucketName(bucketId)}`), note: localized("Key leaves old bucket.", "Key rời bucket cũ.") });
        let candidate = buckets.get(bucketId).next;
        locals.target = candidate;
        clearMutation();
        emit({ line: 39, event: "read-next-bucket", phase: "operation", title: localized(`target = ${bucketName(candidate)}`, `target = ${bucketName(candidate)}`), note: localized("Check next bucket.", "Xét bucket kế.") });
        const needBucket = buckets.get(candidate).count !== oldCount + 1;
        emit({ line: 40, event: needBucket ? "increment-target-missing" : "increment-target-present", phase: "operation", condition: { expression: `${bucketName(candidate)}.count != ${oldCount + 1}`, result: needBucket }, title: localized(`Need count-${oldCount + 1} bucket? ${needBucket}`, `Cần bucket count-${oldCount + 1}? ${needBucket}`), note: needBucket ? localized("Missing: insert it.", "Thiếu: chèn.") : localized("Exists: reuse.", "Có rồi: dùng lại.") });
        if (needBucket) {
          candidate = traceInsertAfter(bucketId, oldCount + 1, 41, true);
        } else {
          counters.neighborReuses++;
        }
        targetId = candidate;
        locals.target = targetId;
        const empty = buckets.get(bucketId).keys.size === 0;
        emit({ line: 42, event: empty ? "old-bucket-empty" : "old-bucket-kept", phase: "operation", condition: { expression: `not ${bucketName(bucketId)}.keys`, result: empty }, title: localized(`Old bucket empty? ${empty}`, `Bucket cũ rỗng? ${empty}`), note: empty ? localized("Empty: remove it.", "Rỗng: xóa.") : localized("Not empty: keep.", "Còn key: giữ.") });
        if (empty) traceRemoveBucket(bucketId, 43);
      }

      buckets.get(targetId).keys.add(key);
      counters.keyAdds++;
      setMutation("key-add", targetId, "keys", null, key);
      emit({ line: 44, event: "add-key-to-target", phase: "operation", title: localized(`Add ${key} to ${bucketName(targetId)}`, `Thêm ${key} vào ${bucketName(targetId)}`), note: localized("Key enters target.", "Key vào đích.") });
      const beforeBucket = keyBucket.get(key) ?? null;
      keyBucket.set(key, targetId);
      counters.keyBucketWrites++;
      outputs.push(null);
      operation.result = null;
      setMutation("map-write", "keyBucket", key, beforeBucket, targetId);
      completeOperation(
        45,
        "set-key-bucket",
        localized(`keyBucket[${key}] = ${bucketName(targetId)}`, `keyBucket[${key}] = ${bucketName(targetId)}`),
        localized("Done: all consistent.", "Xong: tất cả khớp."),
        isFinalOperation,
      );
      return;
    }

    if (command.op === "dec") {
      counters.decCalls++;
      const key = command.key;
      emit({ line: 47, event: "dec-entry", phase: "operation", timing: "before", title: localized(`Enter dec(${key})`, `Vào dec(${key})`), note: localized("Move key one bucket left.", "Dời key sang trái 1 bucket.") });
      const missing = !keyCount.has(key);
      emit({ line: 48, event: missing ? "dec-missing" : "dec-existing", phase: "operation", condition: { expression: `${key} not in keyCount`, result: missing }, title: localized(`Is ${key} missing? ${missing}`, `${key} không tồn tại? ${missing}`), note: missing ? localized("Missing: do nothing.", "Không có: bỏ qua.") : localized("Key exists.", "Key tồn tại.") });
      if (missing) {
        outputs.push(null);
        operation.result = null;
        completeOperation(49, "dec-missing-return", localized("Return without change", "Trả về không thay đổi"), localized("Nothing changed.", "Không đổi gì."), isFinalOperation);
        return;
      }

      const oldCount = keyCount.get(key);
      locals.oldCount = oldCount;
      emit({ line: 50, event: "read-dec-count", phase: "operation", title: localized(`old_count = ${oldCount}`, `old_count = ${oldCount}`), note: localized("Save old count.", "Lưu count cũ.") });
      const bucketId = keyBucket.get(key);
      locals.bucket = bucketId;
      emit({ line: 51, event: "read-dec-bucket", phase: "operation", title: localized(`bucket = ${bucketName(bucketId)}`, `bucket = ${bucketName(bucketId)}`), note: localized("O(1) lookup.", "Tra O(1).") });
      buckets.get(bucketId).keys.delete(key);
      counters.keyRemoves++;
      setMutation("key-remove", bucketId, "keys", key, null);
      emit({ line: 52, event: "remove-key-for-dec", phase: "operation", title: localized(`Delete ${key} from ${bucketName(bucketId)}`, `Xóa ${key} khỏi ${bucketName(bucketId)}`), note: localized("Key leaves old bucket.", "Key rời bucket cũ.") });
      const becomesZero = oldCount === 1;
      emit({ line: 53, event: becomesZero ? "count-becomes-zero" : "count-stays-positive", phase: "operation", condition: { expression: `${oldCount} == 1`, result: becomesZero }, title: localized(`Does count reach zero? ${becomesZero}`, `Count về 0? ${becomesZero}`), note: becomesZero ? localized("Count 0: delete key.", "Count 0: xóa key.") : localized(`Go to [${oldCount - 1}].`, `Sang [${oldCount - 1}].`) });

      if (becomesZero) {
        keyCount.delete(key);
        counters.mapDeletes++;
        setMutation("map-delete", "keyCount", key, oldCount, null);
        emit({ line: 54, event: "delete-key-count", phase: "operation", title: localized(`Delete keyCount[${key}]`, `Xóa keyCount[${key}]`), note: localized("Drop from keyCount.", "Bỏ khỏi keyCount.") });
        const beforeBucket = keyBucket.get(key);
        keyBucket.delete(key);
        counters.mapDeletes++;
        setMutation("map-delete", "keyBucket", key, beforeBucket, null);
        emit({ line: 55, event: "delete-key-bucket", phase: "operation", title: localized(`Delete keyBucket[${key}]`, `Xóa keyBucket[${key}]`), note: localized("Drop from keyBucket.", "Bỏ khỏi keyBucket.") });
      } else {
        emit({ line: 56, event: "dec-else", phase: "operation", timing: "before", title: localized("Enter positive-count branch", "Vào nhánh count vẫn dương"), note: localized("Count stays positive.", "Count vẫn dương.") });
        keyCount.set(key, oldCount - 1);
        counters.keyCountWrites++;
        setMutation("map-write", "keyCount", key, oldCount, oldCount - 1);
        emit({ line: 57, event: "decrement-key-count", phase: "operation", title: localized(`keyCount[${key}] = ${oldCount - 1}`, `keyCount[${key}] = ${oldCount - 1}`), note: localized("Map first, bucket later.", "Map trước, bucket sau.") });
        let candidate = buckets.get(bucketId).prev;
        locals.target = candidate;
        emit({ line: 58, event: "read-prev-bucket", phase: "operation", title: localized(`target = ${bucketName(candidate)}`, `target = ${bucketName(candidate)}`), note: localized("Check previous bucket.", "Xét bucket trước.") });
        const needBucket = buckets.get(candidate).count !== oldCount - 1;
        emit({ line: 59, event: needBucket ? "decrement-target-missing" : "decrement-target-present", phase: "operation", condition: { expression: `${bucketName(candidate)}.count != ${oldCount - 1}`, result: needBucket }, title: localized(`Need count-${oldCount - 1} bucket? ${needBucket}`, `Cần bucket count-${oldCount - 1}? ${needBucket}`), note: needBucket ? localized("Missing: insert it.", "Thiếu: chèn.") : localized("Exists: reuse.", "Có rồi: dùng lại.") });
        if (needBucket) {
          candidate = traceInsertAfter(buckets.get(bucketId).prev, oldCount - 1, 60, true);
        } else {
          counters.neighborReuses++;
        }
        locals.target = candidate;
        buckets.get(candidate).keys.add(key);
        counters.keyAdds++;
        setMutation("key-add", candidate, "keys", null, key);
        emit({ line: 61, event: "add-key-to-decrement-target", phase: "operation", title: localized(`Add ${key} to ${bucketName(candidate)}`, `Thêm ${key} vào ${bucketName(candidate)}`), note: localized("Key enters target.", "Key vào đích.") });
        const beforeBucket = keyBucket.get(key);
        keyBucket.set(key, candidate);
        counters.keyBucketWrites++;
        setMutation("map-write", "keyBucket", key, beforeBucket, candidate);
        emit({ line: 62, event: "redirect-key-bucket", phase: "operation", title: localized(`keyBucket[${key}] = ${bucketName(candidate)}`, `keyBucket[${key}] = ${bucketName(candidate)}`), note: localized("Point map to target.", "Map trỏ tới đích.") });
      }

      const sourceEmpty = buckets.get(bucketId).keys.size === 0;
      emit({ line: 63, event: sourceEmpty ? "dec-source-empty" : "dec-source-kept", phase: "operation", condition: { expression: `not ${bucketName(bucketId)}.keys`, result: sourceEmpty }, title: localized(`Source bucket empty? ${sourceEmpty}`, `Bucket nguồn rỗng? ${sourceEmpty}`), note: sourceEmpty ? localized("Empty: remove it.", "Rỗng: xóa.") : localized("Not empty: keep.", "Còn key: giữ.") });
      if (sourceEmpty) traceRemoveBucket(bucketId, 64);
      outputs.push(null);
      operation.result = null;
      completeOperation(
        sourceEmpty ? 64 : 63,
        "dec-complete",
        localized(`Complete dec(${key})`, `Hoàn tất dec(${key})`),
        localized("Done: all consistent.", "Xong: tất cả khớp."),
        isFinalOperation,
      );
      return;
    }

    const isMax = command.op === "getMaxKey";
    if (isMax) counters.maxQueries++;
    else counters.minQueries++;
    const signatureLine = isMax ? 66 : 71;
    const conditionLine = isMax ? 67 : 72;
    const emptyLine = isMax ? 68 : 73;
    const valueLine = isMax ? 69 : 74;
    const bucketId = isMax ? buckets.get(tailId).prev : buckets.get(headId).next;
    const empty = isMax ? bucketId === headId : bucketId === tailId;
    query.kind = isMax ? "max" : "min";
    query.empty = empty;
    query.bucket = empty ? null : bucketId;
    query.count = empty ? null : buckets.get(bucketId).count;
    query.candidates = empty ? [] : [...buckets.get(bucketId).keys];
    query.displayCandidates = [...query.candidates].sort();
    locals.target = query.bucket;
    emit({ line: signatureLine, event: isMax ? "max-entry" : "min-entry", phase: "query", timing: "before", title: localized(`Enter ${command.op}()`, `Vào ${command.op}()`), note: localized(isMax ? "Max is TAIL.prev." : "Min is HEAD.next.", isMax ? "Max là TAIL.prev." : "Min là HEAD.next.") });
    emit({ line: conditionLine, event: empty ? "query-empty" : "query-nonempty", phase: "query", condition: { expression: isMax ? "tail.prev is head" : "head.next is tail", result: empty }, title: localized(`Is the structure empty? ${empty}`, `Cấu trúc rỗng? ${empty}`), note: empty ? localized("Empty: no buckets.", "Rỗng: không có bucket.") : localized(`Answer from ${bucketName(bucketId)}.`, `Lấy từ ${bucketName(bucketId)}.`) });
    const result = empty ? "" : query.candidates[0];
    query.chosen = result;
    outputs.push(result);
    counters.queryReturns++;
    operation.result = result;
    operation.status = "complete";
    stableExpected = true;
    emit({
      line: empty ? emptyLine : valueLine,
      event: empty ? "empty-query-return" : "extreme-key-return",
      phase: "query",
      title: localized(empty ? "Return empty string" : `Return ${result}`, empty ? "Trả chuỗi rỗng" : `Trả ${result}`),
      note: empty
        ? localized("Empty → ''.", "Rỗng → ''.")
        : localized(`Any key in ${bucketName(bucketId)} is valid.`, `Key nào trong ${bucketName(bucketId)} cũng đúng.`),
      final: isFinalOperation,
    });
    if (!steps[steps.length - 1].allOne432View.invariants.stable) throw new Error(`AllOne query invariant failed at operation ${operation.index}.`);
  });

  return { original: raw, answer: [...outputs], steps };
}

module.exports = {
  ALL_ONE_432_MAX_KEY_LENGTH,
  ALL_ONE_432_MAX_OPERATIONS,
  ALL_ONE_432_SOURCE,
  buildSteps432Exact,
  parseAllOne432Operations,
};
