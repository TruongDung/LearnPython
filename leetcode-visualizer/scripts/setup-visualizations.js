'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),envDir=path.join(root,'.viz-python');
const windows=process.platform==='win32';const candidates=[process.env.LEETCODE_PYTHON,path.resolve(root,'..','.venv',windows?'Scripts/python.exe':'bin/python'),windows?'python':'python3'].filter(Boolean);
const base=candidates.find(command=>spawnSync(command,['--version'],{windowsHide:true,encoding:'utf8'}).status===0);
if(!base)throw Error('Python 3.10+ is required for these lessons. Set LEETCODE_PYTHON to its executable.');
const python=path.join(envDir,windows?'Scripts/python.exe':'bin/python');
if(!fs.existsSync(python)){const result=spawnSync(base,['-m','venv',envDir],{cwd:root,stdio:'inherit',windowsHide:true});if(result.status!==0)process.exit(result.status||1);}
const result=spawnSync(python,['-m','pip','install','-r',path.join(root,'requirements-visualizations.txt')],{cwd:root,stdio:'inherit',windowsHide:true});process.exit(result.status||0);
