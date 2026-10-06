const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[1678];
const examples = [['G()(al)','Goal'], ['G()()()()(al)','Gooooal'], ['(al)G(al)()()G','alGalooG']];

test('1678 matches examples and mixed token sequences', () => {
  for (const [command,answer] of examples) assert.equal(problem.builder(command).answer,answer);
  const options = ['G','()','(al)'];
  let sequences = [''];
  for (let size=1;size<=5;size++) {
    sequences = sequences.flatMap(prefix=>options.map(token=>prefix+token));
    for (const command of sequences) {
      assert.equal(problem.builder(command).answer,command.replaceAll('()','o').replaceAll('(al)','al'));
      assert.deepEqual(problem.liveArgs(command),[command]);
    }
  }
});

test('1678 appends before moving and skips exactly 1, 2 or 4 input characters', () => {
  const result = problem.builder('G()(al)');
  const writes = result.steps.filter(step=>step.goalParser1678View.phase==='append');
  assert.deepEqual(writes.map(step=>step.goalParser1678View.i),[0,1,3]);
  assert.deepEqual(writes.map(step=>step.goalParser1678View.result),[['G'],['G','o'],['G','o','al']]);
  assert.deepEqual(writes.map(step=>step.codeLines),[[7],[10],[13]]);
  const moves = result.steps.filter(step=>step.goalParser1678View.phase==='advance');
  assert.deepEqual(moves.map(step=>step.goalParser1678View.i),[1,3,7]);
  assert.deepEqual(moves.map(step=>step.goalParser1678View.i-step.goalParser1678View.previous),[1,2,4]);
  assert.deepEqual(moves.map(step=>step.codeLines),[[8],[11],[14]]);
  assert.equal(result.steps.at(-2).goalParser1678View.phase,'end');
  assert.deepEqual(result.steps.at(-2).codeLines,[5]);
  assert.equal(result.steps.at(-1).final,true);
  assert.equal(result.steps.at(-1).goalParser1678View.i,7);
  assert.deepEqual(result.steps[0].goalParser1678View.result,[]);
});

test('1678 validates complete tokens and supports the 100-character boundary', () => {
  for (const invalid of ['', 'G'.repeat(101), '(a)', '(al', 'al', 'G\n', '(al)\r\n', null]) assert.throws(()=>problem.builder(invalid),/1678/);
  for (const command of ['G'.repeat(100),'()'.repeat(50),'(al)'.repeat(25),'G','()','(al)']) {
    assert.equal(problem.builder(command).answer,command.replaceAll('()','o').replaceAll('(al)','al'));
  }
});

test('1678 displayed Python and repository solution agree with examples and repeated tokens', () => {
  const repository = fs.readFileSync(require.resolve('../../Leetcode-sln/string/Leetcode_1678.py'),'utf8');
  assert.equal(repository.split('\n\n\n')[0],problem.code.join('\n'));
  const assertions = examples.map(([command,answer])=>`assert Solution().interpret(${JSON.stringify(command)}) == ${JSON.stringify(answer)}`).join('\n');
  const run = spawnSync('python',['-c',problem.code.join('\n')+'\n'+assertions+"\nassert Solution().interpret('(al)' * 25) == 'al' * 25\n"],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
});

test('1678 renderer covers pointer moves, pending groups and completed output in VI and EN', () => {
  const element = { innerHTML:'', querySelector:()=>({querySelector:()=>null}) };
  const context = { lang:'en', $:()=>element, escapeHtml:String, pick:value=>value[context.lang] };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-goal-parser-1678.js'),'utf8'),context);
  for (const language of ['vi','en']) {
    context.lang = language;
    for (const [command,answer] of examples) {
      for (const step of problem.builder(command).steps) {
        context.renderGoalParser1678View(step);
        assert.doesNotMatch(element.innerHTML,/undefined|NaN/);
      }
      assert.match(element.innerHTML,new RegExp(answer));
      assert.match(element.innerHTML,/gp1678-eof active/);
    }
  }
});
