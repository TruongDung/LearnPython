'use strict';
const { lesson, rows, vector, integer } = require('./sweep-lesson');
const specs = [
  {
    id: 1353, title: 'Maximum Number of Events That Can Be Attended', slug: 'maximum-number-of-events-that-can-be-attended', category: 'heap', tags: ['greedy','interval'],
    fields: ['events'], example: [[1,2],[2,3],[3,4],[1,2]], kind: 'schedule', picture: { lanes: ['events','attended'], heaps: ['available'], closed: true },
    validate(events) { rows(events,2,{lo:1,hi:10000}); },
    statement: ['Mỗi sự kiện [start,end] cần một ngày tham dự trong khoảng đóng. Mỗi ngày dự tối đa một sự kiện; tối đa hóa số sự kiện.', 'Attend each [start,end] event on one inclusive day. Attend at most one event per day; maximize the count.'],
    hint: ['Quét ngày; heap ưu tiên sự kiện sắp hết hạn nhất.', 'Sweep days; use a min-heap to attend the event with the earliest deadline.'], time: 'O(n log n)', space: 'O(n)',
    source: `def maxEvents(self, events):
    events.sort()
    available = []
    attended = []
    day = i = 0
    while i < len(events) or available:
        if not available:
            day = max(day, events[i][0])
        while i < len(events) and events[i][0] <= day:
            heapq.heappush(available, events[i][1])
            i += 1
        while available and available[0] < day:
            heapq.heappop(available)
        if available:
            end = heapq.heappop(available)
            attended.append([day, day])
            day += 1
    return len(attended)`,
  },
  {
    id: 1751, title: 'Maximum Number of Events That Can Be Attended II', slug: 'maximum-number-of-events-that-can-be-attended-ii', difficulty: 'hard', category: 'dp', tags: ['interval'],
    fields: ['events','k'], example: { events: [[1,2,4],[3,4,3],[2,3,10]], k: 2 },
    kind: 'schedule', picture: { lanes: ['events'], arrays: ['starts','next_index'], tables: ['dp'], closed: true },
    validate(events,k) { rows(events,3,{max:12,min:1,lo:1,hi:1000}); integer(k,1,Math.min(events.length,6)); },
    statement: ['Chọn tối đa k sự kiện [start,end,value] không giao nhau để tổng value lớn nhất. Phải dự toàn bộ sự kiện; đầu mút trùng cũng giao nhau.', 'Choose at most k non-overlapping [start,end,value] events for maximum value. Attend whole events; shared endpoints overlap.'],
    hint: ['DP bỏ/chọn sự kiện; tìm nhị phân sự kiện tiếp theo bắt đầu sau end.', 'DP: skip or take each event; binary search the next event starting after end.'], time: 'O(n log n + nk)', space: 'O(nk)',
    source: `def maxValue(self, events, k):
    events.sort()
    n = len(events)
    starts = [event[0] for event in events]
    next_index = [bisect_right(starts, event[1]) for event in events]
    dp = [[0] * (k + 1) for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        for count in range(1, k + 1):
            skip = dp[i + 1][count]
            take = events[i][2] + dp[next_index[i]][count - 1]
            dp[i][count] = max(skip, take)
    return dp[0][k]`,
  },
  {
    id: 1942, title: 'The Number of the Smallest Unoccupied Chair', slug: 'the-number-of-the-smallest-unoccupied-chair', category: 'heap', tags: ['interval'],
    fields: ['times','targetFriend'], example: { times: [[1,4],[2,3],[4,6]], targetFriend: 2 }, kind: 'schedule', picture: { lanes: ['times','assignments'], heaps: ['free','busy'] },
    validate(times,target) { rows(times,2,{min:1,lo:1,hi:10000}); integer(target,0,times.length-1); if(new Set(times.map(r=>r[0])).size !== times.length || times.some(r=>r[0]===r[1])) throw Error('Arrivals must be distinct, with arrival < departure.'); },
    statement: ['Bạn bè đến/rời theo times[i]. Mỗi người lấy ghế trống có số nhỏ nhất. Tìm ghế của targetFriend; trả ghế trước khi xử lý người đến cùng lúc.', 'Friends arrive/leave at times[i] and take the smallest free chair. Find targetFriend’s chair; departures release chairs before equal-time arrivals.'],
    hint: ['Hai min-heap: ghế trống theo số ghế và ghế bận theo giờ rời.', 'Two min-heaps: free chairs by number, busy chairs by departure time.'], time: 'O(n log n)', space: 'O(n)',
    source: `def smallestChair(self, times, targetFriend):
    arrivals = sorted((start, end, friend) for friend, (start, end) in enumerate(times))
    free = list(range(len(times)))
    busy = []
    assignments = []
    for time, end, friend in arrivals:
        while busy and busy[0][0] <= time:
            leave, chair = heapq.heappop(busy)
            heapq.heappush(free, chair)
        chair = heapq.heappop(free)
        assignments.append([time, end, chair, friend])
        if friend == targetFriend:
            return chair
        heapq.heappush(busy, (end, chair))`,
  },
  {
    id: 1834, title: 'Single-Threaded CPU', slug: 'single-threaded-cpu', category: 'heap', tags: ['greedy'],
    fields: ['tasks'], example: [[1,2],[2,4],[3,2],[4,1]], kind: 'schedule', picture: { taskDurations: true, lanes: ['timeline'], heaps: ['available'], arrays: ['order'] },
    validate(tasks) { rows(tasks,2,{ordered:false,lo:1,hi:1000}); },
    statement: ['CPU chọn tác vụ sẵn sàng có thời gian xử lý ngắn nhất, hòa chọn chỉ số nhỏ nhất; đã chạy thì không ngắt. Trả về thứ tự tác vụ.', 'The non-preemptive CPU chooses the available task with shortest processing time, breaking ties by index. Return its processing order.'],
    hint: ['Quét thời điểm đến; heap theo (thời gian xử lý, chỉ số), nhảy qua khoảng CPU rảnh.', 'Sweep arrivals; heap by (duration,index), jumping over CPU idle gaps.'], time: 'O(n log n)', space: 'O(n)',
    source: `def getOrder(self, tasks):
    pending = sorted((arrival, duration, index) for index, (arrival, duration) in enumerate(tasks))
    available = []
    order = []
    timeline = []
    time = i = 0
    while i < len(pending) or available:
        if not available:
            time = max(time, pending[i][0])
        while i < len(pending) and pending[i][0] <= time:
            arrival, duration, index = pending[i]
            heapq.heappush(available, (duration, index))
            i += 1
        duration, index = heapq.heappop(available)
        timeline.append([time, time + duration, index])
        time += duration
        order.append(index)
    return order`,
  },
  {
    id: 1882, title: 'Process Tasks Using Servers', slug: 'process-tasks-using-servers', category: 'heap', tags: ['greedy'],
    fields: ['servers','tasks'], example: { servers: [3,3,2], tasks: [1,2,3,2,1,2] },
    kind: 'schedule', picture: { lanes: ['timeline'], heaps: ['free','busy'], arrays: ['servers','tasks','answer'] },
    validate(servers,tasks) { vector(servers,{min:1,max:12,lo:1,hi:1000}); vector(tasks,{min:1,lo:1,hi:1000}); },
    statement: ['Tác vụ i đến lúc i, chạy tasks[i] đơn vị. Chọn server rảnh có weight nhỏ nhất, hòa chọn index nhỏ nhất. Nếu tất cả bận, chờ server rảnh.', 'Task i arrives at time i and takes tasks[i] time. Choose the free server with smallest (weight,index), or wait until a server is free.'],
    hint: ['Hai heap: server rảnh theo (weight,index), server bận theo (finish,weight,index).', 'Two heaps: free by (weight,index), busy by (finish,weight,index).'], time: 'O((n + m) log n)', space: 'O(n + m)',
    source: `def assignTasks(self, servers, tasks):
    free = [(weight, index) for index, weight in enumerate(servers)]
    heapq.heapify(free)
    busy = []
    answer = []
    timeline = []
    time = 0
    for i, duration in enumerate(tasks):
        time = max(time, i)
        if not free:
            time = max(time, busy[0][0])
        while busy and busy[0][0] <= time:
            finish, weight, index = heapq.heappop(busy)
            heapq.heappush(free, (weight, index))
        weight, index = heapq.heappop(free)
        answer.append(index)
        timeline.append([time, time + duration, index, i])
        heapq.heappush(busy, (time + duration, weight, index))
    return answer`,
  },
  {
    id: 502, title: 'IPO', slug: 'ipo', difficulty: 'hard', category: 'heap', tags: ['greedy'],
    fields: ['k','w','profits','capital'], example: { k: 2, w: 0, profits: [1,2,3], capital: [0,1,1] },
    kind: 'schedule', picture: { arrays: ['profits','capital'], heaps: ['available'], projects: true },
    validate(k,w,profits,capital) { integer(k,0,24); integer(w,0,10000); vector(profits,{lo:0,hi:1000}); vector(capital,{lo:0,hi:10000}); if(profits.length !== capital.length) throw Error('profits and capital must have equal lengths.'); },
    statement: ['Bắt đầu với vốn w, làm tối đa k dự án. Chỉ làm được dự án có capital ≤ vốn hiện tại; hoàn tất sẽ cộng profit vào vốn.', 'Starting with capital w, complete at most k projects. A project requires capital ≤ current funds; completing it adds its profit.'],
    hint: ['Đưa dự án đủ vốn vào max-heap lợi nhuận; mỗi lần lấy dự án lãi cao nhất.', 'Move affordable projects into a max-profit heap; always choose the largest profit.'], time: 'O(n log n + k log n)', space: 'O(n)',
    source: `def findMaximizedCapital(self, k, w, profits, capital):
    projects = sorted(zip(capital, profits))
    available = []
    i = 0
    for count in range(k):
        while i < len(projects) and projects[i][0] <= w:
            required, profit = projects[i]
            heapq.heappush(available, -profit)
            i += 1
        if not available:
            break
        profit = -heapq.heappop(available)
        w += profit
    return w`,
  },
  {
    id: 630, title: 'Course Schedule III', slug: 'course-schedule-iii', difficulty: 'hard', category: 'heap', tags: ['greedy'],
    fields: ['courses'], example: [[100,200],[200,1300],[1000,1250],[2000,3200]],
    kind: 'schedule', picture: { heaps: ['chosen'], courses: true },
    validate(courses) { rows(courses,2,{ordered:false,lo:1,hi:10000}); },
    statement: ['Khóa [duration,lastDay] phải học liên tục trong duration ngày và xong chậm nhất lastDay. Mỗi lần học một khóa; tối đa hóa số khóa.', 'Each [duration,lastDay] course takes duration consecutive days and must finish by lastDay. Take one course at a time; maximize the count.'],
    hint: ['Sắp deadline tăng dần; nếu quá hạn thì bỏ khóa dài nhất đã chọn.', 'Sort by deadline; if total time exceeds it, drop the longest selected course.'], time: 'O(n log n)', space: 'O(n)',
    source: `def scheduleCourse(self, courses):
    courses.sort(key=lambda course: course[1])
    chosen = []
    total = 0
    for duration, deadline in courses:
        heapq.heappush(chosen, -duration)
        total += duration
        if total > deadline:
            removed = -heapq.heappop(chosen)
            total -= removed
    return len(chosen)`,
  },
  {
    id: 857, title: 'Minimum Cost to Hire K Workers', slug: 'minimum-cost-to-hire-k-workers', difficulty: 'hard', category: 'heap', tags: ['greedy'],
    fields: ['quality','wage','k'], example: { quality: [10,20,5], wage: [70,50,30], k: 2 },
    kind: 'schedule', picture: { heaps: ['chosen'], arrays: ['quality','wage'], workers: true },
    validate(quality,wage,k) { vector(quality,{min:1,lo:1,hi:1000}); vector(wage,{min:1,lo:1,hi:10000}); if(quality.length!==wage.length) throw Error('quality and wage must have equal lengths.'); integer(k,1,quality.length); },
    statement: ['Thuê đúng k người, trả cùng một tỉ lệ tiền/quality cho mọi người và không dưới wage của từng người. Tìm tổng chi phí nhỏ nhất.', 'Hire exactly k workers at a common pay-to-quality ratio, meeting every minimum wage. Minimize total pay.'],
    hint: ['Quét wage/quality tăng dần; giữ k quality nhỏ nhất trong max-heap.', 'Sweep wage/quality ratios in increasing order; retain the k smallest qualities in a max-heap.'], time: 'O(n log n + n log k)', space: 'O(n)',
    source: `def mincostToHireWorkers(self, quality, wage, k):
    workers = sorted((w / q, q, index) for index, (q, w) in enumerate(zip(quality, wage)))
    chosen = []
    total_quality = 0
    answer = inf
    for ratio, q, index in workers:
        heapq.heappush(chosen, -q)
        total_quality += q
        if len(chosen) > k:
            total_quality += heapq.heappop(chosen)
        if len(chosen) == k:
            cost = total_quality * ratio
            answer = min(answer, cost)
    return answer`,
  },
];
module.exports = Object.fromEntries(specs.map(spec => [spec.id, lesson(spec)]));
