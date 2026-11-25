"use strict";
const { runTrace } = require("./wasm-picture-trace");
const context = require("./catalog-context");
const bi = (vi, en = vi) => ({ vi, en });
const categories = {
  tree: ["binary-tree", "Cây nhị phân", "Binary Tree"], list: ["linked-list", "Danh sách liên kết", "Linked List"],
  string: ["string", "Chuỗi", "String"], array: ["array", "Mảng", "Array"], dp: ["dp", "Quy hoạch động", "Dynamic Programming"],
  math: ["math", "Toán học", "Math"], bits: ["bitmask", "Thao tác bit", "Bit Manipulation"],
  graph: ["graph", "Đồ thị", "Graph"], search: ["binary-search", "Tìm kiếm nhị phân", "Binary Search"],
  backtracking: ["backtracking", "Quay lui", "Backtracking"], design: ["design", "Thiết kế", "Design"],
  sliding: ["sliding", "Cửa sổ trượt", "Sliding Window"], greedy: ["greedy", "Tham lam", "Greedy"],
  sql: ["sql", "SQL · bảng dữ liệu", "SQL · Tables"], shell: ["shell", "Shell · xử lý văn bản", "Shell · Text Processing"],
  concurrency: ["concurrency", "Đồng bộ luồng", "Concurrency"],
  javascript: ["javascript", "JavaScript", "JavaScript"],
};
function parseArguments(input, entry) {
  if (typeof input !== "string" || input.length > 12000) throw new Error("Nhập danh sách tham số JSON ≤ 12000 ký tự / Enter a JSON argument list ≤ 12000 characters.");
  let args;
  try { args = JSON.parse(input); } catch { throw new Error("JSON không hợp lệ / Invalid JSON. Ví dụ / Example: " + JSON.stringify(entry.sample)); }
  if (!Array.isArray(args) || args.length !== entry.sample.length) throw new Error(`Cần ${entry.sample.length} tham số trong một mảng JSON / Expected ${entry.sample.length} arguments in a JSON array.`);
  let cells = 0;
  function check(value, depth = 0) {
    if (depth > 12 || ++cells > 650) throw new Error("Ví dụ quá lớn / Example too large (≤650 values, depth ≤12).");
    if (Array.isArray(value)) { const limit = entry.maxArrayLength || 80; if (value.length > limit) throw new Error(`Mỗi mảng ≤${limit} phần tử / Each array ≤${limit} entries.`); value.forEach(v => check(v, depth+1)); }
    else if (value && typeof value === "object") Object.values(value).forEach(v => check(v, depth+1));
    else if (typeof value === "number" && (!Number.isFinite(value) || Number.isInteger(value) && !Number.isSafeInteger(value))) throw new Error("Số ngoài giới hạn chính xác của JSON / Number outside JSON's exact integer range. Use a string for large integer arguments.");
    else if (typeof value === "string" && value.length > 2000) throw new Error("Chuỗi ≤2000 ký tự / String ≤2000 characters.");
  }
  check(args);
  return args;
}
function define(id, title, group, sample, expected, source, options = {}) {
  const code = source.trim().split("\n"), method = options.method || code.map(line => line.match(/^    def (\w+)\(self/)).find(Boolean)?.[1];
  if (!method) throw new Error(`Missing entrypoint #${id}`);
  const entry = { id, title, sample, expected, code, method, group, ...options };
  const maxEvents = options.traceOptions?.maxEvents || 6000;
  const category = categories[group];
  const names = options.names || code.find(line => line.startsWith(`    def ${method}(`)).match(/\(self,?\s*(.*?)\)/)[1].split(",").map(x=>x.trim()).filter(Boolean);
  const lesson = {
    id, difficulty: options.difficulty || "medium", slug: options.slug || title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-$/,""),
    category: { key: category[0], vi: category[1], en: category[2] }, title: bi(title),
    titleVi: bi(options.vi || title), inputKind: "string", defaultInput: JSON.stringify(sample), extraParams: [],
    inputLabel: bi(`Tham số JSON: [${names.join(", ")}]`, `JSON arguments: [${names.join(", ")}]`),
    statement: bi(`${options.vi || title}. ${options.description || ""} Nhập các tham số theo thứ tự trong mảng JSON. Giới hạn hình: mỗi mảng ≤${options.maxArrayLength || 80} phần tử, ≤650 giá trị; tối đa ${maxEvents} bước.`, `${options.description || title + "."} Enter arguments in order as a JSON array. Visual limits: ${options.maxArrayLength || 80} entries per array, 650 values, ${maxEvents} statements.`),
    approach: [bi(options.guideVi || "Theo dõi ô được chọn, con trỏ, các lời gọi hàm và kết quả qua từng dòng code.", options.guide || "Follow selected cells, pointers, call frames and the result through real source statements.")],
    complexity: { time: options.time || "See algorithm", space: options.space || "See algorithm", note: bi("Không tính lịch sử mô phỏng.", "Excludes replay history.") },
    code, debugMode: "line-by-line", codeLabel: bi(group === "sql" ? "Python · mô phỏng phép toán SQL" : group === "shell" ? "Python · mô phỏng xử lý văn bản" : group === "concurrency" ? "Python · mô phỏng lịch luồng và tín hiệu" : "Python · chạy từng dòng",group === "sql" ? "Python · SQL operation model" : group === "shell" ? "Python · text-processing model" : group === "concurrency" ? "Python · thread scheduling and signal model" : "Python · source execution"),
    ...(options.reference ? { code2: options.reference.trim().split("\n"), code2Label: bi(group === "sql" ? "Truy vấn SQL tham khảo" : "Lệnh Shell tham khảo",group === "sql" ? "SQL reference query" : "Shell reference command") } : {}),
    liveArgs: input => parseArguments(input, entry).map((value,index) => options.kinds?.[index] === "tree"
      ? { __viz_type: "binary_tree", values: value }
      : options.kinds?.[index] === "list" ? { __viz_type: "linked_list", values: value } : value),
    builder(input) {
      const args = parseArguments(input, entry);
      // JSON config is parsed in Python rather than interpolated as Python literals.
      const prefix = context + '\n'+(options.prelude||'')+"\n_viz_config = json.loads(" + JSON.stringify(JSON.stringify({ kinds: options.kinds || [], answerKind: options.answerKind })) + ")\n";
      const trace = runTrace({ engine:options.engine,harness:options.harness,code: code.join("\n"), method, args, prelude: prefix,
        randomSeed: options.seed ?? 105, maxEvents, failOnTruncate: true,
        summarizeLocals: options.traceOptions?.summarizeLocals || {},
        captureAllocations: ["TreeNode", "ListNode", "Node",...(options.captureClasses||[])], stateClasses: ["Solution",...(options.stateClasses||[])],
        objectClasses: ["TreeNode", "ListNode", "Node"] });
      let previous = {};
      const motion = [];
      const steps = trace.events.map((event, index) => {
        const final = index === trace.events.length - 1;
        const locals = { ...event.outer, ...event.locals,...(options.exposeState&&event.locals.self?event.locals.self:{}) };
        if ([657,874,1041,1496].includes(id) && Number.isFinite(locals.x) && Number.isFinite(locals.y)
          && (!motion.length || motion.at(-1)[0] !== locals.x || motion.at(-1)[1] !== locals.y)) motion.push([locals.x,locals.y]);
        const changed = Object.keys(locals).filter(name => JSON.stringify(locals[name]) !== JSON.stringify(previous[name]));
        const oldValues = Object.fromEntries(changed.filter(name=>Object.hasOwn(previous,name)).map(name=>[name,previous[name]]));
        previous = locals;
        return { arr: [], highlight: [], mark: [], codeLines: [event.line], codeBlock: 1, final,
          title: bi(final ? "Hoàn tất · kết quả" : `Dòng ${event.line} · ${event.scope}`,final ? "Complete · result" : `Line ${event.line} · ${event.scope}`),
          note: bi("", ""), vars: Object.entries(locals).map(([name,value])=>({name,value,rawValue:value})),
          catalogLessonView: { id, group, names, args, teaching: options.teaching || null, motion: motion.map(point=>[...point]), line: event.line, source: code[event.line-1],
            locals, changed, oldValues, frames: event.frames, objects: event.objects || [], branch: event.branch,
            returning: event.returning, returned: event.returned,
            result: final ? trace.answer : null, final, trace: trace.trace },
        };
      });
      return { original: args, answer: trace.answer, steps };
    },
    __catalog: entry,
  };
  return lesson;
}
module.exports = { define, parseArguments };
