'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[1368];
const definitions = require('../problems/minimum-cost-grid-1368-methods');

function oracle(grid) {
  const rows=grid.length, cols=grid[0].length, total=rows*cols;
  let best=Array(total).fill(Infinity); best[0]=0;
  for(let turn=0;turn<total-1;turn++) {
    const next=best.slice();
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
      for(const [k,dr,dc] of [[1,0,1],[2,0,-1],[3,1,0],[4,-1,0]]) {
        const nr=r+dr,nc=c+dc;
        if(nr>=0&&nr<rows&&nc>=0&&nc<cols) next[nr*cols+nc]=Math.min(next[nr*cols+nc],best[r*cols+c]+Number(grid[r][c]!==k));
      }
    }
    if(next.every((value,i)=>value===best[i])) break;
    best=next;
  }
  return best.at(-1);
}

function verifyRoute(grid,result) {
  const view=result.steps.at(-1).arrow1368View,route=view.route;
  assert.deepEqual(route[0],[0,0]);
  assert.deepEqual(route.at(-1),[grid.length-1,grid[0].length-1]);
  assert.equal(new Set(route.map(cell=>cell.join(','))).size,route.length);
  let cost=0;
  for(let i=1;i<route.length;i++) {
    const [r,c]=route[i-1],[nr,nc]=route[i];
    const direction=[[0,1],[0,-1],[1,0],[-1,0]].findIndex(([dr,dc])=>r+dr===nr&&c+dc===nc)+1;
    assert.ok(direction>0);
    cost+=Number(grid[r][c]!==direction);
  }
  assert.equal(cost,result.answer);
  assert.equal(view.changes.length,cost);
  assert.equal(view.answer,result.answer);
  assert.equal(view.source.timing,'return');
}

let seed=1368;
const random=limit=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%limit;};
const cases=[[[1]],[[4]],[[1,2],[4,3]],[[1,1,3],[3,2,2],[1,1,4]],[[1,1,3],[3,2,2],[1,2,4]],[[2,2,2]],[[4],[4],[4]],[[3,3,3],[1,1,1]]];
for(let i=0;i<20;i++) {const rows=1+random(3),cols=1+random(3);cases.push(Array.from({length:rows},()=>Array.from({length:cols},()=>1+random(4))));}

test('1368 registers five solutions, complexities and the recommended default',()=>{
  assert.equal(problem.id,1368);
  assert.equal(problem.debugMode,'line-by-line');
  assert.equal(problem.extraParams[0].options.length,5);
  assert.equal(problem.extraParams[0].default,3);
  for(let i=1;i<=5;i++) {
    const suffix=i===1?'':i;
    assert.ok(problem[`code${suffix}`].length>20);
    assert.equal(problem[`complexity${suffix}`].time,definitions[i-1].time);
    assert.equal(problem[`complexity${suffix}`].space,'O(MN)');
  }
  assert.equal(problem.builder('1').steps[0].codeBlock,3);
  const deployment=JSON.parse(fs.readFileSync(require.resolve('../vercel.json'),'utf8'));
  assert.ok(deployment.functions['server.js'].includeFiles.includes('problems/arrow-grid-trace.py'));
});

test('1368 all five Python algorithms agree with an independent oracle; paths and changes are valid',()=>{
  for(const grid of cases) {
    const frozen=JSON.stringify(grid),expected=oracle(grid);
    for(let approach=1;approach<=5;approach++) {
      const result=problem.builder(grid,{approach});
      assert.equal(result.answer,expected,JSON.stringify({grid,approach}));
      assert.equal(JSON.stringify(grid),frozen);
      verifyRoute(grid,result);
      assert.equal(result.steps.filter(step=>step.final).length,1);
      assert.ok(result.steps.every(step=>step.codeBlock===approach&&step.codeLines.length===1&&definitions[approach-1].code[step.codeLines[0]-1]===step.arrow1368View.source.text));
    }
  }
});

test('1368 weights use the arrow at departure and distance snapshots match executed source lines',()=>{
  for(const approach of [2,3,5]) {
    const result=problem.builder(problem.defaultInput,{approach});
    for(const step of result.steps) {
      const view=step.arrow1368View,source=view.source.text.trim();
      if(source.startsWith('nd =')) {
        const {r,c,k,w}=view.locals;
        assert.equal(w,Number(result.original[r][c]!==k));
        assert.equal(view.probe.weight,w);
      }
      if(source.startsWith('parent[')) {
        const {nr,nc,nd}=view.locals;
        assert.equal(view.cells.flat().find(cell=>cell.r===nr&&cell.c===nc).distance,nd);
      }
    }
    const first=JSON.stringify(result.steps[0]);
    result.steps.at(-1).arrow1368View.cells[0][0].distance=99;
    assert.equal(JSON.stringify(result.steps[0]),first);
  }
});

test('1368 Python code also executes in native CPython',()=>{
  const program=`import json,sys\np=json.load(sys.stdin)\nanswers=[]\nfor code in p['codes']:\n scope={}\n exec(code,scope)\n answers.append([scope['Solution']().minCost(grid) for grid in p['cases']])\nprint(json.dumps(answers))`;
  const python=spawnSync(process.env.PYTHON||'python3',['-c',program],{input:JSON.stringify({codes:definitions.map(d=>d.code.join('\n')),cases}),encoding:'utf8'});
  assert.equal(python.status,0,python.stderr);
  for(const answers of JSON.parse(python.stdout)) assert.deepEqual(answers,cases.map(oracle));
});

test('1368 larger grids preserve complete answers and explicitly disclose condensed traces',()=>{
  const official=Array.from({length:4},(_,r)=>Array(4).fill(r%2?2:1));
  for(const approach of [2,3,4,5]) assert.equal(problem.builder(official,{approach}).answer,3);
  const large=Array.from({length:100},()=>Array(100).fill(1));
  for(const approach of [2,3,4]) {
    const result=problem.builder(large,{approach});
    assert.equal(result.answer,99);
    verifyRoute(large,result);
    assert.ok(result.steps.length<=1601);
    const view=result.steps.at(-1).arrow1368View;
    assert.equal(view.trace.truncated,true);
    assert.equal(view.trace.events,view.trace.captured+view.trace.omitted);
    assert.equal(view.cropped,true);
    assert.ok(view.cells.flat().length<=25);
  }
});

test('1368 validates input and exposes practical demo limits for the slow methods',()=>{
  assert.deepEqual(problem.parseInput('1,2|3,4'),[[1,2],[3,4]]);
  assert.deepEqual(problem.liveArgs('[[1,2],[3,4]]'),[[[1,2],[3,4]]]);
  for(const bad of ['',[],[[]],[[0]],[[5]],[[1],[1,2]],'[[1],','1,;2,3',[[NaN]],[[1.5]],[[null]],Array(2)]) assert.throws(()=>problem.parseInput(bad),/1368/);
  assert.throws(()=>problem.builder(Array.from({length:4},()=>Array(4).fill(1)),{approach:1}),/12/);
  assert.throws(()=>problem.builder(Array.from({length:13},()=>Array(12).fill(1)),{approach:5}),/144/);
  assert.throws(()=>problem.builder('1',{approach:6}),/1\.\.5/);
});

test('1368 renderer handles every method, transitions, final routes and both languages',()=>{
  const host={innerHTML:''},context={lang:'vi',$:()=>host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-minimum-cost-grid-1368.js'),'utf8'),context);
  for(const approach of [1,2,3,4,5]) {
    const result=problem.builder(problem.defaultInput,{approach});
    for(const language of ['vi','en']) {
      context.lang=language;
      for(const step of [result.steps[0],result.steps.find(step=>step.arrow1368View.probe?.weight===1),result.steps.at(-1)].filter(Boolean)) {
        context.renderArrowGrid1368View(step);
        assert.match(host.innerHTML,/ag1368-grid/);
        assert.match(host.innerHTML,/Compare 5|So sánh 5/);
        assert.doesNotMatch(host.innerHTML,/undefined|NaN|object Object/);
      }
      assert.match(host.innerHTML,/data-answer="1"/);
      assert.equal((host.innerHTML.match(/ag1368-cell [^"]*changed/g)||[]).length,1);
    }
  }
});
