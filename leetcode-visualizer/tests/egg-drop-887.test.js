'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED[887];
const requested=`class Solution:
    def superEggDrop(self, k: int, n: int) -> int:
        dp = [0 for _ in range(k + 1)]
        moves = 0

        while dp[k] < n:
            moves += 1
            for i in range(k, 0, -1):
                dp[i] = 1 + dp[i] + dp[i - 1]

        return moves`;
function renderer(){const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-physical-dp.js'),'utf8'),ctx);return ctx;}
test('887 preserves the user source exactly and exposes only the one-dimensional lesson',()=>{
 assert.equal(p.code.join('\n'),requested);assert.equal(p.code2,undefined);assert.deepEqual(p.extraParams.map(param=>param.key),['n']);assert.equal(p.complexity.time,'O(k × moves)');assert.equal(p.complexity.space,'O(k)');assert.equal(p.debugMode,'line-by-line');assert.deepEqual(p.liveArgs([2],{n:100}),[2,100]);
 for(const[input,params]of[[[0],{n:6}],[[9],{n:6}],[[2,3],{n:6}],[[1.5],{n:6}],[[2],{n:-1}],[[2],{n:201}],[[2],{n:1.5}]])assert.throws(()=>p.builder(input,params),/887/);
});
test('887 descending writes read two previous-move cells and never a cell already updated in this move',()=>{
 for(const[k,n,expected]of[[2,6,3],[3,14,4],[1,200,200],[8,200,8],[2,0,0]]){
  const run=p.builder([k],{n});assert.equal(run.answer,expected);let writes=[];
  for(const step of run.steps){const v=step.catalogLessonView,x=v.locals,a=v.egg887;assert.equal(v.source,p.code[v.line-1]);assert.equal(step.codeBlock,1);assert.ok(x.dp.every(Number.isInteger));assert.equal(x.dp.length,k+1);assert.equal(x.dp[0],0);assert.equal(a.history.length<=6,true);
   if(v.line===7)writes=[];
   if(v.line===9){const before=v.oldValues.dp;assert.ok(Array.isArray(before));assert.equal(before[x.i],a.previous[x.i]);assert.equal(before[x.i-1],a.previous[x.i-1]);assert.equal(x.dp[x.i],1+before[x.i]+before[x.i-1]);for(let i=0;i<x.i;i++)assert.equal(x.dp[i],a.previous[i]);for(let i=x.i+1;i<=k;i++)assert.equal(x.dp[i],1+a.previous[i]+a.previous[i-1]);writes.push(x.i);assert.equal(a.history.at(-1)?.moves??0,x.moves-1);}
   if(v.line===8&&v.branch===false){assert.deepEqual(writes,Array.from({length:k},(_,i)=>k-i));assert.equal(a.complete,true);assert.equal(a.history.at(-1).coverage,x.dp[k]);assert.equal(a.history.at(-1).moves,x.moves);}
  }
  const final=run.steps.at(-1).catalogLessonView;assert.ok(final.locals.dp[k]>=n);if(n)assert.ok(final.egg887.previous[k]<n);assert.equal(final.locals.moves,run.answer);assert.equal(final.trace.truncated,false);assert.ok(JSON.stringify(run).length<4.5*1024*1024);
 }
});
test('887 bilingual pictures reveal updates only on assignment and preserve rewind snapshots',()=>{
 const ctx=renderer();for(const[k,n]of[[2,6],[1,1],[3,14],[2,0],[8,200]]){const run=p.builder([k],{n}),saved=JSON.stringify(run);
  for(const step of run.steps)for(const lang of['vi','en']){const v=step.catalogLessonView,x=v.locals,html=ctx.renderPhysicalDp(v,lang);assert.match(html,/data-physical-id="887"/);assert.doesNotMatch(html,/NaN|undefined|\[object Object\]|iv-source|iv-debug|data-code-line|pd-tower/);assert.equal(html.includes('data-physical-result='),v.final);assert.equal(html.includes('data-egg-first-drop='),v.final&&n>0);assert.match(html,new RegExp(`data-egg-coverage="${x.dp[k]}"`));
   if(v.line===8&&v.branch===true)assert.match(html,/data-egg-new-value="pending"/);
   if(v.line===9){assert.match(html,new RegExp(`data-egg-new-value="${x.dp[x.i]}"`));assert.match(html,new RegExp(`data-egg-old-same="${v.egg887.previous[x.i]}"`));assert.match(html,new RegExp(`data-egg-old-lower="${v.egg887.previous[x.i-1]}"`));}
   assert.equal(ctx.renderPhysicalDp(v,lang),html);
  }
  const first=ctx.renderPhysicalDp(run.steps[0].catalogLessonView,'vi');ctx.renderPhysicalDp(run.steps.at(-1).catalogLessonView,'vi');assert.equal(ctx.renderPhysicalDp(run.steps[0].catalogLessonView,'vi'),first);assert.equal(JSON.stringify(run),saved);
 }
 const run=p.builder([2],{n:6}),final=run.steps.at(-1).catalogLessonView;assert.deepEqual(final.locals.dp,[0,3,6]);assert.deepEqual(final.egg887.history,[{moves:1,coverage:1},{moves:2,coverage:3},{moves:3,coverage:6}]);
});
