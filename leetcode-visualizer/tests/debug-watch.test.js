const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(require.resolve("../public/app-core.js"), "utf8");

function element() {
  const node = { children: [], className: "", dataset: {}, attributes: {}, value: "", textContent: "", focus() { this.focused = true; },
    appendChild(child) { this.children.push(child); return child; },
    setAttribute(key, value) { this.attributes[key] = value; }, removeAttribute(key) { delete this.attributes[key]; } };
  Object.defineProperty(node, "innerHTML", { get: () => "", set() { node.children = []; } });
  node.classList = {
    contains: key => node.className.split(" ").includes(key),
    add: key => { if (!node.classList.contains(key)) node.className = `${node.className} ${key}`.trim(); },
    remove: key => { node.className = node.className.split(" ").filter(value => value !== key).join(" "); },
    toggle: (key, state) => { if (state ?? !node.classList.contains(key)) node.classList.add(key); else node.classList.remove(key); },
  };
  return node;
}

function setup() {
  const nodes = Object.fromEntries(["varsPanel", "varsGrid", "watchGrid", "watchInput", "watchHint", "watchSuggestions"].map(id => [id, element()]));
  const events = {};
  const context = {
    lang: "vi", debugWatches: [], steps: [], stepIndex: 0, $: id => nodes[id],
    document: { createElement: element, addEventListener: (type, fn) => { (events[type] ||= []).push(fn); } },
  };
  context.pick = value => typeof value === "object" && value ? value[context.lang] || value.en : value;
  context.t = () => ({ watchLabel: context.lang === "vi" ? "Biến hoặc phần tử cần theo dõi" : "Watch variable or element" });
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf("// ---- Variables panel (debug) ----")), context);
  vm.runInContext(source.slice(source.indexOf("function addDebugWatchFromInput()"), source.indexOf("async function runViz()")), context);
  return { context, nodes, events };
}

const step = { vars: [{ name: "h", value: 5 }, { name: "k", value: 1 }, { name: "queue", value: [[5, 0], [7, 0]] }, { name: "node", value: { val: 0, data: { "a,b": false } } }] };
const watchValue = item => item.children.find(child => child.className === "var-value").textContent;

test("Watch reads recorded variables, nested arrays, dynamic indices, properties and lengths", () => {
  const { context: c } = setup();
  for (const [expression, expected] of [["h", 5], ["queue[0][0]", 5], ["queue[k][0]", 7], ["queue[-1][1]", 0], ["len(queue)", 2], ["queue.length", 2], ["node.val", 0], ['node.data["a,b"]', false], ["len(node.data)", 1]]) {
    const result = c.resolveDebugWatch(expression, step);
    assert.equal(result.found, true, expression);
    assert.equal(result.value, expected, expression);
  }
  assert.equal(c.formatVarValue(c.resolveDebugWatch("queue[0]", step).value), "[5, 0]");
  assert.equal(c.formatVarValue(step.vars[2].value), "[[5, 0], [7, 0]]");
  assert.equal(c.formatVarValue({ zero: 0, flag: false }), '{"zero":0,"flag":false}');
  assert.deepEqual(Array.from(c.splitDebugWatches('h, node.data["a,b"], len(queue)')), ["h", 'node.data["a,b"]', "len(queue)"]);
});

test("Watch never executes expressions and distinguishes invalid paths from missing values", () => {
  const { context: c } = setup();
  for (const [expression, error] of [["queue[99]", "index"], ["queue[-3]", "index"], ["queue[h]", "index"], ["heap", "missing"], ["queue[i]", "missing"], ["h + 1", "syntax"], ["alert(1)", "syntax"], ["node.constructor", "syntax"], ['node["__proto__"]', "syntax"], ["len(h)", "length"]]) {
    const result = c.resolveDebugWatch(expression, step);
    assert.equal(result.found, false, expression);
    assert.equal(result.error, error, expression);
  }
  const live = { vars: [{ name: "queue", value: "[[5, 0]]", rawValue: [[5, 0]] }] };
  assert.equal(c.resolveDebugWatch("queue[0][0]", live).value, 5);
  const liveSource = fs.readFileSync(require.resolve("../public/live-editor.js"), "utf8");
  assert.match(liveSource, /value: formatLiveValue\(value\), rawValue: value/);
});

test("Watch click, Enter, remove and step updates work without resetting the visualization", () => {
  const { context: c, nodes, events } = setup();
  c.steps = [step];
  c.renderVars(step);
  assert.match(nodes.watchInput.placeholder, /h, k, queue/);
  assert.match(nodes.watchHint.textContent, /queue\[0\], len\(queue\)/);
  nodes.watchInput.value = "queue[0], len(queue), queue[0], heap";
  events.click[0]({ target: { id: "watchAddBtn" } });
  assert.equal(nodes.watchGrid.children.length, 3);
  assert.equal(watchValue(nodes.watchGrid.children[0]), "[5, 0]");
  assert.equal(watchValue(nodes.watchGrid.children[1]), "2");
  assert.equal(watchValue(nodes.watchGrid.children[2]), "Không có ở bước này");
  assert.equal(nodes.watchGrid.children[2].classList.contains("missing"), true);
  const next = { vars: [{ name: "queue", value: [[4, 0], [5, 0], [7, 0]] }, { name: "heap", value: [] }] };
  c.steps.push(next); c.stepIndex = 1;
  c.renderVars(next, step);
  assert.equal(watchValue(nodes.watchGrid.children[0]), "[4, 0]");
  assert.equal(watchValue(nodes.watchGrid.children[1]), "3");
  assert.equal(nodes.watchGrid.children[0].classList.contains("changed"), true);
  assert.equal(nodes.watchGrid.children[2].classList.contains("missing"), false);
  events.click[0]({ target: { dataset: { removeWatch: "heap" } } });
  assert.equal(nodes.watchGrid.children.length, 2);
  nodes.watchInput.value = "queue[-1]";
  let prevented = false;
  events.keydown[0]({ target: { id: "watchInput" }, key: "Enter", preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(watchValue(nodes.watchGrid.children[2]), "[7, 0]");
  assert.equal(c.stepIndex, 1);
});

test("empty Watch provides feedback and missing values are localized", () => {
  const { context: c, nodes } = setup();
  nodes.watchInput.value = "   ";
  c.addDebugWatchFromInput();
  assert.match(nodes.watchHint.textContent, /Nhập tên biến/);
  assert.equal(nodes.watchInput.attributes["aria-invalid"], "true");
  c.lang = "en";
  assert.equal(c.debugWatchError("missing"), "Not available at this step");
});
