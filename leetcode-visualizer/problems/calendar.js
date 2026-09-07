const both = (vi, en) => ({ vi, en });

function parseBookings(input) {
  let bookings;
  try { bookings = JSON.parse(input); } catch (_) { /* Report one actionable error below. */ }
  if (!Array.isArray(bookings) || bookings.length > 100 || !bookings.every(pair =>
    Array.isArray(pair) && pair.length === 2 && pair.every(Number.isInteger) &&
    pair[0] >= 0 && pair[0] < pair[1] && pair[1] <= 1e9)) {
    throw new Error('Nhập tối đa 100 cặp [start,end], 0 ≤ start < end ≤ 10^9 / Enter up to 100 valid [start,end] pairs.');
  }
  return bookings;
}

function buildSteps729(input) {
  const bookings = parseBookings(input), calendar = [], answer = [], steps = [];
  const snap = (phase, current, compared, codeLines, note) => steps.push({
    title: both('Lịch đặt chỗ · ' + phase, 'Booking calendar · ' + phase), codeLines, note,
    vars: [{ name: 'calendar', value: JSON.stringify(calendar) }, { name: 'results', value: JSON.stringify(answer) }],
    calendarView: { phase, current: current && [...current], compared, calendar: calendar.map(p => [...p]), results: [...answer],
      maximum: Math.max(1, ...bookings.flat()), minimum: Math.min(0, ...bookings.flat()) },
  });
  snap('init', null, -1, [3], both('Lịch ban đầu rỗng.', 'The calendar starts empty.'));
  for (const current of bookings) {
    const [start, end] = current;
    snap('request', current, -1, [5], both('Kiểm tra từng lịch đã nhận.', 'Check each accepted booking.'));
    let conflict = false;
    for (let j = 0; j < calendar.length; j++) {
      const [s, e] = calendar[j];
      conflict = start < e && s < end;
      snap('compare', current, j, [6, 7], both(`${start} < ${e} và ${s} < ${end}: ${conflict}.`, `${start} < ${e} and ${s} < ${end}: ${conflict}.`));
      if (conflict) { answer.push(false); snap('rejected', current, j, [8], both('Có giao nhau: trả False, giữ nguyên lịch.', 'Overlap: return False and leave the calendar unchanged.')); break; }
    }
    if (!conflict) { calendar.push([...current]); answer.push(true); snap('accepted', current, -1, [9, 10], both('Không giao nhau: lưu lịch và trả True.', 'No overlap: save the booking and return True.')); }
  }
  snap('done', null, -1, [], both('Kết quả theo thứ tự gọi book.', 'Results in book call order.'));
  return { original: bookings, answer, steps };
}

module.exports = {
  729: {
    id: 729, difficulty: 'medium', slug: 'my-calendar-i',
    category: { key: 'array', vi: 'Mảng', en: 'Array' },
    tags: [{ key: 'design', vi: 'Thiết kế', en: 'Design' }],
    title: both('My Calendar I', 'My Calendar I'), titleVi: both('Lịch không trùng giờ', 'Calendar without double bookings'),
    statement: both('Cài đặt MyCalendar.book(start, end). Chỉ nhận lịch [start,end) nếu không giao với lịch đã nhận. Trả true nếu nhận, false nếu từ chối.',
      'Implement MyCalendar.book(start, end). Accept [start,end) only if it overlaps no accepted booking. Return true when accepted, false when rejected.'),
    defaultInput: '[[10,20],[15,25],[20,30]]', inputKind: 'string', extraParams: [],
    inputLabel: both('Các lần book dạng JSON: [[10,20],[15,25],[20,30]]', 'Bookings as JSON: [[10,20],[15,25],[20,30]]'),
    approach: [both('Duyệt danh sách các lịch đã nhận.', 'Scan the list of accepted bookings.'),
      both('Hai khoảng giao nhau khi start < e AND s < end.', 'Two intervals overlap when start < e AND s < end.'),
      both('Điểm end không thuộc khoảng: [10,20) và [20,30) không giao nhau.', 'The end is excluded: [10,20) and [20,30) do not overlap.')],
    complexity: { time: 'O(n) / book', space: 'O(n)', note: both('n là số lịch đã nhận; q lần gọi tốn O(q²) tổng. Minh họa giới hạn 100 lần gọi.', 'n is the accepted booking count; q calls take O(q²) total. Visualization is limited to 100 calls.') },
    code: ['class MyCalendar:', '    def __init__(self):', '        self.calendar = []', '', '    def book(self, start: int, end: int) -> bool:', '        for s, e in self.calendar:', '            if start < e and s < end:', '                return False', '        self.calendar.append((start, end))', '        return True'],
    builder: buildSteps729, parseBookings,
  },
};
