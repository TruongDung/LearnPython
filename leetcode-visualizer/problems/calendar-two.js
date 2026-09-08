const both = (vi, en) => ({ vi, en });
const { parseBookings } = require('./calendar')[729];

function buildSteps731(input) {
  const bookings = parseBookings(input);
  const calendar = [];
  const doubles = [];
  const answer = [];
  const steps = [];
  const endpoints = bookings.flat();
  const rawMinimum = endpoints.length ? Math.min(...endpoints) : 0;
  const rawMaximum = endpoints.length ? Math.max(...endpoints) : 1;
  const padding = Math.max(1, Math.ceil((rawMaximum - rawMinimum) * 0.08));
  const minimum = Math.max(0, rawMinimum - padding);
  const maximum = rawMaximum + padding;

  const makeCoverage = (current, requestApplied) => {
    const points = new Set([minimum, maximum]);
    for (const entry of calendar) {
      points.add(entry.range[0]);
      points.add(entry.range[1]);
    }
    if (current) {
      points.add(current[0]);
      points.add(current[1]);
    }
    const sorted = [...points].sort((a, b) => a - b);
    const segments = [];
    for (let i = 0; i + 1 < sorted.length; i += 1) {
      const start = sorted[i];
      const end = sorted[i + 1];
      if (start === end) continue;
      const middle = (start + end) / 2;
      const base = calendar.reduce((count, entry) => count + (entry.range[0] <= middle && middle < entry.range[1] ? 1 : 0), 0);
      const requestCovers = Boolean(current && current[0] <= middle && middle < current[1]);
      const proposed = base + (!requestApplied && requestCovers ? 1 : 0);
      segments.push({ start, end, base, proposed, requestCovers });
    }
    return segments;
  };

  const snap = ({
    phase,
    currentCall = -1,
    compared = -1,
    doubleCompared = -1,
    codeLines,
    note,
    checkStart = null,
    checkEnd = null,
    overlap = null,
    intersection = null,
    justAddedCalendar = -1,
    justAddedDouble = -1,
    requestApplied = false,
    final = false,
  }) => {
    const current = currentCall >= 0 ? bookings[currentCall] : null;
    const phaseIndex = phase === 'init' || phase === 'request'
      ? 0
      : phase === 'check-double' || phase === 'doubles-safe'
        ? 1
        : phase === 'check-calendar' || phase === 'add-double'
          ? 2
          : phase === 'append'
            ? 3
            : 4;
    const callStates = bookings.map((range, index) => ({
      index,
      range: [...range],
      state: index < answer.length
        ? (answer[index] ? 'accepted' : 'rejected')
        : index === currentCall ? 'current' : 'pending',
    }));
    steps.push({
      title: both(
        phase === 'done' ? 'Hoàn tất My Calendar II' : current ? `book(${current[0]}, ${current[1]}) · ${phase}` : 'Khởi tạo My Calendar II',
        phase === 'done' ? 'My Calendar II complete' : current ? `book(${current[0]}, ${current[1]}) · ${phase}` : 'Initialize My Calendar II',
      ),
      codeLines: Array.isArray(codeLines) ? codeLines : [codeLines],
      final,
      note,
      vars: [
        { name: 'calendar', value: JSON.stringify(calendar.map(entry => entry.range)) },
        { name: 'doubles', value: JSON.stringify(doubles.map(entry => entry.range)) },
        { name: 'results', value: JSON.stringify(answer) },
      ],
      calendar731View: {
        phase,
        phaseIndex,
        bookings: bookings.map(range => [...range]),
        callStates,
        currentCall,
        current: current && [...current],
        compared,
        doubleCompared,
        calendar: calendar.map(entry => ({ range: [...entry.range], callIndex: entry.callIndex })),
        doubles: doubles.map(entry => ({ range: [...entry.range], sourceCalls: [...entry.sourceCalls] })),
        results: [...answer],
        checkStart,
        checkEnd,
        overlap,
        intersection: intersection && [...intersection],
        justAddedCalendar,
        justAddedDouble,
        requestApplied,
        coverage: makeCoverage(current, requestApplied),
        minimum,
        maximum,
        explanation: note,
      },
    });
  };

  snap({
    phase: 'init',
    codeLines: [3, 4],
    requestApplied: true,
    note: both(
      'calendar lưu mọi lịch đã nhận. doubles chỉ lưu các đoạn đã được phủ đúng hai lần; request chạm doubles sẽ tạo triple booking.',
      'calendar stores every accepted booking. doubles stores only regions already covered twice; touching doubles would create a triple booking.',
    ),
  });

  for (let currentCall = 0; currentCall < bookings.length; currentCall += 1) {
    const current = bookings[currentCall];
    const [start, end] = current;
    snap({
      phase: 'request',
      currentCall,
      codeLines: 6,
      note: both(
        `Nhận request [${start}, ${end}). Chưa thay đổi calendar hoặc doubles.`,
        `Receive request [${start}, ${end}). Neither calendar nor doubles changes yet.`,
      ),
    });

    let rejected = false;
    for (let doubleCompared = 0; doubleCompared < doubles.length; doubleCompared += 1) {
      const [s, e] = doubles[doubleCompared].range;
      const checkStart = start < e;
      const checkEnd = s < end;
      const overlap = checkStart && checkEnd;
      const intersection = overlap ? [Math.max(start, s), Math.min(end, e)] : null;
      snap({
        phase: 'check-double',
        currentCall,
        doubleCompared,
        codeLines: [7, 8],
        checkStart,
        checkEnd,
        overlap,
        intersection,
        note: overlap
          ? both(
            `Request giao danger zone [${s}, ${e}) trên [${intersection[0]}, ${intersection[1]}): nếu thêm sẽ có ba lịch cùng lúc.`,
            `The request meets danger zone [${s}, ${e}) on [${intersection[0]}, ${intersection[1]}): accepting it would create three simultaneous bookings.`,
          )
          : both(
            `Request không giao danger zone [${s}, ${e}); tiếp tục kiểm tra.`,
            `The request does not overlap danger zone [${s}, ${e}); continue checking.`,
          ),
      });
      if (overlap) {
        rejected = true;
        answer.push(false);
        snap({
          phase: 'rejected',
          currentCall,
          doubleCompared,
          codeLines: 9,
          checkStart,
          checkEnd,
          overlap: true,
          intersection,
          note: both(
            'Từ chối request trước khi sửa dữ liệu. calendar và doubles đều giữ nguyên.',
            'Reject before mutating data. Both calendar and doubles remain unchanged.',
          ),
        });
        break;
      }
    }
    if (rejected) continue;

    snap({
      phase: 'doubles-safe',
      currentCall,
      codeLines: 10,
      note: both(
        'Request đã vượt qua mọi danger zone: nó không thể tạo triple booking. Bây giờ mới tìm các vùng double mới.',
        'The request passed every danger zone, so it cannot create a triple booking. Now find new double-booked regions.',
      ),
    });

    for (let compared = 0; compared < calendar.length; compared += 1) {
      const [s, e] = calendar[compared].range;
      const checkStart = start < e;
      const checkEnd = s < end;
      const overlap = checkStart && checkEnd;
      const intersection = overlap ? [Math.max(start, s), Math.min(end, e)] : null;
      snap({
        phase: 'check-calendar',
        currentCall,
        compared,
        codeLines: [10, 11],
        checkStart,
        checkEnd,
        overlap,
        intersection,
        note: overlap
          ? both(
            `Request giao lịch #${calendar[compared].callIndex + 1}; phần chung [${intersection[0]}, ${intersection[1]}) sẽ trở thành danger zone mới.`,
            `The request overlaps booking #${calendar[compared].callIndex + 1}; shared region [${intersection[0]}, ${intersection[1]}) becomes a new danger zone.`,
          )
          : both(
            `Không giao lịch #${calendar[compared].callIndex + 1}; không tạo vùng double.`,
            `No overlap with booking #${calendar[compared].callIndex + 1}; no double region is created.`,
          ),
      });
      if (overlap) {
        doubles.push({ range: intersection, sourceCalls: [calendar[compared].callIndex, currentCall] });
        snap({
          phase: 'add-double',
          currentCall,
          compared,
          doubleCompared: doubles.length - 1,
          codeLines: 12,
          checkStart,
          checkEnd,
          overlap: true,
          intersection,
          justAddedDouble: doubles.length - 1,
          note: both(
            `Lưu [${intersection[0]}, ${intersection[1]}) vào doubles. Request sau này không được giao vùng này.`,
            `Store [${intersection[0]}, ${intersection[1]}) in doubles. Future requests may not overlap this region.`,
          ),
        });
      }
    }

    calendar.push({ range: [...current], callIndex: currentCall });
    snap({
      phase: 'append',
      currentCall,
      justAddedCalendar: calendar.length - 1,
      codeLines: 13,
      requestApplied: true,
      note: both(
        `Đã cập nhật doubles an toàn; thêm [${start}, ${end}) vào calendar.`,
        `The doubles list is safely updated; append [${start}, ${end}) to calendar.`,
      ),
    });
    answer.push(true);
    snap({
      phase: 'accepted',
      currentCall,
      justAddedCalendar: calendar.length - 1,
      codeLines: 14,
      requestApplied: true,
      note: both(
        `book(${start}, ${end}) trả True. Không thời điểm nào bị phủ ba lần.`,
        `book(${start}, ${end}) returns True. No moment is covered three times.`,
      ),
    });
  }

  snap({
    phase: 'done',
    codeLines: [],
    requestApplied: true,
    final: true,
    note: both(
      'calendar chứa lịch đã nhận; doubles tiếp tục bảo vệ mọi request tương lai khỏi triple booking.',
      'calendar contains accepted bookings; doubles keeps protecting future requests from triple booking.',
    ),
  });
  return { original: bookings, answer, steps };
}

module.exports = {
  731: {
    id: 731, difficulty: 'medium', slug: 'my-calendar-ii',
    category: { key: 'array', vi: 'Mảng', en: 'Array' },
    tags: [{ key: 'segment-tree', vi: 'Segment Tree', en: 'Segment Tree' }],
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
