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
      note: localized("A bucket object exists, but its four fields are initialized one source line at a time.", "Object bucket đã tồn tại, nhưng bốn field được khởi tạo từng dòng mã nguồn."),
    });
    bucket.count = count;
    setMutation("field-write", id, "count", null, count);
    emit({
      line: 3,
      event: "set-bucket-count",
      phase: "helper",
      title: localized(`Set ${id}.count = ${count}`, `Đặt ${id}.count = ${count}`),
      note: localized("This count determines the bucket's ordered-list position.", "Count này quyết định vị trí bucket trong danh sách có thứ tự."),
    });
    bucket.keys = new Set();
    setMutation("field-write", id, "keys", null, "ordered-dict");
    emit({
      line: 4,
      event: "allocate-key-dict",
      phase: "helper",
      title: localized("Allocate an empty ordered key dictionary", "Tạo dictionary key có thứ tự rỗng"),
      note: localized("Dictionary insertion order chooses a stable representative while all key operations remain average O(1).", "Thứ tự chèn của dictionary chọn representative ổn định, còn mọi thao tác key vẫn O(1) trung bình."),
    });
    counters.pointerWrites++;
    setMutation("pointer-write", id, "prev", null, null);
    emit({
      line: 5,
      event: "initialize-prev",
      phase: "helper",
      title: localized("Initialize prev = None", "Khởi tạo prev = None"),
      note: localized("The bucket is not linked yet.", "Bucket chưa được nối vào danh sách."),
    });
    counters.pointerWrites++;
    setMutation("pointer-write", id, "next", null, null);
    emit({
      line: 6,
      event: "initialize-next",
      phase: "helper",
      title: localized("Initialize next = None", "Khởi tạo next = None"),
      note: localized("Both links are empty when construction finishes.", "Cả hai liên kết đều rỗng khi khởi tạo xong."),
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
      note: localized("The call-site assignment waits while the helper performs four pointer writes.", "Phép gán tại call-site chờ helper thực hiện bốn lần ghi pointer."),
    });
    emit({
      line: 17,
      event: "insert-entry",
      phase: "helper",
      timing: "before",
      title: localized("Enter insert_after", "Vào insert_after"),
      note: localized(`Insert a count-${count} bucket between ${bucketName(anchorId)} and ${bucketName(buckets.get(anchorId).next)}.`, `Chèn bucket count-${count} giữa ${bucketName(anchorId)} và ${bucketName(buckets.get(anchorId).next)}.`),
    });
    const newId = `b${bucketSerial++}`;
    emit({
      line: 18,
      event: "new-bucket-call",
      phase: "helper",
      timing: "before",
      title: localized(`Evaluate Bucket(${count})`, `Đánh giá Bucket(${count})`),
      note: localized("new_bucket is unassigned until Bucket.__init__ returns.", "new_bucket chưa được gán cho đến khi Bucket.__init__ trả về."),
    });
    constructBucket(count, newId);
    locals.newBucket = newId;
    emit({
      line: 18,
      event: "new-bucket-assignment",
      phase: "helper",
      title: localized(`new_bucket = ${bucketName(newId)}`, `new_bucket = ${bucketName(newId)}`),
      note: localized("The initialized bucket is still detached from the linked chain.", "Bucket đã khởi tạo vẫn chưa nối vào chain."),
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
      note: localized("Only the new bucket knows its predecessor so far.", "Hiện chỉ bucket mới biết predecessor của nó."),
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
      note: localized("The new bucket now knows both neighbors, but neither forward chain nor reciprocal links are complete.", "Bucket mới đã biết hai hàng xóm, nhưng chain xuôi và liên kết đối ứng chưa hoàn tất."),
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
      note: localized("This is an intentional transient state: the predecessor still skips the new bucket.", "Đây là trạng thái tạm thời có chủ ý: predecessor vẫn bỏ qua bucket mới."),
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
      note: localized("All four links now place the new bucket in the chain; it remains empty until the caller moves a key.", "Bốn liên kết đã đặt bucket mới vào chain; nó vẫn rỗng đến khi caller chuyển key vào."),
    });

    emit({
      line: 23,
      event: "insert-return",
      phase: "helper",
      title: localized(`Return ${bucketName(newId)}`, `Trả về ${bucketName(newId)}`),
      note: localized("Return the exact bucket object created by this constant-time splice.", "Trả đúng object bucket được tạo bởi phép splice thời gian hằng số."),
    });
    if (assignTarget) locals.target = newId;
    emit({
      line: callLine,
      event: "insert-call-return",
      phase: "operation",
      title: localized(assignTarget ? `target = ${bucketName(newId)}` : "insert_after returned", assignTarget ? `target = ${bucketName(newId)}` : "insert_after đã trả về"),
      note: localized(assignTarget ? "The call-site assignment now receives the new bucket." : "This call ignores the returned bucket; the next line reads head.next.", assignTarget ? "Phép gán tại call-site giờ nhận bucket mới." : "Call này bỏ qua bucket trả về; dòng kế tiếp đọc head.next."),
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
      note: localized("The empty bucket is removed with two reciprocal pointer writes.", "Bucket rỗng được xóa bằng hai lần ghi pointer đối ứng."),
    });
    emit({
      line: 25,
      event: "remove-entry",
      phase: "helper",
      timing: "before",
      title: localized("Enter remove_bucket", "Vào remove_bucket"),
      note: localized(`${bucketName(bucket.prev)} and ${bucketName(bucket.next)} will become adjacent.`, `${bucketName(bucket.prev)} và ${bucketName(bucket.next)} sẽ trở thành kề nhau.`),
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
      note: localized("Forward traversal bypasses the removed bucket; the backward pointer is temporarily stale.", "Duyệt xuôi đã bỏ qua bucket bị xóa; pointer ngược tạm thời còn cũ."),
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
      note: localized("The live chain is reciprocal again; the old bucket remains only as a detached object in this debug snapshot.", "Chain đang hoạt động lại đối ứng; bucket cũ chỉ còn là object tách rời trong snapshot debug."),
    });
    emit({
      line: callLine,
      event: "remove-call-return",
      phase: "operation",
      title: localized(`${bucketName(bucketId)} is detached`, `${bucketName(bucketId)} đã tách khỏi chain`),
      note: localized("remove_bucket returns implicitly after its second pointer write.", "remove_bucket trả về ngầm sau lần ghi pointer thứ hai."),
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
  emit({ line: 1, event: "bind-bucket-class", phase: "setup", title: localized("Bind Bucket class", "Liên kết lớp Bucket"), note: localized("Bucket nodes store one count, ordered keys, and reciprocal neighbors.", "Node Bucket lưu một count, các key có thứ tự và hai hàng xóm đối ứng.") });
  emit({ line: 2, event: "bind-bucket-init", phase: "setup", title: localized("Bind Bucket.__init__", "Liên kết Bucket.__init__"), note: localized("Each constructor body will be traced whenever a sentinel or real bucket is created.", "Mỗi thân constructor sẽ được trace khi tạo sentinel hoặc bucket thật.") });
  emit({ line: 8, event: "bind-allone-class", phase: "setup", title: localized("Bind AllOne class", "Liên kết lớp AllOne"), note: localized("All operations share one ordered doubly linked bucket chain.", "Mọi thao tác dùng chung một chain bucket liên kết đôi có thứ tự.") });
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
    note: localized("Method binding changes no runtime bucket state.", "Liên kết method không đổi trạng thái bucket runtime."),
  }));

  operation.status = "running";
  emit({ line: 9, event: "allone-init-entry", phase: "setup", timing: "before", title: localized("Enter AllOne.__init__", "Vào AllOne.__init__"), note: localized("Construct two sentinels, connect them, then allocate both key maps.", "Tạo hai sentinel, nối chúng, rồi cấp phát hai map key.") });
  emit({ line: 10, event: "head-constructor-call", phase: "setup", timing: "before", title: localized("Evaluate Bucket(0) for head", "Đánh giá Bucket(0) cho head"), note: localized("self.head is assigned after the constructor returns.", "self.head được gán sau khi constructor trả về.") });
  constructBucket(0, "head", "head");
  headId = "head";
  locals.newBucket = headId;
  emit({ line: 10, event: "assign-head", phase: "setup", title: localized("Assign the HEAD sentinel", "Gán sentinel HEAD"), note: localized("HEAD never stores user keys and marks the low-count boundary.", "HEAD không bao giờ chứa user key và đánh dấu biên count thấp.") });

  emit({ line: 11, event: "tail-constructor-call", phase: "setup", timing: "before", title: localized("Evaluate Bucket(0) for tail", "Đánh giá Bucket(0) cho tail"), note: localized("self.tail is assigned after its constructor returns.", "self.tail được gán sau khi constructor trả về.") });
  constructBucket(0, "tail", "tail");
  tailId = "tail";
  locals.newBucket = tailId;
  emit({ line: 11, event: "assign-tail", phase: "setup", title: localized("Assign the TAIL sentinel", "Gán sentinel TAIL"), note: localized("TAIL never stores user keys and marks the high-count boundary.", "TAIL không bao giờ chứa user key và đánh dấu biên count cao.") });

  buckets.get(headId).next = tailId;
  counters.pointerWrites++;
  setMutation("pointer-write", headId, "next", null, tailId, headId, tailId);
  emit({ line: 12, event: "connect-head-next", phase: "setup", title: localized("HEAD.next = TAIL", "HEAD.next = TAIL"), note: localized("Forward traversal now reaches TAIL; the reverse link is assigned next.", "Duyệt xuôi giờ tới TAIL; liên kết ngược được gán tiếp theo.") });
  buckets.get(tailId).prev = headId;
  counters.pointerWrites++;
  setMutation("pointer-write", tailId, "prev", null, headId, tailId, headId);
  emit({ line: 13, event: "connect-tail-prev", phase: "setup", title: localized("TAIL.prev = HEAD", "TAIL.prev = HEAD"), note: localized("The empty sentinel chain is now reciprocal.", "Chain sentinel rỗng giờ đã đối ứng.") });
  keyCount = new Map();
  setMutation("map-allocate", "AllOne", "keyCount", null, "{}");
  emit({ line: 14, event: "allocate-key-count", phase: "setup", title: localized("Allocate keyCount", "Cấp phát keyCount"), note: localized("keyCount maps every live key to its integer count.", "keyCount ánh xạ mỗi key đang sống tới count nguyên.") });
  keyBucket = new Map();
  setupComplete = true;
  stableExpected = true;
  operation.status = "complete";
  setMutation("map-allocate", "AllOne", "keyBucket", null, "{}");
  emit({ line: 15, event: "allocate-key-bucket", phase: "setup", title: localized("Allocate keyBucket", "Cấp phát keyBucket"), note: localized("Initialization boundary: both maps are empty and HEAD ↔ TAIL is a valid stable chain.", "Biên khởi tạo: hai map rỗng và HEAD ↔ TAIL là chain ổn định hợp lệ.") });
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
      emit({ line: 28, event: "inc-entry", phase: "operation", timing: "before", title: localized(`Enter inc(${key})`, `Vào inc(${key})`), note: localized("Move this key exactly one count to the right, creating a neighbor only if absent.", "Chuyển key đúng một count sang phải, chỉ tạo hàng xóm nếu chưa có.") });
      const isNew = !keyCount.has(key);
      emit({ line: 29, event: isNew ? "inc-new-key" : "inc-existing-key", phase: "operation", condition: { expression: `${key} not in keyCount`, result: isNew }, title: localized(`Is ${key} new? ${isNew}`, `${key} là key mới? ${isNew}`), note: isNew ? localized("A new key starts at count 1.", "Key mới bắt đầu tại count 1.") : localized("Read and increment the existing key's count.", "Đọc rồi tăng count hiện tại của key.") });

      let targetId = null;
      if (isNew) {
        const before = null;
        keyCount.set(key, 1);
        counters.keyCountWrites++;
        setMutation("map-write", "keyCount", key, before, 1);
        emit({ line: 30, event: "create-key-count", phase: "operation", title: localized(`keyCount[${key}] = 1`, `keyCount[${key}] = 1`), note: localized("The map is temporarily ahead of the bucket state until lines 44–45 finish.", "Map tạm thời đi trước trạng thái bucket cho đến khi dòng 44–45 hoàn tất.") });
        const headNext = buckets.get(headId).next;
        const needBucket = buckets.get(headNext).count !== 1;
        locals.target = headNext;
        emit({ line: 31, event: needBucket ? "count-one-missing" : "count-one-present", phase: "operation", condition: { expression: `${bucketName(headNext)}.count != 1`, result: needBucket }, title: localized(`Need count-1 bucket? ${needBucket}`, `Cần bucket count-1? ${needBucket}`), note: needBucket ? localized("The immediate successor is TAIL or a larger count, so insert count 1.", "Successor trực tiếp là TAIL hoặc count lớn hơn, nên chèn count 1.") : localized("HEAD.next already has count 1; reuse it in O(1).", "HEAD.next đã có count 1; dùng lại trong O(1).") });
        if (needBucket) {
          traceInsertAfter(headId, 1, 32, false);
        } else {
          counters.neighborReuses++;
        }
        targetId = buckets.get(headId).next;
        locals.target = targetId;
        clearMutation();
        emit({ line: 33, event: "select-count-one", phase: "operation", title: localized(`target = ${bucketName(targetId)}`, `target = ${bucketName(targetId)}`), note: localized("HEAD.next is now exactly the count-1 destination.", "HEAD.next giờ chính xác là đích count-1.") });
      } else {
        emit({ line: 34, event: "inc-else", phase: "operation", timing: "before", title: localized("Enter existing-key branch", "Vào nhánh key đã tồn tại"), note: localized("The false branch preserves the old count before changing either map or bucket.", "Nhánh sai giữ lại count cũ trước khi đổi map hoặc bucket.") });
        const oldCount = keyCount.get(key);
        locals.oldCount = oldCount;
        emit({ line: 35, event: "read-old-count", phase: "operation", title: localized(`old_count = ${oldCount}`, `old_count = ${oldCount}`), note: localized("This saved value determines both the source and destination counts.", "Giá trị lưu này quyết định count nguồn và đích.") });
        keyCount.set(key, oldCount + 1);
        counters.keyCountWrites++;
        setMutation("map-write", "keyCount", key, oldCount, oldCount + 1);
        emit({ line: 36, event: "increment-key-count", phase: "operation", title: localized(`keyCount[${key}] = ${oldCount + 1}`, `keyCount[${key}] = ${oldCount + 1}`), note: localized("The count map changes before the key physically moves, so full invariants are intentionally transient.", "Map count đổi trước khi key di chuyển vật lý, nên invariant đầy đủ tạm thời chưa đúng.") });
        const bucketId = keyBucket.get(key);
        locals.bucket = bucketId;
        clearMutation();
        emit({ line: 37, event: "read-key-bucket", phase: "operation", title: localized(`bucket = ${bucketName(bucketId)}`, `bucket = ${bucketName(bucketId)}`), note: localized("keyBucket gives the old bucket directly in average O(1).", "keyBucket cho bucket cũ trực tiếp trong O(1) trung bình.") });
        buckets.get(bucketId).keys.delete(key);
        counters.keyRemoves++;
        setMutation("key-remove", bucketId, "keys", key, null);
        emit({ line: 38, event: "remove-key-from-old", phase: "operation", title: localized(`Delete ${key} from ${bucketName(bucketId)}`, `Xóa ${key} khỏi ${bucketName(bucketId)}`), note: localized("The old bucket may now be empty, but removal waits until the destination is secured.", "Bucket cũ có thể đã rỗng, nhưng chỉ xóa sau khi đảm bảo đích.") });
        let candidate = buckets.get(bucketId).next;
        locals.target = candidate;
        clearMutation();
        emit({ line: 39, event: "read-next-bucket", phase: "operation", title: localized(`target = ${bucketName(candidate)}`, `target = ${bucketName(candidate)}`), note: localized("A +1 move can only reuse the immediate next bucket.", "Một bước +1 chỉ có thể dùng lại bucket kế tiếp trực tiếp.") });
        const needBucket = buckets.get(candidate).count !== oldCount + 1;
        emit({ line: 40, event: needBucket ? "increment-target-missing" : "increment-target-present", phase: "operation", condition: { expression: `${bucketName(candidate)}.count != ${oldCount + 1}`, result: needBucket }, title: localized(`Need count-${oldCount + 1} bucket? ${needBucket}`, `Cần bucket count-${oldCount + 1}? ${needBucket}`), note: needBucket ? localized("Insert the missing adjacent count before moving the key.", "Chèn count kề còn thiếu trước khi chuyển key.") : localized("The adjacent target already exists; no list mutation is needed.", "Đích kề đã tồn tại; không cần đổi list.") });
        if (needBucket) {
          candidate = traceInsertAfter(bucketId, oldCount + 1, 41, true);
        } else {
          counters.neighborReuses++;
        }
        targetId = candidate;
        locals.target = targetId;
        const empty = buckets.get(bucketId).keys.size === 0;
        emit({ line: 42, event: empty ? "old-bucket-empty" : "old-bucket-kept", phase: "operation", condition: { expression: `not ${bucketName(bucketId)}.keys`, result: empty }, title: localized(`Old bucket empty? ${empty}`, `Bucket cũ rỗng? ${empty}`), note: empty ? localized("Splice out the empty source bucket.", "Tách bucket nguồn rỗng khỏi chain.") : localized("Other keys still use this count, so keep the bucket.", "Key khác vẫn dùng count này, nên giữ bucket.") });
        if (empty) traceRemoveBucket(bucketId, 43);
      }

      buckets.get(targetId).keys.add(key);
      counters.keyAdds++;
      setMutation("key-add", targetId, "keys", null, key);
      emit({ line: 44, event: "add-key-to-target", phase: "operation", title: localized(`Add ${key} to ${bucketName(targetId)}`, `Thêm ${key} vào ${bucketName(targetId)}`), note: localized("The ordered dictionary records this key at the destination bucket's insertion-order tail.", "Dictionary có thứ tự ghi key ở cuối thứ tự chèn của bucket đích.") });
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
        localized("Operation boundary: maps, key membership, count order, and reciprocal links agree again.", "Biên thao tác: map, membership key, thứ tự count và pointer đối ứng lại đồng nhất."),
        isFinalOperation,
      );
      return;
    }

    if (command.op === "dec") {
      counters.decCalls++;
      const key = command.key;
      emit({ line: 47, event: "dec-entry", phase: "operation", timing: "before", title: localized(`Enter dec(${key})`, `Vào dec(${key})`), note: localized("Move an existing key one count left, or delete it when count reaches zero.", "Chuyển key đang tồn tại một count sang trái, hoặc xóa khi count về 0.") });
      const missing = !keyCount.has(key);
      emit({ line: 48, event: missing ? "dec-missing" : "dec-existing", phase: "operation", condition: { expression: `${key} not in keyCount`, result: missing }, title: localized(`Is ${key} missing? ${missing}`, `${key} không tồn tại? ${missing}`), note: missing ? localized("The defensive source returns without mutating state.", "Mã nguồn phòng thủ trả về mà không đổi trạng thái.") : localized("The key exists, so read its current count and bucket.", "Key tồn tại, nên đọc count và bucket hiện tại.") });
      if (missing) {
        outputs.push(null);
        operation.result = null;
        completeOperation(49, "dec-missing-return", localized("Return without change", "Trả về không thay đổi"), localized("Operation boundary remains valid because no map, key, or pointer changed.", "Biên thao tác vẫn hợp lệ vì không map, key hay pointer nào thay đổi."), isFinalOperation);
        return;
      }

      const oldCount = keyCount.get(key);
      locals.oldCount = oldCount;
      emit({ line: 50, event: "read-dec-count", phase: "operation", title: localized(`old_count = ${oldCount}`, `old_count = ${oldCount}`), note: localized("Count 1 deletes the key; larger counts move it to old_count − 1.", "Count 1 xóa key; count lớn hơn chuyển nó tới old_count − 1.") });
      const bucketId = keyBucket.get(key);
      locals.bucket = bucketId;
      emit({ line: 51, event: "read-dec-bucket", phase: "operation", title: localized(`bucket = ${bucketName(bucketId)}`, `bucket = ${bucketName(bucketId)}`), note: localized("Direct map lookup avoids scanning the bucket list.", "Tra map trực tiếp tránh quét danh sách bucket.") });
      buckets.get(bucketId).keys.delete(key);
      counters.keyRemoves++;
      setMutation("key-remove", bucketId, "keys", key, null);
      emit({ line: 52, event: "remove-key-for-dec", phase: "operation", title: localized(`Delete ${key} from ${bucketName(bucketId)}`, `Xóa ${key} khỏi ${bucketName(bucketId)}`), note: localized("The source bucket may be empty transiently until line 64 removes it.", "Bucket nguồn có thể rỗng tạm thời cho đến khi dòng 64 xóa nó.") });
      const becomesZero = oldCount === 1;
      emit({ line: 53, event: becomesZero ? "count-becomes-zero" : "count-stays-positive", phase: "operation", condition: { expression: `${oldCount} == 1`, result: becomesZero }, title: localized(`Does count reach zero? ${becomesZero}`, `Count về 0? ${becomesZero}`), note: becomesZero ? localized("Delete both key mappings; no count-0 bucket is allowed.", "Xóa cả hai mapping; không cho phép bucket count-0.") : localized(`Move the key to count ${oldCount - 1}.`, `Chuyển key tới count ${oldCount - 1}.`) });

      if (becomesZero) {
        keyCount.delete(key);
        counters.mapDeletes++;
        setMutation("map-delete", "keyCount", key, oldCount, null);
        emit({ line: 54, event: "delete-key-count", phase: "operation", title: localized(`Delete keyCount[${key}]`, `Xóa keyCount[${key}]`), note: localized("The key no longer has a positive count.", "Key không còn count dương.") });
        const beforeBucket = keyBucket.get(key);
        keyBucket.delete(key);
        counters.mapDeletes++;
        setMutation("map-delete", "keyBucket", key, beforeBucket, null);
        emit({ line: 55, event: "delete-key-bucket", phase: "operation", title: localized(`Delete keyBucket[${key}]`, `Xóa keyBucket[${key}]`), note: localized("Both key maps now omit the deleted key; the empty bucket cleanup still follows.", "Hai map key giờ đều bỏ key đã xóa; bước dọn bucket rỗng vẫn còn phía sau.") });
      } else {
        emit({ line: 56, event: "dec-else", phase: "operation", timing: "before", title: localized("Enter positive-count branch", "Vào nhánh count vẫn dương"), note: localized("The key will move exactly one bucket count to the left.", "Key sẽ chuyển đúng một count bucket sang trái.") });
        keyCount.set(key, oldCount - 1);
        counters.keyCountWrites++;
        setMutation("map-write", "keyCount", key, oldCount, oldCount - 1);
        emit({ line: 57, event: "decrement-key-count", phase: "operation", title: localized(`keyCount[${key}] = ${oldCount - 1}`, `keyCount[${key}] = ${oldCount - 1}`), note: localized("The count map changes before bucket membership, creating a truthful transient mismatch.", "Map count đổi trước membership bucket, tạo mismatch tạm thời đúng với thực thi.") });
        let candidate = buckets.get(bucketId).prev;
        locals.target = candidate;
        emit({ line: 58, event: "read-prev-bucket", phase: "operation", title: localized(`target = ${bucketName(candidate)}`, `target = ${bucketName(candidate)}`), note: localized("A −1 move can only reuse the immediate previous bucket.", "Một bước −1 chỉ có thể dùng lại bucket trước trực tiếp.") });
        const needBucket = buckets.get(candidate).count !== oldCount - 1;
        emit({ line: 59, event: needBucket ? "decrement-target-missing" : "decrement-target-present", phase: "operation", condition: { expression: `${bucketName(candidate)}.count != ${oldCount - 1}`, result: needBucket }, title: localized(`Need count-${oldCount - 1} bucket? ${needBucket}`, `Cần bucket count-${oldCount - 1}? ${needBucket}`), note: needBucket ? localized("Insert the missing bucket immediately before the source.", "Chèn bucket còn thiếu ngay trước bucket nguồn.") : localized("The previous bucket already has the destination count.", "Bucket trước đã có count đích.") });
        if (needBucket) {
          candidate = traceInsertAfter(buckets.get(bucketId).prev, oldCount - 1, 60, true);
        } else {
          counters.neighborReuses++;
        }
        locals.target = candidate;
        buckets.get(candidate).keys.add(key);
        counters.keyAdds++;
        setMutation("key-add", candidate, "keys", null, key);
        emit({ line: 61, event: "add-key-to-decrement-target", phase: "operation", title: localized(`Add ${key} to ${bucketName(candidate)}`, `Thêm ${key} vào ${bucketName(candidate)}`), note: localized("The destination now contains the key at its lower count.", "Đích giờ chứa key tại count thấp hơn.") });
        const beforeBucket = keyBucket.get(key);
        keyBucket.set(key, candidate);
        counters.keyBucketWrites++;
        setMutation("map-write", "keyBucket", key, beforeBucket, candidate);
        emit({ line: 62, event: "redirect-key-bucket", phase: "operation", title: localized(`keyBucket[${key}] = ${bucketName(candidate)}`, `keyBucket[${key}] = ${bucketName(candidate)}`), note: localized("Both key maps now describe the destination; only an empty source bucket may remain.", "Hai map key giờ mô tả đích; chỉ có thể còn bucket nguồn rỗng.") });
      }

      const sourceEmpty = buckets.get(bucketId).keys.size === 0;
      emit({ line: 63, event: sourceEmpty ? "dec-source-empty" : "dec-source-kept", phase: "operation", condition: { expression: `not ${bucketName(bucketId)}.keys`, result: sourceEmpty }, title: localized(`Source bucket empty? ${sourceEmpty}`, `Bucket nguồn rỗng? ${sourceEmpty}`), note: sourceEmpty ? localized("Remove the empty count bucket to preserve the no-empty-bucket invariant.", "Xóa bucket count rỗng để giữ invariant không có bucket rỗng.") : localized("Other keys still use this count; keep the source bucket linked.", "Key khác vẫn dùng count này; giữ bucket nguồn trong chain.") });
      if (sourceEmpty) traceRemoveBucket(bucketId, 64);
      outputs.push(null);
      operation.result = null;
      completeOperation(
        sourceEmpty ? 64 : 63,
        "dec-complete",
        localized(`Complete dec(${key})`, `Hoàn tất dec(${key})`),
        localized("Operation boundary: every remaining key appears once in the correctly ordered reciprocal chain.", "Biên thao tác: mỗi key còn lại xuất hiện đúng một lần trong chain đối ứng có thứ tự đúng."),
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
    emit({ line: signatureLine, event: isMax ? "max-entry" : "min-entry", phase: "query", timing: "before", title: localized(`Enter ${command.op}()`, `Vào ${command.op}()`), note: localized(isMax ? "The maximum bucket is immediately before TAIL." : "The minimum bucket is immediately after HEAD.", isMax ? "Bucket lớn nhất nằm ngay trước TAIL." : "Bucket nhỏ nhất nằm ngay sau HEAD.") });
    emit({ line: conditionLine, event: empty ? "query-empty" : "query-nonempty", phase: "query", condition: { expression: isMax ? "tail.prev is head" : "head.next is tail", result: empty }, title: localized(`Is the structure empty? ${empty}`, `Cấu trúc rỗng? ${empty}`), note: empty ? localized("No real bucket exists between the sentinels.", "Không có bucket thật giữa hai sentinel.") : localized(`${bucketName(bucketId)} is the extremal bucket and contains ${query.candidates.length} valid candidate(s).`, `${bucketName(bucketId)} là bucket cực trị và chứa ${query.candidates.length} ứng viên hợp lệ.`) });
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
        ? localized("The required empty-structure result is an empty string.", "Kết quả bắt buộc cho cấu trúc rỗng là chuỗi rỗng.")
        : localized(`The source returns the first insertion-ordered key in ${bucketName(bucketId)}; every listed candidate is a legally correct answer.`, `Mã nguồn trả key đầu theo thứ tự chèn trong ${bucketName(bucketId)}; mọi ứng viên liệt kê đều là đáp án hợp lệ.`),
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
