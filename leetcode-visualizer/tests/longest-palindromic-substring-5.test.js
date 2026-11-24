"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED[5];
const chars=s=>[...s],pal=s=>chars(s).join('')===chars(s).reverse().join('');
function oracle(s){const a=chars(s);let best='';for(let i=0;i<a.length;i++)for(let j=i+1;j<=a.length;j++){const part=a.slice(i,j).join('');if(j-i>chars(best).length&&pal(part))best=part;}return best;}
const cases=['','a','ab','babad','cbbd','racecar','aaaa','abcbaef','abacdfgdcaba','a b a','  ','😀a😀','<a>"a<'];
test('5 both algorithms agree with exhaustive substring enumeration, preserve spaces, and handle Unicode',()=>{
    const inputs=[...cases];for(let size=1;size<=5;size++)for(let bits=0;bits<2**size;bits++)inputs.push(Array.from({length:size},(_,i)=>(bits>>i)&1?'b':'a').join(''));
    for(const s of inputs)for(const approach of[1,2]){const r=p.builder(s,{approach});assert.equal(r.answer,oracle(s),JSON.stringify({s,approach}));assert.equal(r.steps.filter(x=>x.final).length,1);assert.equal(r.steps.at(-1).palindrome5View.bestText,r.answer);}
    for(const approach of[1,2])assert.equal(p.builder('a'.repeat(32),{approach}).answer,'a'.repeat(32));
    for(const value of[null,[],4,'a'.repeat(33)])assert.throws(()=>p.builder(value),RangeError);
    assert.deepEqual(p.liveArgs(' a '),[' a ']);
});
test('5 center frames distinguish attempted endpoints, confirmed palindromes, and actual best updates',()=>{
    for(const s of cases){const r=p.builder(s),a=chars(s);let best='';
        for(const step of r.steps){const v=step.palindrome5View;assert.equal(v.source,p.code[v.line-1].trim());assert.deepEqual(step.codeLines,[v.line]);
            if(v.accepted){const [l,h]=v.accepted;assert.ok(l>=0&&h<a.length);assert.ok(pal(a.slice(l,h+1).join('')));}
            if(v.line===6){const[l,h]=v.candidate;assert.equal(v.checked,l>=0&&h<a.length&&a[l]===a[h]);}
            if(v.line===5&&v.checked===null&&v.candidate){assert.equal(v.kind,v.candidate[0]===v.candidate[1]?'odd':'even');assert.equal(v.accepted,null);}
            if(v.bestUpdated){assert.ok(chars(v.bestText).length>chars(best).length);assert.deepEqual(v.best,v.accepted);best=v.bestText;}else assert.equal(v.bestText,best);
        }
    }
    const r=p.builder('cbbd'),update=r.steps.find(s=>s.palindrome5View.bestText==='bb').palindrome5View;
    assert.equal(update.kind,'even');assert.deepEqual(update.candidate,[1,2]);
    const mismatch=r.steps.find(s=>s.palindrome5View.line===6&&s.palindrome5View.candidate[0]===0&&s.palindrome5View.candidate[1]===3).palindrome5View;
    assert.equal(mismatch.checked,false);assert.deepEqual(mismatch.accepted,[1,2]);
});
test('5 DP exposes cells only when evaluated and resolves dependencies before reading them',()=>{
    for(const s of cases){const r=p.builder(s,{approach:2}),a=chars(s);let count=0,best='';
        for(const step of r.steps){const v=step.palindrome5View;assert.equal(v.source,p.code2[v.line-1].trim());assert.equal(step.codeBlock,2);
            const tested=new Set(v.tested);
            if(v.line===9){count++;const[i,j]=v.candidate;assert.equal(v.checked,pal(a.slice(i,j+1).join('')));if(j-i>=2)assert.ok(tested.has(`${i+1},${j-1}`));}
            if(v.line===10){const[i,j]=v.candidate;assert.equal(v.table[i][j],true);assert.ok(tested.has(`${i},${j}`));}
            for(const key of tested){const[i,j]=key.split(',').map(Number);assert.equal(v.table[i][j],pal(a.slice(i,j+1).join('')));}
            if(v.bestUpdated){assert.ok(chars(v.bestText).length>chars(best).length);best=v.bestText;}else assert.equal(v.bestText,best);
        }
        assert.equal(count,a.length*(a.length+1)/2);assert.equal(r.steps.at(-1).palindrome5View.tested.length,count);
    }
});
function renderer(lang,extra={}){const host={innerHTML:'',querySelectorAll:()=>[]};const ctx=vm.createContext({lang,$:()=>host,...extra});vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-palindrome-5.js'),'utf8'),ctx);return{ctx,host,render:step=>{ctx.renderPalindrome5(step);return host.innerHTML;}};}
test('5 renderer is safe, reversible and renders both center types, mismatch, best, and DP dependencies',()=>{
    for(const lang of['vi','en'])for(const approach of[1,2])for(const s of cases){const r=p.builder(s,{approach}),ui=renderer(lang),before=JSON.stringify(r);
        for(const step of r.steps){const html=ui.render(step);assert.doesNotMatch(html,/undefined|NaN|Infinity/);assert.match(html,/p5-best/);assert.match(html,/data-p5-jump="check"/);if(step.palindrome5View.table.length)assert.match(html,/p5-table-scroll/);}
        const first=ui.render(r.steps[0]);ui.render(r.steps.at(-1));assert.equal(ui.render(r.steps[0]),first);assert.equal(JSON.stringify(r),before);
    }
    const ui=renderer('en');const r=p.builder('cbbd');assert.match(ui.render(r.steps.find(s=>s.palindrome5View.bestText==='bb')),/Center between characters/);
    const safe=p.builder('<img>');assert.doesNotMatch(ui.render(safe.steps.at(-1)),/<img>/);
});
test('5 shortcut navigation lands on real Python events for either approach',()=>{
    for(const approach of[1,2])for(const kind of['check','best','answer']){const r=p.builder('cbbd',{approach});let stopped=0,rendered=0;const ui=renderer('en',{steps:r.steps,stepIndex:0,stopPlay:()=>stopped++,renderStep:()=>rendered++});ui.ctx.palindrome5Jump(kind);const v=r.steps[ui.ctx.stepIndex].palindrome5View;assert.equal(stopped,1);assert.equal(rendered,1);if(kind==='check')assert.equal(v.line,approach===1?6:9);else if(kind==='best')assert.equal(v.bestUpdated,true);else assert.equal(v.final,true);}
});
test('5 Python source produces the displayed answer and exact statement states in native Python too',()=>{
    const {spawnSync}=require('node:child_process'),path=require('node:path');
    const configs=[1,2].flatMap(approach=>['babad','cbbd','','😀a😀'].map(s=>({s,approach})));
    const payloads=configs.map(({s,approach})=>({code:(approach===1?p.code:p.code2).join('\n'),method:'longestPalindrome',args:[s]}));
    const python=process.env.PYTHON||path.resolve(__dirname,'../../.venv/Scripts/python.exe');
    const program="import sys,json,runpy\np=json.load(sys.stdin);f=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(c)) for c in p['cases']]))";
    const ref=spawnSync(python,['-X','utf8','-c',program],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),cases:payloads}),encoding:'utf8',maxBuffer:8e6});assert.equal(ref.status,0,ref.stderr);
    JSON.parse(ref.stdout).forEach((native,i)=>{const{s,approach}=configs[i],r=p.builder(s,{approach});assert.equal(r.answer,native.answer);assert.equal(r.steps.length,native.events.length);native.events.forEach((e,j)=>{assert.deepEqual(r.steps[j].codeLines,[e.line]);assert.deepEqual(r.steps[j].vars.map(x=>[x.name,x.rawValue]),Object.entries(e.locals));});});
});
test('5 uses dedicated lazy assets and renderer registration',()=>{
    const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');
    assert.match(html,/palindrome-5\.css[^>]*data-problem-ids="5"/);assert.match(html,/renderer-palindrome-5\.js[^>]*data-problem-ids="5"/);assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/renderer-palindrome-5/);assert.match(script,/Boolean\(step.palindrome5View\)/);
});
