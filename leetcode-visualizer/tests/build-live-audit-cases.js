"use strict";

const { SUPPORTED } = require("../problems");
const { extractLiveMethod, prepareDesignLiveRun, prepareGenericLiveArgs } = require("../live-args");

const cases = [];
const skipped = [];

for (const problem of Object.values(SUPPORTED)) {
  const blocks = [1, 2, 3].filter((block) => block === 1 || Array.isArray(problem[`code${block}`]));
  for (const block of blocks) {
    const method = extractLiveMethod(problem, block);
    const params = Object.fromEntries(
      (problem.extraParams || []).map((param) => [param.key, param.default]),
    );
    if (Object.prototype.hasOwnProperty.call(params, "approach")) params.approach = block;
    const code = (block === 3 ? problem.code3 : block === 2 ? problem.code2 : problem.code) || [];
    if (!method) {
      const design = prepareDesignLiveRun(problem, problem.defaultInput, params, block);
      if (!design) {
        skipped.push(`${problem.id}:${block}`);
        continue;
      }
      cases.push({
        id: problem.id,
        block,
        method: design.functionName || design.className,
        code: code.join("\n"),
        args: [],
        design,
      });
      continue;
    }
    try {
      const args = typeof problem.liveArgs === "function"
        ? problem.liveArgs(problem.defaultInput, params)
        : prepareGenericLiveArgs(problem, problem.defaultInput, params, block);
      cases.push({
        id: problem.id,
        block,
        method: method.name,
        code: code.join("\n"),
        args,
      });
    } catch (error) {
      cases.push({ id: problem.id, block, prepareError: String(error.message || error) });
    }
  }
}

process.stdout.write(JSON.stringify({ cases, skipped }));
