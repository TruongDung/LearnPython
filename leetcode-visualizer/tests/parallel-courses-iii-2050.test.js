"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[2050];

function run(n = 3, relations = [[1, 3], [2, 3]], time = [3, 2, 5]) {
  return problem.builder([n], {
    relations: JSON.stringify(relations),
    time: JSON.stringify(time),
  });
}

function render(step, language = "vi") {
  const treeView = { innerHTML: "" };
  const context = {
    lang: language,
    $: id => { assert.equal(id, "treeView"); return treeView; },
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
    })[char]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8"), context);
  context.renderParallelCourses2050View(step);
  return treeView.innerHTML;
}

test("2050 computes minimum completion time with parallel courses", () => {
  assert.equal(run().answer, 8);
  assert.equal(run(5, [[1, 5], [2, 5], [3, 5], [3, 4], [4, 5]], [1, 2, 3, 4, 5]).answer, 12);
  assert.equal(run(3, [], [5, 2, 4]).answer, 5);
});

test("2050 uses the requested deque code snippet", () => {
  assert.equal(problem.code.join("\n"), `from collections import deque
from typing import List

class Solution:
    def minimumTime(self, n: int, relations: List[List[int]], time: List[int]) -> int:
        graph = [[] for _ in range(n + 1)]
        indegree = [0] * (n + 1)
        finish_time = [0] + time[:]

        for before, after in relations:
            graph[before].append(after)
            indegree[after] += 1

        queue = deque(
            course for course in range(1, n + 1)
            if indegree[course] == 0
        )

        while queue:
            course = queue.popleft()

            for next_course in graph[course]:
                finish_time[next_course] = max(
                    finish_time[next_course],
                    finish_time[course] + time[next_course - 1]
                )

                indegree[next_course] -= 1

                if indegree[next_course] == 0:
                    queue.append(next_course)

        return max(finish_time)`);
});

test("2050 emits timeline, queue, unlock, and critical-path states", () => {
  const result = run();
  const events = new Set(result.steps.map(step => step.parallel2050View.event));
  for (const event of ["setup", "add-edge", "seed-queue", "pop", "update-finish", "release-prereq", "enqueue", "result"]) {
    assert.ok(events.has(event), event);
  }
  for (const step of result.steps) {
    const view = step.parallel2050View;
    assert.equal(view.courses.length, 3);
    assert.equal(view.relations.length, 2);
    assert.equal(view.horizon, 10);
    assert.equal(step.codeLines.every(line => line >= 1 && line <= problem.code.length), true);
  }
  const update = result.steps.find(step => step.parallel2050View.event === "update-finish" && step.parallel2050View.currentCourse === 1);
  assert.equal(update.parallel2050View.previousFinish, 5);
  assert.equal(update.parallel2050View.candidate, 8);
  assert.equal(update.parallel2050View.improved, true);
  const finalView = result.steps.at(-1).parallel2050View;
  assert.equal(finalView.answer, 8);
  assert.deepEqual(finalView.criticalPath, [1, 3]);
  assert.deepEqual(finalView.courses.map(course => [course.start, course.finish]), [[0, 3], [0, 2], [3, 8]]);
});

test("2050 renderer shows prerequisite graph, parallel timeline, and critical result", () => {
  const result = run();
  const update = result.steps.find(step => step.parallel2050View.event === "update-finish" && step.parallel2050View.currentCourse === 1);
  for (const language of ["vi", "en"]) {
    const html = render(update, language);
    assert.match(html, /pc2050-viz/);
    assert.match(html, /pc2050-graph/);
    assert.match(html, /pc2050-edge active/);
    assert.match(html, /pc2050-timeline/);
    assert.match(html, /pc2050-action move/);
    assert.match(html, /pc2050-queue/);
    assert.match(html, /style="left:30%;width:50%"/);
    assert.doesNotMatch(html, /undefined|NaN|object Object/);
  }
  const finalHtml = render(result.steps.at(-1));
  assert.match(finalHtml, /pc2050-edge critical/);
  assert.match(finalHtml, /pc2050-row completed critical/);
  assert.match(finalHtml, /pc2050-result/);
  assert.match(finalHtml, /<strong>8<\/strong>/);
  assert.match(finalHtml, /📘<b>1<\/b>.*→.*📘<b>3<\/b>/);
});

test("2050 picture renderer and no-scroll styles are registered and cache-busted", () => {
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/requested-visualizations.css"), "utf8");
  const renderer = fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8");
  const manifest = JSON.parse(script.match(/const PHASE_FOUR_RENDERER_BUNDLES = Object\.freeze\((\{[\s\S]*?\})\);/)[1].replace(/,\s*}/g, "}"));
  assert.ok(manifest["renderer-requested-visualizations.js"].includes("renderParallelCourses2050View"));
  assert.match(script, /parallel2050View/);
  assert.match(html, /requested-visualizations\.css[^"\n]*parallel2050=picture-v1/);
  assert.match(html, /renderer-requested-visualizations\.js[^"\n]*parallel2050=picture-v1/);
  assert.match(html, /script\.js[^"\n]*parallel2050=picture-v1/);
  assert.match(css, /\.pc2050-viz\s*\{/);
  assert.match(css, /#vizPanel:has\(\.pc2050-viz\) :is\(#codePanel, #codePanel2\)/);
  assert.match(renderer, /function renderParallelCourses2050View\(step\)/);
});
