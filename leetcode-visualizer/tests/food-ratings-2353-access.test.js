"use strict";
const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const problem=require('../problems').SUPPORTED[2353];
const code=fs.readFileSync(require.resolve('../public/renderer-picture-study.js'),'utf8');
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderer(){const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang:'vi',$:()=>host,escapeHtml};vm.createContext(ctx);vm.runInContext(code,ctx);return{ctx,host};}
test('2353 indexed fields are actual root tuple and dictionary values, including empty heaps, stale entries and large ratings',()=>{
 const{ctx}=renderer(),cases=[problem.builder(problem.defaultInput),problem.builder(JSON.stringify({foods:['abcdefghij','z'],cuisines:['abcdefghij','abcdefghij'],ratings:[100000000,99999999],operations:[['changeRating','abcdefghij',1],['highestRated','abcdefghij']]}))];
 for(const built of cases){const before=JSON.stringify(built);for(const language of['vi','en']){ctx.lang=language;for(const step of built.steps){const v=step.pictureStudyView;for(const cuisine of new Set(v.cuisines)){
  const html=ctx.study2353IndexAccess(v,cuisine),root=v.heaps[cuisine]?.[0];assert.doesNotMatch(html,/undefined|NaN/);
  if(!root){assert.match(html,/heap = \[\]/);assert.doesNotMatch(html,/data-study-access-value=/);continue;}
  const[negative,name]=root,live=v.food[name][0];assert.ok(html.includes(`data-study-access-value="heap[0][0]" data-value="${negative}"`));assert.ok(html.includes(`data-study-access-value="heap[0][1]" data-value="${name}"`));assert.ok(html.includes(`data-study-access-value="self.food[heap[0][1]][0]" data-value="${live}"`));assert.ok(html.includes(`data-study-access-rating="${-negative}"`));assert.ok(html.includes(`self.food[&quot;${name}&quot;]`));assert.ok(html.includes(`data-access-stale="${-negative!==live}"`));
 }}}assert.equal(JSON.stringify(built),before);}
});
test('2353 distinguishes the executing heap from a preview, links to the correct dictionary row, and follows the NEW root after pop',()=>{
 const{ctx}=renderer(),steps=problem.builder(problem.defaultInput).steps,index=steps.findIndex(s=>s.pictureStudyView.action?.kind==='check'&&s.pictureStudyView.action.pass),v=steps[index].pictureStudyView;
 assert.equal(v.heaps.japanese[0][1],'ramen');assert.equal(v.heaps.japanese[0][0],-16);assert.equal(v.food.ramen[0],5);
 const executing=ctx.study2353IndexAccess(v,'japanese');assert.match(executing,/data-access-executing="true"/);assert.match(executing,/data-access-stale="true"/);assert.match(executing,/16<\/b><strong>≠<\/strong><b>5/);
 const preview=ctx.study2353IndexAccess(v,'korean');assert.match(preview,/data-access-executing="false"/);assert.match(preview,/data-access-stale="false"/);assert.match(preview,/Code đang xử lý.*japanese/);
 const popped=steps[index+1].pictureStudyView;assert.equal(popped.action.kind,'remove');assert.equal(popped.heaps.japanese[0][1],'sushi');const html=ctx.study2353IndexAccess(popped,'japanese');assert.match(html,/data-value="sushi"/);assert.match(html,/data-access-stale="false"/);assert.match(html,/data-access-executing="false"/);
 const map=ctx.study2353FoodMap(v,'ramen');assert.match(map,/<tr[^>]*data-food-map-key="ramen" data-food-lookup="true"/);assert.equal((map.match(/data-food-lookup="true"/g)||[]).length,1);
});
test('2353 expression buttons and cuisine selector update the displayed lookup without changing algorithm snapshots',()=>{
 const listeners=new Map(),select={value:'japanese',addEventListener:(event,fn)=>listeners.set('cuisine:'+event,fn)},host={innerHTML:'',querySelector:()=>null,querySelectorAll:selector=>selector==='[data-study-access]'?['raw','name','live'].map(mode=>({dataset:{studyAccess:mode},addEventListener:(event,fn)=>listeners.set(mode+':'+event,fn)})):selector==='[data-study-access-cuisine]'?[select]:[]};
 const ctx={lang:'vi',$:()=>host,escapeHtml};vm.createContext(ctx);vm.runInContext(code,ctx);const step=problem.builder(problem.defaultInput).steps.find(s=>s.pictureStudyView.action?.kind==='check'&&s.pictureStudyView.action.pass),before=JSON.stringify(step);ctx.renderPictureStudy(step);
 for(const mode of['raw','name','live']){listeners.get(mode+':click')();assert.ok(host.innerHTML.includes(`data-access-mode="${mode}"`));assert.ok(host.innerHTML.includes(`data-study-access="${mode}" aria-pressed="true"`));}
 select.value='korean';listeners.get('cuisine:change')();assert.match(host.innerHTML,/data-access-cuisine="korean"/);assert.match(host.innerHTML,/data-study-access-value="heap\[0\]\[1\]" data-value="kimchi"/);assert.match(host.innerHTML,/data-cuisine-heap="korean"/);assert.match(host.innerHTML,/data-food-map-key="kimchi" data-food-lookup="true"/);assert.equal(JSON.stringify(step),before);
});
test('2353 pointer preview releases arrow navigation and resets on Next or Previous without mutating steps',()=>{
 const listeners=new Map();let focused=null;
 const host={innerHTML:'',querySelector:selector=>selector.startsWith("[data-study-cuisine-tab=")||selector===".study-cuisine-heap.selected"?{focus:()=>focused=selector}:null,querySelectorAll:selector=>selector==='[data-study-cuisine-tab]'?['korean','japanese','greek'].map(cuisine=>({dataset:{studyCuisineTab:cuisine},addEventListener:(event,fn)=>listeners.set(cuisine+':'+event,fn)})):selector==='[data-study-follow-cuisine]'?[{addEventListener:(event,fn)=>listeners.set('follow:'+event,fn)}]:[]};
 const ctx={lang:'vi',$:()=>host,escapeHtml};vm.createContext(ctx);vm.runInContext(code,ctx);
 const steps=problem.builder(problem.defaultInput).steps,before=JSON.stringify(steps),i=steps.findIndex(s=>s.pictureStudyView.action?.kind==='check'),step=steps[i];
 ctx.renderPictureStudy(step);listeners.get('greek:click')({detail:1});assert.equal(focused,'.study-cuisine-heap.selected');assert.match(host.innerHTML,/data-cuisine-heap="greek"/);assert.match(host.innerHTML,/data-study-follow-cuisine/);
 ctx.renderPictureStudy(step);assert.match(host.innerHTML,/data-cuisine-heap="greek"/);
 ctx.renderPictureStudy(steps[i+1]);assert.ok(host.innerHTML.includes(`data-cuisine-heap="${steps[i+1].pictureStudyView.local.cuisine}"`));assert.doesNotMatch(host.innerHTML,/data-study-follow-cuisine/);
 listeners.get('greek:click')({detail:1});ctx.renderPictureStudy(step);assert.ok(host.innerHTML.includes(`data-cuisine-heap="${step.pictureStudyView.local.cuisine}"`));
 listeners.get('greek:click')({detail:1});listeners.get('follow:click')();assert.ok(host.innerHTML.includes(`data-cuisine-heap="${step.pictureStudyView.local.cuisine}"`));assert.doesNotMatch(host.innerHTML,/data-study-follow-cuisine/);
 listeners.get('greek:click')({detail:0});assert.equal(focused,'[data-study-cuisine-tab="greek"]');let prevented=false,stopped=false;listeners.get('greek:keydown')({key:'ArrowRight',preventDefault:()=>prevented=true,stopPropagation:()=>stopped=true});assert.ok(prevented&&stopped);assert.equal(focused,'[data-study-cuisine-tab="korean"]');assert.match(host.innerHTML,/data-cuisine-heap="korean"/);assert.equal(JSON.stringify(steps),before);
});
