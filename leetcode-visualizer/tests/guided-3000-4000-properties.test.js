'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
test('independent enumeration checks bit states, edits, swaps, tree subsets, timers, and every path-count constructor',()=>{
 const root=path.resolve(__dirname,'..'),local=path.join(root,'.viz-python',process.platform==='win32'?'Scripts/python.exe':'bin/python');
 const python=process.env.LEETCODE_PYTHON_NATIVE||(fs.existsSync(local)?local:process.platform==='win32'?'python':'python3');
 const result=spawnSync(python,['-X','utf8',path.join(__dirname,'guided-3000-4000-properties.py')],{cwd:root,encoding:'utf8',timeout:120000,windowsHide:true});
 process.stdout.write(result.stdout||'');process.stdout.write(result.stderr||'');assert.equal(result.status,0,result.error?.message||'Independent oracle checks failed');
});
