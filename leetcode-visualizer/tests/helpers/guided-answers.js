'use strict';
const assert=require('node:assert/strict');
const close=(a,b)=>typeof a==='number'&&typeof b==='number'?Math.abs(a-b)<=Math.max(1e-6,Math.abs(b)*1e-6):Array.isArray(a)&&Array.isArray(b)?a.length===b.length&&a.every((v,i)=>close(v,b[i])):a&&b&&typeof a==='object'&&typeof b==='object'?Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>close(a[k],b[k])):a===b;
const canonical=value=>JSON.stringify(value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b))):value);
function pathCount(grid){const dp=Array(grid[0].length).fill(0);dp[0]=1;for(const row of grid)for(let c=0;c<row.length;c++)dp[c]=row[c]==='#'?0:dp[c]+(c?dp[c-1]:0);return dp.at(-1);}
function verifyAnswer(entry,answer,args=entry.sample){
 const validation=entry.validation;
 if(validation==='unordered-rows'){assert.deepEqual(answer.map(canonical).sort(),entry.expected.map(canonical).sort());return;}
 if(validation==='order-results'){assert.deepEqual(answer.map(v=>Array.isArray(v)?[...v].sort((a,b)=>a-b):v),entry.expected.map(v=>Array.isArray(v)?[...v].sort((a,b)=>a-b):v));return;}
 if(validation==='path-grid'){
  const k=entry.id===3990?args[0]:args[2];
  if(!answer.length){assert.equal(entry.id,3988);const[m,n]=args;let count=1;for(let i=1;i<=Math.min(m-1,n-1);i++)count=count*(m+n-1-i)/i;assert.ok(count<k);return;}
  const m=answer.length,n=answer[0].length;assert.ok(m>0&&n>0);assert.ok(answer.every(row=>typeof row==='string'&&row.length===n&&/^[.#]+$/.test(row)));
  if(entry.id===3988){assert.equal(m,args[0]);assert.equal(n,args[1]);}else assert.ok(m<=25&&n<=25);
  assert.equal(pathCount(answer),k);return;
 }
 if(validation==='grid-layout'){
  const[n,edges]=args,flat=answer.flat(),at=new Map();assert.equal(flat.length,n);assert.equal(new Set(flat).size,n);
  answer.forEach((row,r)=>{assert.equal(row.length,answer[0].length);row.forEach((node,c)=>{assert.ok(Number.isInteger(node)&&node>=0&&node<n);at.set(node,[r,c]);});});
  const connected=new Set(edges.flatMap(([u,v])=>[u+','+v,v+','+u]));
  for(const[u,v]of edges){const a=at.get(u),b=at.get(v);assert.equal(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]),1);}
  for(let r=0;r<answer.length;r++)for(let c=0;c<answer[0].length;c++)for(const[rr,cc]of[[r+1,c],[r,c+1]])if(answer[rr]?.[cc]!==undefined)assert.ok(connected.has(answer[r][c]+','+answer[rr][cc]));return;
 }
 if(validation==='farthest-nodes'){
  const edges=args[0],n=edges.length+1,graph=Array.from({length:n},()=>[]);for(const[u,v]of edges){graph[u].push(v);graph[v].push(u);}assert.equal(answer.length,n);
  for(let start=0;start<n;start++){const distance=Array(n).fill(-1),q=[start];distance[start]=0;for(const node of q)for(const child of graph[node])if(distance[child]<0){distance[child]=distance[node]+1;q.push(child);}assert.equal(distance[answer[start]],Math.max(...distance));}return;
 }
 if(validation==='hamilton-path'){
  const[grid,k]=args;if(!answer.length){assert.equal(entry.expected.length,0);return;}
  assert.equal(answer.length,grid.length*grid[0].length);assert.equal(new Set(answer.map(p=>p.join(','))).size,answer.length);let next=1;
  answer.forEach(([r,c],i)=>{assert.ok(grid[r]?.[c]!==undefined);if(grid[r][c])assert.equal(grid[r][c],next++);if(i){const[a,b]=answer[i-1];assert.equal(Math.abs(a-r)+Math.abs(b-c),1);}});assert.equal(next,k+1);return;
 }
 if(validation==='schedule'){
  const[n]=args;if(n<5){assert.deepEqual(answer,[]);return;}assert.equal(answer.length,n*(n-1));assert.equal(new Set(answer.map(m=>m.join(','))).size,answer.length);
  answer.forEach(([a,b],i)=>{assert.ok(a>=0&&a<n&&b>=0&&b<n&&a!==b);if(i)assert.ok(!answer[i-1].includes(a)&&!answer[i-1].includes(b));});return;
 }
 if(validation==='permutation-order'){
  const[s,x,y]=args;assert.equal([...answer].sort().join(''),[...s].sort().join(''));if(answer.includes(x)&&answer.includes(y))assert.ok(answer.lastIndexOf(y)<answer.indexOf(x));return;
 }
 assert.ok(close(answer,entry.expected),`#${entry.id}: ${JSON.stringify(answer)} != ${JSON.stringify(entry.expected)}`);
}
module.exports={verifyAnswer,pathCount,close};
