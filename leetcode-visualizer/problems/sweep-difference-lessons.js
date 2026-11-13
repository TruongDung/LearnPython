'use strict';
const { lesson, rows, vector, integer, indexedQueries } = require('./sweep-lesson');
const specs = [
  {
    id: 1109, title: 'Corporate Flight Bookings', slug: 'corporate-flight-bookings', category: 'prefix-sum', tags: ['array'],
    fields: ['bookings','n'], example: { bookings: [[1,2,10],[2,3,20],[2,5,25]], n: 5 },
    kind: 'difference', picture: { lanes: ['bookings'], arrays: ['diff','result'], closed: true, indexBase: 1 },
    validate(bookings,n) { integer(n,1,24); rows(bookings,3,{ lo:1,hi:100 }); if(bookings.some(b=>b[1]>n)) throw Error('Flight endpoints must be ≤ n.'); },
    statement: ['Mỗi booking [first,last,seats] đặt ghế cho mọi chuyến từ first đến last, tính cả hai đầu.', 'Each [first,last,seats] booking reserves seats on every flight in the inclusive range. Return seats per flight.'],
    hint: ['Đánh dấu +seats ở first−1, −seats ở last rồi cộng dồn.', 'Mark +seats at first−1 and −seats at last, then take prefix sums.'], time: 'O(n + m)', space: 'O(n)',
    source: `def corpFlightBookings(self, bookings, n):
    diff = [0] * (n + 1)
    for start, end, seats in bookings:
        diff[start - 1] += seats
        diff[end] -= seats
    result = []
    active = 0
    for i in range(n):
        active += diff[i]
        result.append(active)
    return result`,
  },
  {
    id: 1943, title: 'Describe the Painting', slug: 'describe-the-painting', category: 'sweep-line', tags: ['interval','prefix-sum'],
    fields: ['segments'], example: [[1,4,5],[4,7,7],[1,7,9]], kind: 'difference', picture: { lanes: ['segments','result'], maps: ['delta'] },
    validate(segments) { rows(segments,3,{lo:1,hi:10000}); if(segments.some(r=>r[0]===r[1]) || new Set(segments.map(r=>r[2])).size !== segments.length) throw Error('Use start < end and distinct positive colors.'); },
    statement: ['Trộn màu trên các đoạn [start,end). Trả về các đoạn liên tiếp có tập màu cố định, nhãn là tổng các màu.', 'Mix colors on [start,end) segments. Return consecutive constant-color-set segments labeled by the sum of colors.'],
    hint: ['Gom sự kiện theo tọa độ; tổng màu giữ nguyên giữa hai đầu mút.', 'Group endpoint events; the color sum stays constant between consecutive endpoints.'], time: 'O(n log n)', space: 'O(n)',
    source: `def splitPainting(self, segments):
    delta = defaultdict(int)
    for start, end, color in segments:
        delta[start] += color
        delta[end] -= color
    active = 0
    prev = None
    result = []
    for x in sorted(delta):
        if prev is not None and active > 0:
            result.append([prev, x, active])
        active += delta[x]
        prev = x
    return result`,
  },
  {
    id: 1893, title: 'Check if All the Integers in a Range Are Covered', slug: 'check-if-all-the-integers-in-a-range-are-covered', difficulty: 'easy', category: 'prefix-sum', tags: ['interval'],
    fields: ['ranges','left','right'], example: { ranges: [[1,2],[3,4],[5,6]], left: 2, right: 5 },
    kind: 'difference', picture: { lanes: ['ranges'], arrays: ['diff','coverage'], closed: true },
    validate(ranges,left,right) { rows(ranges,2,{lo:1,hi:50}); integer(left,1,50); integer(right,left,50); },
    statement: ['Kiểm tra mọi số nguyên trong [left,right] có nằm trong ít nhất một khoảng đóng hay không.', 'Check whether every integer in [left,right] lies in at least one inclusive range.'],
    hint: ['+1 tại start, −1 tại end+1; tìm vị trí có độ phủ 0.', '+1 at start, −1 at end+1; look for a zero-coverage position.'], time: 'O(n + U)', space: 'O(U)',
    source: `def isCovered(self, ranges, left, right):
    last = max([right] + [end for start, end in ranges])
    diff = [0] * (last + 2)
    for start, end in ranges:
        diff[start] += 1
        diff[end + 1] -= 1
    active = 0
    coverage = []
    for i in range(last + 1):
        active += diff[i]
        coverage.append(active)
        if left <= i <= right and active == 0:
            return False
    return True`,
  },
  {
    id: 2021, title: 'Brightest Position on Street', slug: 'brightest-position-on-street', premium: true, category: 'sweep-line', tags: ['prefix-sum'],
    fields: ['lights'], example: [[-3,2],[1,2],[3,3]], kind: 'difference', picture: { lights: true, maps: ['delta'], arrays: ['positions','brightness'], closed: true },
    validate(lights) { rows(lights,2,{min:1,ordered:false}); if(lights.some(r=>r[1]<0)) throw Error('Radius must be nonnegative.'); },
    statement: ['Đèn [position,radius] chiếu các vị trí nguyên từ position−radius đến position+radius. Tìm vị trí sáng nhất nhỏ nhất.', 'A [position,radius] light covers integer positions from position−radius through position+radius. Return the smallest brightest position.'],
    hint: ['Quét sự kiện start và end+1; chỉ cập nhật đáp án khi sáng hơn hẳn.', 'Sweep start and end+1 events; update the answer only for a strictly brighter position.'], time: 'O(n log n)', space: 'O(n)',
    source: `def brightestPosition(self, lights):
    delta = defaultdict(int)
    for position, radius in lights:
        delta[position - radius] += 1
        delta[position + radius + 1] -= 1
    active = best = 0
    answer = 0
    positions = []
    brightness = []
    for x in sorted(delta):
        active += delta[x]
        positions.append(x)
        brightness.append(active)
        if active > best:
            best = active
            answer = x
    return answer`,
  },
  {
    id: 2381, title: 'Shifting Letters II', slug: 'shifting-letters-ii', category: 'prefix-sum', tags: ['array'],
    fields: ['s','shifts'], example: { s: 'abc', shifts: [[0,1,0],[1,2,1],[0,2,1]] },
    kind: 'difference', picture: { arrays: ['letters','diff','result'], lanes: ['shifts'], closed: true },
    validate(s,shifts) { if(typeof s !== 'string' || !/^[a-z]{1,24}$/.test(s)) throw Error('Use 1–24 lowercase letters.'); rows(shifts,3,{lo:0,hi:24}); if(shifts.some(r=>r[1]>=s.length || ![0,1].includes(r[2]))) throw Error('Use valid indices and direction 0 or 1.'); },
    statement: ['Mỗi shift [start,end,direction] dịch các ký tự trong khoảng đóng: 1 tiến, 0 lùi, xoay vòng a–z.', 'Each [start,end,direction] shifts an inclusive substring: 1 forward, 0 backward, wrapping a–z.'],
    hint: ['Gộp các lần dịch bằng mảng hiệu, rồi lấy modulo 26.', 'Combine shifts with a difference array, then take modulo 26.'], time: 'O(n + q)', space: 'O(n)',
    source: `def shiftingLetters(self, s, shifts):
    letters = list(s)
    diff = [0] * (len(s) + 1)
    for start, end, direction in shifts:
        change = 1 if direction else -1
        diff[start] += change
        diff[end + 1] -= change
    active = 0
    result = []
    for i, letter in enumerate(s):
        active += diff[i]
        result.append(chr((ord(letter) - ord('a') + active) % 26 + ord('a')))
    return ''.join(result)`,
  },
  {
    id: 2772, title: 'Apply Operations to Make All Array Elements Equal to Zero', slug: 'apply-operations-to-make-all-array-elements-equal-to-zero', category: 'prefix-sum', tags: ['greedy'],
    fields: ['nums','k'], example: { nums: [2,2,3,1,1,0], k: 3 }, kind: 'difference', picture: { arrays: ['nums','diff'], lanes: ['operations'] },
    validate(nums,k) { vector(nums,{min:1,lo:0,hi:100}); integer(k,1,nums.length); },
    statement: ['Một thao tác giảm 1 trên đúng k phần tử liên tiếp. Có thể đưa toàn bộ nums về 0 không?', 'One operation subtracts 1 from exactly k consecutive elements. Can all elements become zero?'],
    hint: ['Quét trái sang phải; giá trị còn lại bắt buộc phải bắt đầu thao tác tại i.', 'Sweep left to right; each remaining value forces operations to start at i.'], time: 'O(n)', space: 'O(n)',
    source: `def checkArray(self, nums, k):
    n = len(nums)
    diff = [0] * (n + 1)
    active = 0
    operations = []
    for i in range(n):
        active += diff[i]
        need = nums[i] - active
        if need < 0:
            return False
        if need > 0:
            if i + k > n:
                return False
            active += need
            diff[i + k] -= need
            operations.append([i, i + k, need])
    return True`,
  },
  {
    id: 2848, title: 'Points That Intersect With Cars', slug: 'points-that-intersect-with-cars', difficulty: 'easy', category: 'prefix-sum', tags: ['interval'],
    fields: ['nums'], example: [[3,6],[1,5],[4,7]], kind: 'difference', picture: { lanes: ['nums'], arrays: ['diff','coverage'], closed: true },
    validate(nums) { rows(nums,2,{min:1,lo:1,hi:100}); },
    statement: ['Đếm các điểm nguyên được ít nhất một xe [start,end] che phủ, tính cả hai đầu.', 'Count integer points covered by at least one car [start,end], including both endpoints.'],
    hint: ['Đánh dấu sự kiện đầu/cuối; đếm các điểm có độ phủ dương.', 'Mark start/end events; count positions with positive coverage.'], time: 'O(n + U)', space: 'O(U)',
    source: `def numberOfPoints(self, nums):
    last = max(end for start, end in nums)
    diff = [0] * (last + 2)
    for start, end in nums:
        diff[start] += 1
        diff[end + 1] -= 1
    active = answer = 0
    coverage = []
    for i in range(last + 1):
        active += diff[i]
        coverage.append(active)
        if active > 0:
            answer += 1
    return answer`,
  },
  {
    id: 3169, title: 'Count Days Without Meetings', slug: 'count-days-without-meetings', category: 'interval', tags: ['greedy'],
    fields: ['days','meetings'], example: { days: 10, meetings: [[5,7],[1,3],[9,10]] }, kind: 'interval', picture: { lanes: ['meetings','gaps'], closed: true },
    validate(days,meetings) { integer(days,1,10000); rows(meetings,2,{lo:1,hi:days}); },
    statement: ['Đếm số ngày từ 1 đến days không nằm trong bất kỳ cuộc họp [start,end] nào.', 'Count days from 1 through days that are not covered by any inclusive meeting interval.'],
    hint: ['Sắp theo start; đếm khoảng trống trước mỗi phần đã gộp.', 'Sort by start; count gaps before the merged coverage.'], time: 'O(n log n)', space: 'O(n)',
    source: `def countDays(self, days, meetings):
    meetings.sort()
    end = 0
    answer = 0
    gaps = []
    for start, finish in meetings:
        if start > end + 1:
            gaps.append([end + 1, start - 1])
            answer += start - end - 1
        end = max(end, finish)
    if end < days:
        gaps.append([end + 1, days])
        answer += days - end
    return answer`,
  },
  {
    id: 3355, title: 'Zero Array Transformation I', slug: 'zero-array-transformation-i', category: 'prefix-sum', tags: ['array'],
    fields: ['nums','queries'], example: { nums: [1,0,1], queries: [[0,2]] }, kind: 'difference', picture: { lanes: ['queries'], arrays: ['nums','diff','capacity'], closed: true },
    validate: indexedQueries,
    statement: ['Mỗi query cho phép giảm tối đa 1 ở từng phần tử tùy chọn trong [l,r]. Có thể biến nums thành mảng 0 không?', 'Each query can decrement any chosen subset of indices in [l,r] by 1. Can nums become a zero array?'],
    hint: ['Mỗi vị trí cần số query che phủ ít nhất bằng nums[i].', 'Each index needs at least nums[i] covering queries.'], time: 'O(n + q)', space: 'O(n)',
    source: `def isZeroArray(self, nums, queries):
    diff = [0] * (len(nums) + 1)
    for start, end in queries:
        diff[start] += 1
        diff[end + 1] -= 1
    active = 0
    capacity = []
    for i, need in enumerate(nums):
        active += diff[i]
        capacity.append(active)
        if active < need:
            return False
    return True`,
  },
  {
    id: 3356, title: 'Zero Array Transformation II', slug: 'zero-array-transformation-ii', category: 'prefix-sum', tags: ['array'],
    fields: ['nums','queries'], example: { nums: [2,0,2], queries: [[0,2,1],[0,2,1],[1,1,3]] }, kind: 'difference', picture: { lanes: ['queries'], arrays: ['nums','diff','capacity'], closed: true },
    validate(nums,queries) { indexedQueries(nums,queries,3); if(queries.some(q=>q[2]<1)) throw Error('Query values must be positive.'); },
    statement: ['Query [l,r,val] cho phép giảm mỗi nums[i] trong đoạn tối đa val, độc lập. Tìm số query đầu tiên ít nhất cần dùng, hoặc −1.', 'A [l,r,val] query independently allows up to val decrements per index in the range. Return the shortest sufficient query prefix, or −1.'],
    hint: ['Tìm nhị phân số query; mỗi lần thử dùng mảng hiệu tính sức giảm tại từng ô.', 'Binary search the prefix length; use a difference array to check decrement capacity.'], time: 'O((n + q) log(q + 1))', space: 'O(n)',
    source: `def minZeroArray(self, nums, queries):
    def enough(count):
        diff = [0] * (len(nums) + 1)
        for start, end, value in queries[:count]:
            diff[start] += value
            diff[end + 1] -= value
        active = 0
        capacity = []
        for i, need in enumerate(nums):
            active += diff[i]
            capacity.append(active)
            if active < need:
                return False
        return True
    lo, hi = 0, len(queries)
    if not enough(hi):
        return -1
    while lo < hi:
        mid = (lo + hi) // 2
        if enough(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
  },
  {
    id: 3362, title: 'Zero Array Transformation III', slug: 'zero-array-transformation-iii', category: 'heap', tags: ['greedy','prefix-sum','interval'],
    fields: ['nums','queries'], example: { nums: [2,0,2], queries: [[0,2],[0,1],[1,2],[0,2]] }, kind: 'difference', picture: { lanes: ['queries','selected'], arrays: ['nums','diff'], heaps: ['available'], closed: true },
    validate: indexedQueries,
    statement: ['Mỗi query [l,r] giảm độc lập tối đa 1 tại từng ô. Xóa được nhiều query nhất mà vẫn đưa nums về 0; trả −1 nếu không thể.', 'Each [l,r] query independently decrements each covered index by at most 1. Maximize discarded queries while still zeroing nums; return −1 if impossible.'],
    hint: ['Khi thiếu độ phủ, chọn query đang có kết thúc xa nhất; mảng hiệu theo dõi query đã chọn hết hạn.', 'When coverage is insufficient, choose the available query ending farthest right; expire chosen queries with a difference array.'], time: 'O(n + q log q)', space: 'O(n + q)',
    source: `def maxRemoval(self, nums, queries):
    queries.sort()
    available = []
    diff = [0] * (len(nums) + 1)
    active = used = j = 0
    selected = []
    for i, need in enumerate(nums):
        active += diff[i]
        while j < len(queries) and queries[j][0] <= i:
            heapq.heappush(available, -queries[j][1])
            j += 1
        while active < need:
            if not available or -available[0] < i:
                return -1
            end = -heapq.heappop(available)
            active += 1
            used += 1
            diff[end + 1] -= 1
            selected.append([i, end])
    return len(queries) - used`,
  },
];
module.exports = Object.fromEntries(specs.map(spec => [spec.id, lesson(spec)]));
