"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");

const { SUPPORTED } = require("../problems");
const problem = SUPPORTED[879];

test("Profitable Schemes 879 keeps the sample answer and visual state aligned", () => {
  const run = problem.builder(problem.defaultInput, {
    minProfit: 3,
    group: "2,2",
    profit: "2,3",
  });

  assert.equal(run.answer, 2);
  assert.equal(run.steps.at(-1).profitableSchemes879View.answer, 2);
  assert.equal(run.steps.at(-1).profitableSchemes879View.dp[5][3], 2);
  assert.ok(run.steps.every((step) => step.profitableSchemes879View));
  assert.deepEqual(
    run.steps.map((step) => step.profitableSchemes879View.phase),
    ["intro", "crime", "crime", "result"],
  );
});

test("Profitable Schemes 879 exposes before/after plans and source states per crime", () => {
  const run = problem.builder([5], {
    minProfit: 3,
    group: "2,2",
    profit: "2,3",
  });
  const firstCrime = run.steps[1].profitableSchemes879View;
  const secondCrime = run.steps[2].profitableSchemes879View;

  assert.deepEqual(firstCrime.crimes[0], { index: 0, members: 2, gain: 2 });
  assert.equal(firstCrime.beforeDp[2][2], 0);
  assert.equal(firstCrime.dp[2][2], 1);
  assert.ok(firstCrime.updates.some((update) =>
    update.members === 2 && update.profit === 2 &&
    update.sourceMembers === 0 && update.sourceProfit === 0 &&
    update.previous === 0 && update.added === 1 && update.after === 1,
  ));
  assert.equal(secondCrime.dp[5][3], 2);
});

test("Profitable Schemes 879 handles zero required profit and an unusable crime", () => {
  const run = problem.builder([3], {
    minProfit: 0,
    group: "4",
    profit: "0",
  });

  assert.equal(run.answer, 1);
  assert.equal(run.steps.at(-1).profitableSchemes879View.dp[3][0], 1);
  assert.equal(run.steps.at(-1).profitableSchemes879View.crimes.length, 1);
});

test("879 pictured subsets and both branches match exhaustive counting at every prefix", () => {
  let seed = 879;
  const random = max => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % max; };
  for (let c = 0; c < 250; c++) {
    const jobs = 1 + random(7), n = 1 + random(8), minProfit = random(7);
    const group = Array.from({length:jobs}, () => 1 + random(5));
    const profit = Array.from({length:jobs}, () => random(6));
    const run = problem.builder([n], {minProfit,group:group.join(','),profit:profit.join(',')});
    for (const step of run.steps) {
      const v = step.profitableSchemes879View;
      let total = 0, take = 0, skip = 0;
      for (let mask = 0; mask < 2 ** v.processedCount; mask++) {
        let people = 0, gain = 0;
        for (let i = 0; i < v.processedCount; i++) if (mask & (1 << i)) { people += group[i]; gain += profit[i]; }
        if (people <= n && gain >= minProfit) {
          total++;
          if (v.activeCrime !== null && (mask & (1 << v.activeCrime))) take++; else skip++;
        }
      }
      assert.equal(v.count, total);
      if (v.phase === 'crime') { assert.equal(v.takeCount,take); assert.equal(v.skipCount,skip); }
      for (const plan of [...v.samples,...v.skipSamples,...v.takeSamples]) {
        assert.equal(new Set(plan.jobs).size,plan.jobs.length);
        assert.ok(plan.jobs.every(i=>i >= 0 && i < v.processedCount));
        assert.equal(plan.members,plan.jobs.reduce((sum,i)=>sum+group[i],0));
        assert.equal(plan.profit,plan.jobs.reduce((sum,i)=>sum+profit[i],0));
      }
      assert.ok(v.samples.every(plan=>plan.members<=n && plan.profit>=minProfit));
      assert.ok(v.skipSamples.every(plan=>!plan.jobs.includes(v.activeCrime)));
      assert.ok(v.takeSamples.every(plan=>plan.jobs.includes(v.activeCrime)));
      assert.ok(step.codeLines.every(line=>line>=1 && line<=problem.code.length));
      assert.equal(step.codeBlock,undefined);
    }
  }
});

test("879 samples preserve distinct identical jobs and stay bounded with 100 jobs", () => {
  const small = problem.builder([1],{minProfit:1,group:'1,1',profit:'1,1'});
  assert.equal(small.answer,2);
  assert.deepEqual(small.steps.at(-1).profitableSchemes879View.samples.map(p=>p.jobs),[[0],[1]]);
  let expected=1n, choose=1n;
  for(let k=1;k<=10;k++) { choose=choose*BigInt(101-k)/BigInt(k); expected+=choose; }
  const large=problem.builder([10],{minProfit:0,group:Array(100).fill(1).join(','),profit:Array(100).fill(0).join(',')});
  assert.equal(large.answer,Number(expected%1000000007n));
  for(const step of large.steps) {
    const v=step.profitableSchemes879View;
    assert.ok(v.samples.length<=6 && v.skipSamples.length<=2 && v.takeSamples.length<=2);
  }
  assert.equal(large.steps.at(-1).profitableSchemes879View.examplesOnly,true);
});

test("879 pictures render both languages, correct threshold axes and real examples", () => {
  const host={innerHTML:'',querySelector:()=>null};
  const context={lang:'vi',$:()=>host,escapeHtml:String};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-profitable-schemes-879.js'),'utf8'),context);
  for(const params of [{minProfit:3,group:'2,2',profit:'2,3'},{minProfit:0,group:'4',profit:'0'},{minProfit:12,group:'1,2,3',profit:'100,0,3'}]) {
    const run=problem.builder([3],params), original=JSON.stringify(run);
    for(const language of ['vi','en']) for(const step of run.steps) {
      context.lang=language;context.renderProfitableSchemes879View(step);
      assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|nuevos|CORE RULE/);
      assert.match(host.innerHTML,/ps879-people-meter/);
      assert.match(host.innerHTML,/<th>≥0<\/th>/);
      assert.match(host.innerHTML,/<th>≤0<\/th>/);
      if(step.profitableSchemes879View.phase==='crime') assert.match(host.innerHTML,/ps879-branches/);
      if(step.final) assert.match(host.innerHTML,new RegExp(`<strong>${run.answer}</strong>`));
    }
    assert.equal(JSON.stringify(run),original);
  }
});

test("879 rejects misleading input and displayed Python matches examples", () => {
  for(const [n,params] of [[0,{}],[11,{}],[5,{minProfit:1.5}],[5,{group:'0',profit:'2'}],[5,{group:'2,2',profit:'3'}],[5,{group:'2',profit:'-1'}],[5,{group:'',profit:''}]]) {
    assert.throws(()=>problem.builder([n],params),/879:/);
  }
  const cases=[{n:5,minProfit:3,group:[2,2],profit:[2,3]},{n:3,minProfit:0,group:[4],profit:[0]},{n:1,minProfit:1,group:[1,1],profit:[1,1]}];
  const source=`${problem.code.join('\n')}\nimport json,sys\nfor case in json.load(sys.stdin):\n    assert Solution().profitableSchemes(case['n'],case['minProfit'],case['group'],case['profit']) == case['answer']`;
  const run=spawnSync('python3',['-c',source],{encoding:'utf8',input:JSON.stringify(cases.map(c=>({...c,answer:problem.builder([c.n],{minProfit:c.minProfit,group:c.group.join(','),profit:c.profit.join(',')}).answer})))});
  assert.equal(run.status,0,run.stderr);
});
