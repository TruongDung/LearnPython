'use strict';
const { lesson, rows } = require('./sweep-lesson');
function squares(value) { rows(value,3,{min:1,max:12,ordered:false,lo:0,hi:10000}); if(value.some(r=>r[2]===0)) throw Error('Square sides must be positive.'); }
function points(value) { rows(value,2,{min:1,max:16,ordered:false}); if(new Set(value.map(JSON.stringify)).size!==value.length) throw Error('Points must be distinct.'); }
const specs = [
  {
    id: 391, title: 'Perfect Rectangle', slug: 'perfect-rectangle', difficulty: 'hard', category: 'geometry', tags: ['sweep-line'],
    fields: ['rectangles'], example: [[1,1,3,3],[3,1,4,2],[3,2,4,4],[1,3,2,4],[2,3,3,4]], kind: 'geometry', picture: { rectangles: true },
    validate(rectangles) { rows(rectangles,4,{ordered:false,min:1}); if(rectangles.some(r=>r[0]>=r[2]||r[1]>=r[3])) throw Error('Use [x1,y1,x2,y2] with x1 < x2 and y1 < y2.'); },
    statement: ['Kiểm tra các hình chữ nhật có phủ chính xác một hình chữ nhật lớn, không lỗ và không chồng lấn.', 'Check whether the rectangles exactly tile one bounding rectangle, with no gaps or overlaps.'],
    hint: ['Tổng diện tích phải bằng khung bao; các góc xuất hiện lẻ chỉ gồm 4 góc khung.', 'The area sum must equal the bounding area; only the four outer corners may have odd parity.'], time: 'O(n)', space: 'O(n)',
    source: `def isRectangleCover(self, rectangles):
    min_x = min(r[0] for r in rectangles)
    min_y = min(r[1] for r in rectangles)
    max_x = max(r[2] for r in rectangles)
    max_y = max(r[3] for r in rectangles)
    area = 0
    corners = set()
    for i, (x1, y1, x2, y2) in enumerate(rectangles):
        area += (x2 - x1) * (y2 - y1)
        for point in [(x1, y1), (x1, y2), (x2, y1), (x2, y2)]:
            if point in corners:
                corners.remove(point)
            else:
                corners.add(point)
    expected = {(min_x, min_y), (min_x, max_y), (max_x, min_y), (max_x, max_y)}
    return area == (max_x - min_x) * (max_y - min_y) and corners == expected`,
  },
  {
    id: 3453, title: 'Separate Squares I', slug: 'separate-squares-i', category: 'geometry', tags: ['sweep-line'],
    fields: ['squares'], example: [[0,0,2],[1,1,2],[4,4,1]], kind: 'geometry', picture: { squares: true }, validate: squares,
    statement: ['Tìm đường ngang thấp nhất chia đôi tổng diện tích hình vuông. Phần chồng lấn được tính riêng cho từng hình.', 'Find the lowest horizontal line splitting total square area in half. Overlapping areas count once per square.'],
    hint: ['Quét y; bề rộng là tổng cạnh các hình đang cắt. Nội suy trong dải chứa nửa diện tích.', 'Sweep y; active width is the sum of crossing side lengths. Interpolate inside the slab containing half the area.'], time: 'O(n log n)', space: 'O(n)',
    source: `def separateSquares(self, squares):
    events = []
    for x, y, side in squares:
        events.append((y, side))
        events.append((y + side, -side))
    events.sort()
    prev = events[0][0]
    width = total = 0
    slabs = []
    for y, change in events:
        if y > prev and width > 0:
            slabs.append([prev, y, width])
            total += (y - prev) * width
        width += change
        prev = y
    target = total / 2
    accumulated = 0
    for bottom, top, width in slabs:
        area = (top - bottom) * width
        if accumulated + area >= target:
            cut = bottom + (target - accumulated) / width
            return cut
        accumulated += area`,
  },
  {
    id: 3454, title: 'Separate Squares II', slug: 'separate-squares-ii', difficulty: 'hard', category: 'segment-tree', tags: ['geometry','sweep-line'],
    fields: ['squares'], example: [[0,0,2],[1,1,2],[4,4,1]], kind: 'geometry', picture: { squares: true, union: true, arrays: ['xs','count','length'] }, validate: squares,
    statement: ['Tìm đường ngang thấp nhất chia đôi diện tích hợp các hình vuông. Phần chồng lấn chỉ tính một lần.', 'Find the lowest horizontal line bisecting the union area of the squares. Overlap counts only once.'],
    hint: ['Nén tọa độ x; segment tree đếm độ phủ và độ dài hợp trong mỗi dải y.', 'Compress x coordinates; a segment tree maintains cover counts and union length in each y slab.'], time: 'O(n log n)', space: 'O(n)',
    source: `def separateSquares(self, squares):
    xs = sorted({v for x, y, side in squares for v in (x, x + side)})
    index = {x: i for i, x in enumerate(xs)}
    m = len(xs) - 1
    count = [0] * (4 * m + 4)
    length = [0] * (4 * m + 4)
    def update(node, left, right, ql, qr, change):
        if ql <= left and right <= qr:
            count[node] += change
        else:
            mid = (left + right) // 2
            if ql < mid:
                update(node * 2, left, mid, ql, qr, change)
            if qr > mid:
                update(node * 2 + 1, mid, right, ql, qr, change)
        if count[node] > 0:
            length[node] = xs[right] - xs[left]
        elif right - left == 1:
            length[node] = 0
        else:
            length[node] = length[node * 2] + length[node * 2 + 1]
    events = []
    for x, y, side in squares:
        events.append((y, 1, index[x], index[x + side]))
        events.append((y + side, -1, index[x], index[x + side]))
    events.sort()
    prev = events[0][0]
    total = 0
    slabs = []
    for y, change, ql, qr in events:
        width = length[1]
        if y > prev and width > 0:
            slabs.append([prev, y, width])
            total += (y - prev) * width
        update(1, 0, m, ql, qr, change)
        prev = y
    target = total / 2
    accumulated = 0
    for bottom, top, width in slabs:
        area = (top - bottom) * width
        if accumulated + area >= target:
            cut = bottom + (target - accumulated) / width
            return cut
        accumulated += area`,
  },
  {
    id: 587, title: 'Erect the Fence', slug: 'erect-the-fence', difficulty: 'hard', category: 'geometry',
    fields: ['trees'], example: [[1,1],[2,2],[2,0],[2,4],[3,3],[4,2]], kind: 'geometry', picture: { points: 'trees', hull: true }, validate: points,
    statement: ['Tìm mọi cây nằm trên biên hàng rào lồi ngắn nhất bao quanh tất cả cây; giữ cả các điểm thẳng hàng trên cạnh.', 'Return every tree on the boundary of the convex hull, including collinear boundary points.'],
    hint: ['Monotonic chain; chỉ bỏ khi quay phải (cross < 0), giữ các điểm thẳng hàng.', 'Monotonic chain; pop only right turns (cross < 0), retaining collinear boundary points.'], time: 'O(n log n)', space: 'O(n)',
    source: `def outerTrees(self, trees):
    points = sorted(map(tuple, trees))
    def cross(a, b, c):
        return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    lower = []
    for point in points:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], point) < 0:
            lower.pop()
        lower.append(point)
    upper = []
    for point in reversed(points):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], point) < 0:
            upper.pop()
        upper.append(point)
    result = sorted(set(lower + upper))
    return [list(point) for point in result]`,
  },
  {
    id: 939, title: 'Minimum Area Rectangle', slug: 'minimum-area-rectangle', category: 'geometry',
    fields: ['points'], example: [[1,1],[1,3],[3,1],[3,3],[2,2]], kind: 'geometry', picture: { points: 'points' }, validate: points,
    statement: ['Tìm hình chữ nhật có các cạnh song song trục và bốn đỉnh trong points, diện tích nhỏ nhất. Không có thì trả 0.', 'Find the smallest axis-aligned rectangle whose four corners are input points, or return 0 if none exists.'],
    hint: ['Quét cột x; ghi nhớ cột gần nhất từng chứa cùng cặp y.', 'Sweep x columns; remember the nearest previous column containing each y pair.'], time: 'O(n²)', space: 'O(n²)',
    source: `def minAreaRect(self, points):
    columns = defaultdict(list)
    for x, y in points:
        columns[x].append(y)
    last = {}
    answer = inf
    rectangle = []
    best_box = []
    for x in sorted(columns):
        ys = sorted(columns[x])
        for y1, y2 in combinations(ys, 2):
            if (y1, y2) in last:
                prev = last[(y1, y2)]
                rectangle = [[prev, y1], [x, y1], [x, y2], [prev, y2]]
                area = (x - prev) * (y2 - y1)
                if area < answer:
                    answer = area
                    best_box = rectangle
            last[(y1, y2)] = x
    return 0 if answer == inf else answer`,
  },
  {
    id: 963, title: 'Minimum Area Rectangle II', slug: 'minimum-area-rectangle-ii', category: 'geometry',
    fields: ['points'], example: [[1,2],[2,1],[1,0],[0,1],[3,3]], kind: 'geometry', picture: { points: 'points' }, validate: points,
    statement: ['Tìm hình chữ nhật nhỏ nhất có bốn đỉnh trong points; hình được phép xoay. Không có thì trả 0.', 'Find the smallest rectangle with four vertices among points, allowing rotation, or return 0 if none exists.'],
    hint: ['Hai đường chéo có cùng trung điểm và độ dài tạo hình chữ nhật; so diện tích các ứng viên.', 'Equal-length diagonals sharing a midpoint form a rectangle; compare candidate areas.'], time: 'O(n² + Σg²)', space: 'O(n²)',
    source: `def minAreaFreeRect(self, points):
    groups = defaultdict(list)
    answer = inf
    rectangle = []
    best_box = []
    for i, p in enumerate(points):
        for q in points[i + 1:]:
            distance = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2
            key = (p[0] + q[0], p[1] + q[1], distance)
            for u, v in groups[key]:
                rectangle = [u, p, v, q]
                area = hypot(u[0] - p[0], u[1] - p[1]) * hypot(u[0] - q[0], u[1] - q[1])
                if area < answer:
                    answer = area
                    best_box = rectangle
            groups[key].append((p, q))
    return 0 if answer == inf else answer`,
  },
];
module.exports = Object.fromEntries(specs.map(spec => [spec.id, lesson(spec)]));
