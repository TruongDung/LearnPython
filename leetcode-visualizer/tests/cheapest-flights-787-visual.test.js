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

test('787 witnesses distinguish cheaper routes that exceed the stop limit', () => {
  for (const approach of [1,2]) {
    const final = build(approach).steps.at(-1).flights787View;
    assert.deepEqual(final.path.nodes,[0,1,3]);
    assert.equal(final.path.edges.reduce((sum,edge)=>sum+edge.w,0),final.answer);
    assert.ok(final.path.edges.length<=final.k+1);
    assert.deepEqual(final.invalidRoute.nodes,[0,1,2,3]);
    assert.equal(final.invalidRoute.cost,400);
    assert.ok(final.invalidRoute.edges.length>final.k+1);
    const direct = problem.builder('0,1,100;1,2,100;0,2,500',{n:3,src:0,dst:2,k:0,approach}).steps.at(-1).flights787View;
    assert.deepEqual(direct.path.nodes,[0,2]);assert.equal(direct.answer,500);
    assert.equal(direct.invalidRoute.cost,200);
    const missing = problem.builder('0,1,100;1,2,100',{n:3,src:0,dst:2,k:0,approach}).steps.at(-1).flights787View;
    assert.equal(missing.answer,-1);assert.equal(missing.path,null);assert.equal(missing.invalidRoute.edges.length,2);
  }
});

test('787 Bellman-Ford preserves its frozen source row throughout each round', () => {
  const run=build(1);let source=null,round=0;
  assert.equal(run.steps[0].flights787View.allowedFlights,null);
  assert.equal(run.steps[0].flights787View.price,null);
  for(const step of run.steps) {
    const v=step.flights787View;
    if(v.operation==='round-start'){source=[...v.costs];round++;}
    if(v.phase==='rounds'){assert.equal(v.allowedFlights,round);assert.deepEqual(v.oldCost,source);}
  }
  const skipped=run.steps.find(step=>{const v=step.flights787View;return v.allowedFlights===2&&v.currentEdge?.join(',')==='2,3'&&v.operation==='reachable-check';}).flights787View;
  assert.equal(skipped.oldCost[2],null);assert.equal(skipped.costs[2],200);
  assert.equal(skipped.candidate,null);
});

test('787 Dijkstra keeps exact popped states, heap entries and best rows across instructions', () => {
  const run=build(2);let popped=null;
  assert.equal(run.steps[0].flights787View.price,null);assert.equal(run.steps[0].flights787View.city,null);
  for(const step of run.steps) {
    const v=step.flights787View;
    if(v.operation==='heap-pop')popped={city:v.city,price:v.price,used:v.used};
    if(popped){assert.equal(v.city,popped.city);assert.equal(v.price,popped.price);assert.equal(v.used,popped.used);}
    assert.equal(v.allowedFlights,2);
    for(const state of v.heapStates)assert.ok(state.used<=2&&Number.isFinite(state.price));
  }
  const final=run.steps.at(-1).flights787View;
  assert.equal(final.city,3);assert.equal(final.price,700);assert.equal(final.used,2);
  assert.equal(final.bestMatrix[3][2],700);assert.equal(final.bestMatrix[2][2],200);
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
        assert.match(element.innerHTML, /f787-graph/);
        assert.match(element.innerHTML, /marker-end="url\(#f787-arrow-/);
        assert.doesNotMatch(element.innerHTML, /\?\?\?|undefined|NaN|Infinity/);
        assert.doesNotMatch(element.innerHTML, /rv-action-banner/);
        if (step.final) {
          assert.match(element.innerHTML, /f787-edge route" data-flight="0,1"/);
          assert.match(element.innerHTML, /f787-edge route" data-flight="1,3"/);
          assert.match(element.innerHTML, /f787-route invalid/);
          assert.match(element.innerHTML, /× 400/);
          assert.match(element.innerHTML, /✓ 700/);
        }
      }
    }
  }
});

test('787 ships dedicated high-contrast graph and state styles', () => {
  const css = readFrontendStyles();
  assert.match(css, /\.f787-edge\.route > path[^}]*stroke:\s*var\(--rv-green\)/s);
  assert.match(css, /\.f787-edge > text[^}]*12px/s);
  assert.match(css, /\.f787-node text[^}]*15px/s);
  assert.match(css, /\.f787-route\.invalid[^}]*--rv-red/s);
  assert.match(css, /\.f787-node\.source circle/);
  assert.match(css, /\.f787-node\.target circle/);
});

test('787 layout stays inside the visualization panel without horizontal scrolling', () => {
  const css = readFrontendStyles();
  assert.match(css, /\.rv-flight-viz \{[^}]*container-type:\s*inline-size[^}]*overflow-x:\s*clip/s);
  assert.match(css, /\.rv-flight-workspace \{[^}]*minmax\(0,\s*1\.25fr\)[^}]*minmax\(0,\s*\.75fr\)/s);
  assert.match(css, /\.rv-flight-viz \.rv-core-graph svg \{[^}]*min-width:\s*0[^}]*width:\s*100%/s);
  assert.match(css, /@container \(max-width:\s*700px\)\s*\{[^}]*\.rv-flight-workspace \{[^}]*grid-template-columns:\s*1fr/s);
});
