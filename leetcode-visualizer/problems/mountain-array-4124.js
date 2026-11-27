"use strict";
const {defineEasy}=require('./easy-lesson'),{parseArguments}=require('./catalog-lesson');
const source=require('./mountain-array-4124-source.json');
const bi=(vi,en)=>({vi,en});
const lesson=defineEasy(4124,'Minimum Operations to Make Mountain Array II','dp',[[3,1,2,5,4]],3,source,
 'Dựng dãy tăng từ hai phía, thử từng đỉnh rồi ghép một phương án tối ưu.',
 'O(n log n)','O(n)',{
  engine:'wasm',method:'minOperations',names:['nums'],kinds:[null],difficulty:'hard',maxArrayLength:40,
  guide:'Fit increasing sequences from both ends, try every internal peak, then build one optimal mountain.',
  focus:['heap','cost','left_cost','right_cost','candidate','best','adjusted'],teachingMode:'guided',
  scene:{compact:true,debug:true,kind:'mountain-heap'},traceOptions:{maxEvents:15000},
  provenance:{origin:'Project implementation using public LeetCode hints',license:'local',url:'https://leetcode.com/problems/minimum-operations-to-make-mountain-array-ii/',modifications:'Independent max-heap implementation and explicit optimal-witness reconstruction; problem description supplied by the user. Negative and zero adjusted values are allowed.'}
 });
const build=lesson.builder;
lesson.builder=input=>{
 const[nums]=parseArguments(input,lesson.__catalog);
 if(!Array.isArray(nums)||nums.length>40||!nums.every(value=>Number.isInteger(value)&&Math.abs(value)<=1e9))throw Error('#4124: tối đa 40 số nguyên trong ±10⁹ / Use up to 40 integers within ±10⁹.');
 return build(input);
};
lesson.statement=bi('Mỗi bước tăng hoặc giảm một ô đi 1. Giá trị có thể bằng 0 hoặc âm. Tạo dãy tăng nghiêm ngặt rồi giảm nghiêm ngặt với đỉnh ở bên trong; trả chi phí nhỏ nhất, hoặc -1 nếu không thể. Giới hạn hình: tối đa 40 ô.', 'Each operation changes one value by 1. Zero and negative values are allowed. Build a strictly increasing then strictly decreasing array with an internal peak. Return the minimum cost, or -1 if impossible. Visual limit: 40 values.');
lesson.approach=[bi('Đổi a[i] thành a[i] − i để xử lý dãy không giảm.','Transform a[i] to a[i] − i to fit a nondecreasing sequence.'),bi('Max-heap ghi chi phí tối thiểu cho mỗi tiền tố; làm cả hai chiều.','A max-heap records optimal prefix costs in both directions.'),bi('Thử từng đỉnh, rồi dựng lại đường núi đạt đúng chi phí đã chọn.','Try each peak, then reconstruct a mountain matching the selected cost.')];
lesson.liveEditorDisabled=true;lesson.sourceLanguage='python';
lesson.complexity.note=bi('Gồm dựng lại một phương án tối ưu; không tính lịch sử debug.','Includes reconstruction of one optimum; excludes debug history.');
module.exports={4124:lesson};
