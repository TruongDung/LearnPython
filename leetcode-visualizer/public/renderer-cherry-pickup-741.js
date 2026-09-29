"use strict";

const CP741_MAX_DIMENSION = 5;
const CP741_MAX_SCORE = CP741_MAX_DIMENSION * CP741_MAX_DIMENSION;
const CP741_MAX_FRAMES = 2200;
const CP741_MAX_MEMO_ENTRIES = 216;
const CP741_SOURCE = Object.freeze([
  "class Solution:",
  "    def cherryPickup(self, grid):",
  "        n = len(grid)",
  "        from functools import lru_cache",
  "        @lru_cache(None)",
  "        def dp(r1, c1, c2):",
  "            r2 = r1 + c1 - c2",
  "            if (r1>=n or c1>=n or r2>=n or c2>=n",
  "                    or grid[r1][c1]==-1 or grid[r2][c2]==-1):",
  "                return float('-inf')",
  "            if r1==n-1 and c1==n-1:",
  "                return grid[r1][c1]",
  "            cherries = grid[r1][c1]",
  "            if c1 != c2: cherries += grid[r2][c2]",
  "            cherries += max(dp(r1,c1+1,c2+1), dp(r1+1,c1,c2+1),",
  "                            dp(r1,c1+1,c2),   dp(r1+1,c1,c2))",
  "            return cherries",
  "        return max(0, dp(0, 0, 0))",
]);
const CP741_LINE_EVENTS = Object.freeze([
  "bind-class", "bind-method", "set-dimension", "import-lru-cache",
  "bind-lru-cache-decorator", "bind-dp-helper", "derive-r2", "bounds-guard-false",
  "thorn-guard-false", "rejected-return", "destination-guard-false", "destination-return",
  "read-walker-a-cherry", "overlap-count-once", "select-first-strict-maximum",
  "candidate-rd-call", "dfs-return", "root-clamp-final",
]);
const CP741_LINE_ACTIONS = Object.freeze([
  ["Define Solution", "Định nghĩa Solution"],
  ["Define cherryPickup", "Định nghĩa cherryPickup"],
  ["Read board dimension", "Đọc kích thước bảng"],
  ["Import memoization", "Nhập bộ nhớ đệm"],
  ["Memoize every DFS state", "Ghi nhớ mọi trạng thái DFS"],
  ["Define the three-coordinate state", "Định nghĩa trạng thái ba tọa độ"],
  ["Derive walker B's row", "Suy ra hàng của người B"],
  ["Check coordinate bounds", "Kiểm tra giới hạn tọa độ"],
  ["Reject thorn cells", "Loại các ô gai"],
  ["Return unreachable", "Trả về không thể đến"],
  ["Check the destination", "Kiểm tra đích"],
  ["Return the destination cell", "Trả về ô đích"],
  ["Read walker A's gain", "Đọc điểm của người A"],
  ["Count overlap once", "Chỉ đếm ô trùng một lần"],
  ["Try RR then DR", "Thử RR rồi DR"],
  ["Try RD then DD", "Thử RD rồi DD"],
  ["Return the best suffix", "Trả về hậu tố tốt nhất"],
  ["Clamp and return the answer", "Kẹp và trả về đáp án"],
]);
const CP741_MOVES = Object.freeze([
  Object.freeze({ move: "RR", walkerA: "right", walkerB: "right", line: 15, delta: [0, 1, 1] }),
  Object.freeze({ move: "DR", walkerA: "down", walkerB: "right", line: 15, delta: [1, 0, 1] }),
  Object.freeze({ move: "RD", walkerA: "right", walkerB: "down", line: 16, delta: [0, 1, 0] }),
  Object.freeze({ move: "DD", walkerA: "down", walkerB: "down", line: 16, delta: [1, 0, 0] }),
]);
const CP741_PHASES = Object.freeze({
  setup: ["setup", "khởi tạo"],
  root: ["root call", "lời gọi gốc"],
  memo: ["memoization", "bộ nhớ đệm"],
  dfs: ["DFS entry", "vào DFS"],
  guard: ["guard checks", "kiểm tra guard"],
  "base-case": ["base case", "trường hợp cơ sở"],
  gain: ["collect current gain", "thu điểm hiện tại"],
  transition: ["evaluate successors", "đánh giá trạng thái kế"],
  return: ["return suffix score", "trả điểm hậu tố"],
  done: ["complete", "hoàn tất"],
});
const CP741_EVENTS = Object.freeze({
  "bind-class": ["Bind Solution class", "Liên kết lớp Solution"],
  "bind-method": ["Bind cherryPickup method", "Liên kết phương thức cherryPickup"],
  "set-dimension": ["Set board dimension", "Đặt kích thước bảng"],
  "import-lru-cache": ["Import lru_cache", "Nhập lru_cache"],
  "bind-lru-cache-decorator": ["Bind memo decorator", "Liên kết decorator ghi nhớ"],
  "bind-dp-helper": ["Bind dp helper", "Liên kết helper dp"],
  "root-dfs-call": ["Call root state", "Gọi trạng thái gốc"],
  "root-dfs-result": ["Receive root result", "Nhận kết quả gốc"],
  "root-clamp-final": ["Clamp and verify final result", "Kẹp và xác minh kết quả cuối"],
  "lru-cache-hit": ["Memo cache hit", "Tìm thấy trong memo"],
  "lru-cache-miss": ["Memo cache miss", "Chưa có trong memo"],
  "dfs-enter": ["Enter DFS helper", "Vào helper DFS"],
  "derive-r2": ["Derive r2", "Suy ra r2"],
  "bounds-guard-true": ["Bounds guard rejects", "Guard biên loại trạng thái"],
  "bounds-guard-false": ["Bounds guard accepts", "Guard biên chấp nhận"],
  "thorn-guard-true": ["Thorn guard rejects", "Guard gai loại trạng thái"],
  "thorn-guard-false": ["Thorn guard accepts", "Guard gai chấp nhận"],
  "rejected-return": ["Return unreachable state", "Trả trạng thái không thể đến"],
  "destination-guard-true": ["Destination reached", "Đã đến đích"],
  "destination-guard-false": ["Continue below destination", "Tiếp tục vì chưa đến đích"],
  "destination-return": ["Return destination value", "Trả giá trị tại đích"],
  "read-walker-a-cherry": ["Read walker A cell", "Đọc ô của người A"],
  "distinct-cells-add-walker-b": ["Add walker B cell", "Cộng ô của người B"],
  "overlap-count-once": ["Count shared cell once", "Chỉ đếm ô chung một lần"],
  "candidate-rr-call": ["Call RR candidate", "Gọi ứng viên RR"],
  "candidate-rr-result": ["Receive RR candidate", "Nhận kết quả RR"],
  "candidate-dr-call": ["Call DR candidate", "Gọi ứng viên DR"],
  "candidate-dr-result": ["Receive DR candidate", "Nhận kết quả DR"],
  "candidate-rd-call": ["Call RD candidate", "Gọi ứng viên RD"],
  "candidate-rd-result": ["Receive RD candidate", "Nhận kết quả RD"],
  "candidate-dd-call": ["Call DD candidate", "Gọi ứng viên DD"],
  "candidate-dd-result": ["Receive DD candidate", "Nhận kết quả DD"],
  "select-first-strict-maximum": ["Select first strict maximum", "Chọn cực đại nghiêm ngặt đầu tiên"],
  "dfs-return": ["Return DFS score", "Trả điểm DFS"],
  "memo-write-unreachable": ["Memoize unreachable state", "Ghi trạng thái không thể đến"],
  "memo-write-destination": ["Memoize destination", "Ghi nhớ trạng thái đích"],
  "memo-choice-write": ["Memoize score and successor", "Ghi điểm và trạng thái kế"],
});
const CP741_FRAME_STATUSES = Object.freeze([
  "entered", "derived-r2", "rejected", "destination", "read-walker-a",
  "checked-overlap", "selected-first-maximum", "returning",
]);
const CP741_COUNTERS = Object.freeze([
  ["frames", "Frames", "Frame"],
  ["dfsCalls", "DFS calls", "Lời gọi DFS"],
  ["rootCalls", "Root calls", "Lời gọi gốc"],
  ["rootResults", "Root results", "Kết quả gốc"],
  ["cacheHits", "Cache hits", "Lần trúng cache"],
  ["cacheMisses", "Cache misses", "Lần trượt cache"],
  ["helperExecutions", "Helper executions", "Lần chạy helper"],
  ["boundsGuardChecks", "Bounds checks", "Lần kiểm tra biên"],
  ["thornGuardChecks", "Thorn checks", "Lần kiểm tra gai"],
  ["rejectedReturns", "Rejected returns", "Lần trả bị loại"],
  ["destinationChecks", "Destination checks", "Lần kiểm tra đích"],
  ["destinationReturns", "Destination returns", "Lần trả tại đích"],
  ["cherryReads", "Cell reads", "Lần đọc ô"],
  ["overlapChecks", "Overlap checks", "Lần kiểm tra trùng"],
  ["candidateCalls", "Candidate calls", "Lời gọi ứng viên"],
  ["candidateResults", "Candidate results", "Kết quả ứng viên"],
  ["strictMaximumUpdates", "Strict-max updates", "Lần cập nhật cực đại"],
  ["tiesKeptFirst", "Ties kept first", "Hòa giữ ứng viên trước"],
  ["lowerScoresRejected", "Lower scores rejected", "Điểm thấp bị loại"],
  ["unreachableCandidates", "Unreachable candidates", "Ứng viên không thể đến"],
  ["memoWrites", "Memo writes", "Lần ghi memo"],
  ["choiceWrites", "Choice writes", "Lần ghi lựa chọn"],
  ["successorWrites", "Successor writes", "Lần ghi trạng thái kế"],
  ["dfsReturns", "DFS returns", "Lần DFS trả về"],
  ["maxCallDepth", "Maximum call depth", "Độ sâu gọi lớn nhất"],
]);
const CP741_INVARIANTS = Object.freeze([
  ["sourceEventHasSingletonLine", "Every event has one canonical source line", "Mỗi sự kiện có đúng một dòng nguồn chuẩn"],
  ["boardIsNonemptySquare", "The board is a nonempty square", "Bảng là ma trận vuông không rỗng"],
  ["boardDomainIsMinusOneZeroOne", "Every cell is −1, 0, or 1", "Mỗi ô là −1, 0 hoặc 1"],
  ["synchronizedTime", "Both walkers share the same time r+c", "Hai người có cùng thời điểm r+c"],
  ["callDepthWithinPathBound", "Call depth stays within the path bound", "Độ sâu gọi nằm trong giới hạn đường đi"],
  ["memoStatusesExplicit", "Memo entries use explicit finite statuses", "Mục memo dùng trạng thái hữu hạn rõ ràng"],
  ["successorMapCoversReachableMemo", "Every reachable memo state has a successor record", "Mỗi trạng thái memo đến được có bản ghi kế tiếp"],
  ["tieOrderIsDeterministic", "Tie order is RR > DR > RD > DD", "Thứ tự phá hòa là RR > DR > RD > DD"],
  ["framesWithinLimit", "Frame count stays within the limit", "Số frame nằm trong giới hạn"],
  ["reachableZeroIsDistinct", "Reachable zero stays distinct from unreachable zero", "Đường đi điểm 0 khác với không thể đến"],
  ["answerMatchesRootClamp", "Answer matches the root clamp", "Đáp án khớp phép kẹp ở gốc"],
  ["witnessAssertionsHold", "Witness assertions hold", "Các khẳng định witness đều đúng"],
  ["finalHasWitness", "The final frame contains a witness", "Frame cuối chứa witness"],
]);
const CP741_WITNESS_ASSERTIONS = Object.freeze([
  "emptyPaths", "reachableIsFalse", "answerIsZero", "rawScoreIsNull",
  "pathLengthsAreTwoNMinusOne", "pathAIsLegalRightDown", "pathBIsLegalRightDown",
  "legalSynchronizedPaths", "legalReverseReturnPath", "endpointsMatch", "noThorns",
  "synchronizedScoreMatchesRawAndAnswer", "originalScoreMatchesRawAndAnswer",
  "uniqueCherryCellsMatchScore",
]);
const CP741_TEXT = Object.freeze({
  en: Object.freeze({
    region: "LeetCode 741 Cherry Pickup execution visualization",
    kicker: "LEETCODE 741 · 3D MEMOIZED DFS",
    fallback: "Cherry Pickup",
    line: "LINE",
    before: "before execution",
    after: "after execution",
    during: "during expression",
    rail: "Canonical 18-line source and event rail",
    sourceAction: "Current canonical source action",
    phase: "Phase",
    event: "Runtime event",
    condition: "Condition",
    noCondition: "No condition on this frame.",
    yes: "TRUE",
    no: "FALSE",
    pending: "pending",
    unavailable: "unavailable",
    notEvaluated: "not evaluated",
    board: "Synchronized board",
    boardHelp: "Both walkers occupy antidiagonal t = r + c. Their two right/down paths encode the outbound and return trips.",
    boardCaption: "Cherry Pickup board with synchronized walker and path roles",
    dimension: "dimension",
    time: "time / antidiagonal",
    state: "state (r1, c1, c2)",
    derived: "derived r2",
    synchronized: "synchronized",
    notSynchronized: "not synchronized",
    thorn: "thorn",
    open: "open",
    cherry: "cherry",
    walkerA: "walker A",
    walkerB: "walker B",
    overlap: "A/B overlap",
    currentDiagonal: "current antidiagonal",
    pathA: "A / outbound path",
    pathB: "B / reversed return path",
    row: "row",
    column: "column",
    gain: "Current gain and overlap",
    gainHelp: "Count A's cell, then count B's cell only when the synchronized positions differ.",
    cellA: "A cell",
    cellB: "B cell",
    valueA: "A value",
    valueB: "B value",
    sameCell: "same cell",
    countedOnce: "counted once",
    localGain: "local gain",
    suffixBest: "best suffix",
    combined: "combined score",
    stack: "DFS call stack",
    stackHelp: "The last row is the active helper frame; cache hits never push a frame.",
    stackEmpty: "No helper frame is active.",
    depth: "depth",
    origin: "origin",
    status: "status",
    memo: "Explicit memo table",
    memoHelp: "Each key stores either reachable with a finite score, or unreachable with a null score.",
    memoEmpty: "No memo entry has been written.",
    entries: "entries",
    reachableEntries: "reachable",
    unreachableEntries: "unreachable",
    currentMemo: "current state",
    key: "state key",
    score: "score",
    successors: "Chosen successor sidecar",
    successorHelp: "Reachable nonterminal states store one deterministic move; the destination stores a terminal null successor.",
    successorEmpty: "No reachable successor record has been written.",
    move: "move",
    target: "target state",
    terminal: "destination / terminal",
    candidates: "Four recursive candidates",
    candidatesHelp: "Evaluate exactly RR, DR, RD, DD. Replace the choice only for a strict increase; an equal score keeps the first move.",
    candidateOrder: "fixed order",
    directions: "walker directions",
    targetTime: "target time",
    selected: "chosen strict maximum",
    notSelected: "not chosen",
    choice: "Current deterministic choice",
    noChoice: "No reachable candidate has established a maximum yet.",
    policy: "first strict maximum in RR > DR > RD > DD order",
    reasonUnavailable: "This candidate is not available on the current frame.",
    reasonPending: "The recursive call has not been evaluated yet.",
    reasonCalling: "The recursive call is currently in progress.",
    reasonUnreachable: "The candidate is unreachable and cannot become the maximum.",
    reasonFirst: "This is the first reachable candidate, so it establishes the maximum.",
    reasonGreater: "Its score is strictly greater than the earlier maximum, so it replaces the choice.",
    reasonTie: "Its score ties the maximum, so the earlier move remains chosen.",
    reasonLower: "Its score is below the current maximum, so the choice does not change.",
    witness: "Verified route witness",
    witnessHelp: "Walker A is the outbound trip. Reversing walker B produces the original destination-to-start return trip.",
    witnessPending: "The witness is constructed only after the root DFS score is fixed.",
    outbound: "Outbound timeline · walker A",
    returnTrip: "Return timeline · reversed walker B",
    synchronizedTimeline: "Synchronized two-walker timeline",
    tripStep: "trip step",
    originalTime: "DFS time",
    uniqueCherries: "Unique cherry cells",
    noCherries: "The verified route visits no cherry cell.",
    perTimeGain: "gain",
    scoreEquivalence: "Score equivalence",
    rawScore: "raw root score",
    synchronizedScore: "synchronized score",
    recomputed: "recomputed",
    outAndBackScore: "deduplicated out-and-back score",
    answer: "clamped answer",
    equivalent: "equivalent",
    mismatch: "mismatch",
    witnessAssertions: "Witness assertions",
    unreachableWitness: "The root is unreachable. Both route timelines are explicitly empty and the answer is clamped to zero.",
    result: "Reachability and result",
    resultPending: "The root result has not been returned yet.",
    reachableResult: "A valid start-to-destination route exists.",
    reachableZero: "A valid route exists but contains zero unique cherries; this is not an unreachable result.",
    unreachableResult: "No valid route reaches the destination; zero comes from the root clamp.",
    rawStatus: "raw root status",
    invariants: "Trace invariants",
    invariantDefinition: "dp(r1,c1,c2) is the best synchronized suffix score, with r2 = r1 + c1 − c2.",
    holds: "holds",
    failed: "failed",
    notApplicable: "not applicable yet",
    counters: "Operation counters",
    note: "Why this frame matters",
    right: "right",
    down: "down",
    root: "root",
    candidate: "candidate",
    notCached: "not cached",
    notApplicableMemo: "not applicable",
  }),
  vi: Object.freeze({
    region: "Minh họa thực thi Cherry Pickup LeetCode 741",
    kicker: "LEETCODE 741 · DFS 3D CÓ GHI NHỚ",
    fallback: "Nhặt anh đào",
    line: "DÒNG",
    before: "trước khi chạy",
    after: "sau khi chạy",
    during: "trong khi tính biểu thức",
    rail: "Thanh nguồn và sự kiện 18 dòng chuẩn",
    sourceAction: "Thao tác nguồn chuẩn hiện tại",
    phase: "Giai đoạn",
    event: "Sự kiện runtime",
    condition: "Điều kiện",
    noCondition: "Frame này không có điều kiện.",
    yes: "ĐÚNG",
    no: "SAI",
    pending: "đang chờ",
    unavailable: "không có",
    notEvaluated: "chưa đánh giá",
    board: "Bảng di chuyển đồng bộ",
    boardHelp: "Hai người cùng nằm trên đường chéo phụ t = r + c. Hai đường phải/xuống mã hóa lượt đi và lượt về.",
    boardCaption: "Bảng Cherry Pickup với vai trò người đi và đường đi đồng bộ",
    dimension: "kích thước",
    time: "thời điểm / đường chéo phụ",
    state: "trạng thái (r1, c1, c2)",
    derived: "r2 được suy ra",
    synchronized: "đồng bộ",
    notSynchronized: "không đồng bộ",
    thorn: "gai",
    open: "ô trống",
    cherry: "anh đào",
    walkerA: "người A",
    walkerB: "người B",
    overlap: "A/B trùng ô",
    currentDiagonal: "đường chéo phụ hiện tại",
    pathA: "đường A / lượt đi",
    pathB: "đường B / lượt về đảo chiều",
    row: "hàng",
    column: "cột",
    gain: "Điểm hiện tại và ô trùng",
    gainHelp: "Đếm ô của A, rồi chỉ đếm ô của B khi hai vị trí đồng bộ khác nhau.",
    cellA: "ô A",
    cellB: "ô B",
    valueA: "giá trị A",
    valueB: "giá trị B",
    sameCell: "cùng ô",
    countedOnce: "chỉ đếm một lần",
    localGain: "điểm cục bộ",
    suffixBest: "hậu tố tốt nhất",
    combined: "điểm kết hợp",
    stack: "Ngăn xếp gọi DFS",
    stackHelp: "Hàng cuối là frame helper đang chạy; cache hit không đẩy thêm frame.",
    stackEmpty: "Không có frame helper đang hoạt động.",
    depth: "độ sâu",
    origin: "nguồn gọi",
    status: "trạng thái",
    memo: "Bảng memo có trạng thái rõ ràng",
    memoHelp: "Mỗi khóa lưu reachable với điểm hữu hạn, hoặc unreachable với điểm null.",
    memoEmpty: "Chưa ghi mục memo nào.",
    entries: "số mục",
    reachableEntries: "đến được",
    unreachableEntries: "không thể đến",
    currentMemo: "trạng thái hiện tại",
    key: "khóa trạng thái",
    score: "điểm",
    successors: "Sidecar trạng thái kế đã chọn",
    successorHelp: "Trạng thái đến được và chưa kết thúc lưu một bước xác định; đích lưu bước kế null.",
    successorEmpty: "Chưa ghi trạng thái kế đến được nào.",
    move: "bước đi",
    target: "trạng thái đích",
    terminal: "đích / kết thúc",
    candidates: "Bốn ứng viên đệ quy",
    candidatesHelp: "Đánh giá đúng RR, DR, RD, DD. Chỉ đổi lựa chọn khi tăng nghiêm ngặt; điểm hòa giữ bước đầu tiên.",
    candidateOrder: "thứ tự cố định",
    directions: "hướng của hai người",
    targetTime: "thời điểm đích",
    selected: "cực đại nghiêm ngặt đã chọn",
    notSelected: "không được chọn",
    choice: "Lựa chọn xác định hiện tại",
    noChoice: "Chưa có ứng viên đến được để thiết lập cực đại.",
    policy: "cực đại nghiêm ngặt đầu tiên theo RR > DR > RD > DD",
    reasonUnavailable: "Ứng viên này không có trong frame hiện tại.",
    reasonPending: "Lời gọi đệ quy chưa được đánh giá.",
    reasonCalling: "Lời gọi đệ quy đang chạy.",
    reasonUnreachable: "Ứng viên không thể đến nên không thể trở thành cực đại.",
    reasonFirst: "Đây là ứng viên đến được đầu tiên nên thiết lập cực đại.",
    reasonGreater: "Điểm lớn hơn nghiêm ngặt cực đại trước đó nên thay thế lựa chọn.",
    reasonTie: "Điểm hòa với cực đại nên giữ bước xuất hiện trước.",
    reasonLower: "Điểm thấp hơn cực đại hiện tại nên lựa chọn không đổi.",
    witness: "Witness đường đi đã xác minh",
    witnessHelp: "Người A là lượt đi. Đảo ngược đường của người B tạo lượt về từ đích đến điểm đầu.",
    witnessPending: "Witness chỉ được dựng sau khi điểm DFS gốc đã cố định.",
    outbound: "Timeline lượt đi · người A",
    returnTrip: "Timeline lượt về · đảo ngược người B",
    synchronizedTimeline: "Timeline hai người đồng bộ",
    tripStep: "bước hành trình",
    originalTime: "thời điểm DFS",
    uniqueCherries: "Các ô anh đào duy nhất",
    noCherries: "Đường đã xác minh không đi qua ô anh đào nào.",
    perTimeGain: "điểm",
    scoreEquivalence: "Tương đương điểm số",
    rawScore: "điểm gốc chưa kẹp",
    synchronizedScore: "điểm đồng bộ",
    recomputed: "tính lại",
    outAndBackScore: "điểm đi-về đã loại trùng",
    answer: "đáp án đã kẹp",
    equivalent: "tương đương",
    mismatch: "không khớp",
    witnessAssertions: "Các khẳng định witness",
    unreachableWitness: "Gốc không thể đến. Hai timeline đường đi rỗng rõ ràng và đáp án được kẹp về 0.",
    result: "Khả năng đến đích và kết quả",
    resultPending: "Kết quả gốc chưa được trả về.",
    reachableResult: "Tồn tại đường hợp lệ từ điểm đầu đến đích.",
    reachableZero: "Tồn tại đường hợp lệ nhưng có 0 ô anh đào duy nhất; đây không phải kết quả không thể đến.",
    unreachableResult: "Không có đường hợp lệ đến đích; số 0 đến từ phép kẹp ở gốc.",
    rawStatus: "trạng thái gốc thô",
    invariants: "Bất biến trace",
    invariantDefinition: "dp(r1,c1,c2) là điểm hậu tố đồng bộ tốt nhất, với r2 = r1 + c1 − c2.",
    holds: "đúng",
    failed: "sai",
    notApplicable: "chưa áp dụng",
    counters: "Bộ đếm thao tác",
    note: "Ý nghĩa của frame này",
    right: "phải",
    down: "xuống",
    root: "gốc",
    candidate: "ứng viên",
    notCached: "chưa có trong memo",
    notApplicableMemo: "không áp dụng",
  }),
});

function cp741Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function cp741Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}
function cp741Object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function cp741Int(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}
function cp741Score(value) {
  return cp741Int(value, 0, CP741_MAX_SCORE);
}
function cp741Boolean(value) {
  return typeof value === "boolean" ? value : null;
}
function cp741Text(value, maximum, fallback = "") {
  return typeof value === "string" ? value.slice(0, maximum) : fallback;
}
function cp741Localized(value, locale, fallback = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return cp741Text(value[locale] ?? value.en ?? value.vi, 500, fallback);
  }
  return cp741Text(value, 500, fallback);
}
function cp741StateTuple(value, n) {
  if (!Array.isArray(value) || value.length < 3) return null;
  const state = value.slice(0, 3).map((item) => cp741Int(item, 0, n));
  return state.every((item) => item !== null) ? state : null;
}
function cp741CellTuple(value, n) {
  if (!Array.isArray(value) || value.length < 2) return null;
  const row = cp741Int(value[0], 0, n - 1);
  const column = cp741Int(value[1], 0, n - 1);
  return row === null || column === null ? null : [row, column];
}
function cp741CoordinateLabel(value) {
  return value ? `(${value[0]}, ${value[1]})` : "—";
}
function cp741StateLabel(value) {
  return value ? `(${value[0]}, ${value[1]}, ${value[2]})` : "—";
}
function cp741StateKey(value) {
  return value ? `${value[0]},${value[1]},${value[2]}` : "";
}
function cp741ParseStateKey(value, n) {
  if (typeof value !== "string" || value.length > 32) return null;
  const parts = value.split(",");
  if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part))) return null;
  const state = parts.map((part) => cp741Int(Number(part), 0, n));
  return state.every((item) => item !== null) ? { key: cp741StateKey(state), state } : null;
}
function cp741SortStates(left, right) {
  const leftTime = left.state[0] + left.state[1];
  const rightTime = right.state[0] + right.state[1];
  return leftTime - rightTime
    || left.state[0] - right.state[0]
    || left.state[1] - right.state[1]
    || left.state[2] - right.state[2];
}
function cp741Path(value, n) {
  if (!Array.isArray(value)) return [];
  const maximum = 2 * n - 1;
  return value.slice(0, maximum).map((cell) => cp741CellTuple(cell, n)).filter(Boolean);
}
function cp741UniqueCells(paths) {
  const seen = new Set();
  const unique = [];
  paths.forEach((path) => path.forEach((cell) => {
    const key = `${cell[0]},${cell[1]}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push([...cell]);
    }
  }));
  return unique;
}
function cp741NormalizeMemo(rawMemo, n, currentState) {
  const memo = cp741Object(rawMemo);
  const source = cp741Object(memo.entries);
  const entries = [];
  for (const rawKey of Object.keys(source)) {
    if (entries.length >= CP741_MAX_MEMO_ENTRIES) break;
    const parsed = cp741ParseStateKey(rawKey, n);
    const encoded = source[rawKey];
    if (!parsed || !Array.isArray(encoded) || encoded.length < 2) continue;
    if (encoded[0] === "reachable") {
      const score = cp741Score(encoded[1]);
      if (score === null) continue;
      entries.push({ ...parsed, status: "reachable", score });
    } else if (encoded[0] === "unreachable" && encoded[1] === null) {
      entries.push({ ...parsed, status: "unreachable", score: null });
    }
  }
  entries.sort(cp741SortStates);
  const currentKey = cp741StateKey(currentState);
  const currentEntry = entries.find((entry) => entry.key === currentKey) || null;
  return {
    entries,
    size: entries.length,
    reachable: entries.filter((entry) => entry.status === "reachable").length,
    unreachable: entries.filter((entry) => entry.status === "unreachable").length,
    current: currentEntry ? currentEntry.status : currentState ? "not-cached" : "not-applicable",
    currentKey,
  };
}
function cp741NormalizeSuccessors(raw, n, memo) {
  const source = cp741Object(raw);
  const reachable = new Set(memo.entries.filter((entry) => entry.status === "reachable").map((entry) => entry.key));
  const successors = [];
  for (const rawKey of Object.keys(source)) {
    if (successors.length >= CP741_MAX_MEMO_ENTRIES) break;
    const parsed = cp741ParseStateKey(rawKey, n);
    const encoded = source[rawKey];
    if (!parsed || !reachable.has(parsed.key) || !Array.isArray(encoded) || encoded.length < 2) continue;
    if (encoded[0] === null && encoded[1] === null) {
      successors.push({ ...parsed, move: null, target: null, terminal: true });
      continue;
    }
    if (!CP741_MOVES.some((move) => move.move === encoded[0])) continue;
    const target = cp741StateTuple(encoded[1], n);
    if (!target) continue;
    successors.push({ ...parsed, move: encoded[0], target, terminal: false });
  }
  successors.sort(cp741SortStates);
  return successors;
}
function cp741CandidateReasonKey(candidate, bestBefore, chosenBefore) {
  if (candidate.status === "unavailable") return "reasonUnavailable";
  if (candidate.status === "pending") return "reasonPending";
  if (candidate.status === "calling") return "reasonCalling";
  if (candidate.status === "unreachable") return "reasonUnreachable";
  if (bestBefore === null) return "reasonFirst";
  if (candidate.score > bestBefore) return "reasonGreater";
  if (candidate.score === bestBefore && chosenBefore) return "reasonTie";
  return "reasonLower";
}
function cp741NormalizeCandidates(rawCandidates, currentState, n) {
  const source = Array.isArray(rawCandidates) ? rawCandidates.slice(0, 16) : [];
  const candidates = CP741_MOVES.map((metadata, order) => {
    const raw = cp741Object(source.find((candidate) => candidate && candidate.move === metadata.move));
    const fallbackTarget = currentState ? [
      currentState[0] + metadata.delta[0],
      currentState[1] + metadata.delta[1],
      currentState[2] + metadata.delta[2],
    ] : null;
    const targetState = cp741StateTuple(raw.targetState, n) || cp741StateTuple(fallbackTarget, n);
    const rawStatus = ["pending", "calling", "reachable", "unreachable"].includes(raw.status)
      ? raw.status
      : "unavailable";
    const score = rawStatus === "reachable" ? cp741Score(raw.score) : null;
    const status = rawStatus === "reachable" && score === null ? "unavailable" : rawStatus;
    return {
      order,
      move: metadata.move,
      walkerA: metadata.walkerA,
      walkerB: metadata.walkerB,
      sourceLine: metadata.line,
      targetState,
      targetTime: targetState ? targetState[0] + targetState[1] : null,
      status,
      score,
      becameStrictMaximum: false,
      reasonKey: "reasonUnavailable",
      payloadReason: cp741Text(raw.reason, 240, ""),
    };
  });
  let bestScore = null;
  let chosen = null;
  candidates.forEach((candidate) => {
    const bestBefore = bestScore;
    const chosenBefore = chosen;
    candidate.reasonKey = cp741CandidateReasonKey(candidate, bestBefore, chosenBefore);
    if (candidate.status === "reachable" && (bestScore === null || candidate.score > bestScore)) {
      candidate.becameStrictMaximum = true;
      bestScore = candidate.score;
      chosen = candidate;
    }
  });
  return {
    candidates,
    bestScore,
    chosen: chosen ? {
      order: chosen.order,
      move: chosen.move,
      targetState: chosen.targetState ? [...chosen.targetState] : null,
      score: chosen.score,
      policy: "first strict maximum in RR > DR > RD > DD order",
    } : null,
  };
}
function cp741NormalizeStack(rawStack, n) {
  if (!Array.isArray(rawStack)) return [];
  return rawStack.slice(0, 2 * n).map((item, index) => {
    const raw = cp741Object(item);
    const state = cp741StateTuple(raw.state, n);
    if (!state) return null;
    const originRaw = cp741Object(raw.origin);
    const originType = originRaw.type === "candidate" ? "candidate" : "root";
    const move = CP741_MOVES.some((candidate) => candidate.move === originRaw.move) ? originRaw.move : null;
    return {
      depth: cp741Int(raw.depth, 0, 2 * n - 1) ?? index,
      key: cp741StateKey(state),
      state,
      time: state[0] + state[1],
      r2: cp741Int(raw.r2, -n, 2 * n),
      status: CP741_FRAME_STATUSES.includes(raw.status) ? raw.status : "entered",
      origin: {
        type: originType,
        move: originType === "candidate" ? move : null,
        sourceLine: cp741Int(originRaw.sourceLine, 1, CP741_SOURCE.length),
        parentState: cp741StateTuple(originRaw.parentState, n),
      },
    };
  }).filter(Boolean);
}
function cp741NormalizeWitness(rawWitness, board) {
  const raw = cp741Object(rawWitness);
  if (typeof raw.reachable !== "boolean") return null;
  const n = board.length;
  const assertionRaw = cp741Object(raw.assertions);
  const assertions = {};
  CP741_WITNESS_ASSERTIONS.forEach((key) => { assertions[key] = cp741Boolean(assertionRaw[key]); });
  if (!raw.reachable) {
    return {
      reachable: false,
      rawScore: null,
      answer: 0,
      pathA: [],
      pathB: [],
      outbound: [],
      returnPath: [],
      perTime: [],
      uniqueVisitedCells: [],
      uniqueVisitedCherryCells: [],
      synchronizedScore: null,
      originalOutAndBackDeduplicatedScore: null,
      computedSynchronizedScore: null,
      computedTripScore: null,
      assertions,
    };
  }
  const pathA = cp741Path(raw.pathA, n);
  const pathB = cp741Path(raw.pathB, n);
  const outboundRaw = cp741Path(raw.outbound, n);
  const returnRaw = cp741Path(raw.returnPath, n);
  const outbound = outboundRaw.length ? outboundRaw : pathA.map((cell) => [...cell]);
  const returnPath = returnRaw.length ? returnRaw : [...pathB].reverse().map((cell) => [...cell]);
  const synchronizedLength = Math.min(pathA.length, pathB.length, 2 * n - 1);
  const perTime = Array.from({ length: synchronizedLength }, (_, time) => {
    const a = pathA[time];
    const b = pathB[time];
    const overlap = a[0] === b[0] && a[1] === b[1];
    const walkerA = board[a[0]][a[1]];
    const walkerB = board[b[0]][b[1]];
    return { time, a: [...a], b: [...b], overlap, walkerA, walkerB, gain: walkerA + (overlap ? 0 : walkerB) };
  });
  const uniqueVisitedCells = cp741UniqueCells([pathA, pathB]);
  const uniqueVisitedCherryCells = uniqueVisitedCells.filter(([row, column]) => board[row][column] === 1);
  const computedSynchronizedScore = perTime.length
    ? perTime.reduce((sum, item) => sum + item.gain, 0)
    : null;
  const computedTripScore = outbound.length || returnPath.length
    ? cp741UniqueCells([outbound, returnPath]).filter(([row, column]) => board[row][column] === 1).length
    : null;
  return {
    reachable: true,
    rawScore: cp741Score(raw.rawScore),
    answer: cp741Score(raw.answer),
    pathA,
    pathB,
    outbound,
    returnPath,
    perTime,
    uniqueVisitedCells,
    uniqueVisitedCherryCells,
    synchronizedScore: cp741Score(raw.synchronizedScore),
    originalOutAndBackDeduplicatedScore: cp741Score(raw.originalOutAndBackDeduplicatedScore),
    computedSynchronizedScore,
    computedTripScore,
    assertions,
  };
}
function cp741Normalize(step) {
  const raw = step ? cp741Object(step.cherryPickup741View) : {};
  const rawBoard = Array.isArray(raw.board) ? raw.board.slice(0, CP741_MAX_DIMENSION) : [];
  const n = Math.max(1, rawBoard.length);
  const board = Array.from({ length: n }, (_, row) => Array.from({ length: n }, (_, column) => {
    const value = Array.isArray(rawBoard[row]) ? rawBoard[row][column] : null;
    return value === -1 || value === 0 || value === 1 ? value : 0;
  }));
  const sourceRaw = cp741Object(raw.source);
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = cp741Int(sourceRaw.line, 1, CP741_SOURCE.length)
    ?? cp741Int(fallbackLine, 1, CP741_SOURCE.length)
    ?? 1;
  const event = Object.prototype.hasOwnProperty.call(CP741_EVENTS, raw.event)
    ? raw.event
    : CP741_LINE_EVENTS[line - 1];
  const phase = Object.prototype.hasOwnProperty.call(CP741_PHASES, raw.phase) ? raw.phase : "setup";
  const timing = ["before", "after", "during"].includes(raw.timing) ? raw.timing : "after";
  const conditionRaw = cp741Object(raw.condition);
  const conditionNumber = cp741Int(conditionRaw.result, -1000000, 1000000);
  const conditionResult = typeof conditionRaw.result === "boolean" ? conditionRaw.result : conditionNumber;
  const currentState = cp741StateTuple(raw.currentState, n);
  const currentTime = currentState
    ? currentState[0] + currentState[1]
    : cp741Int(raw.currentTime, 0, 2 * n - 2);
  const derivedR2 = currentState ? currentState[0] + currentState[1] - currentState[2] : null;
  const currentR2 = cp741Int(raw.currentR2, -n, 2 * n);
  const overlapRaw = cp741Object(raw.overlap);
  const gainRaw = cp741Object(raw.gain);
  const memo = cp741NormalizeMemo(raw.memo, n, currentState);
  const candidateState = cp741NormalizeCandidates(raw.candidates, currentState, n);
  const counterRaw = cp741Object(raw.counters);
  const counters = {};
  CP741_COUNTERS.forEach(([key]) => { counters[key] = cp741Int(counterRaw[key], 0, 1000000000) ?? 0; });
  const invariantRaw = cp741Object(raw.invariants);
  const invariants = {};
  CP741_INVARIANTS.forEach(([key]) => { invariants[key] = cp741Boolean(invariantRaw[key]); });
  const witness = cp741NormalizeWitness(raw.witness, board);
  const rawRootInput = cp741Object(raw.rawRoot);
  let rawRoot = { status: "pending", score: null };
  if (rawRootInput.status === "unreachable" && rawRootInput.score === null) {
    rawRoot = { status: "unreachable", score: null };
  } else if (rawRootInput.status === "reachable") {
    const score = cp741Score(rawRootInput.score);
    if (score !== null) rawRoot = { status: "reachable", score };
  }
  const payloadReachable = cp741Boolean(raw.reachable);
  const reachable = payloadReachable !== null ? payloadReachable : witness ? witness.reachable : null;
  const answer = cp741Score(raw.answer) ?? (witness ? witness.answer : null);
  const locale = cp741Locale();
  return {
    source: { line, text: CP741_SOURCE[line - 1] },
    event,
    phase,
    timing,
    condition: {
      expression: cp741Text(conditionRaw.expression, 240, ""),
      result: conditionResult,
    },
    board,
    n,
    currentState,
    currentTime,
    currentR2,
    derivedR2,
    currentCells: {
      a: currentState ? [currentState[0], currentState[1]] : null,
      b: currentState ? [derivedR2, currentState[2]] : null,
    },
    overlap: {
      sameCell: cp741Boolean(overlapRaw.sameCell),
      countedOnce: cp741Boolean(overlapRaw.countedOnce),
    },
    gain: {
      walkerA: cp741Int(gainRaw.walkerA, 0, 1),
      walkerB: cp741Int(gainRaw.walkerB, 0, 1),
      total: cp741Int(gainRaw.total, 0, 2),
      combinedWithBest: cp741Score(gainRaw.combinedWithBest),
    },
    callStack: cp741NormalizeStack(raw.callStack, n),
    candidates: candidateState.candidates,
    chosen: candidateState.chosen,
    bestScore: candidateState.bestScore,
    memo,
    successors: cp741NormalizeSuccessors(raw.successorMap, n, memo),
    counters,
    invariants: {
      definition: cp741Text(invariantRaw.definition, 500, ""),
      ...invariants,
    },
    rawRoot,
    reachable,
    answer,
    witness,
    final: raw.final === true || Boolean(step && step.final),
    title: cp741Localized(step && step.title, locale, CP741_TEXT[locale].fallback),
    note: cp741Localized(step && step.note, locale, ""),
    limits: { minDimension: 1, maxDimension: CP741_MAX_DIMENSION, maxFrames: CP741_MAX_FRAMES },
  };
}
function cp741PairLabel(dictionary, key, locale) {
  const pair = dictionary[key];
  return pair ? pair[locale === "vi" ? 1 : 0] : key;
}
function cp741EventLabel(event, locale) {
  return cp741PairLabel(CP741_EVENTS, event, locale);
}
function cp741PhaseLabel(phase, locale) {
  return cp741PairLabel(CP741_PHASES, phase, locale);
}
function cp741TimingLabel(timing, copy) {
  return timing === "before" ? copy.before : timing === "during" ? copy.during : copy.after;
}
function cp741Nullable(value, fallback = "—") {
  return value === null ? fallback : String(value);
}
function cp741BooleanLabel(value, copy) {
  return value === null ? copy.notApplicable : value ? copy.yes : copy.no;
}
function cp741MemoStatusLabel(status, copy) {
  if (status === "reachable") return copy.reachableEntries;
  if (status === "unreachable") return copy.unreachableEntries;
  if (status === "not-cached") return copy.notCached;
  return copy.notApplicableMemo;
}
function cp741FrameStatusLabel(status, locale) {
  const labels = {
    entered: ["entered", "đã vào"],
    "derived-r2": ["r2 derived", "đã suy ra r2"],
    rejected: ["rejected", "bị loại"],
    destination: ["destination", "đích"],
    "read-walker-a": ["read A", "đã đọc A"],
    "checked-overlap": ["overlap checked", "đã kiểm tra trùng"],
    "selected-first-maximum": ["maximum selected", "đã chọn cực đại"],
    returning: ["returning", "đang trả về"],
  };
  return cp741PairLabel(labels, status, locale);
}
function cp741Rail(state, copy, locale) {
  return `<nav class="cp741-rail-scroll" aria-label="${cp741Escape(copy.rail)}" tabindex="0"><ol class="cp741-rail">${CP741_SOURCE.map((source, index) => {
    const current = index + 1 === state.source.line;
    const action = CP741_LINE_ACTIONS[index][locale === "vi" ? 1 : 0];
    return `<li class="${current ? "cp741-current" : ""}"${current ? ' aria-current="step"' : ""}><small>L${index + 1} · ${cp741Escape(action)}</small><code>${cp741Escape(source)}</code>${current ? `<em>${cp741Escape(cp741EventLabel(state.event, locale))}</em>` : ""}</li>`;
  }).join("")}</ol></nav>`;
}
function cp741SourcePanel(state, copy, locale) {
  let condition = copy.noCondition;
  if (state.condition.result !== null) {
    const result = typeof state.condition.result === "boolean"
      ? state.condition.result ? copy.yes : copy.no
      : state.condition.result;
    condition = `${state.condition.expression || "—"} → ${result}`;
  }
  return `<section class="cp741-source" aria-labelledby="cp741-source-title"><div class="cp741-source-code"><small id="cp741-source-title">${cp741Escape(copy.sourceAction)}</small><code>${cp741Escape(state.source.text)}</code></div><dl><div><dt>${cp741Escape(copy.phase)}</dt><dd>${cp741Escape(cp741PhaseLabel(state.phase, locale))}</dd></div><div><dt>${cp741Escape(copy.event)}</dt><dd>${cp741Escape(cp741EventLabel(state.event, locale))}</dd></div><div><dt>${cp741Escape(copy.condition)}</dt><dd>${cp741Escape(condition)}</dd></div></dl></section>`;
}
function cp741CellKey(cell) {
  return cell ? `${cell[0]},${cell[1]}` : "";
}
function cp741InBoard(cell, n) {
  return Boolean(cell && cell[0] >= 0 && cell[0] < n && cell[1] >= 0 && cell[1] < n);
}
function cp741BoardPanel(state, copy) {
  const witness = state.witness && state.witness.reachable ? state.witness : null;
  const pathA = new Set(witness ? witness.pathA.map(cp741CellKey) : []);
  const pathB = new Set(witness ? witness.pathB.map(cp741CellKey) : []);
  const currentA = cp741InBoard(state.currentCells.a, state.n) ? cp741CellKey(state.currentCells.a) : "";
  const currentB = cp741InBoard(state.currentCells.b, state.n) ? cp741CellKey(state.currentCells.b) : "";
  const heads = Array.from({ length: state.n }, (_, column) => `<th scope="col"><span>c${column}</span></th>`).join("");
  const rows = state.board.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      const key = `${rowIndex},${columnIndex}`;
      const isA = currentA === key;
      const isB = currentB === key;
      const onA = pathA.has(key);
      const onB = pathB.has(key);
      const antidiagonal = state.currentTime !== null && rowIndex + columnIndex === state.currentTime;
      const kind = value === -1 ? "thorn" : value === 1 ? "cherry" : "open";
      const classes = [
        "cp741-board-cell", `cp741-cell-${kind}`,
        antidiagonal ? "cp741-antidiagonal" : "",
        isA ? "cp741-current-a" : "", isB ? "cp741-current-b" : "",
        isA && isB ? "cp741-current-overlap" : "",
        onA ? "cp741-path-a" : "", onB ? "cp741-path-b" : "",
        onA && onB ? "cp741-path-overlap" : "",
      ].filter(Boolean).join(" ");
      const roles = [
        kind === "thorn" ? copy.thorn : kind === "cherry" ? copy.cherry : copy.open,
        antidiagonal ? copy.currentDiagonal : "",
        isA ? copy.walkerA : "", isB ? copy.walkerB : "",
        onA ? copy.pathA : "", onB ? copy.pathB : "",
      ].filter(Boolean).join(", ");
      const markers = isA && isB
        ? '<span class="cp741-walker-marker cp741-marker-overlap">A·B</span>'
        : `${isA ? '<span class="cp741-walker-marker cp741-marker-a">A</span>' : ""}${isB ? '<span class="cp741-walker-marker cp741-marker-b">B</span>' : ""}`;
      const pathMarkers = `${onA ? '<i class="cp741-path-marker cp741-path-marker-a" aria-hidden="true">A</i>' : ""}${onB ? '<i class="cp741-path-marker cp741-path-marker-b" aria-hidden="true">B</i>' : ""}`;
      const glyph = value === -1 ? "×" : value === 1 ? "●" : "·";
      return `<td class="${classes}" aria-label="${cp741Escape(`${copy.row} ${rowIndex}, ${copy.column} ${columnIndex}: ${roles}`)}"><span class="cp741-cell-glyph" aria-hidden="true">${glyph}</span>${markers}<span class="cp741-path-markers">${pathMarkers}</span><small>r${rowIndex}c${columnIndex}</small></td>`;
    }).join("");
    return `<tr><th scope="row"><span>r${rowIndex}</span></th>${cells}</tr>`;
  }).join("");
  const synchronized = state.currentState && state.currentCells.b
    ? state.currentState[0] + state.currentState[1] === state.currentCells.b[0] + state.currentCells.b[1]
    : null;
  const timeEquation = state.currentTime === null
    ? "t = —"
    : `t = ${state.currentTime}; A: ${state.currentCells.a ? `${state.currentCells.a[0]}+${state.currentCells.a[1]}` : "—"}; B: ${state.currentCells.b ? `${state.currentCells.b[0]}+${state.currentCells.b[1]}` : "—"}`;
  return `<section class="cp741-card cp741-board" aria-labelledby="cp741-board-title"><header><div><h3 id="cp741-board-title">${cp741Escape(copy.board)}</h3><p>${cp741Escape(copy.boardHelp)}</p></div><strong class="${synchronized === false ? "cp741-bad" : synchronized === true ? "cp741-good" : "cp741-neutral"}">${cp741Escape(synchronized === null ? copy.pending : synchronized ? copy.synchronized : copy.notSynchronized)}</strong></header><dl class="cp741-board-summary"><div><dt>${cp741Escape(copy.dimension)}</dt><dd>${state.n} × ${state.n}</dd></div><div><dt>${cp741Escape(copy.time)}</dt><dd>${cp741Escape(timeEquation)}</dd></div><div><dt>${cp741Escape(copy.state)}</dt><dd>${cp741Escape(cp741StateLabel(state.currentState))}</dd></div><div><dt>${cp741Escape(copy.derived)}</dt><dd>${cp741Escape(cp741Nullable(state.currentR2))}</dd></div></dl><div class="cp741-board-scroll" role="region" aria-label="${cp741Escape(copy.board)}" tabindex="0"><table><caption>${cp741Escape(copy.boardCaption)}</caption><thead><tr><th scope="col">r \ c</th>${heads}</tr></thead><tbody>${rows}</tbody></table></div><ul class="cp741-board-legend" aria-label="${cp741Escape(copy.boardCaption)}"><li class="cp741-legend-thorn">${cp741Escape(copy.thorn)}</li><li class="cp741-legend-open">${cp741Escape(copy.open)}</li><li class="cp741-legend-cherry">${cp741Escape(copy.cherry)}</li><li class="cp741-legend-a">${cp741Escape(copy.walkerA)}</li><li class="cp741-legend-b">${cp741Escape(copy.walkerB)}</li><li class="cp741-legend-overlap">${cp741Escape(copy.overlap)}</li><li class="cp741-legend-diagonal">${cp741Escape(copy.currentDiagonal)}</li><li class="cp741-legend-path-a">${cp741Escape(copy.pathA)}</li><li class="cp741-legend-path-b">${cp741Escape(copy.pathB)}</li></ul></section>`;
}
function cp741GainPanel(state, copy) {
  const values = [
    [copy.cellA, cp741CoordinateLabel(state.currentCells.a)],
    [copy.valueA, cp741Nullable(state.gain.walkerA)],
    [copy.cellB, cp741CoordinateLabel(state.currentCells.b)],
    [copy.valueB, cp741Nullable(state.gain.walkerB)],
    [copy.sameCell, cp741BooleanLabel(state.overlap.sameCell, copy)],
    [copy.countedOnce, cp741BooleanLabel(state.overlap.countedOnce, copy)],
    [copy.localGain, cp741Nullable(state.gain.total)],
    [copy.suffixBest, cp741Nullable(state.bestScore)],
    [copy.combined, cp741Nullable(state.gain.combinedWithBest)],
  ];
  const formula = state.gain.total === null
    ? "gain = —"
    : `${state.gain.walkerA ?? "—"}${state.overlap.sameCell === false ? ` + ${state.gain.walkerB ?? "—"}` : ""} = ${state.gain.total}`;
  return `<section class="cp741-card cp741-gain" aria-labelledby="cp741-gain-title"><header><div><h3 id="cp741-gain-title">${cp741Escape(copy.gain)}</h3><p>${cp741Escape(copy.gainHelp)}</p></div><code>${cp741Escape(formula)}</code></header><dl>${values.map(([label, value], index) => `<div class="${index >= 6 ? "cp741-gain-total" : ""}"><dt>${cp741Escape(label)}</dt><dd>${cp741Escape(value)}</dd></div>`).join("")}</dl></section>`;
}
function cp741StackPanel(state, copy, locale) {
  const rows = state.callStack.length ? `<ol>${state.callStack.map((frame, index) => {
    const active = index === state.callStack.length - 1;
    const origin = frame.origin.type === "candidate"
      ? `${copy.candidate} ${frame.origin.move || "—"}${frame.origin.parentState ? ` ← ${cp741StateLabel(frame.origin.parentState)}` : ""}`
      : copy.root;
    return `<li class="${active ? "cp741-stack-active" : ""}"${active ? ' aria-current="true"' : ""}><span>${frame.depth}</span><div><code>dp${cp741Escape(cp741StateLabel(frame.state))}</code><small>t=${frame.time} · r2=${cp741Escape(cp741Nullable(frame.r2))}</small></div><div><strong>${cp741Escape(cp741FrameStatusLabel(frame.status, locale))}</strong><small>${cp741Escape(origin)}</small></div></li>`;
  }).join("")}</ol>` : `<div class="cp741-empty">${cp741Escape(copy.stackEmpty)}</div>`;
  return `<section class="cp741-card cp741-stack" aria-labelledby="cp741-stack-title"><header><div><h3 id="cp741-stack-title">${cp741Escape(copy.stack)}</h3><p>${cp741Escape(copy.stackHelp)}</p></div><strong>${state.callStack.length}</strong></header><div class="cp741-stack-scroll" role="region" aria-label="${cp741Escape(copy.stack)}" tabindex="0">${rows}</div></section>`;
}
function cp741MemoPanel(state, copy) {
  const table = state.memo.entries.length ? `<div class="cp741-table-scroll" role="region" aria-label="${cp741Escape(copy.memo)}" tabindex="0"><table><caption>${cp741Escape(copy.memoHelp)}</caption><thead><tr><th scope="col">${cp741Escape(copy.key)}</th><th scope="col">${cp741Escape(copy.status)}</th><th scope="col">${cp741Escape(copy.score)}</th></tr></thead><tbody>${state.memo.entries.map((entry) => `<tr class="cp741-memo-${entry.status} ${entry.key === state.memo.currentKey ? "cp741-memo-current" : ""}"><th scope="row"><code>${cp741Escape(entry.key)}</code></th><td><span>${cp741Escape(cp741MemoStatusLabel(entry.status, copy))}</span></td><td>${entry.status === "reachable" ? cp741Escape(entry.score) : '<span aria-label="null">∅</span>'}</td></tr>`).join("")}</tbody></table></div>` : `<div class="cp741-empty">${cp741Escape(copy.memoEmpty)}</div>`;
  return `<section class="cp741-card cp741-memo" aria-labelledby="cp741-memo-title"><header><div><h3 id="cp741-memo-title">${cp741Escape(copy.memo)}</h3><p>${cp741Escape(copy.memoHelp)}</p></div><strong class="cp741-memo-state-${state.memo.current}">${cp741Escape(cp741MemoStatusLabel(state.memo.current, copy))}</strong></header><dl class="cp741-memo-summary"><div><dt>${cp741Escape(copy.entries)}</dt><dd>${state.memo.size}</dd></div><div><dt>${cp741Escape(copy.reachableEntries)}</dt><dd>${state.memo.reachable}</dd></div><div><dt>${cp741Escape(copy.unreachableEntries)}</dt><dd>${state.memo.unreachable}</dd></div><div><dt>${cp741Escape(copy.currentMemo)}</dt><dd>${cp741Escape(state.memo.currentKey || "—")}</dd></div></dl>${table}</section>`;
}
function cp741SuccessorPanel(state, copy) {
  const rows = state.successors.length ? `<div class="cp741-table-scroll" role="region" aria-label="${cp741Escape(copy.successors)}" tabindex="0"><table><caption>${cp741Escape(copy.successorHelp)}</caption><thead><tr><th scope="col">${cp741Escape(copy.key)}</th><th scope="col">${cp741Escape(copy.move)}</th><th scope="col">${cp741Escape(copy.target)}</th></tr></thead><tbody>${state.successors.map((entry) => `<tr class="${entry.key === state.memo.currentKey ? "cp741-successor-current" : ""}"><th scope="row"><code>${cp741Escape(entry.key)}</code></th><td><strong>${cp741Escape(entry.terminal ? copy.terminal : entry.move)}</strong></td><td><code>${cp741Escape(entry.terminal ? "[null, null]" : cp741StateLabel(entry.target))}</code></td></tr>`).join("")}</tbody></table></div>` : `<div class="cp741-empty">${cp741Escape(copy.successorEmpty)}</div>`;
  return `<section class="cp741-card cp741-successors" aria-labelledby="cp741-successors-title"><header><div><h3 id="cp741-successors-title">${cp741Escape(copy.successors)}</h3><p>${cp741Escape(copy.successorHelp)}</p></div><strong>${state.successors.length}</strong></header>${rows}</section>`;
}
function cp741DirectionLabel(direction, copy) {
  return direction === "right" ? copy.right : copy.down;
}
function cp741CandidateStatus(candidate, copy) {
  if (candidate.status === "reachable") return copy.reachableEntries;
  if (candidate.status === "unreachable") return copy.unreachableEntries;
  if (candidate.status === "pending") return copy.notEvaluated;
  if (candidate.status === "calling") return copy.reasonCalling;
  return copy.unavailable;
}
function cp741CandidateScore(candidate, copy) {
  if (candidate.status === "reachable") return String(candidate.score);
  if (candidate.status === "unreachable") return `∅ · ${copy.unreachableEntries}`;
  return `— · ${copy.unavailable}`;
}
function cp741CandidatePanel(state, copy) {
  const cards = state.candidates.map((candidate) => {
    const chosen = state.chosen && state.chosen.move === candidate.move;
    const classes = [
      "cp741-candidate", `cp741-candidate-${candidate.move.toLowerCase()}`,
      `cp741-candidate-status-${candidate.status}`,
      candidate.becameStrictMaximum ? "cp741-strict-update" : "",
      chosen ? "cp741-candidate-chosen" : "",
    ].filter(Boolean).join(" ");
    const directions = `A ${cp741DirectionLabel(candidate.walkerA, copy)} · B ${cp741DirectionLabel(candidate.walkerB, copy)}`;
    return `<article class="${classes}"${chosen ? ' aria-current="true"' : ""}><header><span>${candidate.order + 1}</span><div><h4>${candidate.move}</h4><small>L${candidate.sourceLine}</small></div><strong>${cp741Escape(chosen ? copy.selected : copy.notSelected)}</strong></header><dl><div><dt>${cp741Escape(copy.directions)}</dt><dd>${cp741Escape(directions)}</dd></div><div><dt>${cp741Escape(copy.target)}</dt><dd><code>${cp741Escape(cp741StateLabel(candidate.targetState))}</code></dd></div><div><dt>${cp741Escape(copy.targetTime)}</dt><dd>${cp741Escape(cp741Nullable(candidate.targetTime))}</dd></div><div><dt>${cp741Escape(copy.status)}</dt><dd>${cp741Escape(cp741CandidateStatus(candidate, copy))}</dd></div><div class="cp741-candidate-score"><dt>${cp741Escape(copy.score)}</dt><dd>${cp741Escape(cp741CandidateScore(candidate, copy))}</dd></div></dl><p>${cp741Escape(copy[candidate.reasonKey])}</p></article>`;
  }).join("");
  const choice = state.chosen
    ? `<strong>${cp741Escape(state.chosen.move)}</strong><code>dp${cp741Escape(cp741StateLabel(state.chosen.targetState))} = ${cp741Escape(state.chosen.score)}</code>`
    : `<span>${cp741Escape(copy.noChoice)}</span>`;
  return `<section class="cp741-card cp741-candidates" aria-labelledby="cp741-candidates-title"><header><div><h3 id="cp741-candidates-title">${cp741Escape(copy.candidates)}</h3><p>${cp741Escape(copy.candidatesHelp)}</p></div><strong>RR → DR → RD → DD</strong></header><div class="cp741-candidate-scroll" role="region" aria-label="${cp741Escape(copy.candidates)}" tabindex="0"><div class="cp741-candidate-grid">${cards}</div></div><div class="cp741-choice"><div><small>${cp741Escape(copy.choice)}</small>${choice}</div><p><b>${cp741Escape(copy.policy)}</b></p></div></section>`;
}
function cp741Timeline(title, path, copy, reverse = false) {
  const items = path.length ? path.map((cell, index) => {
    const originalTime = reverse ? path.length - 1 - index : index;
    return `<li><small>${cp741Escape(copy.tripStep)} ${index}</small><span aria-hidden="true">${index ? "→" : "●"}</span><code>${cp741Escape(cp741CoordinateLabel(cell))}</code><em>${cp741Escape(copy.originalTime)} ${originalTime}</em></li>`;
  }).join("") : `<li class="cp741-timeline-empty">∅</li>`;
  return `<section class="cp741-trip"><h4>${cp741Escape(title)}</h4><div class="cp741-timeline-scroll" role="region" aria-label="${cp741Escape(title)}" tabindex="0"><ol>${items}</ol></div></section>`;
}
function cp741WitnessAssertionLabel(key, locale) {
  const labels = {
    emptyPaths: ["unreachable paths are empty", "đường không thể đến đều rỗng"],
    reachableIsFalse: ["reachable is false", "reachable là false"],
    answerIsZero: ["answer is zero", "đáp án bằng 0"],
    rawScoreIsNull: ["raw score is null", "điểm thô là null"],
    pathLengthsAreTwoNMinusOne: ["both paths have length 2n−1", "hai đường có độ dài 2n−1"],
    pathAIsLegalRightDown: ["path A uses right/down", "đường A chỉ đi phải/xuống"],
    pathBIsLegalRightDown: ["path B uses right/down", "đường B chỉ đi phải/xuống"],
    legalSynchronizedPaths: ["synchronized paths are legal", "hai đường đồng bộ hợp lệ"],
    legalReverseReturnPath: ["reversed B is a legal return", "B đảo chiều là lượt về hợp lệ"],
    endpointsMatch: ["route endpoints match", "các đầu mút khớp"],
    noThorns: ["witness avoids thorns", "witness tránh mọi ô gai"],
    synchronizedScoreMatchesRawAndAnswer: ["synchronized score equals raw and answer", "điểm đồng bộ bằng điểm thô và đáp án"],
    originalScoreMatchesRawAndAnswer: ["out-and-back score equals raw and answer", "điểm đi-về bằng điểm thô và đáp án"],
    uniqueCherryCellsMatchScore: ["unique cherry cells equal the score", "số ô anh đào duy nhất bằng điểm"],
  };
  return cp741PairLabel(labels, key, locale);
}
function cp741WitnessPanel(state, copy, locale) {
  const witness = state.witness;
  if (!witness) {
    return `<section class="cp741-card cp741-witness cp741-witness-pending" aria-labelledby="cp741-witness-title"><header><div><h3 id="cp741-witness-title">${cp741Escape(copy.witness)}</h3><p>${cp741Escape(copy.witnessHelp)}</p></div><strong>${cp741Escape(copy.pending)}</strong></header><div class="cp741-empty">${cp741Escape(copy.witnessPending)}</div></section>`;
  }
  const assertions = `<ul class="cp741-assertions">${CP741_WITNESS_ASSERTIONS.map((key) => {
    const value = witness.assertions[key];
    const statusClass = value === true ? "cp741-pass" : value === false ? "cp741-fail" : "cp741-na";
    const symbol = value === true ? "✓" : value === false ? "×" : "·";
    return `<li class="${statusClass}"><span aria-hidden="true">${symbol}</span><strong>${cp741Escape(cp741WitnessAssertionLabel(key, locale))}</strong></li>`;
  }).join("")}</ul>`;
  if (!witness.reachable) {
    return `<section class="cp741-card cp741-witness cp741-witness-unreachable" aria-labelledby="cp741-witness-title"><header><div><h3 id="cp741-witness-title">${cp741Escape(copy.witness)}</h3><p>${cp741Escape(copy.witnessHelp)}</p></div><strong>${cp741Escape(copy.unreachableEntries)}</strong></header><p class="cp741-unreachable-message">${cp741Escape(copy.unreachableWitness)}</p><div class="cp741-trip-grid">${cp741Timeline(copy.outbound, [], copy)}${cp741Timeline(copy.returnTrip, [], copy, true)}</div><section class="cp741-witness-assertions"><h4>${cp741Escape(copy.witnessAssertions)}</h4>${assertions}</section></section>`;
  }
  const syncEquivalent = witness.rawScore !== null
    && witness.answer !== null
    && witness.synchronizedScore === witness.rawScore
    && witness.computedSynchronizedScore === witness.rawScore
    && witness.answer === witness.rawScore;
  const tripEquivalent = witness.rawScore !== null
    && witness.answer !== null
    && witness.originalOutAndBackDeduplicatedScore === witness.rawScore
    && witness.computedTripScore === witness.rawScore
    && witness.answer === witness.rawScore;
  const synchronizedRows = witness.perTime.length ? witness.perTime.map((item) => `<tr class="${item.overlap ? "cp741-time-overlap" : ""}"><th scope="row">t=${item.time}</th><td><code>${cp741Escape(cp741CoordinateLabel(item.a))}</code><small>${item.walkerA}</small></td><td><code>${cp741Escape(cp741CoordinateLabel(item.b))}</code><small>${item.walkerB}</small></td><td>${item.overlap ? "A·B" : "A+B"}</td><td><strong>${item.gain}</strong></td></tr>`).join("") : `<tr><td colspan="5">—</td></tr>`;
  const cherries = witness.uniqueVisitedCherryCells.length
    ? `<ol>${witness.uniqueVisitedCherryCells.map((cell, index) => `<li><span>${index + 1}</span><code>${cp741Escape(cp741CoordinateLabel(cell))}</code></li>`).join("")}</ol>`
    : `<p>${cp741Escape(copy.noCherries)}</p>`;
  const scoreCards = [
    [copy.rawScore, witness.rawScore, true],
    [copy.synchronizedScore, witness.synchronizedScore, syncEquivalent],
    [`${copy.synchronizedScore} · ${copy.recomputed}`, witness.computedSynchronizedScore, syncEquivalent],
    [copy.outAndBackScore, witness.originalOutAndBackDeduplicatedScore, tripEquivalent],
    [`${copy.outAndBackScore} · ${copy.recomputed}`, witness.computedTripScore, tripEquivalent],
    [copy.answer, witness.answer, syncEquivalent && tripEquivalent],
  ];
  return `<section class="cp741-card cp741-witness cp741-witness-reachable" aria-labelledby="cp741-witness-title"><header><div><h3 id="cp741-witness-title">${cp741Escape(copy.witness)}</h3><p>${cp741Escape(copy.witnessHelp)}</p></div><strong>${cp741Escape(copy.reachableEntries)}</strong></header><div class="cp741-trip-grid">${cp741Timeline(copy.outbound, witness.outbound, copy)}${cp741Timeline(copy.returnTrip, witness.returnPath, copy, true)}</div><section class="cp741-synchronized"><h4>${cp741Escape(copy.synchronizedTimeline)}</h4><div class="cp741-table-scroll" role="region" aria-label="${cp741Escape(copy.synchronizedTimeline)}" tabindex="0"><table><thead><tr><th scope="col">t</th><th scope="col">A</th><th scope="col">B</th><th scope="col">${cp741Escape(copy.overlap)}</th><th scope="col">${cp741Escape(copy.perTimeGain)}</th></tr></thead><tbody>${synchronizedRows}</tbody></table></div></section><div class="cp741-witness-grid"><section class="cp741-unique-cherries"><h4>${cp741Escape(copy.uniqueCherries)}</h4>${cherries}</section><section class="cp741-equivalence"><h4>${cp741Escape(copy.scoreEquivalence)}</h4><dl>${scoreCards.map(([label, value, passes]) => `<div class="${passes ? "cp741-pass" : "cp741-fail"}"><dt>${cp741Escape(label)}</dt><dd>${cp741Escape(cp741Nullable(value))}</dd><small>${cp741Escape(passes ? copy.equivalent : copy.mismatch)}</small></div>`).join("")}</dl></section></div><section class="cp741-witness-assertions"><h4>${cp741Escape(copy.witnessAssertions)}</h4>${assertions}</section></section>`;
}
function cp741ResultPanel(state, copy) {
  const kind = state.reachable === true ? "reachable" : state.reachable === false ? "unreachable" : "pending";
  const description = kind === "reachable"
    ? state.answer === 0 ? copy.reachableZero : copy.reachableResult
    : kind === "unreachable" ? copy.unreachableResult : copy.resultPending;
  const status = kind === "reachable" ? copy.reachableEntries : kind === "unreachable" ? copy.unreachableEntries : copy.pending;
  return `<section class="cp741-card cp741-result cp741-result-${kind}" aria-labelledby="cp741-result-title" aria-live="polite"><header><div><h3 id="cp741-result-title">${cp741Escape(copy.result)}</h3><p>${cp741Escape(description)}</p></div><strong>${cp741Escape(status)}</strong></header><dl><div><dt>${cp741Escape(copy.rawStatus)}</dt><dd>${cp741Escape(state.rawRoot.status)}</dd></div><div><dt>${cp741Escape(copy.rawScore)}</dt><dd>${cp741Escape(cp741Nullable(state.rawRoot.score))}</dd></div><div><dt>${cp741Escape(copy.answer)}</dt><dd>${cp741Escape(cp741Nullable(state.answer, copy.pending))}</dd></div></dl></section>`;
}
function cp741InvariantPanel(state, copy, locale) {
  const definition = state.invariants.definition || copy.invariantDefinition;
  return `<section class="cp741-card cp741-invariants" aria-labelledby="cp741-invariants-title"><header><div><h3 id="cp741-invariants-title">${cp741Escape(copy.invariants)}</h3><p>${cp741Escape(definition)}</p></div></header><ul>${CP741_INVARIANTS.map(([key, en, vi]) => {
    const value = state.invariants[key];
    const statusClass = value === true ? "cp741-pass" : value === false ? "cp741-fail" : "cp741-na";
    const symbol = value === true ? "✓" : value === false ? "×" : "·";
    const status = value === true ? copy.holds : value === false ? copy.failed : copy.notApplicable;
    return `<li class="${statusClass}"><span aria-hidden="true">${symbol}</span><strong>${cp741Escape(locale === "vi" ? vi : en)}</strong><small>${cp741Escape(status)}</small></li>`;
  }).join("")}</ul></section>`;
}
function cp741CounterPanel(state, copy, locale) {
  return `<section class="cp741-card cp741-counters" aria-labelledby="cp741-counters-title"><header><h3 id="cp741-counters-title">${cp741Escape(copy.counters)}</h3></header><ul>${CP741_COUNTERS.map(([key, en, vi]) => `<li><small>${cp741Escape(locale === "vi" ? vi : en)}</small><strong>${state.counters[key]}</strong></li>`).join("")}</ul></section>`;
}
function renderCherryPickup741View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = cp741Locale();
  const copy = CP741_TEXT[locale];
  const state = cp741Normalize(step);
  const event = cp741EventLabel(state.event, locale);
  const resultClass = state.reachable === true ? "cp741-reachable" : state.reachable === false ? "cp741-unreachable" : "cp741-pending";
  const note = state.note ? `<aside class="cp741-note"><strong>${cp741Escape(copy.note)}</strong><p>${cp741Escape(state.note)}</p></aside>` : "";
  host.innerHTML = `<article class="cp741-viz ${state.final ? "cp741-final" : ""} ${resultClass}" role="region" aria-label="${cp741Escape(`${copy.region}, ${copy.line} ${state.source.line}, ${event}`)}"><header class="cp741-header"><div><span>${cp741Escape(copy.kicker)}</span><h2>${cp741Escape(state.title)}</h2></div><div><strong>${cp741Escape(copy.line)} ${state.source.line}</strong><span>${cp741Escape(cp741TimingLabel(state.timing, copy))}</span><em>${cp741Escape(event)}</em></div></header>${cp741Rail(state, copy, locale)}${cp741SourcePanel(state, copy, locale)}<div class="cp741-board-gain-grid">${cp741BoardPanel(state, copy)}${cp741GainPanel(state, copy)}</div><div class="cp741-runtime-grid">${cp741StackPanel(state, copy, locale)}${cp741MemoPanel(state, copy)}</div>${cp741SuccessorPanel(state, copy)}${cp741CandidatePanel(state, copy)}${cp741WitnessPanel(state, copy, locale)}${cp741ResultPanel(state, copy)}<div class="cp741-footer-grid">${cp741InvariantPanel(state, copy, locale)}${cp741CounterPanel(state, copy, locale)}</div>${note}</article>`;
}
