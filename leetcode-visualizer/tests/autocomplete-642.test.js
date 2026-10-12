const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript, JAVASCRIPT_ASSETS, STYLESHEET_ASSETS } = require('./helpers/frontend-source');
const problem = SUPPORTED[642];
const source = fs.readFileSync(require.resolve('../public/renderer-autocomplete-642.js'), 'utf8');

function renderer(width = 506) {
  const host = { innerHTML: '', clientWidth: width };
  const context = { lang: 'en', $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]) };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { host, context, render: step => { context.renderAutocomplete642View(step); return host.innerHTML; } };
}

test('642 picture renders every build, typing, commit and missing-prefix state in both languages', () => {
  const run = problem.builder('i a#i ');
  const { context, render } = renderer();
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of run.steps) {
      const html = render(step);
      assert.match(html, /ac642-diagram/);
      assert.match(html, /<circle/);
      if (step.autocompleteView.stage !== 'init-empty') assert.match(html, /<path class="ac642-link/);
      assert.doesNotMatch(html, /undefined|NaN|Infinity|NODE INSPECTOR|EDGE PROBE|CACHE UPDATE|EXECUTE|<p>/);
      const view = step.autocompleteView;
      if (view.phase === 'type') {
        assert.equal((html.match(/class="ac642-suggestion /g) || []).length, view.candidates.length);
        if (!view.nodeFound && view.stage === 'return-hot') assert.match(html, /× → \[\]/);
        if (view.stage === 'read-char') {
          assert.match(html, /ac642-dot [^"]*pending/);
          assert.doesNotMatch(html, /class="ac642-suggestion delivered"/);
        }
        if (view.stage === 'return-hot' && view.nodeFound) assert.match(html, /class="ac642-suggestion delivered"/);
      }
      if (view.phase === 'commit') assert.match(html, /↩ \[\]/);
    }
  }
});

test('642 diagram selects the current node, leaves pending edges dashed, and marks misses', () => {
  const { render } = renderer();
  const run = problem.builder('i x');
  for (const step of run.steps.filter(step => step.autocompleteView.phase === 'type')) {
    const view = step.autocompleteView;
    const html = render(step);
    const current = html.match(/<g class="ac642-dot ([^"]*)"[^>]*data-prefix="([^"]*)"/g).find(tag => / current /.test(tag));
    assert.ok(current);
    assert.ok(current.includes(`data-prefix="${view.inspectPrefix}"`));
    if (view.stage === 'read-char') assert.ok(!current.includes('pending'));
    if (!view.nodeFound) assert.ok(current.includes('missing'));
  }
});

test('642 commit updates count and cache picture without presenting root cache as a return', () => {
  const run = problem.builder('i a#');
  const { render } = renderer();
  const saved = run.steps.find(step => step.autocompleteView.stage === 'commit-update');
  assert.equal(saved.autocompleteView.history.find(item => item.sentence === 'i a').count, 1);
  const updated = render(saved);
  assert.match(updated, /ac642-dot [^"]*updated/);
  assert.match(updated, /<strong>1<\/strong>/);
  assert.doesNotMatch(updated, /class="ac642-suggestion delivered"/);
  const reset = run.steps.find(step => step.autocompleteView.stage === 'commit-reset');
  assert.match(render(reset), /↩ ⌂/);
  const done = render(run.steps.at(-1));
  assert.match(done, /↩ \[\]/);
  assert.equal((done.match(/class="ac642-suggestion /g) || []).length, 3);
  assert.doesNotMatch(done, /class="ac642-suggestion delivered"/);
});

test('642 displays ranked frequency bars and highlights the matching prefix once', () => {
  const run = problem.builder('i ');
  const returned = run.steps.findLast(step => step.autocompleteView.stage === 'return-hot');
  assert.deepEqual(returned.autocompleteView.suggestions, ['i love you', 'i love leetcode']);
  const html = renderer().render(returned);
  assert.match(html, /<mark>i <\/mark>love you/);
  assert.match(html, /--ac642-fill:100%/);
  assert.match(html, /--ac642-fill:40%/);
  assert.equal((html.match(/data-sentence="i love you"/g) || []).length, 1);
  assert.equal((html.match(/class="ac642-suggestion /g) || []).length, 2);
});

test('642 folds long paths and excess siblings while keeping the current branch and readable geometry', () => {
  const input = 'abcdefghijklmnopqrstuv';
  const run = problem.builder(input, { sentences: `${input}|zebra|hello|yellow|xray|world|test|other`, times: '9,8,7,6,5,4,3,2' });
  const returned = run.steps.at(-1);
  const { render } = renderer(260);
  const html = render(returned);
  assert.match(html, /hidden nodes/);
  assert.match(html, /data-prefix="abcdefghijklmnopqrstuv"/);
  const bounds = html.match(/viewBox="0 0 (\d+) (\d+)" role="img"/);
  assert.equal(Number(bounds[1]), 234);
  assert.ok(Number(bounds[2]) < 500);
  for (const [_, x] of html.matchAll(/transform="translate\(([\d.]+),/g)) assert.ok(Number(x) >= 19 && Number(x) <= Number(bounds[1]) - 19);
  const initial = render(run.steps.find(step => step.autocompleteView.stage === 'commit-reset') || { ...returned, autocompleteView: { ...returned.autocompleteView, triePath: [{ prefix: '', char: 'ROOT', found: true }], prefix: '', inspectPrefix: '' } });
  assert.match(initial, /<text[^>]*>\+\d+<\/text>/);
});

test('642 renderer escapes user text and does not alter snapshots', () => {
  const run = problem.builder('<', { sentences: '<script>alert|<safe', times: '3,2' });
  const before = JSON.stringify(run);
  const html = renderer().render(run.steps.at(-1));
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;/);
  assert.equal(JSON.stringify(run), before);
});

test('642 picture assets are lazy and the registry uses the new renderer', () => {
  assert.equal(problem.preserveInputWhitespace, true);
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-autocomplete-642.js'));
  assert.ok(STYLESHEET_ASSETS.includes('autocomplete-642.css'));
  assert.match(readFrontendJavaScript(), /renderAutocomplete642View\(step\)/);
  const active = readFrontendIndex().replace(/<template[\s\S]*?<\/template>/g, '');
  assert.doesNotMatch(active, /(?:renderer-)?autocomplete-642\.(?:js|css)/);
});
