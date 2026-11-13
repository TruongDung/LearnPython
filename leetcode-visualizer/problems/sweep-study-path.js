'use strict';

// Preserve the order of the user's five study lists, including existing lessons.
const SWEEP_STUDY_ORDER = [
  252,253,56,57,435,452,986,1288,228,2406,
  1094,1109,1854,1943,1893,2021,2251,2381,2772,2848,3169,3355,3356,3362,
  218,1851,1353,1751,2054,1942,2402,1834,1882,502,630,857,
  729,731,732,759,1229,1272,2158,2237,370,646,
  850,391,223,836,1401,3453,3454,587,939,963,
];
function registerSweepStudyPath(supported, categoryOrder) {
  const tag = { key:'sweep-line', vi:'Đường quét', en:'Sweep Line' };
  for(const id of SWEEP_STUDY_ORDER) {
    const problem=supported[id];
    if(!problem) continue;
    if(!problem.tags?.some(t=>t.key===tag.key)) problem.tags=[...(problem.tags||[]),tag];
  }
  categoryOrder[tag.key]={ order:SWEEP_STUDY_ORDER,
    label:{ vi:'Lộ trình: Interval → Mảng hiệu → Heap → Calendar → Hình học', en:'Study path: Intervals → Difference arrays → Heaps → Calendars → Geometry' } };
}
module.exports={ SWEEP_STUDY_ORDER, registerSweepStudyPath };
