const both = (vi, en) => ({ vi, en });
const { parseBookings } = require('./calendar')[729];

function buildSteps731(input) {
  const bookings = parseBookings(input), calendar = [], doubles = [], answer = [], steps = [];
  const maximum = Math.max(1, ...bookings.flat());
  const snap = (phase, current, compared, doubleCompared, codeLines, note, intersection = null) => steps.push({
    title: both('My Calendar II · bước ' + (steps.length + 1), 'My Calendar II · step ' + (steps.length + 1)),
    codeLines, note,
    vars: [{ name: 'calendar', value: JSON.stringify(calendar) }, { name: 'doubles', value: JSON.stringify(doubles) }, { name: 'results', value: JSON.stringify(answer) }],
    calendarView: { problemId: 731, phase, current: current && [...current], compared, doubleCompared,
      calendar: calendar.map(p => [...p]), doubles: doubles.map(p => [...p]), results: [...answer],
      intersection: intersection && [...intersection], maximum, minimum: 0 },
  });
  snap('init', null, -1, -1, [3, 4], both('calendar lưu lịch đã nhận; doubles lưu các vùng đã có hai lịch.', 'calendar stores accepted bookings; doubles stores regions already booked twice.'));
  for (const current of bookings) {
    const [start, end] = current;
    snap('request', current, -1, -1, [6], both('Trước tiên kiểm tra các vùng đặt hai lần. Chưa thay đổi dữ liệu.', 'First check double-booked regions. Do not change any data yet.'));
    let rejected = false;
    for (let j = 0; j < doubles.length; j++) {
      const [s, e] = doubles[j];
      const overlaps = start < e && s < end;
      snap('check-double', current, -1, j, [7, 8], both(`${start} < ${e} và ${s} < ${end}: ${overlaps}. Giao với doubles sẽ tạo ba lịch.`, `${start} < ${e} and ${s} < ${end}: ${overlaps}. Overlapping doubles would create a triple booking.`));
      if (overlaps) {
        rejected = true; answer.push(false);
        snap('rejected', current, -1, j, [9], both('Từ chối: cả calendar và doubles giữ nguyên.', 'Reject: both calendar and doubles remain unchanged.'));
        break;
      }
    }
    if (rejected) continue;
    for (let j = 0; j < calendar.length; j++) {
      const [s, e] = calendar[j];
      const overlaps = start < e && s < end;
      snap('compare', current, j, -1, [10, 11], both(`${start} < ${e} và ${s} < ${end}: ${overlaps}. Giao với một lịch là hợp lệ.`, `${start} < ${e} and ${s} < ${end}: ${overlaps}. Overlapping a single booking is allowed.`));
      if (overlaps) {
        const intersection = [Math.max(start, s), Math.min(end, e)];
        doubles.push(intersection);
        snap('add-double', current, j, doubles.length - 1, [12], both(`Lưu vùng giao [${intersection}): max hai start, min hai end.`, `Save intersection [${intersection}): max of starts, min of ends.`), intersection);
      }
    }
    calendar.push([...current]); answer.push(true);
    snap('accepted', current, -1, -1, [13, 14], both('Nhận lịch: không có thời điểm nào bị đặt ba lần.', 'Accept: no time is booked three times.'));
  }
  snap('done', null, -1, -1, [], both('Kết quả theo thứ tự gọi book; doubles dùng để kiểm tra lịch tiếp theo.', 'Results in book call order; doubles protects against future triple bookings.'));
  return { original: bookings, answer, steps };
}

module.exports = {
  731: {
    id: 731, difficulty: 'medium', slug: 'my-calendar-ii',
    category: { key: 'array', vi: 'Mảng', en: 'Array' },
    tags: [{ key: 'design', vi: 'Thiết kế', en: 'Design' }],
    title: both('My Calendar II', 'My Calendar II'), titleVi: both('Cho phép hai lịch trùng giờ', 'Allow double bookings'),
    statement: both('Cài đặt MyCalendarTwo.book(start,end). Cho phép hai lịch cùng lúc nhưng từ chối lịch tạo ba lịch cùng lúc. Khoảng [start,end) không bao gồm end.', 'Implement MyCalendarTwo.book(start,end). Allow double bookings but reject any request that creates a triple booking. Intervals [start,end) exclude end.'),
    defaultInput: '[[10,20],[50,60],[10,40],[5,15],[5,10],[25,55]]', inputKind: 'string', extraParams: [],
    inputLabel: both('Các lần book dạng JSON: [[10,20],[10,40],[5,15]]', 'Bookings as JSON: [[10,20],[10,40],[5,15]]'),
    approach: [
      both('Invariant: calendar chứa lịch đã nhận, doubles chứa vùng giao của từng cặp lịch đã nhận.', 'Invariant: calendar contains accepted bookings; doubles contains pairwise intersections of accepted bookings.'),
      both('Nếu lịch mới giao với doubles, trả False ngay trước khi sửa dữ liệu.', 'If the request overlaps doubles, return False before mutating either list.'),
      both('Nếu an toàn, lưu giao với từng lịch cũ vào doubles, rồi thêm lịch mới vào calendar.', 'If safe, add intersections with existing bookings to doubles, then append the request to calendar.'),
      both('Chạm biên không phải giao nhau: start < e AND s < end. Vùng giao là [max(start,s),min(end,e)).', 'Touching endpoints do not overlap: start < e AND s < end. The intersection is [max(start,s),min(end,e)).'),
    ],
    complexity: { time: 'O(n) / book', space: 'O(n)', note: both('n là số lịch đã nhận. Không có triple booking nên số vùng giao là O(n). q lần gọi: O(q²) tổng. Minh họa tối đa 100 lần gọi; lưu snapshot tốn thêm bộ nhớ.', 'n is the accepted booking count. Without triple bookings there are O(n) intersections. q calls: O(q²) total. Visualization allows 100 calls; trace snapshots use extra memory.') },
    code: ['class MyCalendarTwo:', '    def __init__(self):', '        self.calendar = []', '        self.doubles = []', '', '    def book(self, start: int, end: int) -> bool:', '        for s, e in self.doubles:', '            if start < e and s < end:', '                return False', '        for s, e in self.calendar:', '            if start < e and s < end:', '                self.doubles.append((max(start, s), min(end, e)))', '        self.calendar.append((start, end))', '        return True'],
    builder: buildSteps731, parseBookings,
  },
};
