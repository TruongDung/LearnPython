'use strict';
const { lesson, rows, vector, integer, sortedDisjoint } = require('./sweep-lesson');
const specs = [
  {
    id: 759, title: 'Employee Free Time', slug: 'employee-free-time', difficulty: 'hard', premium: true, category: 'interval', tags: ['greedy'],
    fields: ['schedule'], example: [[[1,2],[5,6]],[[1,3]],[[4,10]]], kind: 'interval', picture: { employees: true, lanes: ['merged','result'] },
    validate(schedule) { if(!Array.isArray(schedule)||schedule.length<1||schedule.length>8) throw Error('Use 1–8 employee schedules.'); schedule.forEach(employee=>{rows(employee,2,{max:6,min:1}); sortedDisjoint(employee,false); if(employee.some(r=>r[0]===r[1])) throw Error('Use start < end.');}); },
    statement: ['Lịch bận của mỗi nhân viên là danh sách cặp [start,end] đã sắp xếp. Tìm các khoảng rảnh chung hữu hạn có độ dài dương.', 'Each employee’s busy schedule is a sorted list of [start,end] pairs. Find all finite, positive-length intervals when everyone is free.'],
    hint: ['Gộp lịch bận của mọi người; khoảng trống trong hợp là thời gian rảnh chung.', 'Merge everyone’s busy intervals; gaps in their union are common free time.'], time: 'O(N log N)', space: 'O(N)',
    source: `def employeeFreeTime(self, schedule):
    intervals = sorted(interval for employee in schedule for interval in employee)
    result = []
    merged = []
    end = intervals[0][1]
    merged.append(list(intervals[0]))
    for start, finish in intervals[1:]:
        if start > end:
            result.append([end, start])
            merged.append([start, finish])
        else:
            merged[-1][1] = max(end, finish)
        end = max(end, finish)
    return result`,
  },
  {
    id: 1229, title: 'Meeting Scheduler', slug: 'meeting-scheduler', premium: true, category: 'two-pointer', tags: ['interval'],
    fields: ['slots1','slots2','duration'], example: { slots1: [[10,50],[60,120],[140,210]], slots2: [[0,15],[60,70]], duration: 8 }, kind: 'interval', picture: { lanes: ['slots1','slots2','result'] },
    validate(a,b,duration) { for(const slots of [a,b]) { rows(slots); const sorted=[...slots].sort((x,y)=>x[0]-y[0]); sortedDisjoint(sorted,false); if(slots.some(r=>r[0]===r[1])) throw Error('Use start < end.'); } integer(duration,1,10000); },
    statement: ['Hai người có các khung giờ không giao nhau. Tìm cuộc họp sớm nhất dài duration; trả [] nếu không có.', 'Given two people’s non-overlapping availability slots, find the earliest duration-long meeting, or [] if none fits.'],
    hint: ['Hai con trỏ tìm phần giao; nếu đủ dài trả về ngay, nếu không tiến bên kết thúc sớm.', 'Two pointers find the overlap; return the first long enough one, otherwise advance the earlier ending slot.'], time: 'O(n log n + m log m)', space: 'O(n + m)',
    source: `def minAvailableDuration(self, slots1, slots2, duration):
    slots1.sort()
    slots2.sort()
    i = j = 0
    result = []
    while i < len(slots1) and j < len(slots2):
        start = max(slots1[i][0], slots2[j][0])
        end = min(slots1[i][1], slots2[j][1])
        if end - start >= duration:
            result = [start, start + duration]
            return result
        if slots1[i][1] < slots2[j][1]:
            i += 1
        else:
            j += 1
    return result`,
  },
  {
    id: 1272, title: 'Remove Interval', slug: 'remove-interval', premium: true, category: 'interval', tags: ['array'],
    fields: ['intervals','toBeRemoved'], example: { intervals: [[0,2],[3,4],[5,7]], toBeRemoved: [1,6] }, kind: 'interval', picture: { lanes: ['intervals','toBeRemoved','result'] },
    validate(intervals,cut) { sortedDisjoint(intervals,false); vector(cut,{min:2,max:2}); rows([cut]); if(cut[0]===cut[1]||intervals.some(r=>r[0]===r[1])) throw Error('Use start < end.'); },
    statement: ['Xóa khoảng nửa mở toBeRemoved = [left,right) khỏi danh sách khoảng nửa mở đã sắp xếp và không giao nhau.', 'Remove the half-open interval toBeRemoved = [left,right) from sorted disjoint half-open intervals.'],
    hint: ['Không giao: giữ nguyên. Có giao: giữ phần bên trái và/hoặc bên phải còn lại.', 'No overlap: keep it. Overlap: retain any surviving left and right pieces.'], time: 'O(n)', space: 'O(n)',
    source: `def removeInterval(self, intervals, toBeRemoved):
    left, right = toBeRemoved
    result = []
    for start, end in intervals:
        if end <= left or start >= right:
            result.append([start, end])
        else:
            if start < left:
                result.append([start, left])
            if end > right:
                result.append([right, end])
    return result`,
  },
  {
    id: 2237, title: 'Count Positions on Street With Required Brightness', slug: 'count-positions-on-street-with-required-brightness', premium: true, category: 'prefix-sum',
    fields: ['n','lights','requirement'], example: { n: 5, lights: [[0,1],[2,1],[3,2]], requirement: [0,2,1,4,1] }, kind: 'difference', picture: { lights: true, arrays: ['diff','brightness','requirement'], closed: true },
    validate(n,lights,requirement) { integer(n,1,24); rows(lights,2,{ordered:false,lo:0,hi:10000}); if(lights.some(r=>r[0]>=n)) throw Error('Light positions must be smaller than n.'); vector(requirement,{min:n,max:n,lo:0,hi:100}); },
    statement: ['Đường có n vị trí 0..n−1. Mỗi đèn chiếu [position−radius,position+radius]. Đếm vị trí có số đèn chiếu ít nhất requirement[i].', 'A street has n positions 0..n−1. Each light covers [position−radius,position+radius]. Count positions meeting requirement[i].'],
    hint: ['Cắt vùng sáng về giới hạn đường, dùng mảng hiệu rồi so với yêu cầu.', 'Clamp light ranges to the street, prefix-sum a difference array, and compare against requirements.'], time: 'O(n + m)', space: 'O(n)',
    source: `def meetRequirement(self, n, lights, requirement):
    diff = [0] * (n + 1)
    for position, radius in lights:
        start = max(0, position - radius)
        end = min(n - 1, position + radius)
        diff[start] += 1
        diff[end + 1] -= 1
    active = answer = 0
    brightness = []
    for i in range(n):
        active += diff[i]
        brightness.append(active)
        if active >= requirement[i]:
            answer += 1
    return answer`,
  },
];
module.exports = Object.fromEntries(specs.map(spec => [spec.id, lesson(spec)]));
