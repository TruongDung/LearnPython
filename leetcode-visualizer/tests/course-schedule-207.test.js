"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[207];
const numCourses = problem.extraParams[0].default;

test("207 uses the requested typed Kahn implementation", () => {
  assert.equal(problem.debugMode, "line-by-line");
  assert.deepEqual(problem.code, [
    "from collections import defaultdict, deque",
    "from typing import List",
    "",
    "class Solution:",
    "    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:",
    "        graph = defaultdict(list)",
    "        indegree = [0] * numCourses",
    "",
    "        for course, prerequisite in prerequisites:",
    "            graph[prerequisite].append(course)",
    "            indegree[course] += 1",
    "",
    "        queue = deque(",
    "            course for course in range(numCourses)",
    "            if indegree[course] == 0",
    "        )",
    "",
    "        processed_count = 0",
    "",
    "        while queue:",
    "            course = queue.popleft()",
    "            processed_count += 1",
    "",
    "            for next_course in graph[course]:",
    "                indegree[next_course] -= 1",
    "",
    "                if indegree[next_course] == 0:",
    "                    queue.append(next_course)",
    "",
    "        return processed_count == numCourses",
  ]);
});

test("207 line-by-line frames point to executable lines in the updated snippet", () => {
  const run = problem.builder(problem.defaultInput, { numCourses });
  assert.equal(run.answer, true);
  assert.ok(run.steps.every(step => step.codeLines.length === 1));
  for (const step of run.steps) {
    assert.ok(problem.code[step.codeLines[0] - 1]?.trim(), `${step.title.en}: ${step.codeLines[0]}`);
  }

  const lines = new Set(run.steps.map(step => step.codeLines[0]));
  for (const line of [5, 6, 7, 9, 10, 11, 13, 18, 20, 21, 22, 24, 25, 27, 28, 30]) {
    assert.ok(lines.has(line), `line ${line}`);
  }
  assert.equal(run.steps.at(-1).codeLines[0], 30);
});

test("207 builder and displayed Python agree for DAGs, cycles, and isolated courses", () => {
  const cases = [
    [4, "1-0,2-1,3-2", true],
    [2, "1-0,0-1", false],
    [3, "", true],
    [5, "1-0,2-0", true],
    [4, "1-0,2-1,0-2", false],
  ];
  for (const [courses, input, expected] of cases) {
    assert.equal(problem.builder(input, { numCourses: courses }).answer, expected);
  }

  const payload = cases.map(([courses, input, expected]) => [
    courses,
    input ? input.split(",").map(edge => edge.split("-").map(Number)) : [],
    expected,
  ]);
  const source = `${problem.code.join("\n")}\nimport json, sys\nfor n, prerequisites, expected in json.load(sys.stdin):\n    assert Solution().canFinish(n, prerequisites) is expected`;
  const execution = spawnSync("python3", ["-c", source], { encoding: "utf8", input: JSON.stringify(payload) });
  assert.equal(execution.status, 0, execution.stderr);
});
