"use strict";

const AO432_SOURCE = Object.freeze([
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

const AO432_LINE_EVENTS = Object.freeze([
  "bind-bucket-class", "bucket-init-entry", "set-bucket-count", "allocate-key-dict", "initialize-prev", "initialize-next", "separator",
  "bind-allone-class", "allone-init-entry", "head-constructor-call", "tail-constructor-call", "connect-head-next", "connect-tail-prev", "allocate-key-count", "allocate-key-bucket", "separator",
  "insert-entry", "new-bucket-call", "link-new-prev", "link-new-next", "link-successor-prev", "link-predecessor-next", "insert-return", "separator",
  "remove-entry", "bypass-forward", "bypass-backward", "inc-entry", "inc-new-key", "create-key-count", "count-one-missing", "insert-call", "select-count-one", "inc-else",
  "read-old-count", "increment-key-count", "read-key-bucket", "remove-key-from-old", "read-next-bucket", "increment-target-missing", "insert-call", "old-bucket-empty", "remove-call", "add-key-to-target", "set-key-bucket", "separator",
  "dec-entry", "dec-missing", "dec-missing-return", "read-dec-count", "read-dec-bucket", "remove-key-for-dec", "count-becomes-zero", "delete-key-count", "delete-key-bucket", "dec-else",
  "decrement-key-count", "read-prev-bucket", "decrement-target-missing", "insert-call", "add-key-to-decrement-target", "redirect-key-bucket", "dec-source-empty", "remove-call", "separator",
  "max-entry", "query-empty", "empty-query-return", "extreme-key-return", "separator", "min-entry", "query-empty", "empty-query-return", "extreme-key-return",
]);

const AO432_EVENTS = Object.freeze({
  "separator": { en: "Source separator", vi: "Dòng phân cách" },
  "bind-bucket-class": { en: "Bind Bucket class", vi: "Liên kết lớp Bucket" },
  "bind-bucket-init": { en: "Bind Bucket constructor", vi: "Liên kết constructor Bucket" },
  "bind-allone-class": { en: "Bind AllOne class", vi: "Liên kết lớp AllOne" },
  "bind-allone-init": { en: "Bind AllOne constructor", vi: "Liên kết constructor AllOne" },
  "bind-insert-method": { en: "Bind insertion helper", vi: "Liên kết helper chèn" },
  "bind-remove-method": { en: "Bind removal helper", vi: "Liên kết helper xóa" },
  "bind-inc-method": { en: "Bind increment operation", vi: "Liên kết thao tác tăng" },
  "bind-dec-method": { en: "Bind decrement operation", vi: "Liên kết thao tác giảm" },
  "bind-max-method": { en: "Bind maximum query", vi: "Liên kết truy vấn max" },
  "bind-min-method": { en: "Bind minimum query", vi: "Liên kết truy vấn min" },
  "allone-init-entry": { en: "Enter AllOne constructor", vi: "Vào constructor AllOne" },
  "head-constructor-call": { en: "Construct HEAD", vi: "Tạo HEAD" },
  "tail-constructor-call": { en: "Construct TAIL", vi: "Tạo TAIL" },
  "bucket-init-entry": { en: "Enter Bucket constructor", vi: "Vào constructor Bucket" },
  "set-bucket-count": { en: "Write bucket count", vi: "Ghi count bucket" },
  "allocate-key-dict": { en: "Allocate ordered keys", vi: "Tạo tập key có thứ tự" },
  "initialize-prev": { en: "Initialize prev pointer", vi: "Khởi tạo pointer prev" },
  "initialize-next": { en: "Initialize next pointer", vi: "Khởi tạo pointer next" },
  "assign-head": { en: "Assign HEAD sentinel", vi: "Gán sentinel HEAD" },
  "assign-tail": { en: "Assign TAIL sentinel", vi: "Gán sentinel TAIL" },
  "connect-head-next": { en: "Connect HEAD forward", vi: "Nối xuôi từ HEAD" },
  "connect-tail-prev": { en: "Connect TAIL backward", vi: "Nối ngược từ TAIL" },
  "allocate-key-count": { en: "Allocate count map", vi: "Cấp phát map count" },
  "allocate-key-bucket": { en: "Allocate bucket map", vi: "Cấp phát map bucket" },
  "insert-call": { en: "Call insertion helper", vi: "Gọi helper chèn" },
  "insert-entry": { en: "Enter insertion helper", vi: "Vào helper chèn" },
  "new-bucket-call": { en: "Construct new bucket", vi: "Tạo bucket mới" },
  "new-bucket-assignment": { en: "Assign new bucket", vi: "Gán bucket mới" },
  "link-new-prev": { en: "Write new.prev", vi: "Ghi new.prev" },
  "link-new-next": { en: "Write new.next", vi: "Ghi new.next" },
  "link-successor-prev": { en: "Redirect successor.prev", vi: "Chuyển successor.prev" },
  "link-predecessor-next": { en: "Redirect predecessor.next", vi: "Chuyển predecessor.next" },
  "insert-return": { en: "Return inserted bucket", vi: "Trả bucket đã chèn" },
  "insert-call-return": { en: "Insertion call returns", vi: "Call chèn trả về" },
  "remove-call": { en: "Call removal helper", vi: "Gọi helper xóa" },
  "remove-entry": { en: "Enter removal helper", vi: "Vào helper xóa" },
  "bypass-forward": { en: "Bypass bucket forward", vi: "Bỏ qua bucket theo chiều xuôi" },
  "bypass-backward": { en: "Bypass bucket backward", vi: "Bỏ qua bucket theo chiều ngược" },
  "remove-call-return": { en: "Removal call returns", vi: "Call xóa trả về" },
  "inc-entry": { en: "Enter inc", vi: "Vào inc" },
  "inc-new-key": { en: "Detect new key", vi: "Phát hiện key mới" },
  "inc-existing-key": { en: "Detect existing key", vi: "Phát hiện key đã có" },
  "create-key-count": { en: "Create count mapping", vi: "Tạo mapping count" },
  "count-one-missing": { en: "Count-1 bucket missing", vi: "Thiếu bucket count-1" },
  "count-one-present": { en: "Reuse count-1 bucket", vi: "Dùng lại bucket count-1" },
  "select-count-one": { en: "Select count-1 target", vi: "Chọn đích count-1" },
  "inc-else": { en: "Enter existing-key branch", vi: "Vào nhánh key đã có" },
  "read-old-count": { en: "Read old count", vi: "Đọc count cũ" },
  "increment-key-count": { en: "Increment count mapping", vi: "Tăng mapping count" },
  "read-key-bucket": { en: "Read current bucket", vi: "Đọc bucket hiện tại" },
  "remove-key-from-old": { en: "Remove key from source", vi: "Xóa key khỏi nguồn" },
  "read-next-bucket": { en: "Read next neighbor", vi: "Đọc hàng xóm kế tiếp" },
  "increment-target-missing": { en: "Increment target missing", vi: "Thiếu đích tăng" },
  "increment-target-present": { en: "Reuse increment target", vi: "Dùng lại đích tăng" },
  "old-bucket-empty": { en: "Source bucket became empty", vi: "Bucket nguồn đã rỗng" },
  "old-bucket-kept": { en: "Source bucket still used", vi: "Bucket nguồn vẫn được dùng" },
  "add-key-to-target": { en: "Add key to target", vi: "Thêm key vào đích" },
  "set-key-bucket": { en: "Redirect keyBucket", vi: "Chuyển keyBucket" },
  "dec-entry": { en: "Enter dec", vi: "Vào dec" },
  "dec-missing": { en: "Missing key", vi: "Key không tồn tại" },
  "dec-existing": { en: "Existing key", vi: "Key tồn tại" },
  "dec-missing-return": { en: "Return without change", vi: "Trả về không thay đổi" },
  "read-dec-count": { en: "Read decrement count", vi: "Đọc count cần giảm" },
  "read-dec-bucket": { en: "Read decrement bucket", vi: "Đọc bucket cần giảm" },
  "remove-key-for-dec": { en: "Remove key before decrement", vi: "Xóa key trước khi giảm" },
  "count-becomes-zero": { en: "Count reaches zero", vi: "Count về 0" },
  "count-stays-positive": { en: "Count remains positive", vi: "Count vẫn dương" },
  "delete-key-count": { en: "Delete count mapping", vi: "Xóa mapping count" },
  "delete-key-bucket": { en: "Delete bucket mapping", vi: "Xóa mapping bucket" },
  "dec-else": { en: "Enter positive-count branch", vi: "Vào nhánh count dương" },
  "decrement-key-count": { en: "Decrement count mapping", vi: "Giảm mapping count" },
  "read-prev-bucket": { en: "Read previous neighbor", vi: "Đọc hàng xóm trước" },
  "decrement-target-missing": { en: "Decrement target missing", vi: "Thiếu đích giảm" },
  "decrement-target-present": { en: "Reuse decrement target", vi: "Dùng lại đích giảm" },
  "add-key-to-decrement-target": { en: "Add key to lower target", vi: "Thêm key vào đích thấp hơn" },
  "redirect-key-bucket": { en: "Redirect key bucket", vi: "Chuyển bucket của key" },
  "dec-source-empty": { en: "Decrement source is empty", vi: "Nguồn giảm đã rỗng" },
  "dec-source-kept": { en: "Decrement source remains", vi: "Nguồn giảm được giữ" },
  "dec-complete": { en: "Complete decrement", vi: "Hoàn tất giảm" },
  "max-entry": { en: "Enter maximum query", vi: "Vào truy vấn max" },
  "min-entry": { en: "Enter minimum query", vi: "Vào truy vấn min" },
  "query-empty": { en: "Detect empty structure", vi: "Phát hiện cấu trúc rỗng" },
  "query-nonempty": { en: "Locate extremal bucket", vi: "Tìm bucket cực trị" },
  "empty-query-return": { en: "Return empty string", vi: "Trả chuỗi rỗng" },
  "extreme-key-return": { en: "Return extremal key", vi: "Trả key cực trị" },
});

const AO432_COUNTERS = Object.freeze([
  ["operations", { en: "Operations", vi: "Thao tác" }],
  ["incCalls", { en: "inc calls", vi: "Lần gọi inc" }],
  ["decCalls", { en: "dec calls", vi: "Lần gọi dec" }],
  ["maxQueries", { en: "Max queries", vi: "Truy vấn max" }],
  ["minQueries", { en: "Min queries", vi: "Truy vấn min" }],
  ["bucketConstructions", { en: "Buckets built", vi: "Bucket đã tạo" }],
  ["bucketInsertions", { en: "Bucket splices", vi: "Lần chèn bucket" }],
  ["bucketRemovals", { en: "Buckets removed", vi: "Bucket đã xóa" }],
  ["pointerWrites", { en: "Pointer writes", vi: "Lần ghi pointer" }],
  ["keyCountWrites", { en: "Count writes", vi: "Lần ghi count" }],
  ["keyBucketWrites", { en: "Bucket-map writes", vi: "Lần ghi map bucket" }],
  ["mapDeletes", { en: "Map deletes", vi: "Lần xóa map" }],
  ["keyAdds", { en: "Key insertions", vi: "Lần thêm key" }],
  ["keyRemoves", { en: "Key removals", vi: "Lần bỏ key" }],
  ["neighborReuses", { en: "Neighbor reuses", vi: "Lần dùng lại hàng xóm" }],
  ["queryReturns", { en: "Query returns", vi: "Kết quả truy vấn" }],
]);

const AO432_TEXT = Object.freeze({
  en: Object.freeze({
    region: "All O`one exact bucket-list visualization",
    kicker: "LEETCODE 432 · O(1) BUCKET LIST",
    fallbackTitle: "All O`one Data Structure",
    line: "LINE",
    before: "before execution",
    after: "after execution",
    eventRail: "Exact source and runtime event rail",
    sourceAction: "Current source action",
    phase: "Phase",
    event: "Event",
    condition: "Condition",
    noCondition: "No condition on this frame.",
    trueValue: "TRUE",
    falseValue: "FALSE",
    pending: "pending",
    none: "None",
    operations: "Operation sequence",
    operationsHelp: "Each operation contributes one result; mutators return None.",
    setup: "setup",
    running: "running",
    complete: "complete",
    bucketChain: "Count-ordered doubly linked bucket chain",
    bucketHelp: "Real bucket counts increase left-to-right. Cards expose actual prev/next pointers even during a transient splice.",
    head: "HEAD",
    tail: "TAIL",
    count: "count",
    keysSorted: "keys A→Z",
    dictOrder: "dict insertion order",
    empty: "empty",
    linked: "linked",
    detached: "detached",
    constructing: "constructing",
    prev: "prev",
    next: "next",
    detachedTitle: "Detached / under-construction buckets",
    noDetached: "No detached bucket exists in this frame.",
    maps: "Direct key maps",
    mapsHelp: "keyCount stores counts; keyBucket points directly to the bucket object.",
    key: "key",
    keyCount: "keyCount[key]",
    keyBucket: "keyBucket[key]",
    noKeys: "No live keys.",
    mutation: "Current constant-time mutation",
    mutationHelp: "One source line changes one field, map entry, or bucket membership.",
    kind: "kind",
    object: "object",
    field: "field/key",
    beforeValue: "before",
    afterValue: "after",
    locals: "Active locals",
    bucket: "bucket",
    target: "target",
    newBucket: "new_bucket",
    predecessor: "predecessor",
    successor: "successor",
    oldCount: "old_count",
    invariants: "Structural invariants",
    invariantsHelp: "Stable boundaries require every invariant. Intermediate helper lines may intentionally violate reciprocity or map agreement.",
    expectedStable: "stable state expected",
    expectedTransient: "transient state expected",
    stable: "VALID",
    transient: "TRANSIENT",
    violation: "INVALID BOUNDARY",
    reciprocalLinks: "adjacent links are reciprocal",
    increasingCounts: "real counts strictly increase",
    nonemptyBuckets: "linked real buckets are nonempty",
    uniqueKeys: "each key appears once",
    mapsAgree: "maps agree with bucket membership",
    sentinelsValid: "sentinels are valid and empty",
    notChecked: "Initialization is not complete yet.",
    query: "Extremal query and tie semantics",
    queryHelp: "Every key in the extremal bucket is valid. The ordered dict returns its first insertion-ordered key deterministically.",
    queryKind: "query",
    candidateBucket: "extremal bucket",
    candidates: "valid tied candidates",
    chosen: "returned key",
    noQuery: "No min/max query is active.",
    outputs: "Operation outputs",
    outputsHelp: "Output positions align one-to-one with the input operations.",
    awaiting: "awaiting",
    emptyString: "empty string",
    counters: "Operation counters",
    note: "Why this frame matters",
  }),
  vi: Object.freeze({
    region: "Minh họa bucket list chính xác cho All O`one",
    kicker: "LEETCODE 432 · BUCKET LIST O(1)",
    fallbackTitle: "Cấu trúc dữ liệu All O`one",
    line: "DÒNG",
    before: "trước khi chạy",
    after: "sau khi chạy",
    eventRail: "Mã nguồn chính xác và chuỗi sự kiện runtime",
    sourceAction: "Thao tác mã nguồn hiện tại",
    phase: "Giai đoạn",
    event: "Sự kiện",
    condition: "Điều kiện",
    noCondition: "Frame này không có điều kiện.",
    trueValue: "ĐÚNG",
    falseValue: "SAI",
    pending: "đang chờ",
    none: "None",
    operations: "Chuỗi thao tác",
    operationsHelp: "Mỗi thao tác tạo một kết quả; thao tác thay đổi trả về None.",
    setup: "khởi tạo",
    running: "đang chạy",
    complete: "hoàn tất",
    bucketChain: "Chain bucket liên kết đôi theo count",
    bucketHelp: "Count bucket thật tăng từ trái sang phải. Card hiển thị pointer prev/next thật kể cả khi splice đang tạm thời.",
    head: "HEAD",
    tail: "TAIL",
    count: "count",
    keysSorted: "key A→Z",
    dictOrder: "thứ tự chèn dict",
    empty: "rỗng",
    linked: "đang nối",
    detached: "đã tách",
    constructing: "đang tạo",
    prev: "prev",
    next: "next",
    detachedTitle: "Bucket đã tách / đang khởi tạo",
    noDetached: "Frame này không có bucket tách rời.",
    maps: "Map key trực tiếp",
    mapsHelp: "keyCount lưu count; keyBucket trỏ thẳng tới object bucket.",
    key: "key",
    keyCount: "keyCount[key]",
    keyBucket: "keyBucket[key]",
    noKeys: "Không có key đang sống.",
    mutation: "Thay đổi thời gian hằng số hiện tại",
    mutationHelp: "Một dòng nguồn đổi một field, map entry hoặc membership bucket.",
    kind: "loại",
    object: "object",
    field: "field/key",
    beforeValue: "trước",
    afterValue: "sau",
    locals: "Biến cục bộ đang hoạt động",
    bucket: "bucket",
    target: "target",
    newBucket: "new_bucket",
    predecessor: "predecessor",
    successor: "successor",
    oldCount: "old_count",
    invariants: "Bất biến cấu trúc",
    invariantsHelp: "Biên ổn định cần mọi invariant. Dòng helper trung gian có thể cố ý chưa đối ứng hoặc chưa khớp map.",
    expectedStable: "mong đợi trạng thái ổn định",
    expectedTransient: "mong đợi trạng thái tạm thời",
    stable: "HỢP LỆ",
    transient: "TẠM THỜI",
    violation: "BIÊN KHÔNG HỢP LỆ",
    reciprocalLinks: "liên kết kề đối ứng",
    increasingCounts: "count thật tăng nghiêm ngặt",
    nonemptyBuckets: "bucket thật đang nối không rỗng",
    uniqueKeys: "mỗi key xuất hiện một lần",
    mapsAgree: "map khớp membership bucket",
    sentinelsValid: "sentinel hợp lệ và rỗng",
    notChecked: "Khởi tạo chưa hoàn tất.",
    query: "Truy vấn cực trị và semantics khi hòa",
    queryHelp: "Mọi key trong bucket cực trị đều hợp lệ. Dict có thứ tự trả key được chèn đầu tiên một cách xác định.",
    queryKind: "truy vấn",
    candidateBucket: "bucket cực trị",
    candidates: "ứng viên hòa hợp lệ",
    chosen: "key trả về",
    noQuery: "Không có truy vấn min/max đang hoạt động.",
    outputs: "Kết quả thao tác",
    outputsHelp: "Vị trí output tương ứng một-một với thao tác input.",
    awaiting: "đang chờ",
    emptyString: "chuỗi rỗng",
    counters: "Bộ đếm thao tác",
    note: "Ý nghĩa của frame này",
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

function ao432Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function ao432CleanText(value, fallback = "", maximum = 500) {
  if (typeof value !== "string") return fallback;
  const text = value.slice(0, maximum).trim();
  return /^(?:undefined|null|nan|[+-]?infinity)$/i.test(text) ? fallback : text;
}

function ao432Localized(value, locale, fallback) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return ao432CleanText(value[locale], ao432CleanText(value.en, ao432CleanText(value.vi, fallback)));
  }
  return ao432CleanText(value, fallback);
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
  if (typeof value === "string") return ao432CleanText(value, "", 40);
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

function ao432Normalize(step) {
  const raw = step && step.allOne432View && typeof step.allOne432View === "object" ? step.allOne432View : {};
  const sourceRaw = raw.source && typeof raw.source === "object" ? raw.source : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const sourceLine = ao432Integer(sourceRaw.line, 1, AO432_SOURCE.length)
    ?? ao432Integer(fallbackLine, 1, AO432_SOURCE.length)
    ?? 1;
  const fallbackEvent = AO432_LINE_EVENTS[sourceLine - 1];
  const event = Object.prototype.hasOwnProperty.call(AO432_EVENTS, raw.event) ? raw.event : fallbackEvent;
  const phase = ["setup", "helper", "operation", "query", "done"].includes(raw.phase) ? raw.phase : "setup";
  const timing = raw.timing === "before" ? "before" : "after";
  const conditionRaw = raw.condition && typeof raw.condition === "object" ? raw.condition : {};

  const inputRaw = raw.input && typeof raw.input === "object" ? raw.input : {};
  const commands = Array.isArray(inputRaw.commands) ? inputRaw.commands.slice(0, 24).flatMap((item) => {
    const command = item && typeof item === "object" ? item : {};
    const op = ["inc", "dec", "getMaxKey", "getMinKey"].includes(command.op) ? command.op : null;
    const key = op === "inc" || op === "dec" ? ao432Key(command.key) : null;
    if (!op || ((op === "inc" || op === "dec") && !key)) return [];
    return [{ op, key, raw: key ? `${op} ${key}` : op }];
  }) : [];

  const structureRaw = raw.structure && typeof raw.structure === "object" ? raw.structure : {};
  const recordsRaw = Array.isArray(structureRaw.buckets) ? structureRaw.buckets.slice(0, 26) : [];
  const seenIds = new Set();
  const initialRecords = recordsRaw.flatMap((item) => {
    const bucket = item && typeof item === "object" ? item : {};
    const id = ao432Id(bucket.id);
    if (!id || seenIds.has(id)) return [];
    seenIds.add(id);
    const sentinel = bucket.sentinel === "head" || bucket.sentinel === "tail" ? bucket.sentinel : null;
    return [{
      id,
      label: sentinel ? sentinel.toUpperCase() : `B${ao432Integer(bucket.count, 0, 24) ?? "?"}`,
      count: ao432Integer(bucket.count, 0, 24),
      sentinel,
      prev: ao432Id(bucket.prev),
      next: ao432Id(bucket.next),
      keys: ao432UniqueKeys(bucket.keys),
      displayKeys: ao432UniqueKeys(bucket.displayKeys).sort(),
      constructing: bucket.constructing === true,
    }];
  });
  const byId = new Map(initialRecords.map((bucket) => [bucket.id, bucket]));
  const order = [];
  const orderedIds = new Set();
  if (Array.isArray(structureRaw.order)) {
    structureRaw.order.slice(0, initialRecords.length).forEach((value) => {
      const id = ao432Id(value);
      if (id && byId.has(id) && !orderedIds.has(id)) {
        orderedIds.add(id);
        order.push(id);
      }
    });
  }
  const buckets = initialRecords.map((bucket) => ({
    ...bucket,
    prev: bucket.prev && byId.has(bucket.prev) ? bucket.prev : null,
    next: bucket.next && byId.has(bucket.next) ? bucket.next : null,
    displayKeys: bucket.displayKeys.length ? bucket.displayKeys : [...bucket.keys].sort(),
    linked: orderedIds.has(bucket.id),
  }));
  const head = ao432Id(structureRaw.head);
  const tail = ao432Id(structureRaw.tail);
  const constructing = ao432Id(structureRaw.constructing);

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
    const bucket = ao432Id(entry.bucket);
    return key && bucket && byId.has(bucket) ? [{
      key,
      bucket,
      count: ao432Integer(entry.count, 0, 24),
      linked: orderedIds.has(bucket),
    }] : [];
  }) : [];

  const operationRaw = raw.operation && typeof raw.operation === "object" ? raw.operation : {};
  const total = commands.length;
  const operationName = ["AllOne", "inc", "dec", "getMaxKey", "getMinKey"].includes(operationRaw.name) ? operationRaw.name : "AllOne";
  const operationKey = operationName === "inc" || operationName === "dec" ? ao432Key(operationRaw.key) : null;
  const outputs = Array.isArray(operationRaw.outputs) ? operationRaw.outputs.slice(0, total).map((value) => {
    if (value === null || value === "") return value;
    return ao432Key(value) || null;
  }) : [];
  const operation = {
    index: ao432Integer(operationRaw.index, 0, total) ?? 0,
    total,
    name: operationName,
    key: operationKey,
    raw: operationKey ? `${operationName} ${operationKey}` : operationName === "AllOne" ? "AllOne()" : operationName,
    status: ["setup", "running", "complete"].includes(operationRaw.status) ? operationRaw.status : "setup",
    result: operationRaw.result === null || operationRaw.result === "" ? operationRaw.result : ao432Key(operationRaw.result),
    outputs,
  };

  const localsRaw = raw.locals && typeof raw.locals === "object" ? raw.locals : {};
  const locals = {
    key: ao432Key(localsRaw.key),
    count: ao432Integer(localsRaw.count, 0, 24),
    oldCount: ao432Integer(localsRaw.oldCount, 1, 24),
    bucket: byId.has(ao432Id(localsRaw.bucket)) ? localsRaw.bucket : null,
    target: byId.has(ao432Id(localsRaw.target)) ? localsRaw.target : null,
    newBucket: byId.has(ao432Id(localsRaw.newBucket)) ? localsRaw.newBucket : null,
    predecessor: byId.has(ao432Id(localsRaw.predecessor)) ? localsRaw.predecessor : null,
    successor: byId.has(ao432Id(localsRaw.successor)) ? localsRaw.successor : null,
  };
  const mutationRaw = raw.mutation && typeof raw.mutation === "object" ? raw.mutation : {};
  const mutationKinds = new Set(["idle", "field-write", "pointer-write", "map-allocate", "map-write", "map-delete", "key-add", "key-remove"]);
  const mutation = {
    kind: mutationKinds.has(mutationRaw.kind) ? mutationRaw.kind : "idle",
    object: ao432Id(mutationRaw.object) || ao432CleanText(mutationRaw.object, "", 24) || null,
    field: ao432CleanText(mutationRaw.field, "", 24) || null,
    before: ao432Primitive(mutationRaw.before),
    after: ao432Primitive(mutationRaw.after),
    from: ao432Id(mutationRaw.from),
    to: ao432Id(mutationRaw.to),
  };

  const queryRaw = raw.query && typeof raw.query === "object" ? raw.query : {};
  const queryBucket = ao432Id(queryRaw.bucket);
  const query = {
    kind: queryRaw.kind === "max" || queryRaw.kind === "min" ? queryRaw.kind : null,
    empty: ao432Boolean(queryRaw.empty),
    bucket: queryBucket && byId.has(queryBucket) ? queryBucket : null,
    count: ao432Integer(queryRaw.count, 1, 24),
    candidates: ao432UniqueKeys(queryRaw.candidates),
    displayCandidates: ao432UniqueKeys(queryRaw.displayCandidates).sort(),
    chosen: queryRaw.chosen === "" ? "" : ao432Key(queryRaw.chosen),
  };

  const invariantsRaw = raw.invariants && typeof raw.invariants === "object" ? raw.invariants : {};
  const allowedIssues = new Set(["sentinels", "reciprocal-links", "count-order", "empty-linked-bucket", "duplicate-key", "map-bucket-mismatch"]);
  const invariants = {
    expectedStable: invariantsRaw.expectedStable === true,
    checked: invariantsRaw.checked === true,
    stable: ao432Boolean(invariantsRaw.stable),
    reciprocalLinks: ao432Boolean(invariantsRaw.reciprocalLinks),
    increasingCounts: ao432Boolean(invariantsRaw.increasingCounts),
    nonemptyBuckets: ao432Boolean(invariantsRaw.nonemptyBuckets),
    uniqueKeys: ao432Boolean(invariantsRaw.uniqueKeys),
    mapsAgree: ao432Boolean(invariantsRaw.mapsAgree),
    sentinelsValid: ao432Boolean(invariantsRaw.sentinelsValid),
    issues: Array.isArray(invariantsRaw.issues) ? invariantsRaw.issues.filter((issue) => allowedIssues.has(issue)).slice(0, 6) : [],
  };

  const countersRaw = raw.counters && typeof raw.counters === "object" ? raw.counters : {};
  const counters = {};
  AO432_COUNTERS.forEach(([key]) => {
    counters[key] = ao432Integer(countersRaw[key], 0, 100_000) ?? 0;
  });
  const locale = ao432Locale();
  return {
    source: { line: sourceLine, text: AO432_SOURCE[sourceLine - 1] },
    event,
    phase,
    timing,
    condition: {
      expression: ao432CleanText(conditionRaw.expression, "", 180),
      result: ao432Boolean(conditionRaw.result),
    },
    commands,
    operation,
    structure: { head, tail, order, buckets, constructing },
    maps: {
      keyCountAllocated: mapsRaw.keyCountAllocated === true,
      keyBucketAllocated: mapsRaw.keyBucketAllocated === true,
      keyCount,
      keyBucket,
    },
    locals,
    mutation,
    query,
    invariants,
    counters,
    final: raw.final === true || Boolean(step && step.final),
    title: ao432Localized(step && step.title, locale, AO432_TEXT[locale].fallbackTitle),
    note: ao432Localized(step && step.note, locale, ""),
  };
}

function ao432Display(value, copy) {
  if (value === null) return copy.none;
  if (value === "") return copy.emptyString;
  return String(value);
}

function ao432EventLabel(event, locale) {
  return AO432_EVENTS[event] ? AO432_EVENTS[event][locale] : event;
}

function ao432BucketLabel(id, state, copy) {
  if (!id) return copy.none;
  const bucket = state.structure.buckets.find((item) => item.id === id);
  return bucket ? bucket.label : id;
}

function ao432RenderRail(state, copy, locale) {
  const items = AO432_SOURCE.map((source, index) => {
    const line = index + 1;
    const current = line === state.source.line;
    const event = AO432_LINE_EVENTS[index];
    const sourceText = source || "↳";
    return `<li class="ao432-rail-item ${current ? "ao432-is-current" : ""} ${source ? "" : "ao432-is-separator"}"${current ? ' aria-current="step"' : ""}><small>L${line} · ${ao432Escape(ao432EventLabel(event, locale))}</small><code>${ao432Escape(sourceText)}</code></li>`;
  }).join("");
  return `<nav class="ao432-rail-wrap" aria-label="${ao432Escape(copy.eventRail)}"><ol class="ao432-event-rail" role="list">${items}</ol></nav>`;
}

function ao432RenderSource(state, copy, locale) {
  const eventLabel = ao432EventLabel(state.event, locale);
  const condition = state.condition.result === null
    ? copy.noCondition
    : `${state.condition.expression || copy.condition} → ${state.condition.result ? copy.trueValue : copy.falseValue}`;
  const conditionClass = state.condition.result === null ? "none" : state.condition.result ? "true" : "false";
  return `<section class="ao432-source-card" aria-labelledby="ao432-source-title"><div class="ao432-source-expression"><small id="ao432-source-title">${ao432Escape(copy.sourceAction)}</small><code>${ao432Escape(state.source.text || " ")}</code></div><dl class="ao432-source-facts"><div><dt>${ao432Escape(copy.phase)}</dt><dd>${ao432Escape(state.phase)}</dd></div><div><dt>${ao432Escape(copy.event)}</dt><dd>${ao432Escape(eventLabel)}</dd></div><div><dt>${ao432Escape(copy.condition)}</dt><dd class="ao432-condition-${conditionClass}">${ao432Escape(condition)}</dd></div></dl></section>`;
}

function ao432RenderOperations(state, copy) {
  const outputs = state.operation.outputs;
  const items = state.commands.map((command, index) => {
    const position = index + 1;
    const current = position === state.operation.index;
    const done = position <= outputs.length;
    const output = done ? ao432Display(outputs[index], copy) : copy.awaiting;
    const classes = [current ? "ao432-is-current" : "", done ? "ao432-is-done" : ""].filter(Boolean).join(" ");
    return `<li class="${classes}"${current ? ' aria-current="step"' : ""}><small>#${position}</small><code>${ao432Escape(command.raw)}</code><span>${ao432Escape(output)}</span></li>`;
  }).join("");
  return `<section class="ao432-card ao432-operations" aria-labelledby="ao432-operations-title"><header><div><h3 id="ao432-operations-title">${ao432Escape(copy.operations)}</h3><p>${ao432Escape(copy.operationsHelp)}</p></div><strong>${state.operation.index}/${state.operation.total}</strong></header><div class="ao432-operation-scroll" tabindex="0"><ol role="list">${items}</ol></div></section>`;
}

function ao432BucketRoles(bucket, state) {
  const roles = [];
  if (bucket.id === state.locals.bucket) roles.push("source");
  if (bucket.id === state.locals.target) roles.push("target");
  if (bucket.id === state.locals.newBucket) roles.push("new");
  if (bucket.id === state.locals.predecessor) roles.push("predecessor");
  if (bucket.id === state.locals.successor) roles.push("successor");
  if (bucket.id === state.query.bucket) roles.push("extreme");
  return roles;
}

function ao432RenderBucket(bucket, state, copy) {
  const roles = ao432BucketRoles(bucket, state);
  const classes = [
    "ao432-bucket",
    bucket.sentinel ? `ao432-sentinel-${bucket.sentinel}` : "ao432-real-bucket",
    bucket.linked ? "ao432-is-linked" : "ao432-is-detached",
    bucket.constructing ? "ao432-is-constructing" : "",
    ...roles.map((role) => `ao432-role-${role}`),
  ].filter(Boolean).join(" ");
  const sortedKeys = bucket.displayKeys.length
    ? bucket.displayKeys.map((key) => `<span>${ao432Escape(key)}</span>`).join("")
    : `<em>${ao432Escape(copy.empty)}</em>`;
  const insertionOrder = bucket.keys.length ? bucket.keys.join(" → ") : copy.empty;
  const stateLabel = bucket.constructing ? copy.constructing : bucket.linked ? copy.linked : copy.detached;
  const roleLabel = roles.length ? roles.join(", ") : stateLabel;
  const aria = `${bucket.label}, ${copy.count} ${ao432Display(bucket.count, copy)}, ${copy.dictOrder} ${insertionOrder}, ${roleLabel}`;
  return `<article class="${classes}" aria-label="${ao432Escape(aria)}"><header><div><small>${ao432Escape(stateLabel)}</small><strong>${ao432Escape(bucket.label)}</strong></div><span>${bucket.sentinel ? "S" : ao432Escape(bucket.count)}</span></header><div class="ao432-bucket-keys"><small>${ao432Escape(copy.keysSorted)}</small><div>${sortedKeys}</div><code>${ao432Escape(copy.dictOrder)}: ${ao432Escape(insertionOrder)}</code></div><dl><div><dt>${ao432Escape(copy.prev)}</dt><dd>${ao432Escape(ao432BucketLabel(bucket.prev, state, copy))}</dd></div><div><dt>${ao432Escape(copy.next)}</dt><dd>${ao432Escape(ao432BucketLabel(bucket.next, state, copy))}</dd></div></dl>${roles.length ? `<footer>${roles.map((role) => `<span>${ao432Escape(role)}</span>`).join("")}</footer>` : ""}</article>`;
}

function ao432RenderChain(state, copy) {
  const byId = new Map(state.structure.buckets.map((bucket) => [bucket.id, bucket]));
  const linked = state.structure.order.flatMap((id, index) => {
    const bucket = byId.get(id);
    if (!bucket) return [];
    const card = ao432RenderBucket(bucket, state, copy);
    if (index === state.structure.order.length - 1) return [card];
    const reciprocal = bucket.next === state.structure.order[index + 1]
      && byId.get(state.structure.order[index + 1])?.prev === id;
    const arrow = `<div class="ao432-chain-link ${reciprocal ? "ao432-is-reciprocal" : "ao432-is-broken"}" aria-label="${reciprocal ? "reciprocal" : "transient"}"><span>next →</span><span>← prev</span></div>`;
    return [card, arrow];
  }).join("");
  const detached = state.structure.buckets.filter((bucket) => !bucket.linked);
  const detachedHtml = detached.length
    ? detached.map((bucket) => ao432RenderBucket(bucket, state, copy)).join("")
    : `<div class="ao432-empty">${ao432Escape(copy.noDetached)}</div>`;
  return `<section class="ao432-card ao432-chain-card" aria-labelledby="ao432-chain-title"><header><div><h3 id="ao432-chain-title">${ao432Escape(copy.bucketChain)}</h3><p>${ao432Escape(copy.bucketHelp)}</p></div><strong>${state.structure.order.length}</strong></header><div class="ao432-chain-scroll" tabindex="0" role="region" aria-label="${ao432Escape(copy.bucketChain)}"><div class="ao432-chain">${linked || `<div class="ao432-empty">${ao432Escape(copy.awaiting)}</div>`}</div></div><details class="ao432-detached"${detached.some((bucket) => bucket.constructing) ? " open" : ""}><summary>${ao432Escape(copy.detachedTitle)} <span>${detached.length}</span></summary><div>${detachedHtml}</div></details></section>`;
}

function ao432RenderMaps(state, copy) {
  const countMap = new Map(state.maps.keyCount.map((entry) => [entry.key, entry.count]));
  const bucketMap = new Map(state.maps.keyBucket.map((entry) => [entry.key, entry]));
  const keys = [...new Set([...countMap.keys(), ...bucketMap.keys()])].sort();
  const rows = keys.length ? keys.map((key) => {
    const bucket = bucketMap.get(key);
    const current = key === state.operation.key;
    return `<tr class="${current ? "ao432-is-current-key" : ""}"><th scope="row">${ao432Escape(key)}</th><td>${ao432Escape(ao432Display(countMap.get(key) ?? null, copy))}</td><td><code>${ao432Escape(bucket ? ao432BucketLabel(bucket.bucket, state, copy) : copy.none)}</code></td><td class="ao432-map-${bucket && bucket.linked ? "linked" : "pending"}">${bucket && bucket.linked ? "✓" : "·"}</td></tr>`;
  }).join("") : `<tr><td colspan="4" class="ao432-empty-cell">${ao432Escape(copy.noKeys)}</td></tr>`;
  return `<section class="ao432-card ao432-maps-card" aria-labelledby="ao432-maps-title"><header><div><h3 id="ao432-maps-title">${ao432Escape(copy.maps)}</h3><p>${ao432Escape(copy.mapsHelp)}</p></div><span>${keys.length}</span></header><div class="ao432-table-scroll" tabindex="0"><table><thead><tr><th>${ao432Escape(copy.key)}</th><th>${ao432Escape(copy.keyCount)}</th><th>${ao432Escape(copy.keyBucket)}</th><th>${ao432Escape(copy.linked)}</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

function ao432RenderMutation(state, copy) {
  const mutation = state.mutation;
  const facts = [
    [copy.kind, mutation.kind],
    [copy.object, mutation.object],
    [copy.field, mutation.field],
    [copy.beforeValue, mutation.before],
    [copy.afterValue, mutation.after],
  ].map(([label, value]) => `<div><dt>${ao432Escape(label)}</dt><dd>${ao432Escape(ao432Display(value, copy))}</dd></div>`).join("");
  const locals = [
    [copy.key, state.locals.key],
    [copy.oldCount, state.locals.oldCount],
    [copy.bucket, ao432BucketLabel(state.locals.bucket, state, copy)],
    [copy.target, ao432BucketLabel(state.locals.target, state, copy)],
    [copy.newBucket, ao432BucketLabel(state.locals.newBucket, state, copy)],
    [copy.predecessor, ao432BucketLabel(state.locals.predecessor, state, copy)],
    [copy.successor, ao432BucketLabel(state.locals.successor, state, copy)],
  ].map(([label, value]) => `<li><small>${ao432Escape(label)}</small><strong>${ao432Escape(ao432Display(value, copy))}</strong></li>`).join("");
  return `<section class="ao432-card ao432-mutation-card" aria-labelledby="ao432-mutation-title"><header><div><h3 id="ao432-mutation-title">${ao432Escape(copy.mutation)}</h3><p>${ao432Escape(copy.mutationHelp)}</p></div><strong>${ao432Escape(mutation.kind)}</strong></header><dl class="ao432-mutation-facts">${facts}</dl><h4>${ao432Escape(copy.locals)}</h4><ul class="ao432-locals" role="list">${locals}</ul></section>`;
}

function ao432InvariantStatus(state, copy) {
  if (!state.invariants.checked) return { label: copy.pending, kind: "pending" };
  if (state.invariants.stable) return { label: copy.stable, kind: "stable" };
  if (!state.invariants.expectedStable) return { label: copy.transient, kind: "transient" };
  return { label: copy.violation, kind: "invalid" };
}

function ao432RenderInvariants(state, copy) {
  const status = ao432InvariantStatus(state, copy);
  const checks = [
    [copy.reciprocalLinks, state.invariants.reciprocalLinks],
    [copy.increasingCounts, state.invariants.increasingCounts],
    [copy.nonemptyBuckets, state.invariants.nonemptyBuckets],
    [copy.uniqueKeys, state.invariants.uniqueKeys],
    [copy.mapsAgree, state.invariants.mapsAgree],
    [copy.sentinelsValid, state.invariants.sentinelsValid],
  ].map(([label, value]) => `<li class="ao432-check-${value === true ? "yes" : value === false ? "no" : "pending"}"><span aria-hidden="true">${value === true ? "✓" : value === false ? "×" : "·"}</span><span>${ao432Escape(label)}</span><strong>${ao432Escape(value === null ? copy.pending : value ? copy.trueValue : copy.falseValue)}</strong></li>`).join("");
  const expectation = state.invariants.expectedStable ? copy.expectedStable : copy.expectedTransient;
  return `<section class="ao432-card ao432-invariants-card ao432-status-${status.kind}" aria-labelledby="ao432-invariants-title"><header><div><h3 id="ao432-invariants-title">${ao432Escape(copy.invariants)}</h3><p>${ao432Escape(copy.invariantsHelp)}</p></div><strong>${ao432Escape(status.label)}</strong></header><span class="ao432-expectation">${ao432Escape(expectation)}</span>${state.invariants.checked ? `<ul role="list">${checks}</ul>` : `<div class="ao432-empty">${ao432Escape(copy.notChecked)}</div>`}</section>`;
}

function ao432RenderQuery(state, copy) {
  const query = state.query;
  const candidates = query.displayCandidates.length
    ? query.displayCandidates.map((key) => `<li class="${key === query.chosen ? "ao432-is-chosen" : ""}">${ao432Escape(key)}</li>`).join("")
    : `<li class="ao432-empty">${ao432Escape(query.kind ? copy.empty : copy.noQuery)}</li>`;
  const facts = [
    [copy.queryKind, query.kind],
    [copy.candidateBucket, ao432BucketLabel(query.bucket, state, copy)],
    [copy.count, query.count],
    [copy.chosen, query.chosen],
  ].map(([label, value]) => `<div><dt>${ao432Escape(label)}</dt><dd>${ao432Escape(ao432Display(value, copy))}</dd></div>`).join("");
  return `<section class="ao432-card ao432-query-card" aria-labelledby="ao432-query-title"><header><div><h3 id="ao432-query-title">${ao432Escape(copy.query)}</h3><p>${ao432Escape(copy.queryHelp)}</p></div><strong>${query.kind ? query.kind.toUpperCase() : "—"}</strong></header><dl>${facts}</dl><h4>${ao432Escape(copy.candidates)}</h4><ul role="list">${candidates}</ul></section>`;
}

function ao432RenderOutputs(state, copy) {
  const items = state.commands.map((command, index) => {
    const complete = index < state.operation.outputs.length;
    const result = complete ? ao432Display(state.operation.outputs[index], copy) : copy.awaiting;
    return `<li class="${complete ? "ao432-is-done" : ""}"><small>#${index + 1}</small><code>${ao432Escape(command.op)}</code><strong>${ao432Escape(result)}</strong></li>`;
  }).join("");
  return `<section class="ao432-card ao432-outputs-card" aria-labelledby="ao432-outputs-title" aria-live="polite"><header><div><h3 id="ao432-outputs-title">${ao432Escape(copy.outputs)}</h3><p>${ao432Escape(copy.outputsHelp)}</p></div><strong>${state.operation.outputs.length}/${state.commands.length}</strong></header><ol role="list">${items}</ol></section>`;
}

function ao432RenderCounters(state, copy, locale) {
  const items = AO432_COUNTERS.map(([key, labels]) => `<li><small>${ao432Escape(labels[locale])}</small><strong>${state.counters[key]}</strong></li>`).join("");
  return `<section class="ao432-card ao432-counters" aria-labelledby="ao432-counters-title"><header><h3 id="ao432-counters-title">${ao432Escape(copy.counters)}</h3></header><ul role="list">${items}</ul></section>`;
}

function renderAllOne432View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = ao432Locale();
  const copy = AO432_TEXT[locale];
  const state = ao432Normalize(step);
  const eventLabel = ao432EventLabel(state.event, locale);
  const timingLabel = state.timing === "before" ? copy.before : copy.after;
  const summary = `${copy.region}. ${copy.line} ${state.source.line}. ${eventLabel}.`;
  const note = state.note
    ? `<aside class="ao432-note"><strong>${ao432Escape(copy.note)}</strong><p>${ao432Escape(state.note)}</p></aside>`
    : "";
  host.innerHTML = `<article class="ao432-viz ao432-phase-${state.phase} ${state.final ? "ao432-is-final" : ""}" role="region" aria-label="${ao432Escape(summary)}"><header class="ao432-header"><div><span>${ao432Escape(copy.kicker)}</span><h2>${ao432Escape(state.title)}</h2></div><div class="ao432-line-state"><strong>${ao432Escape(copy.line)} ${state.source.line}</strong><span class="ao432-timing-${state.timing}">${ao432Escape(timingLabel)}</span><em>${ao432Escape(eventLabel)}</em></div></header>${ao432RenderRail(state, copy, locale)}${ao432RenderSource(state, copy, locale)}${ao432RenderOperations(state, copy)}${ao432RenderChain(state, copy)}<div class="ao432-state-grid">${ao432RenderMaps(state, copy)}${ao432RenderMutation(state, copy)}</div><div class="ao432-analysis-grid">${ao432RenderInvariants(state, copy)}${ao432RenderQuery(state, copy)}</div>${ao432RenderOutputs(state, copy)}${ao432RenderCounters(state, copy, locale)}${note}</article>`;
}
