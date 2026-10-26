"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { prepareDesignLiveRun } = require("../live-args");
const problem = require("../problems").SUPPORTED[355];
const WATCHES = ["count", "userId", "uid", "idx", "tweetId", "len(heap)"];
const manyPosts = [...Array.from({ length: 15 }, (_, i) => ["postTweet", 1, i + 1]), ["getNewsFeed", 1]];
const manyUsers = [...Array.from({ length: 16 }, (_, i) => ["postTweet", i + 1, i + 101]),
  ...Array.from({ length: 16 }, (_, i) => ["follow", 0, i + 1]), ["getNewsFeed", 0]];
const CASES = [problem.defaultInput,
  [["getNewsFeed", 7], ["follow", 7, 9], ["getNewsFeed", 7], ["unfollow", 7, 9], ["unfollow", 8, 7], ["getNewsFeed", 8]],
  [["postTweet", 1, 5], ["follow", 1, 1], ["follow", 1, 1], ["getNewsFeed", 1], ["unfollow", 1, 1], ["getNewsFeed", 1]],
  [["postTweet", 0, 0], ["postTweet", 0, 0], ["getNewsFeed", 0], ["getNewsFeed", 0]],
  [["postTweet", 17, 1], ["postTweet", 9, 2], ["postTweet", 1, 3], ["follow", 1, 17], ["follow", 1, 9], ["getNewsFeed", 1], ["getNewsFeed", 17]],
  manyPosts, manyUsers,
];

function oracle(operations) {
  const following = new Map(), tweets = [], results = [];
  for (const { name, args } of operations) {
    if (name === "postTweet") tweets.push({ userId: args[0], tweetId: args[1] });
    else if (name === "follow" || name === "unfollow") {
      if (!following.has(args[0])) following.set(args[0], new Set());
      if (name === "follow") following.get(args[0]).add(args[1]); else following.get(args[0]).delete(args[1]);
    } else {
      const eligible = new Set([args[0], ...(following.get(args[0]) || [])]);
      results.push([...tweets].reverse().filter(tweet => eligible.has(tweet.userId)).slice(0, 10).map(tweet => tweet.tweetId));
      continue;
    }
    results.push(null);
  }
  return results;
}

test("355 agrees with an independent timeline oracle across follow changes, self-follow and repeated queries", () => {
  let seed = 355;
  const random = max => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % max; };
  const cases = [...CASES];
  for (let sample = 0; sample < 45; sample++) cases.push(Array.from({ length: 35 }, (_, i) => {
    const user = random(6), other = random(6), kind = random(4);
    return kind === 0 ? ["postTweet", user, i] : kind === 1 ? ["follow", user, other] : kind === 2 ? ["unfollow", user, other] : ["getNewsFeed", user];
  }));
  for (const input of cases) {
    const operations = problem.parseTwitter355Operations(input), expected = oracle(operations), run = problem.builder(input);
    assert.deepEqual(run.designResults, expected);
    assert.deepEqual(run.answer, expected.filter(Array.isArray).at(-1) || []);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    assert.ok(run.steps.at(-1).final);
    let previous = null;
    for (const step of run.steps) {
      const v = step.twitterView, line = step.codeLines[0], posts = Object.values(v.tweets).flat();
      assert.equal(step.codeLines.length, 1);
      assert.equal(new Set(posts.map(tweet => tweet.ts)).size, posts.length);
      assert.equal(posts.length, -v.count + (line === 9 ? 1 : 0));
      assert.deepEqual(step.vars.map(variable => variable.name), WATCHES);
      assert.deepEqual(step.vars.map(variable => variable.value), [v.count ?? "—", v.locals.userId ?? "—", v.locals.uid ?? "—", v.locals.idx ?? "—", v.locals.tweetId ?? "—", v.heapReady ? v.heap.length : "—"]);
      if (v.currentFeed) {
        assert.ok(v.result.length <= 10);
        assert.deepEqual(v.heap.map(entry => [entry.ts, entry.tweetId, entry.userId, entry.idx]), v.locals.heap);
        assert.equal(new Set(v.heap.map(entry => entry.userId)).size, v.heap.length);
        v.heap.forEach((entry, i) => {
          const original = v.tweets[entry.userId][entry.idx];
          assert.deepEqual([entry.ts, entry.tweetId], [original.ts, original.tweetId]);
          if (i) assert.ok(v.heap[Math.floor((i - 1) / 2)].ts < entry.ts);
        });
        assert.deepEqual(v.resultEntries.map(entry => entry.tweetId), v.result);
        v.resultEntries.forEach((entry, i) => {
          assert.ok(v.eligibleIds.includes(entry.userId));
          if (i) assert.ok(v.resultEntries[i - 1].ts < entry.ts);
        });
        if (previous?.activeIndex === v.activeIndex) {
          if (line === 21) { assert.deepEqual(v.action, { kind: "pop", ...previous.heap[0] }); assert.deepEqual(v.result, previous.result); }
          else if (line === 22) assert.deepEqual(v.result, [...previous.result, v.locals.tweetId]);
          else assert.deepEqual(v.result, previous.result);
        }
      }
      previous = v;
    }
  }
  const limited = problem.builder(manyPosts).steps.at(-1).twitterView;
  assert.equal(limited.result.length, 10);
  assert.equal(limited.heap.length, 1, "the return frame retains the older candidate queued by line 26");
  assert.equal(problem.builder(manyUsers).steps.at(-1).twitterView.heap.length, 6);
});

test("355 globals, local variables and heap order match CPython after every executed line", () => {
  const payload = CASES.map(input => ({ operations: problem.parseTwitter355Operations(input), code: problem.code.join("\n") }));
  const program = `
import json, sys
runs = []
def normalize(value):
    if isinstance(value, set): return sorted(value)
    if isinstance(value, dict): return {str(k): normalize(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)): return [normalize(v) for v in value]
    return value
for case in json.load(sys.stdin):
    namespace = {}
    exec(case['code'], namespace)
    events, pending = [], None
    def snapshot(frame, line):
        events.append({'line': line, 'globals': normalize(frame.f_locals['self'].__dict__), 'locals': normalize({name: value for name, value in frame.f_locals.items() if name != 'self'})})
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_name not in ('__init__', 'postTweet', 'getNewsFeed', 'follow', 'unfollow'):
            return trace
        if event == 'line':
            if pending is not None:
                snapshot(frame, pending)
            pending = frame.f_lineno
        elif event == 'return':
            snapshot(frame, pending)
            pending = None
        return trace
    sys.settrace(trace)
    instance = namespace['Twitter']()
    results = [getattr(instance, operation['name'])(*operation['args']) for operation in case['operations']]
    sys.settrace(None)
    runs.append({'results': results, 'events': events})
print(json.dumps(runs))
`;
  const python = spawnSync(process.env.PYTHON || "python3", ["-c", program], { input: JSON.stringify(payload), encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(python.status, 0, python.stderr);
  JSON.parse(python.stdout).forEach((reference, index) => {
    const run = problem.builder(CASES[index]);
    assert.deepEqual(run.designResults, reference.results);
    assert.equal(run.steps.length, reference.events.length);
    run.steps.forEach((step, i) => {
      const v = step.twitterView, e = reference.events[i], label = `case ${index}, event ${i}, line ${e.line}`;
      assert.deepEqual(step.codeLines, [e.line], label);
      assert.deepEqual(v.globals, e.globals, label);
      assert.deepEqual(v.locals, e.locals, label);
      assert.deepEqual(v.source, { line: e.line, text: problem.code[e.line - 1], timing: "after" });
    });
  });
});

test("355 strictly parses call strings and JSON and preserves the class-based live runner", () => {
  const expected = [{ name: "postTweet", args: [1, 5] }, { name: "getNewsFeed", args: [1] }];
  for (const input of ["postTweet(1,5);getNewsFeed(1)", "postTweet(1,5)\ngetNewsFeed(1)", "postTweet(1,5), getNewsFeed(1)", expected, [["postTweet", 1, 5], ["getNewsFeed", 1]], JSON.stringify(expected)]) {
    assert.equal(problem.liveArgs, undefined);
    assert.deepEqual(prepareDesignLiveRun(problem, input), { className: "Twitter", constructorArgs: [], operations: expected });
    assert.deepEqual(problem.builder(input).answer, [5]);
  }
  for (const input of ["", null, [], Array(2), "Twitter()", "unknown(1)", "postTweet(1)", "getNewsFeed(1,2)", "getNewsFeed()", "postTweet(-1,2)", "postTweet(1,1.5)", "postTweet(1,NaN)", "getNewsFeed(1);not_a_call", "[1", [["postTweet", true, 5]], [["postTweet", 1, Infinity]], [["getNewsFeed", Number.MAX_SAFE_INTEGER + 1]], Array(101).fill(["getNewsFeed", 1])]) {
    assert.throws(() => problem.builder(input)); assert.throws(() => prepareDesignLiveRun(problem, input));
  }
  const ops = [...Array.from({ length: 99 }, (_, i) => ["postTweet", 0, i]), ["getNewsFeed", 0]];
  const run = problem.builder(ops);
  assert.deepEqual(run.answer, Array.from({ length: 10 }, (_, i) => 98 - i));
  assert.equal(run.steps.at(-1).twitterView.count, -99);
});

function renderer(language) {
  const host = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] };
  const context = { lang: language, $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-design-twitter-355.js"), "utf8"), context);
  return { host, context };
}

test("355 pictures retain all timeline cards, actual heap candidates and only appended feed entries", () => {
  for (const language of ["vi", "en"]) for (const input of CASES) {
    const { host, context } = renderer(language), run = problem.builder(input);
    for (const step of run.steps) {
      const v = step.twitterView, before = JSON.stringify(step);
      context.renderDesignTwitter355Pictures(step);
      assert.match(host.innerHTML, /class="tw355p-viz/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object|<p[ >]|<table/);
      const timelines = host.innerHTML.split('<div class="tw355p-details">')[0];
      assert.equal((timelines.match(/class="tw355p-tweet /g) || []).length, Object.values(v.tweets).flat().length);
      assert.equal((host.innerHTML.match(/class="tw355p-node /g) || []).length, v.heap.length);
      assert.equal((host.innerHTML.match(/class="tw355p-feed-item /g) || []).length, v.result.length);
      if (v.phase === "unfollow" && v.action.from !== v.action.to) assert.match(host.innerHTML, /tw355p-avatar removed/);
      if (v.phase === "back") assert.match(host.innerHTML, /tw355p-direction">←/);
      assert.equal(JSON.stringify(step), before);
    }
    context.renderDesignTwitter355Pictures(run.steps[0]); const first = host.innerHTML;
    context.renderDesignTwitter355Pictures(run.steps.at(-1)); context.renderDesignTwitter355Pictures(run.steps[0]);
    assert.equal(host.innerHTML, first);
  }
});

test("355 uses a dedicated lazy renderer and theme-aware fixed watches", () => {
  assert.equal(problem.debugMode, "line-by-line");
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const prefix = script.slice(0, script.indexOf("\nfunction ", script.indexOf("const ORDERED_RENDERER_REGISTRY")));
  const context = { renderDesignTwitter355Pictures: step => { context.rendered = step; } };
  vm.createContext(context); vm.runInContext(prefix + "\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;", context);
  const step = problem.builder().steps[0], entry = context.registry.find(item => item.predicate(step));
  assert.equal(entry.surface, "treeView"); entry.render(step); assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  for (const asset of ["design-twitter-355.css", "renderer-design-twitter-355.js"]) {
    assert.equal(html.split(asset + "?").length - 1, 1);
    assert.ok(!html.replace(/<template[\s\S]*?<\/template>/g, "").includes(asset));
  }
  const css = fs.readFileSync(require.resolve("../public/design-twitter-355.css"), "utf8");
  assert.match(css, /\[data-theme="light"\] \.tw355p-viz/);
  assert.match(css, /#varsPanel\.vars-panel[^}]*position: sticky/);
});
