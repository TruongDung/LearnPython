'use strict';

const FENWICK_TREE_TAG = {key:'fenwick-tree',vi:'Fenwick Tree',en:'Fenwick Tree'};
const LEVELS = [
  ['foundation','Nền tảng','Foundations',[
    [303,'Range Sum Query - Immutable','easy','Prefix Sum, chuẩn bị cho BIT','Prefix sums, preparation for BIT'],
    [307,'Range Sum Query - Mutable','medium','Point update + range sum','Point update + range sum'],
    [1409,'Queries on a Permutation With Key','medium','BIT theo vị trí','Position-based BIT'],
  ]],
  ['frequency','Đếm tần suất','Frequency counting',[
    [1395,'Count Number of Teams','medium','Đếm nhỏ hơn / lớn hơn','Count smaller / greater values'],
    [775,'Global and Local Inversions','medium','Inversion counting','Inversion counting'],
    [1505,'Minimum Possible Integer After at Most K Adjacent Swaps On Digits','hard','BIT theo vị trí','Position-based BIT'],
  ]],
  ['compression','Coordinate Compression','Coordinate Compression',[
    [315,'Count of Smaller Numbers After Self','hard','Compression + BIT','Compression + BIT'],
    [493,'Reverse Pairs','hard','Đếm cặp có điều kiện','Count pairs satisfying a condition'],
    [1649,'Create Sorted Array through Instructions','hard','Frequency BIT','Frequency BIT'],
    [327,'Count of Range Sum','hard','Prefix Sum + Compression','Prefix Sum + Compression'],
  ]],
  ['combined','Kết hợp thuật toán','Combining algorithms',[
    [2179,'Count Good Triplets in an Array','hard','Hai phía + counting','Count choices on both sides'],
    [2250,'Count Number of Rectangles Containing Each Point','medium','Offline queries + BIT','Offline queries + BIT'],
    [2426,'Number of Pairs Satisfying Inequality','hard','Compression + BIT','Compression + BIT'],
    [2519,'Count the Number of K-Big Indices','hard','Hai lượt BIT','Two BIT passes'],
    [2659,'Make Array Empty','hard','BIT theo vị trí','Position-based BIT'],
    [2907,'Maximum Profitable Triplets With Increasing Prices I','medium','Prefix maximum','Prefix maximum'],
    [2908,'Minimum Sum of Mountain Triplets I','easy','Bài nền tảng, không cần BIT','Foundation exercise; no BIT needed'],
  ]],
  ['advanced','Chuyên sâu','Advanced',[
    [308,'Range Sum Query 2D - Mutable','hard','2D Fenwick Tree','2D Fenwick Tree'],
    [2916,'Subarrays Distinct Element Sum of Squares II','hard','Range update + aggregate; Segment Tree thường phù hợp hơn','Range update + aggregate; Segment Tree is often more suitable'],
    [3072,'Distribute Elements Into Two Arrays II','hard','Hai BIT','Two BITs'],
    [2940,'Find Building Where Alice and Bob Can Meet','hard','Offline queries + prefix maximum','Offline queries + prefix maximum'],
    [3161,'Block Placement Queries','hard','Ordered set + BIT / Segment Tree','Ordered set + BIT / Segment Tree'],
    [3187,'Peaks in Array','hard','BIT + cập nhật cục bộ','BIT + local updates'],
    [673,'Number of Longest Increasing Subsequence','medium','DP + BIT nâng cao','DP + advanced BIT'],
  ]],
];
const FENWICK_ROSTER = LEVELS.flatMap(([level,,,rows],i)=>rows.map(([id,title,difficulty,vi,en])=>({id,title,difficulty,level,stage:i+1,technique:{vi,en}})));
const FENWICK_ORDER = FENWICK_ROSTER.map(p=>p.id);
const FENWICK_ORDER_LABEL = {vi:'Lộ trình 5 cấp · học theo thứ tự trong từng cấp',en:'Five levels · follow the order within each level'};
const FENWICK_GUIDE = Object.fromEntries(['vi','en'].map(lang=>[lang,{
  intro:lang==='vi'?'24 bài từ Prefix Sum đến đếm tần suất, nén tọa độ và phối hợp BIT với thuật toán khác.':'24 problems from prefix sums through frequencies, coordinate compression, and combining BIT with other algorithms.',
  patterns:FENWICK_ROSTER.map(p=>({id:p.id,name:p.title,pattern:p.technique[lang]})),
  stages:LEVELS.map(([key,vi,en],i)=>({title:lang==='vi'?`Cấp ${i+1} · ${vi}`:`Level ${i+1} · ${en}`,description:lang==='vi'?'Học theo thứ tự các bài bên dưới.':'Follow the problem order below.',problems:FENWICK_ROSTER.filter(p=>p.level===key).map(p=>p.id)})),
  conclusion:lang==='vi'?'303 và 2908 là bài nền tảng, không bắt buộc dùng BIT. Với 2916, Segment Tree thường phù hợp; visualization minh hoạ range update và aggregate bằng hai BIT.':'303 and 2908 are foundation exercises that do not require BIT. Segment Tree is often suitable for 2916; its visualization demonstrates range updates and aggregation with two BITs.',
}]));
function fenwickSubTabs(supported){
  const entries=FENWICK_ROSTER.map(p=>({...p,difficulty:supported[p.id]?.difficulty??p.difficulty,available:Boolean(supported[p.id])}));
  const known=new Set(FENWICK_ORDER);
  const extras=Object.values(supported).filter(p=>!known.has(p.id)&&[p.category,...(p.tags??[])].some(t=>t?.key==='fenwick-tree')).sort((a,b)=>a.id-b.id).map(p=>({id:p.id,title:p.title?.en??p.title,difficulty:p.difficulty,available:true}));
  return [{key:'all',vi:'Tất cả',en:'All',roster:[...entries,...extras]},...LEVELS.map(([key,vi,en],i)=>({key,vi:`Cấp ${i+1} · ${vi}`,en:`Level ${i+1} · ${en}`,roster:entries.filter(p=>p.level===key)}))];
}
module.exports={FENWICK_TREE_TAG,FENWICK_ROSTER,FENWICK_ORDER,FENWICK_ORDER_LABEL,FENWICK_GUIDE,fenwickSubTabs};
