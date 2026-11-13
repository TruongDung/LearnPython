'use strict';
// Throwaway probe: widest bucket-chain SVG per 432 preset (not part of the app or test suite).
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..', '..', '..');
const src = fs.readFileSync(path.join(root, 'public', 'renderer-all-one-432.js'), 'utf8');
const host = { innerHTML: '' };
const context = { lang: 'en', document: { getElementById: () => host } };
vm.createContext(context);
vm.runInContext(src, context);
const problem = require(path.join(root, 'problems')).SUPPORTED[432];
for (const [input, , name] of vm.runInContext('AO432_CASES', context)) {
  const steps = problem.builder(input).steps;
  let widest = 0;
  steps.forEach((step, index) => {
    context.steps = steps;
    context.stepIndex = index;
    context.renderAllOne432View(step);
    const match = host.innerHTML.match(/class="ao432-svg" width="(\d+)/);
    if (match) widest = Math.max(widest, Number(match[1]));
  });
  console.log(name, widest);
}
