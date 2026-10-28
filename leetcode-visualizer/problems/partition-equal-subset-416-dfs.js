"use strict";
const { bi, parseIntegerArray } = require('./hard-viz-shared');
const SOURCE = [
  'class Solution:',
  '    def canPartition(self, nums: list[int]) -> bool:',
  '        total = sum(nums)',
  '',
  '        if total % 2 != 0:',
  '            return False',
  '',
  '        target = total // 2',
  '',
  '        def dfs(i, remain):',
  '            # The required sum has been reached.',
  '            if remain == 0:',
  '                return True',
  '',
  '            # No numbers left, or the chosen sum exceeds the target.',
  '            if i == len(nums) or remain < 0:',
  '                return False',
  '',
  '            # Take the current number.',
  '            take = dfs(i + 1, remain - nums[i])',
  '',
  '            # Skip the current number.',
  '            skip = dfs(i + 1, remain)',
  '',
  '            return take or skip',
  '',
  '        return dfs(0, target)',
];
function buildDfsSteps(input) {
  const nums = parseIntegerArray(input, {problemId:416,name:'nums',maxLength:200,minValue:1,maxValue:100});
  if (nums.length > 12) throw new Error('DFS minh họa tối đa 12 số. Chọn DP hoặc Bitset cho mảng lớn. / DFS visualization supports up to 12 numbers. Choose DP or Bitset for larger arrays.');
  const steps=[], stack=[], recent=[];
  let total=null,target=null,answer=null,root=null,witness=null,calls=0,shortened=false;
  const copy=node=>node?{id:node.id,parent:node.parent,branch:node.branch,i:node.i,remain:node.remain,take:node.take,skip:node.skip,result:node.result,path:[...node.path],taken:[...node.taken]}:null;
  function emit(line,event,node=null,final=false) {
    if (!final && steps.length >= 450) {shortened=true;return;}
    const chosen=final&&answer?witness:null, a=new Set(chosen||[]);
    steps.push({arr:[],codeLines:[line],final,title:bi(`Dòng ${line} · ${event}`,`Line ${line} · ${event}`),note:bi('Mỗi bước hiển thị dòng sắp chạy; ✓ / × là giá trị trả về.','Each step shows the next line to execute; ✓ / × marks a return value.'),
      vars:[['total',total],['target',target],['i',node?.i],['remain',node?.remain],['nums[i]',node&&nums[node.i]],['take',node?.take],['skip',node?.skip],['return',node?.result??answer]].map(([name,value])=>({name,value:value??'—'})),
      equalSubset416DfsView:{line,event,nums:[...nums],total,target,answer,final,calls,shortened,current:copy(node),root:copy(root),stack:stack.map(copy),recent:recent.map(r=>({...r})),partition:chosen?{a:[...chosen],b:nums.map((_,i)=>i).filter(i=>!a.has(i))}:null}});
  }
  emit(3,'total');total=nums.reduce((a,b)=>a+b,0);emit(5,'odd-check');
  if(total%2){answer=false;emit(6,'odd-return',null,true);return{original:[...nums],answer,steps};}
  emit(8,'target');target=total/2;emit(10,'define');emit(27,'start');
  function dfs(i,remain,parent=null,branch=null,path=[],taken=[]) {
    const node={id:calls++,parent:parent?.id??null,branch,i,remain,path,taken,take:null,skip:null,result:null};
    if(!parent)root=node;
    stack.push(node);emit(12,'zero-check',node);
    if(remain===0){node.result=true;if(witness===null)witness=[...taken];emit(13,'found',node);}
    else {
      emit(16,'stop-check',node);
      if(i===nums.length||remain<0){node.result=false;emit(17,remain<0?'overshoot':'exhausted',node);}
      else{
        emit(20,'take',node);
        node.take=dfs(i+1,remain-nums[i],node,'take',[...path,'take'],[...taken,i]);
        emit(23,'skip',node);
        node.skip=dfs(i+1,remain,node,'skip',[...path,'skip'],taken);
        emit(25,'combine',node);
        node.result=node.take||node.skip;
      }
    }
    recent.push({id:node.id,i,remain,result:node.result,branch});if(recent.length>8)recent.shift();
    stack.pop();return node.result;
  }
  answer=dfs(0,target);emit(27,'return',root,true);
  return{original:[...nums],answer,steps};
}
module.exports={code3:SOURCE,code3Label:bi('Cách 3: DFS chọn / bỏ (không memo)','Approach 3: Take / skip DFS (no memo)'),builder3:buildDfsSteps,
  complexity3:{time:'O(2^n)',space:'O(n)',note:bi('Không memo; mỗi số có hai nhánh. Giới hạn minh họa 12 số, trace dài được rút gọn nhưng đáp án vẫn tính đầy đủ.','No memoization; each number has two branches. Visualization is limited to 12 numbers; long traces are shortened while computing the full answer.')}};
