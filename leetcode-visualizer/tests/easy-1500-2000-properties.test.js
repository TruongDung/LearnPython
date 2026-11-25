"use strict";
const test=require('node:test'),assert=require('node:assert/strict');
const groups=['1501-1599','1600-1699','1700-1799','1800-1899','1900-2000'];
const lessons=Object.assign({},...groups.map(g=>require('../problems/easy-'+g)));
const run=(id,args)=>lessons[id].builder(JSON.stringify(args)),answer=(id,args)=>run(id,args).answer;
let seed=1500;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
const gcd=(a,b)=>b?gcd(b,a%b):a;
function permutations(a){return a.length?a.flatMap((v,i)=>permutations(a.filter((_,j)=>j!==i)).map(p=>[v,...p])):[[]];}
test('binary rewriting and adjacent one swaps agree with complete legal state graphs',()=>{
 function maximum(s){const queue=[s],seen=new Set(queue);let best=s;for(const state of queue){best=best>state?best:state;for(let i=0;i<state.length-1;i++){const pair=state.slice(i,i+2),replacement=pair==='00'?'10':pair==='10'?'01':null;if(replacement){const next=state.slice(0,i)+replacement+state.slice(i+2);if(!seen.has(next)){seen.add(next);queue.push(next);}}}}return best;}
 for(let n=1;n<=5;n++)for(let mask=0;mask<1<<n;mask++){const s=mask.toString(2).padStart(n,'0');assert.equal(answer(1702,[s]),maximum(s));}
 function swaps(nums,k){const queue=[[nums.join(''),0]],seen=new Set([nums.join('')]);for(const[s,d]of queue){if(s.includes('1'.repeat(k)))return d;for(let i=0;i<s.length-1;i++)if(s[i]!==s[i+1]){const next=s.slice(0,i)+s[i+1]+s[i]+s.slice(i+2);if(!seen.has(next)){seen.add(next);queue.push([next,d+1]);}}}}
 for(let t=0;t<18;t++){const nums=Array.from({length:6},()=>random(2));if(!nums.some(Boolean))nums[0]=1;const k=1+random(nums.reduce((a,b)=>a+b));assert.equal(answer(1703,[nums,k]),swaps(nums,k));}
});
test('substring removal, garden subsequences and equal-character quadruples have independent exhaustive oracles',()=>{
 function gain(s,x,y){let best=0;for(let i=0;i<s.length-1;i++){const pair=s.slice(i,i+2);if(pair==='ab'||pair==='ba')best=Math.max(best,(pair==='ab'?x:y)+gain(s.slice(0,i)+s.slice(i+2),x,y));}return best;}
 for(let t=0;t<15;t++){const s=Array.from({length:6},()=>'abc'[random(3)]).join(''),x=1+random(8),y=1+random(8);assert.equal(answer(1717,[s,x,y]),gain(s,x,y));const flowers=[1,...Array.from({length:5},()=>random(7)-3),1];let best=-Infinity;for(let mask=0;mask<1<<flowers.length;mask++){const a=flowers.filter((_,i)=>mask>>i&1);if(a.length>=2&&a[0]===a.at(-1))best=Math.max(best,a.reduce((s,v)=>s+v,0));}assert.equal(answer(1788,[flowers]),best);}
 for(const[a,b]of[['ab','ab'],['abcd','bccda'],['aaaa','aa'],['a','b'],['aba','bab']]){let minimum=Infinity,count=0;for(let i=0;i<a.length;i++)for(let j=i;j<a.length;j++)for(let x=0;x<b.length;x++)for(let y=x;y<b.length;y++)if(a.slice(i,j+1)===b.slice(x,y+1)){const d=j-x;if(d<minimum){minimum=d;count=1;}else if(d===minimum)count++;}assert.equal(answer(1794,[a,b]),count);}
});
test('XOR window changes and good subsets match full assignment and subset enumeration',()=>{
 for(let t=0;t<14;t++){const nums=Array.from({length:6},()=>random(4)),k=1+random(3);let best=Infinity;for(let mask=0;mask<4**k;mask++){const values=Array.from({length:k},(_,i)=>(mask>>(2*i))&3);if(values.reduce((a,b)=>a^b,0)===0)best=Math.min(best,nums.reduce((s,v,i)=>s+(v!==values[i%k]),0));}assert.equal(answer(1787,[nums,k]),best);
 const a=Array.from({length:7},()=>1+random(12));let count=0;for(let mask=1;mask<1<<a.length;mask++){let product=a.reduce((p,v,i)=>mask>>i&1?p*v:p,1),valid=product>1;for(let p=2;p*p<=product;p++)if(product%(p*p)===0){valid=false;break;}count+=valid;}assert.equal(answer(1994,[a]),count);}
});
test('tree ancestor-pair reconstruction counts agree with every rooted labeled tree of four nodes',()=>{
 const n=4,counts=new Map();function key(pairs){return pairs.map(([a,b])=>[Math.min(a,b),Math.max(a,b)].join(',')).sort().join(';');}
 for(let root=0;root<n;root++)for(let code=0;code<n**(n-1);code++){const parents=Array(n).fill(-1);let value=code;for(let i=0;i<n;i++)if(i!==root){parents[i]=value%n;value=Math.floor(value/n);}let valid=true;const pairs=[];for(let i=0;i<n;i++){const seen=new Set([i]);let p=parents[i];while(p!==-1){if(seen.has(p)){valid=false;break;}seen.add(p);pairs.push([i+1,p+1]);p=parents[p];}if(!valid)break;}if(valid){const k=key(pairs);counts.set(k,(counts.get(k)||0)+1);}}
 for(const[k,count]of counts){const pairs=k.split(';').map(s=>s.split(',').map(Number));assert.equal(answer(1719,[pairs]),Math.min(2,count),k);}
 assert.equal(answer(1719,[[[1,2],[2,3],[3,4],[4,1]]]),0);
});
test('bounded peaks and rest-skipping DP agree with full array and rest-mask searches',()=>{
 for(let n=1;n<=4;n++)for(let total=n;total<=n+4;total++){const maxima=Array(n).fill(0);function visit(a,sum){if(a.length===n){a.forEach((v,i)=>maxima[i]=Math.max(maxima[i],v));return;}for(let v=1;v<=total-sum-(n-a.length-1);v++)if(!a.length||Math.abs(v-a.at(-1))<=1)visit([...a,v],sum+v);}visit([],0);for(let i=0;i<n;i++)assert.equal(answer(1802,[n,i,total]),maxima[i]);}
 for(let t=0;t<18;t++){const dist=Array.from({length:4},()=>1+random(5)),speed=1+random(5),hours=1+random(9);let best=Infinity;for(let mask=0;mask<8;mask++){let elapsed=0;dist.forEach((d,i)=>{elapsed+=d;if(i<3&&!(mask>>i&1))elapsed=Math.ceil(elapsed/speed)*speed;});if(elapsed<=hours*speed)best=Math.min(best,mask.toString(2).replace(/0/g,'').length);}assert.equal(answer(1883,[dist,speed,hours]),best===Infinity?-1:best);}
});
test('working sessions and transfer balances match complete assignments and request subsets',()=>{
 function sessions(tasks,cap){let best=tasks.length;function visit(i,bins){if(bins.length>=best)return;if(i===tasks.length){best=bins.length;return;}for(let j=0;j<bins.length;j++)if(bins[j]+tasks[i]<=cap){bins[j]+=tasks[i];visit(i+1,bins);bins[j]-=tasks[i];}visit(i+1,[...bins,tasks[i]]);}visit(0,[]);return best;}
 for(let t=0;t<14;t++){const tasks=Array.from({length:6},()=>1+random(4));assert.equal(answer(1986,[tasks,5]),sessions(tasks,5));const requests=Array.from({length:6},()=>[random(3),random(3)]);let best=0;for(let mask=0;mask<64;mask++){const balance=[0,0,0];let count=0;requests.forEach(([a,b],i)=>{if(mask>>i&1){balance[a]--;balance[b]++;count++;}});if(balance.every(v=>v===0))best=Math.max(best,count);}assert.equal(answer(1601,[3,requests]),best);}
});
test('subset-sum recovery replays to the supplied multiset; GCD sorting agrees with all legal swaps',()=>{
 const sums=a=>a.reduce((list,v)=>[...list,...list.map(x=>x+v)],[0]).sort((a,b)=>a-b);
 function sortable(a){const target=[...a].sort((a,b)=>a-b).join(','),queue=[a],seen=new Set([a.join(',')]);for(const state of queue){if(state.join(',')===target)return true;for(let i=0;i<a.length;i++)for(let j=0;j<i;j++)if(gcd(state[i],state[j])>1){const next=[...state];[next[i],next[j]]=[next[j],next[i]];if(!seen.has(next.join(','))){seen.add(next.join(','));queue.push(next);}}}return false;}
 for(let t=0;t<22;t++){const original=Array.from({length:4},()=>random(9)-4),input=sums(original),recovered=answer(1982,[4,input]);assert.equal(recovered.length,4);assert.deepEqual(sums(recovered),input);const a=Array.from({length:5},()=>1+random(12));assert.equal(answer(1998,[a]),sortable(a));}
});
test('hidden-array majority uses only reader queries and identifies a valid majority for all seven-bit arrays',()=>{
 for(let mask=0;mask<128;mask++){const bits=Array.from({length:7},(_,i)=>mask>>i&1),index=answer(1538,[bits]);const ones=bits.reduce((a,b)=>a+b);assert.equal(bits[index],ones>3?1:0);}
 for(const bits of[[0,0,1,1,0,1],[1,1,1,1,0,0]]){const index=answer(1538,[bits]);if(bits.reduce((a,b)=>a+b)===bits.length/2)assert.equal(index,-1);else assert.equal(bits[index],1);}
});
test('nearest enclosing circles and service centers retain numerical accuracy and translation invariance',()=>{
 for(const[points,expected]of[[[[2,3]],[2,3,0]],[[[0,0],[2,0]],[1,0,1]],[[[0,0],[2,0],[1,Math.sqrt(3)]],[1,1/Math.sqrt(3),2/Math.sqrt(3)]],[[[0,0],[4,0],[0,2],[4,2]],[2,1,Math.sqrt(5)]]]){const circle=answer(1924,[points]);circle.forEach((v,i)=>assert.ok(Math.abs(v-expected[i])<1e-7));for(const[x,y]of points)assert.ok(Math.hypot(x-circle[0],y-circle[1])<=circle[2]+1e-7);}
 for(const points of[[[0,0],[2,0],[1,Math.sqrt(3)]],[[10,-4],[12,-4],[11,-4+Math.sqrt(3)]]])assert.ok(Math.abs(answer(1515,[points])-2*Math.sqrt(3))<1e-5);
});
test('virus meeting times agree with literal per-day cardinal-grid infection expansion',()=>{
 function spread(points,k){let infected=points.map(([x,y])=>new Set([x+','+y]));for(let day=0;day<12;day++){const counts=new Map();infected.forEach(set=>set.forEach(key=>counts.set(key,(counts.get(key)||0)+1)));if([...counts.values()].some(v=>v>=k))return day;infected=infected.map(set=>{const next=new Set(set);for(const key of set){const[x,y]=key.split(',').map(Number);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])next.add((x+dx)+','+(y+dy));}return next;});}}
 for(let t=0;t<14;t++){const points=Array.from({length:4},()=>[random(5)-2,random(5)-2]);for(let k=1;k<=4;k++)assert.equal(answer(1956,[points,k]),spread(points,k));}
});
test('two-digit multiples match direct ordered enumeration, including both nonzero digits and zero-only input',()=>{
 function enumerate(k,a,b){const queue=[...new Set([a,b])].filter(Boolean).sort();for(const value of queue){if(value>2147483647)continue;if(value>k&&value%k===0)return value;for(const digit of [...new Set([a,b])].sort())queue.push(value*10+digit);}return -1;}
 for(const[k,a,b]of[[3,0,1],[2,1,3],[7,2,5],[1,1,1],[4,0,0],[17,0,9],[9,3,6]])assert.equal(answer(1999,[k,a,b]),enumerate(k,a,b));
});
test('SQL joins, inclusive timestamps, null values and independent distinct counts preserve query semantics',()=>{
 assert.deepEqual(answer(1501,[[{id:1,phone_number:'001000'},{id:2,phone_number:'002000'}],[{country_code:'001',name:'A'},{country_code:'002',name:'B'}],[{caller_id:1,callee_id:2,duration:20}]]),[]);
 assert.deepEqual(answer(1777,[[{product_id:1,store:'store2',price:0}]]),[{product_id:1,store1:null,store2:0,store3:null}]);
 assert.deepEqual(answer(1795,[[{product_id:1,store1:null,store2:0,store3:null}]]),[{product_id:1,store:'store2',price:0}]);
 assert.deepEqual(answer(1747,[[{account_id:1,ip_address:1,login:'2020-01-01 10:00',logout:'2020-01-01 11:00'},{account_id:1,ip_address:2,login:'2020-01-01 11:00',logout:'2020-01-01 12:00'}]]),[{account_id:1}]);
 assert.deepEqual(answer(1843,[[{account_id:1,max_income:10}],[{account_id:1,type:'Creditor',amount:11,day:'2020-12-31'},{account_id:1,type:'Creditor',amount:11,day:'2021-01-01'}]]),[{account_id:1}]);
 assert.deepEqual(answer(1565,[[{order_id:1,customer_id:1,invoice:21,order_date:'2020-01-01'},{order_id:2,customer_id:1,invoice:30,order_date:'2020-01-02'},{order_id:3,customer_id:2,invoice:20,order_date:'2020-01-03'}]]),[{month:'2020-01',order_count:2,customer_count:1}]);
});

test('grid happiness and squared-subarray DP agree with literal placements and subarrays',()=>{
 function happiness(m,n,intro,extro){let best=0;for(let mask=0;mask<3**(m*n);mask++){let value=mask;const a=Array.from({length:m*n},()=>{const x=value%3;value=Math.floor(value/3);return x;});if(a.filter(x=>x===1).length>intro||a.filter(x=>x===2).length>extro)continue;let score=0;a.forEach((kind,i)=>{if(!kind)return;score+=kind===1?120:40;for(const j of[i%n?i-1:-1,i>=n?i-n:-1])if(j>=0&&a[j])score+=(kind===1?-30:20)+(a[j]===1?-30:20);});best=Math.max(best,score);}return best;}
 for(const[m,n,i,e]of[[1,2,1,1],[2,2,2,2],[2,3,1,2],[2,2,0,3]])assert.equal(answer(1659,[m,n,i,e]),happiness(m,n,i,e));
 for(let t=0;t<18;t++){const nums=Array.from({length:6},()=>random(9)-4);let best=-Infinity;for(let left=0;left<nums.length;left++)for(let right=left;right<nums.length;right++)for(let changed=left;changed<=right;changed++)best=Math.max(best,nums.reduce((sum,value,i)=>i<left||i>right?sum:sum+(i===changed?value*value:value),0));assert.equal(answer(1746,[nums]),best);}
});
test('palindromes across two words, mountain removals and odd palindrome products agree with exhaustive subsequences and intervals',()=>{
 const subseq=s=>Array.from({length:(1<<s.length)-1},(_,mask)=>[...s].filter((_,i)=>(mask+1)>>i&1).join(''));
 for(let t=0;t<12;t++){const a=Array.from({length:4},()=>'abc'[random(3)]).join(''),b=Array.from({length:4},()=>'abc'[random(3)]).join('');let best=0;for(const x of subseq(a))for(const y of subseq(b)){const s=x+y;if(s===[...s].reverse().join(''))best=Math.max(best,s.length);}assert.equal(answer(1771,[a,b]),best);
 const s=a+b,intervals=[];for(let i=0;i<s.length;i++)for(let j=i;j<s.length;j+=2){const text=s.slice(i,j+1);if(text===[...text].reverse().join(''))intervals.push([i,j]);}let product=0;for(const[i,j]of intervals)for(const[x,y]of intervals)if(j<x)product=Math.max(product,(j-i+1)*(y-x+1));assert.equal(answer(1960,[s]),product);}
 const nums=[2,1,1,5,6,2,3,1];let longest=0;for(let mask=0;mask<1<<nums.length;mask++){const a=nums.filter((_,i)=>mask>>i&1);for(let peak=1;peak<a.length-1;peak++)if(a.slice(1,peak+1).every((v,i)=>v>a[i])&&a.slice(peak+1).every((v,i)=>v<a[peak+i]))longest=Math.max(longest,a.length);}assert.equal(answer(1671,[nums]),nums.length-longest);
});
test('expression trees preserve left/right operand order and Boolean flip costs match every allowed edit',()=>{
 assert.equal(answer(1628,[['3','4','+','2','*','7','/']]),2);
 assert.equal(answer(1628,[['2','8','-','4','/']]),-1);
 const tree=run(1628,[['3','4','+']]).steps.at(-1).catalogLessonView;assert.equal(tree.objects.length,3);assert.equal(tree.objects.find(o=>o.fields.val==='+').fields.left.type,'TreeNode');
 function evaluate(s){let i=0;function expression(){let result=atom();while(i<s.length&&s[i]!==')'){const op=s[i++],other=atom();result=op==='&'?result&other:result|other;}return result;}function atom(){if(s[i]==='('){i++;const v=expression();i++;return v;}return Number(s[i++]);}return expression();}
 for(const s of['1&(0|1)','(0&0)&(0&0&0)','1|1&0','(1|0)&(0|1)','1&0|1&1']){const editable=[...s].flatMap((c,i)=>'01&|'.includes(c)?[i]:[]),original=evaluate(s);let best=Infinity;for(let mask=1;mask<1<<editable.length;mask++){const chars=[...s];editable.forEach((i,j)=>{if(mask>>j&1)chars[i]=({'0':'1','1':'0','&':'|','|':'&'})[chars[i]];});if(evaluate(chars.join(''))!==original)best=Math.min(best,mask.toString(2).replace(/0/g,'').length);}assert.equal(answer(1896,[s]),best);}
});
test('tree locking upgrade checks ancestors and unlocks every locked descendant, irrespective of user',()=>{
 const parent=[-1,0,0,1,1,2,2],locks=new Map(),operations=[],expected=[];
 const ancestors=node=>{const out=[];while(node!==-1){out.push(node);node=parent[node];}return out;};
 for(let t=0;t<60;t++){const name=['lock','unlock','upgrade'][random(3)],node=random(7),user=1+random(3);let result=false;if(name==='lock'){if(!locks.has(node)){locks.set(node,user);result=true;}}else if(name==='unlock'){if(locks.get(node)===user){locks.delete(node);result=true;}}else{const below=[...locks.keys()].filter(child=>child!==node&&ancestors(child).includes(node));if(!ancestors(node).some(a=>locks.has(a))&&below.length){below.forEach(child=>locks.delete(child));locks.set(node,user);result=true;}}operations.push([name,node,user]);expected.push(result);}
 assert.deepEqual(answer(1993,[parent,operations]),expected);
 const r=run(1666,[[1,2,3,4],4]);assert.deepEqual(r.answer,[4,2,null,1,null,null,3]);assert.ok(r.steps.some(s=>s.catalogLessonView.objects.some(o=>o.fields.left?.type==='TreeNode')));
 assert.deepEqual(answer(1516,[[[1,[2,3]],[2,[4]],[3,[]],[4,[]]],1,2,4]),{root:1,nodes:[[1,[4,3]],[2,[]],[3,[]],[4,[2]]]});
});
