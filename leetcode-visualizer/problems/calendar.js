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
  const bookings = parseBookings(input);
  const calendar = [];
  const answer = [];
  const steps = [];
  const rawMinimum = Math.min(...bookings.flat());
  const rawMaximum = Math.max(...bookings.flat());
  const padding = Math.max(1, Math.ceil((rawMaximum - rawMinimum) * 0.08));
  const minimum = Math.max(0, rawMinimum - padding);
  const maximum = rawMaximum + padding;

  const snap = ({
    phase,
    currentCall = -1,
    compared = -1,
    codeLines,
    note,
    checkStart = null,
    checkEnd = null,
    activeCheck = '',
    overlap = null,
    intersection = null,
    relationship = '',
    justAdded = -1,
    final = false,
  }) => {
    const current = currentCall >= 0 ? bookings[currentCall] : null;
    const phaseIndex = phase === 'init' || phase === 'request'
      ? 0
      : phase === 'select' || phase === 'check-start' || phase === 'check-end'
        ? 1
        : phase === 'decision'
          ? 2
          : 3;
    const callStates = bookings.map((range, index) => ({
      index,
      range: [...range],
      state: index < answer.length
        ? (answer[index] ? 'accepted' : 'rejected')
        : index === currentCall ? 'current' : 'pending',
    }));
    steps.push({
      title: both(
        phase === 'done' ? 'Hoàn tất mọi lần book' : current ? `book(${current[0]}, ${current[1]}) · ${phase}` : 'Khởi tạo MyCalendar',
        phase === 'done' ? 'All book calls complete' : current ? `book(${current[0]}, ${current[1]}) · ${phase}` : 'Initialize MyCalendar',
      ),
      codeLines: Array.isArray(codeLines) ? codeLines : [codeLines],
      final,
      note,
      vars: [
        { name: 'start', value: current ? current[0] : '-' },
        { name: 'end', value: current ? current[1] : '-' },
        { name: 'calendar', value: JSON.stringify(calendar.map(entry => entry.range)) },
        { name: 'results', value: JSON.stringify(answer) },
      ],
      calendar729View: {
        phase,
        phaseIndex,
        bookings: bookings.map(range => [...range]),
        callStates,
        currentCall,
        current: current && [...current],
        compared,
        calendar: calendar.map(entry => ({ range: [...entry.range], callIndex: entry.callIndex })),
        results: [...answer],
        checkStart,
        checkEnd,
        activeCheck,
        overlap,
        intersection: intersection && [...intersection],
        relationship,
        justAdded,
        minimum,
        maximum,
        explanation: note,
      },
    });
  };

  snap({
    phase: 'init',
    codeLines: 3,
    note: both(
      'calendar bắt đầu rỗng. Mỗi khoảng dùng dạng [start, end): lấy start nhưng không lấy end.',
      'calendar starts empty. Every interval is [start, end): start is included, end is excluded.',
    ),
  });

  for (let currentCall = 0; currentCall < bookings.length; currentCall += 1) {
    const current = bookings[currentCall];
    const [start, end] = current;
    snap({
      phase: 'request',
      currentCall,
      codeLines: 5,
      note: both(
        `Nhận yêu cầu [${start}, ${end}). Chưa sửa calendar; trước tiên phải kiểm tra mọi lịch đã nhận.`,
        `Receive [${start}, ${end}). Do not mutate calendar yet; first check every accepted booking.`,
      ),
    });

    let conflict = false;
    for (let compared = 0; compared < calendar.length; compared += 1) {
      const [s, e] = calendar[compared].range;
      snap({
        phase: 'select',
        currentCall,
        compared,
        codeLines: 6,
        note: both(
          `Lấy lịch #${calendar[compared].callIndex + 1} [${s}, ${e}) để so sánh với request.`,
          `Select booking #${calendar[compared].callIndex + 1} [${s}, ${e}) and compare it with the request.`,
        ),
      });

      const checkStart = start < e;
      snap({
        phase: 'check-start',
        currentCall,
        compared,
        codeLines: 7,
        checkStart,
        activeCheck: 'start',
        note: both(
          `${start} < ${e} là ${checkStart}. Start của request phải nằm trước end của lịch cũ.`,
          `${start} < ${e} is ${checkStart}. The request start must be before the existing booking's end.`,
        ),
      });

      const checkEnd = s < end;
      snap({
        phase: 'check-end',
        currentCall,
        compared,
        codeLines: 7,
        checkStart,
        checkEnd,
        activeCheck: 'end',
        note: both(
          `${s} < ${end} là ${checkEnd}. Start của lịch cũ phải nằm trước end của request.`,
          `${s} < ${end} is ${checkEnd}. The existing booking's start must be before the request end.`,
        ),
      });

      conflict = checkStart && checkEnd;
      const intersectionStart = Math.max(start, s);
      const intersectionEnd = Math.min(end, e);
      const relationship = conflict ? 'overlap' : end <= s ? 'before' : 'after';
      const intersection = conflict ? [intersectionStart, intersectionEnd] : null;
      snap({
        phase: 'decision',
        currentCall,
        compared,
        codeLines: 7,
        checkStart,
        checkEnd,
        activeCheck: 'and',
        overlap: conflict,
        intersection,
        relationship,
        note: conflict
          ? both(
            `Cả hai điều kiện đều True nên có phần giao [${intersectionStart}, ${intersectionEnd}).`,
            `Both conditions are True, so the intervals intersect on [${intersectionStart}, ${intersectionEnd}).`,
          )
          : both(
            relationship === 'before'
              ? `${end} ≤ ${s}: request kết thúc trước hoặc vừa chạm start của lịch cũ.`
              : `${e} ≤ ${start}: lịch cũ kết thúc trước hoặc vừa chạm start của request.`,
            relationship === 'before'
              ? `${end} ≤ ${s}: the request ends before or exactly at the existing start.`
              : `${e} ≤ ${start}: the existing booking ends before or exactly at the request start.`,
          ),
      });

      if (conflict) {
        answer.push(false);
        snap({
          phase: 'rejected',
          currentCall,
          compared,
          codeLines: 8,
          checkStart,
          checkEnd,
          overlap: true,
          intersection,
          relationship,
          note: both(
            `Từ chối [${start}, ${end}) và giữ nguyên calendar.`,
            `Reject [${start}, ${end}) and leave calendar unchanged.`,
          ),
        });
        break;
      }
    }

    if (conflict) continue;
    calendar.push({ range: [...current], callIndex: currentCall });
    snap({
      phase: 'append',
      currentCall,
      justAdded: calendar.length - 1,
      codeLines: 9,
      note: both(
        `Mọi lịch cũ đều pass. Thêm [${start}, ${end}) vào calendar.`,
        `Every accepted booking passed. Append [${start}, ${end}) to calendar.`,
      ),
    });
    answer.push(true);
    snap({
      phase: 'accepted',
      currentCall,
      justAdded: calendar.length - 1,
      codeLines: 10,
      note: both(
        `book(${start}, ${end}) trả True. Calendar hiện có ${calendar.length} lịch.`,
        `book(${start}, ${end}) returns True. Calendar now contains ${calendar.length} booking(s).`,
      ),
    });
  }

  snap({
    phase: 'done',
    codeLines: [],
    note: both('Kết quả theo đúng thứ tự gọi book.', 'Results are listed in book-call order.'),
    final: true,
  });
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
