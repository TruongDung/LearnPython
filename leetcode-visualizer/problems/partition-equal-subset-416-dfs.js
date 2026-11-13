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
  // Short title (the code being run) and note (a few words) per event; the picture carries the rest.
  function words(line,event,node){
    const v=node&&nums[node.i], r=node?.remain, T=x=>x?'True':'False';
    switch(event){
      case 'class':return[bi('class Solution','class Solution'),bi('Định nghĩa lớp.','Class defined.')];
      case 'call':return[bi('canPartition(nums)','canPartition(nums)'),bi(`${nums.length} số.`,`${nums.length} numbers.`)];
      case 'total':return[bi('total = sum(nums)','total = sum(nums)'),bi('Cộng tất cả số.','Add up every number.')];
      case 'odd-check':return[bi(`${total} % 2 != 0 ?`,`${total} % 2 != 0 ?`),bi('Tổng lẻ?','Odd total?')];
      case 'odd-return':return[bi('return False','return False'),bi('Tổng lẻ → False.','Odd total → False.')];
      case 'target':return[bi('target = total // 2','target = total // 2'),bi('Cần nửa tổng.','Need half the total.')];
      case 'define':return[bi('def dfs(i, remain)','def dfs(i, remain)'),bi('Định nghĩa dfs.','Define dfs.')];
      case 'start':return[bi(`dfs(0, ${target})`,`dfs(0, ${target})`),bi(`Bắt đầu: còn ${target}.`,`Start: ${target} to go.`)];
      case 'zero-check':return[bi(`${r} == 0 ?`,`${r} == 0 ?`),bi(`dfs(${node.i}, ${r}): đủ chưa?`,`dfs(${node.i}, ${r}): done?`)];
      case 'found':return[bi('return True','return True'),bi('Đủ tổng → True!','Sum reached → True!')];
      case 'stop-check':return[bi(`${node.i} == ${nums.length} or ${r} < 0 ?`,`${node.i} == ${nums.length} or ${r} < 0 ?`),bi('Hết số hoặc vượt?','Out of numbers or over?')];
      case 'overshoot':return[bi('return False','return False'),bi('Vượt quá → False.','Overshot → False.')];
      case 'exhausted':return[bi('return False','return False'),bi('Hết số → False.','No numbers left → False.')];
      case 'take':return[bi(`take = dfs(${node.i+1}, ${r-v})`,`take = dfs(${node.i+1}, ${r-v})`),bi(`Chọn ${v}: còn ${r-v}.`,`Take ${v}: ${r-v} left.`)];
      case 'skip':return[bi(`skip = dfs(${node.i+1}, ${r})`,`skip = dfs(${node.i+1}, ${r})`),bi(`Bỏ ${v}: còn ${r}.`,`Skip ${v}: ${r} left.`)];
      case 'combine':return[bi(`return ${T(node.take)} or ${T(node.skip)}`,`return ${T(node.take)} or ${T(node.skip)}`),bi(`${T(node.take)} or ${T(node.skip)} → ${T(node.take||node.skip)}`,`${T(node.take)} or ${T(node.skip)} → ${T(node.take||node.skip)}`)];
      default:return[bi(`return ${T(answer)}`,`return ${T(answer)}`),answer?bi('Chia được 2 nhóm!','Two equal groups!'):bi('Không chia được.','No equal split.')];
    }
  }
  function emit(line,event,node=null,final=false) {
    if (!final && steps.length >= 450) {shortened=true;return;}
    const chosen=final&&answer?witness:null, a=new Set(chosen||[]), [title,note]=words(line,event,node);
    steps.push({arr:[],codeLines:[line],final,title:bi(`Dòng ${line}: ${title.vi}`,`Line ${line}: ${title.en}`),note,
      vars:[['total',total],['target',target],['i',node?.i],['remain',node?.remain],['nums[i]',node&&nums[node.i]],['take',node?.take],['skip',node?.skip],['return',node?.result??answer]].map(([name,value])=>({name,value:value??'—'})),
      equalSubset416DfsView:{line,event,nums:[...nums],total,target,answer,final,calls,shortened,current:copy(node),root:copy(root),stack:stack.map(copy),recent:recent.map(r=>({...r})),partition:chosen?{a:[...chosen],b:nums.map((_,i)=>i).filter(i=>!a.has(i))}:null}});
  }
  emit(1,'class');emit(2,'call');emit(3,'total');total=nums.reduce((a,b)=>a+b,0);emit(5,'odd-check');
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
