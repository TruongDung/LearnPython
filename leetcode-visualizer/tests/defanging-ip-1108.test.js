const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[1108];

test('1108 matches examples and preserves all digits across boundary addresses', () => {
  const addresses = ['1.1.1.1','255.100.50.0','0.0.0.0','255.255.255.255','192.168.1.10','10.20.30.40'];
  for (const address of addresses) {
    const result = problem.builder(address);
    assert.equal(result.answer, address.split('.').join('[.]'));
    assert.equal(result.answer.length, address.length + 6);
    assert.deepEqual(problem.liveArgs(address), [address]);
    assert.equal(result.steps.at(-1).defang1108View.replaced, 3);
    assert.equal(result.steps.at(-1).final, true);
    const writes = result.steps.filter(step => ['append-dot','append-digit'].includes(step.defang1108View.phase));
    assert.equal(writes.length, address.length);
    writes.forEach((step, i) => assert.equal(step.defang1108View.result.join(''), address.slice(0, i+1).replaceAll('.','[.]')));
  }
});

test('1108 dot check does not write until append and replayed snapshots stay immutable', () => {
  const steps = problem.builder('1.1.1.1').steps;
  const check = steps.find(step => step.defang1108View.phase === 'check' && step.defang1108View.index === 1);
  assert.deepEqual(check.defang1108View.result, ['1']);
  assert.deepEqual(check.codeLines, [5]);
  const append = steps.find(step => step.defang1108View.phase === 'append-dot');
  assert.deepEqual(append.defang1108View.result, ['1','[.]']);
  assert.deepEqual(append.codeLines, [6]);
  assert.deepEqual(steps[0].defang1108View.result, []);
  assert.equal(steps.at(-1).defang1108View.result.join(''), '1[.]1[.]1[.]1');
});

test('1108 reports malformed addresses', () => {
  for (const input of ['', '1.1.1', '1.1.1.1.1', '256.0.0.1', '1..1.1', 'abc', '::1', 123]) assert.throws(() => problem.builder(input), /IPv4/);
});

test('1108 displayed Python and repository solution match the visualizer', () => {
  const repository = fs.readFileSync(require.resolve('../../Leetcode-sln/string/Leetcode_1108.py'), 'utf8');
  assert.equal(repository.split('\n\n\n')[0], problem.code.join('\n'));
  const checks = "\nfor address in ['1.1.1.1', '255.100.50.0', '0.0.0.0', '255.255.255.255']:\n    assert Solution().defangIPaddr(address) == address.replace('.', '[.]')\n";
  const execution = spawnSync('python', ['-c', problem.code.join('\n') + checks], { encoding:'utf8' });
  assert.equal(execution.status, 0, execution.stderr);
});

test('1108 renderer displays output groups and their actual character count in VI and EN', () => {
  const element = { innerHTML:'', querySelector:() => ({querySelector:() => null}) };
  const context = { lang:'en', $:() => element, escapeHtml:String, pick:value => value[context.lang] };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-defanging-ip-1108.js'),'utf8'), context);
  for (const language of ['vi','en']) {
    context.lang = language;
    for (const step of problem.builder('1.1.1.1').steps) {
      context.renderDefang1108View(step);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
    }
    assert.match(element.innerHTML, /1\[\.\]1\[\.\]1\[\.\]1/);
    assert.match(element.innerHTML, /13 (?:ký tự output|output characters)/);
  }
});
