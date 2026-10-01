const assert = require('node:assert/strict');
const { test } = require('node:test');
const vm = require('node:vm');

const { readFrontendJavaScript, readFrontendStyles } = require('./helpers/frontend-source');
const problem = require('../problems').SUPPORTED[787];

const flights = '0,1,100;1,2,100;2,0,100;1,3,600;2,3,200';

function build(approach) {
  return problem.builder(flights, { n: 4, src: 0, dst: 3, k: 1, approach });
}

test('787 keeps both visualized approaches correct', () => {
  for (const approach of [1, 2]) {
    const run = build(approach);
    assert.equal(run.answer, 700);
    assert.ok(run.steps.length > 10);
    assert.ok(run.steps.every((step) => step.codeLines.length === 1));
    assert.ok(run.steps.every((step) => step.flights787View.approach === approach));
    assert.equal(run.steps.at(-1).flights787View.answer, 700);
  }
});

test('787 renderer is legible and contains no corrupted placeholder text', () => {
  const source = readFrontendJavaScript();
  const start = source.indexOf('function requestedVizEsc(value)');
  const end = source.indexOf('function renderVisitAll847View(step)', start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: (value) => String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;'),
    pick: (value) => typeof value === 'object' && value !== null
      ? (value[context.lang] || value.en || value.vi || '')
      : String(value ?? ''),
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);

  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const approach of [1, 2]) {
      for (const step of build(approach).steps) {
        context.renderFlights787View(step);
        assert.match(element.innerHTML, /requested-viz/);
        assert.match(element.innerHTML, /rv-flight-viz/);
        assert.match(element.innerHTML, /rv-core-graph/);
        assert.doesNotMatch(element.innerHTML, /\?\?\?|undefined|NaN|Infinity/);
      }
    }
  }
});

test('787 ships dedicated high-contrast graph and state styles', () => {
  const css = readFrontendStyles();
  assert.match(css, /\.rv-flight-viz \.rv-core-edge line[^}]*stroke-width:\s*3\.25/s);
  assert.match(css, /\.rv-flight-viz \.rv-core-edge text[^}]*font-size:\s*12px/s);
  assert.match(css, /\.rv-flight-viz \.rv-core-node \.id[^}]*font-size:\s*15px/s);
  assert.match(css, /\.rv-city-costs b[^}]*font-size:\s*20px/s);
  assert.match(css, /\.rv-flight-viz \.rv-core-node\.source circle[^}]*drop-shadow/s);
  assert.match(css, /\.rv-flight-viz \.rv-core-node\.target circle[^}]*drop-shadow/s);
});

test('787 layout stays inside the visualization panel without horizontal scrolling', () => {
  const css = readFrontendStyles();
  assert.match(css, /\.rv-flight-viz \{[^}]*container-type:\s*inline-size[^}]*overflow-x:\s*clip/s);
  assert.match(css, /\.rv-flight-workspace \{[^}]*minmax\(0,\s*1\.25fr\)[^}]*minmax\(0,\s*\.75fr\)/s);
  assert.match(css, /\.rv-flight-viz \.rv-core-graph svg \{[^}]*min-width:\s*0[^}]*width:\s*100%/s);
  assert.match(css, /@container \(max-width:\s*700px\)\s*\{[^}]*\.rv-flight-workspace \{[^}]*grid-template-columns:\s*1fr/s);
});
