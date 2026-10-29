'use strict';
const base=require('./graph')[2115];
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const copy=value=>JSON.parse(JSON.stringify(value));
const own=(object,key)=>object&&Object.hasOwn(object,key)?object[key]:null;
const code=[
  'from collections import defaultdict, deque',
  'class Solution:',
  '    def findAllRecipes(self, recipes, ingredients, supplies):',
  '        need = {}',
  '        dependents = defaultdict(list)',
  '        for recipe, parts in zip(recipes, ingredients):',
  '            need[recipe] = len(parts)',
  '            for ingredient in parts:',
  '                dependents[ingredient].append(recipe)',
  '        queue = deque(supplies)',
  '        available = set(supplies)',
  '        made = []',
  '        for recipe in recipes:',
  '            if need[recipe] == 0:',
  '                made.append(recipe)',
  '                if recipe not in available:',
  '                    available.add(recipe)',
  '                    queue.append(recipe)',
  '        while queue:',
  '            ingredient = queue.popleft()',
  '            for recipe in dependents[ingredient]:',
  '                need[recipe] -= 1',
  '                if need[recipe] == 0:',
  '                    made.append(recipe)',
  '                    if recipe not in available:',
  '                        available.add(recipe)',
  '                        queue.append(recipe)',
  '        return made',
];
function parse(input,params={}) {
  function json(value,label) {try{return typeof value==='string'?JSON.parse(value):copy(value);}catch{throw new TypeError(`#2115: ${label} phải là JSON hợp lệ / use valid JSON.`);}}
  function names(value,label){const parsed=json(value,label);if(!Array.isArray(parsed)||parsed.some(name=>typeof name!=='string'||!name.trim()||[...name.trim()].length>48))throw new RangeError(`#2115: ${label} phải gồm tên 1–48 ký tự / use names of 1–48 characters.`);return parsed.map(name=>name.trim());}
  const recipes=names(input,'recipes'),raw=json(params.ingredients??base.extraParams[0].default,'ingredients'),supplies=[...new Set(names(params.supplies??base.extraParams[1].default,'supplies'))];
  if(recipes.length>8||new Set(recipes).size!==recipes.length)throw new RangeError('#2115: tối đa 8 công thức, tên không trùng / up to 8 unique recipes.');
  if(!Array.isArray(raw)||raw.length!==recipes.length)throw new RangeError('#2115: ingredients cần một danh sách cho mỗi recipe / one ingredient list per recipe.');
  const ingredients=raw.map(parts=>names(parts,'ingredients'));
  if(ingredients.some(parts=>parts.length>18)||new Set([...recipes,...supplies,...ingredients.flat()]).size>18)throw new RangeError('#2115: tối đa 18 tên khác nhau và 18 nguyên liệu/công thức / up to 18 distinct names and 18 ingredients per recipe.');
  return [recipes,ingredients,supplies];
}
function builder(input,params={}) {
  const [recipes,ingredients,supplies]=parse(input,params),trace=runTrace({code:code.join('\n'),method:'findAllRecipes',args:[recipes,ingredients,supplies]});
  const delivered=ingredients.map(parts=>parts.map(()=>false)),popped=[];
  let active=null,target=null,change=null,build=null;
  const steps=trace.events.map((record,index)=>{
    const x=record.locals,line=record.line;let event='step';
    if(line===4)event='need';if(line===5)event='dependents';
    if(line===6){event='recipe';build=null;}
    if(line===7)event='count';
    if(line===8){event='ingredient';build=record.branch?{ingredient:x.ingredient,recipe:x.recipe}:null;}
    if(line===9){event='link';build={ingredient:x.ingredient,recipe:x.recipe};}
    if(line===10){event='queue';build=null;}
    if(line===11)event='supplies';
    if(line===12)event='made';
    if(line===13){event='seed-recipe';target=record.branch?x.recipe:null;change=null;}
    if(line===14)event='empty-check';
    if(line===15||line===24)event='make';
    if(line===16||line===25)event='available-check';
    if(line===17||line===26)event='available';
    if(line===18||line===27)event='enqueue';
    if(line===19){event='queue-check';target=null;change=null;}
    if(line===20){event='pop';active=x.ingredient;target=null;change=null;popped.push(active);}
    if(line===21){event='dependent';target=record.branch?x.recipe:null;change=null;}
    if(line===22){event='decrement';const r=recipes.indexOf(x.recipe),slot=ingredients[r].findIndex((item,j)=>item===active&&!delivered[r][j]);delivered[r][slot]=true;change={recipe:x.recipe,ingredient:active,slot,before:x.need[x.recipe]+1,after:x.need[x.recipe]};}
    if(line===23)event='ready-check';
    const final=index===trace.events.length-1;if(final){event='return';active=target=build=null;change=null;}
    const state=recipes.map((name,i)=>{
      const counts=new Map();
      return {name,need:own(x.need,name),made:x.made?.includes(name)??false,available:x.available?.includes(name)??false,queued:x.queue?.includes(name)??false,
        ingredients:ingredients[i].map((item,j)=>{const occurrence=(counts.get(item)??0)+1;counts.set(item,occurrence);const links=own(x.dependents,item)??[];return {name:item,slot:j,built:links.filter(recipe=>recipe===name).length>=occurrence,delivered:delivered[i][j],available:x.available?.includes(item)??false};})};
    });
    const names=final?['made']:line<10?['recipe','ingredient']:['ingredient','recipe','need[recipe]'];
    return {arr:[],codeBlock:1,codeLines:[line],final,title:bi(`L${line} · ${event}`,`L${line} · ${event}`),note:bi('',''),
      vars:names.map(name=>({name,value:name==='need[recipe]'?(Object.hasOwn(x,'recipe')?own(x.need,x.recipe)??'—':'—'):(Object.hasOwn(x,name)?x[name]:'—')})),
      recipes2115View:{source:{line,text:code[line-1].trim(),timing:'after'},scope:record.scope,locals:x,outer:record.outer,frames:record.frames,branch:record.branch,returning:record.returning,returned:record.returned,
        event,phase:line<10?'build':line<19?'seed':'cook',recipes,ingredients,supplies,state,need:x.need??null,dependents:x.dependents??null,queue:x.queue??null,available:x.available??null,made:x.made??null,
        active,target,change:copy(change),build:copy(build),popped:copy(popped),done:final,answer:final?trace.answer:null},
    };
  });
  return {original:{recipes,ingredients,supplies},answer:trace.answer,steps};
}
module.exports={2115:{...base,code,builder,debugMode:'line-by-line',
  inputLabel:bi('recipes · JSON · tối đa 8 công thức','recipes · JSON · up to 8 recipes'),
  approach:[bi('Nguyên liệu → queue → giảm need. need = 0 → made → nguyên liệu mới.','Ingredient → queue → decrease need. need = 0 → made → a new ingredient.')],
  liveArgs:parse,
}};
