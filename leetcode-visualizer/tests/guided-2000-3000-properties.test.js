'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),lessons=require('../problems/guided-2000-3000');
const run=(id,args)=>lessons[id].builder(JSON.stringify(args)),answer=(id,args)=>run(id,args).answer;
let seed=2000;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
test('kth products, rolling hashes and consecutive windows match direct enumeration',()=>{
 for(let t=0;t<18;t++){const a=Array.from({length:4},()=>random(9)-4).sort((a,b)=>a-b),b=Array.from({length:4},()=>random(9)-4).sort((a,b)=>a-b),products=a.flatMap(x=>b.map(y=>x*y)).sort((a,b)=>a-b);for(const k of[1,5,16])assert.equal(answer(2040,[a,b,k]),products[k-1]||0);
 const s=Array.from({length:7},()=>'abc'[random(3)]).join(''),power=2+random(5),mod=11,k=2+random(3),start=random(s.length-k+1);function hash(i){let sum=0,p=1;for(const ch of s.slice(i,i+k)){sum=(sum+(ch.charCodeAt(0)-96)*p)%mod;p=p*power%mod;}return sum;}const wanted=hash(start),first=Array.from({length:s.length-k+1},(_,i)=>i).find(i=>hash(i)===wanted);assert.equal(answer(2156,[s,power,mod,k,wanted]),s.slice(first,first+k));}
});
test('restricted friendship and time-group secrets agree with independent component and BFS models',()=>{
 for(let t=0;t<12;t++){const n=5,restrictions=[[0,1],[2,4]],requests=Array.from({length:8},()=>{const a=random(n);return[a,(a+1+random(n-1))%n];}),groups=Array.from({length:n},(_,i)=>new Set([i])),expected=[];for(const[a,b]of requests){const ca=groups.find(g=>g.has(a)),cb=groups.find(g=>g.has(b)),merged=new Set([...ca,...cb]);const valid=!restrictions.some(([x,y])=>merged.has(x)&&merged.has(y));expected.push(valid);if(valid&&ca!==cb){for(const value of cb)ca.add(value);groups.splice(groups.indexOf(cb),1);}}assert.deepEqual(answer(2076,[n,restrictions,requests]),expected);
 const meetings=Array.from({length:6},()=>{const a=random(n);return[a,(a+1+random(n-1))%n,1+random(3)];}),known=new Set([0,1]);for(let time=1;time<=3;time++){const edges=meetings.filter(m=>m[2]===time);let changed=true;while(changed){changed=false;for(const[a,b]of edges)if(known.has(a)||known.has(b)){const old=known.size;known.add(a);known.add(b);changed||=known.size!==old;}}}assert.deepEqual(answer(2092,[n,meetings,1]),[...known].sort((a,b)=>a-b));}
});
test('ideal arrays, hero subsets and elegance teams match exhaustive small choices',()=>{
 for(let n=1;n<=4;n++)for(let maximum=1;maximum<=4;maximum++){let total=0;function visit(a){if(a.length===n){total++;return;}for(let v=1;v<=maximum;v++)if(!a.length||v%a.at(-1)===0)visit([...a,v]);}visit([]);assert.equal(answer(2338,[n,maximum]),total);}
 for(let t=0;t<16;t++){const nums=Array.from({length:5},()=>1+random(7));let total=0;for(let mask=1;mask<32;mask++){const chosen=nums.filter((_,i)=>mask>>i&1);total+=Math.min(...chosen)*Math.max(...chosen)**2;}assert.equal(answer(2681,[nums]),total);
 const items=Array.from({length:6},()=>[1+random(10),1+random(4)]),k=1+random(4);let best=0;for(let mask=0;mask<64;mask++){const chosen=items.filter((_,i)=>mask>>i&1);if(chosen.length===k)best=Math.max(best,chosen.reduce((s,[p])=>s+p,0)+new Set(chosen.map(([,c])=>c)).size**2);}assert.equal(answer(2813,[items,k]),best);}
});
test('robot budgets and powerful-number digit counts match literal intervals and numbers',()=>{
 for(let t=0;t<20;t++){const charge=Array.from({length:6},()=>1+random(9)),running=Array.from({length:6},()=>1+random(5)),budget=1+random(90);let best=0;for(let left=0;left<6;left++)for(let right=left;right<6;right++){const size=right-left+1,cost=Math.max(...charge.slice(left,right+1))+size*running.slice(left,right+1).reduce((a,b)=>a+b,0);if(cost<=budget)best=Math.max(best,size);}assert.equal(answer(2398,[charge,running,budget]),best);}
 for(const[low,high,limit,suffix]of[[1,500,3,'12'],[20,700,7,'5'],[1,100,2,'22']]){let count=0;for(let value=low;value<=high;value++)if(String(value).endsWith(suffix)&&[...String(value)].every(d=>Number(d)<=limit))count++;assert.equal(answer(2999,[low,high,limit,suffix]),count);}
});
test('JavaScript boundaries, debounce/throttle and Promise pool retain exact deterministic timing',()=>{
 assert.deepEqual(answer(2622,[[[0,'set',1,42,0],[0,'get',1],[0,'count']]]),[false,-1,0]);
 assert.deepEqual(answer(2627,[[[0,1],[20,2],[40,3]],50]),[[90,3]]);
 assert.deepEqual(answer(2676,[[[0,1],[20,2],[40,3]],50]),[[0,1],[50,3]]);
 for(const durations of[[5,5,5],[10,1,2,8],[2,9,4]])for(let count=1;count<=durations.length;count++){const lanes=Array(count).fill(0);for(const duration of durations){const i=lanes.indexOf(Math.min(...lanes));lanes[i]+=duration;}assert.equal(answer(2636,[durations,count]),Math.max(...lanes));}
 assert.equal(answer(2637,[10,20]),42);assert.equal(answer(2637,[20,10]),'Time Limit Exceeded');
 assert.deepEqual(answer(2794,[[1,'1',false],[4,5,6]]),{'1':4,false:6});
});
test('snapshotting never calls user getters, consumes generators or triggers Proxy reads',()=>{
 const{runTrace}=require('../problems/wasm-picture-trace');const code='let reads=0;const obj={get value(){reads++;return 7;}};function result(){return [reads,obj.value,reads];}';const payload={engine:'javascript',code,harness:'return result();',args:[],maxEvents:1000};assert.deepEqual(runTrace(payload).answer,[0,7,1]);assert.deepEqual(runTrace(payload).answer,runTrace({...payload,noInstrumentation:true}).answer);
 const p=lessons[2691],args=[{a:{b:1}},2];assert.deepEqual(answer(2691,args),{a:{b:2}});assert.deepEqual(args,[{a:{b:1}},2]);
});
test('SQL models handle budget priority, zero-capacity buses, null filling and dated boundaries',()=>{
 assert.deepEqual(answer(2004,[{Candidates:[{employee_id:1,experience:'Senior',salary:70000},{employee_id:2,experience:'Junior',salary:1}]}]),[{experience:'Junior',accepted_candidates:0},{experience:'Senior',accepted_candidates:1}]);
 assert.deepEqual(answer(2153,[{Buses:[{bus_id:1,arrival_time:1,capacity:0},{bus_id:2,arrival_time:1,capacity:1}],Passengers:[{passenger_id:1,arrival_time:1}]}]),[{bus_id:1,passengers_cnt:0},{bus_id:2,passengers_cnt:1}]);
 assert.deepEqual(answer(2388,[{CoffeeShop:[{id:9,drink:'Tea'},{id:1,drink:null},{id:7,drink:'Coffee'}]}]),[{id:9,drink:'Tea'},{id:1,drink:'Tea'},{id:7,drink:'Coffee'}]);
 assert.deepEqual(answer(2228,[{Purchases:[{purchase_id:1,user_id:1,purchase_date:'2021-12-31'},{purchase_id:2,user_id:1,purchase_date:'2022-01-07'}]}]),[{user_id:1}]);
 assert.deepEqual(answer(2356,[{Teacher:[]}]),[]);
 assert.deepEqual(answer(2880,[{data:[]}]),[]);
});
test('native source no longer evaluates user expressions; lists and special trees keep judge semantics',()=>{
 assert.equal(answer(2019,['1+2*3',[7,9,4]]),7);
 assert.throws(()=>answer(2019,["__import__('os')",[0]]));
 assert.deepEqual(answer(2674,[[2,6,1,5]]),[[2,6],[1,5]]);
 assert.equal(answer(2773,[[1,2,3,null,null,4,5]]),2);
 const rows=answer(2408,[['SQL','ins','rmv','ins','exp'],[[['a'],[1]],['a',['first']],['a',1],['a',['second']],['a']]]);assert.deepEqual(rows,[null,true,null,true,['2,second']]);
});
