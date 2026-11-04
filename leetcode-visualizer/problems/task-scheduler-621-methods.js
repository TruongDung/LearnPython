'use strict';
const method=(vi,en,time,space,source)=>({label:{vi,en},time,space,code:source.trim().split('\n')});
const header='from collections import Counter, deque\nfrom heapq import heapify, heappop, heappush\n\nclass Solution:\n    def leastInterval(self, tasks, n):\n';
const make=(vi,en,time,space,body)=>method(vi,en,time,space,header+body);
const heapInit=`        freq = Counter(tasks)
        heap = []
        for task, count in freq.items():
            heap.append((-count, task))
        heapify(heap)
        time = 0
        schedule = []
`;
function cooldown(jump){return heapInit+`        wait = deque()
        while heap or wait:
${jump?`            if not heap and wait:
                gap = wait[0][0] - time - 1
                schedule.extend(["_"] * gap)
                time += gap
`:''}            time += 1
            while wait and wait[0][0] <= time:
                ready = wait.popleft()
                heappush(heap, (ready[1], ready[2]))
            if heap:
                neg_count, task = heappop(heap)
                schedule.append(task)
                neg_count += 1
                if neg_count < 0:
                    wait.append((time + n + 1, neg_count, task))
            else:
                schedule.append("_")
        return time`;}
module.exports=[
make('Công thức khung','Frame formula','O(T + U)','O(U)',`        freq = Counter(tasks)
        max_freq = max(freq.values())
        max_count = 0
        for count in freq.values():
            if count == max_freq:
                max_count += 1
        frame = (max_freq - 1) * (n + 1) + max_count
        answer = max(len(tasks), frame)
        return answer`),
make('Trừ ô nghỉ','Subtract idle gaps','O(T + U log U)','O(U)',`        freq = Counter(tasks)
        counts = sorted(freq.values())
        max_freq = counts.pop()
        idle = (max_freq - 1) * n
        for count in counts:
            idle -= min(max_freq - 1, count)
        idle = max(0, idle)
        answer = len(tasks) + idle
        return answer`),
make('Heap + hàng chờ','Heap + cooldown queue','O(T log U + L)','O(U + L)',cooldown(false)),
make('Heap theo chu kỳ','Heap cycles','O(T log U + L)','O(U + L)',heapInit+`        while heap:
            used = []
            slots = n + 1
            while slots > 0 and heap:
                neg_count, task = heappop(heap)
                schedule.append(task)
                time += 1
                neg_count += 1
                if neg_count < 0:
                    used.append((neg_count, task))
                slots -= 1
            for entry in used:
                heappush(heap, entry)
            if heap:
                schedule.extend(["_"] * slots)
                time += slots
        return time`),
make('Quét task sẵn sàng','Scan ready tasks','O(T + L × U)','O(U + L)',`        remaining = Counter(tasks)
        ready = dict.fromkeys(remaining, 1)
        left = len(tasks)
        time = 0
        schedule = []
        while left:
            time += 1
            chosen = None
            for task in remaining:
                if remaining[task] > 0 and ready[task] <= time:
                    if chosen is None or remaining[task] > remaining[chosen]:
                        chosen = task
            if chosen is None:
                schedule.append("_")
            else:
                schedule.append(chosen)
                remaining[chosen] -= 1
                ready[chosen] = time + n + 1
                left -= 1
        return time`),
make('Heap nhảy qua ô nghỉ','Heap with time jumps','O(T log U + L)','O(U + L)',cooldown(true)),
make('Sort theo chu kỳ','Sorted cycles','O(T × U log U + L)','O(U + L)',`        freq = Counter(tasks)
        counts = []
        for task, count in freq.items():
            counts.append((count, task))
        time = 0
        schedule = []
        while counts:
            counts.sort(reverse=True)
            used = []
            slots = n + 1
            while slots > 0 and counts:
                count, task = counts.pop(0)
                schedule.append(task)
                time += 1
                count -= 1
                if count > 0:
                    used.append((count, task))
                slots -= 1
            counts.extend(used)
            if counts:
                schedule.extend(["_"] * slots)
                time += slots
        return time`)
];
