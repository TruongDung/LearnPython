const both = (vi, en) => ({ vi, en });
const METHODS = new Set(['addRange', 'queryRange', 'removeRange']);

function parseRangeOperations(input) {
  let operations;
  try { operations = JSON.parse(input); } catch (_) { /* Use the validation message below. */ }
  if (!Array.isArray(operations) || operations.length > 100 || !operations.every(op =>
    Array.isArray(op) && op.length === 3 && METHODS.has(op[0]) &&
    Number.isInteger(op[1]) && Number.isInteger(op[2]) &&
    1 <= op[1] && op[1] < op[2] && op[2] <= 1e9)) {
    throw new Error('Nhập tối đa 100 lệnh JSON ["addRange"|"removeRange"|"queryRange", left, right], 1 ≤ left < right ≤ 10^9 / Enter up to 100 valid JSON operations, e.g. [["addRange",10,20],["queryRange",10,14]].');
  }
  return operations;
}

function buildSteps715(input) {
  const operations = parseRangeOperations(input);
  const points = [], answer = [], steps = [];
  const bounds = operations.flatMap(op => op.slice(1));
  // Equal spacing keeps narrow intervals visible even near 10^9. This is only
  // a display scale; the algorithm always uses the original coordinates.
  const coordinates = bounds.length
    ? [...new Set([Math.min(...bounds) - 1, ...bounds, Math.max(...bounds) + 1])].sort((a, b) => a - b)
    : [0, 1];
  let callIndex = -1, before = [], i = null, j = null, replacement = null;

  const snap = (phase, codeLine, note, binary = null) => {
    const current = operations[callIndex] || null;
    steps.push({
      title: both(
        current ? `${current[0]}(${current[1]}, ${current[2]})` : 'Range Module · danh sách mốc biên',
        current ? `${current[0]}(${current[1]}, ${current[2]})` : 'Range Module · sorted endpoints',
      ),
      codeLines: codeLine == null ? [] : [codeLine],
      note, final: phase === 'done',
      vars: [
        { name: 'points', value: JSON.stringify(points) },
        { name: 'left', value: current ? current[1] : '—' },
        { name: 'right', value: current ? current[2] : '—' },
        { name: 'i', value: i ?? '—' }, { name: 'j', value: j ?? '—' },
        { name: 'boundary', value: replacement == null ? '—' : JSON.stringify(replacement) },
        { name: 'results', value: JSON.stringify(answer) },
      ],
      rangeModuleView: {
        phase, callIndex, operations, coordinates, current,
        points: [...points], before: [...before], results: [...answer],
        i, j, replacement: replacement && [...replacement], binary,
        explanation: note,
      },
    });
  };

  // Trace the same lower/upper bounds used by Python's bisect module.
  const bisect = (target, side, variable, line) => {
    let lo = 0, hi = points.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const moveRight = side === 'left' ? points[mid] < target : points[mid] <= target;
      const comparison = `${points[mid]} ${side === 'left' ? '<' : '≤'} ${target}`;
      snap('search', line, both(
        `${variable} = bisect_${side}: ${comparison} là ${moveRight}. ${moveRight ? `Đổi lo thành ${mid + 1}` : `Đổi hi thành ${mid}`}; vùng tìm kiếm là [lo, hi).`,
        `${variable} = bisect_${side}: ${comparison} is ${moveRight}. ${moveRight ? `Move lo to ${mid + 1}` : `Move hi to ${mid}`}; the search window is [lo, hi).`,
      ), { target, side, variable, lo, hi, mid, moveRight });
      if (moveRight) lo = mid + 1;
      else hi = mid;
    }
    if (variable === 'i') i = lo;
    else j = lo;
    snap('bound', line, both(
      `${variable} = ${lo}: có ${lo} mốc ${side === 'left' ? '<' : '≤'} ${target}. Vị trí chèn có thể bằng len(points).`,
      `${variable} = ${lo}: ${lo} endpoints are ${side === 'left' ? '<' : '≤'} ${target}. An insertion index may equal len(points).`,
    ), { target, side, variable, lo, hi, mid: null, moveRight: null });
  };

  snap('init', 5, both(
    'points rỗng. Mốc ở index chẵn mở vùng theo dõi, mốc ở index lẻ đóng vùng: [points[0], points[1]), …',
    'points starts empty. Even-indexed endpoints start coverage; odd-indexed endpoints end it: [points[0], points[1]), …',
  ));

  for (callIndex = 0; callIndex < operations.length; callIndex++) {
    const [method, left, right] = operations[callIndex];
    const query = method === 'queryRange', adding = method === 'addRange';
    const firstLine = query ? 17 : adding ? 7 : 22;
    before = [...points]; i = null; j = null; replacement = null;
    snap('request', firstLine, both(
      `Xử lý [${left}, ${right}): lấy left, không lấy right. ${query ? 'Truy vấn không sửa points.' : 'Tìm các mốc cần thay thế.'}`,
      `Process [${left}, ${right}): include left, exclude right. ${query ? 'Queries do not mutate points.' : 'Find the endpoints to replace.'}`,
    ));
    bisect(left, query ? 'right' : 'left', 'i', firstLine + 1);
    bisect(right, query ? 'left' : 'right', 'j', firstLine + 2);

    if (query) {
      const covered = i === j && i % 2 === 1;
      answer.push(covered);
      snap('result', 20, both(
        `i == j: ${i === j}; i lẻ: ${i % 2 === 1}. ${covered ? 'Toàn bộ khoảng nằm trong một vùng được theo dõi.' : i !== j ? 'Có mốc biên bên trong truy vấn, nên có phần chưa được theo dõi.' : 'Khoảng nằm ngoài các vùng được theo dõi.'} Trả ${covered}.`,
        `i == j: ${i === j}; i is odd: ${i % 2 === 1}. ${covered ? 'The entire interval lies within one tracked range.' : i !== j ? 'A coverage boundary lies inside the query, so part of it is untracked.' : 'The interval lies outside tracked ranges.'} Return ${covered}.`,
      ));
      continue;
    }

    const boundaryLine = adding ? 10 : 25;
    const parity = adding ? 0 : 1;
    replacement = [];
    snap('boundary', boundaryLine, both(
      `Chuẩn bị thay points[${i}:${j}]. Các mốc ngoài lát cắt giữ nguyên.`,
      `Prepare to replace points[${i}:${j}]. Endpoints outside the slice stay unchanged.`,
    ));
    snap('boundary', boundaryLine + 1, both(
      `i = ${i}; i % 2 == ${parity} là ${i % 2 === parity}. ${adding ? 'Thêm left nếu vùng ngay trước left chưa được theo dõi.' : 'Giữ left làm mốc đóng nếu vùng ngay trước left đang được theo dõi.'}`,
      `i = ${i}; i % 2 == ${parity} is ${i % 2 === parity}. ${adding ? 'Insert left if coverage immediately before left is off.' : 'Keep left as an end if coverage immediately before left is on.'}`,
    ));
    if (i % 2 === parity) {
      replacement.push(left);
      snap('boundary', boundaryLine + 2, both(`Thêm mốc left = ${left} vào boundary.`, `Append left = ${left} to boundary.`));
    }
    snap('boundary', boundaryLine + 3, both(
      `j = ${j}; j % 2 == ${parity} là ${j % 2 === parity}. ${adding ? 'Thêm right để đóng vùng mới nếu vùng bên phải chưa được theo dõi.' : 'Giữ right để mở lại vùng theo dõi ở bên phải.'}`,
      `j = ${j}; j % 2 == ${parity} is ${j % 2 === parity}. ${adding ? 'Insert right to end the new coverage if coverage to its right is off.' : 'Keep right to resume coverage on its right.'}`,
    ));
    if (j % 2 === parity) {
      replacement.push(right);
      snap('boundary', boundaryLine + 4, both(`Thêm mốc right = ${right} vào boundary.`, `Append right = ${right} to boundary.`));
    }
    points.splice(i, j - i, ...replacement);
    answer.push(null);
    snap('applied', boundaryLine + 5, both(
      `points[${i}:${j}] = ${JSON.stringify(replacement)}. ${adding ? 'Gộp cả các vùng chạm nhau.' : 'Có thể xóa hết, rút ngắn hoặc tách một vùng thành hai.'} Hàm không trả giá trị: null.`,
      `points[${i}:${j}] = ${JSON.stringify(replacement)}. ${adding ? 'Merge overlapping and touching ranges.' : 'Removal may erase, trim, or split a range.'} The method returns no value: null.`,
    ));
  }
  callIndex = -1; before = [...points]; i = null; j = null; replacement = null;
  snap('done', null, both(
    'Hoàn tất. Kết quả theo thứ tự lệnh; RangeModule() được khởi tạo tự động và không nằm trong output.',
    'Complete. Results follow operation order; RangeModule() is constructed automatically and is omitted from the output.',
  ));
  return { original: operations, answer, steps };
}

module.exports = {
  715: {
    id: 715, difficulty: 'hard', slug: 'range-module',
    category: { key: 'binary-search', vi: 'Tìm kiếm nhị phân', en: 'Binary Search' },
    tags: [{ key: 'design', vi: 'Thiết kế', en: 'Design' }, { key: 'array', vi: 'Mảng', en: 'Array' }],
    title: both('Range Module', 'Range Module'),
    titleVi: both('Thêm, xóa và kiểm tra vùng được theo dõi', 'Add, remove, and query tracked ranges'),
    statement: both(
      'Thiết kế RangeModule để theo dõi mọi số thực trong các khoảng [left, right). addRange thêm vùng, removeRange xóa vùng, queryRange trả true chỉ khi toàn bộ khoảng đã được theo dõi. Điểm right không thuộc khoảng.',
      'Design RangeModule to track real numbers in half-open intervals [left, right). addRange enables coverage, removeRange disables it, and queryRange returns true only when the entire interval is tracked. The right endpoint is excluded.',
    ),
    defaultInput: '[["addRange",10,20],["removeRange",14,16],["queryRange",10,14],["queryRange",13,15],["queryRange",16,17]]',
    inputKind: 'string', extraParams: [],
    inputLabel: both('Lệnh JSON: [["addRange",10,20],["queryRange",10,14]] · tự khởi tạo RangeModule()', 'JSON operations: [["addRange",10,20],["queryRange",10,14]] · RangeModule() is automatic'),
    approach: [
      both('Invariant: points tăng nghiêm ngặt, có số phần tử chẵn và ghép thành các vùng rời nhau [points[0], points[1]), … Không giữ hai vùng chạm nhau.', 'Invariant: points is strictly increasing with even length and pairs into disjoint tracked ranges [points[0], points[1]), … Touching ranges are merged.'),
      both('bisect_left(points, x) đếm mốc < x; bisect_right(points, x) đếm mốc ≤ x. Số mốc đã đi qua là lẻ thì đang ở trong vùng theo dõi.', 'bisect_left(points, x) counts endpoints < x; bisect_right(points, x) counts endpoints ≤ x. Crossing an odd number of endpoints means coverage is on.'),
      both('add/remove dùng i = bisect_left(left), j = bisect_right(right). Thay points[i:j] bằng tối đa hai mốc: add giữ biên có chỉ số chẵn, remove giữ biên có chỉ số lẻ.', 'Add/remove use i = bisect_left(left), j = bisect_right(right). Replace points[i:j] with up to two endpoints: add keeps boundaries with even indices; remove keeps those with odd indices.'),
      both('query dùng bisect_right(left) và bisect_left(right): cần i == j và i lẻ. Thứ tự bisect này xử lý đúng việc lấy left, không lấy right.', 'Query uses bisect_right(left) and bisect_left(right): require i == j and odd i. These bounds correctly include left and exclude right.'),
      both('Ví dụ: add [10,20), remove [14,16) → [10,14) và [16,20). query [10,14) đúng; [13,15) sai; [16,17) đúng.', 'Example: add [10,20), remove [14,16) → [10,14) and [16,20). Queries [10,14), [13,15), [16,17) return true, false, true.'),
    ],
    complexity: {
      time: 'query O(log n) · add/remove O(n)', space: 'O(n)',
      note: both('n là số mốc biên. Binary search tốn O(log n), nhưng thay lát cắt Python list cần O(n). Minh họa giới hạn 100 lệnh và lưu thêm snapshot; trục nén tọa độ chỉ dùng để hiển thị.', 'n is the number of endpoints. Binary search costs O(log n), but Python list slice updates cost O(n). Visualization allows 100 calls and stores extra snapshots; coordinate compression is for display only.'),
    },
    code: [
      'from bisect import bisect_left, bisect_right',
      '',
      'class RangeModule:',
      '    def __init__(self):',
      '        self.points = []',
      '',
      '    def addRange(self, left: int, right: int) -> None:',
      '        i = bisect_left(self.points, left)',
      '        j = bisect_right(self.points, right)',
      '        boundary = []',
      '        if i % 2 == 0:',
      '            boundary.append(left)',
      '        if j % 2 == 0:',
      '            boundary.append(right)',
      '        self.points[i:j] = boundary',
      '',
      '    def queryRange(self, left: int, right: int) -> bool:',
      '        i = bisect_right(self.points, left)',
      '        j = bisect_left(self.points, right)',
      '        return i == j and i % 2 == 1',
      '',
      '    def removeRange(self, left: int, right: int) -> None:',
      '        i = bisect_left(self.points, left)',
      '        j = bisect_right(self.points, right)',
      '        boundary = []',
      '        if i % 2 == 1:',
      '            boundary.append(left)',
      '        if j % 2 == 1:',
      '            boundary.append(right)',
      '        self.points[i:j] = boundary',
    ],
    builder: buildSteps715, parseRangeOperations,
  },
};
