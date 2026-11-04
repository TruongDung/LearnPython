'use strict';
const driver=`

# Example caller: the TaskManager implementation is above.
class Solution:
    def run(self, config):
        manager = TaskManager(config["tasks"])
        answer = [None]
        for op in config["ops"]:
            action = op[0]
            if action == "add":
                manager.add(*op[1:])
                answer.append(None)
            elif action == "edit":
                manager.edit(*op[1:])
                answer.append(None)
            elif action == "rmv":
                manager.rmv(op[1])
                answer.append(None)
            else:
                result = manager.execTop()
                answer.append(result)
        return answer`;
const make=(vi,en,time,space,source)=>({label:{vi,en},time,space,code:(source+driver).split('\n')});
function lazy(versioned){return `from heapq import heappop, heappush

class TaskManager:
    def __init__(self, tasks):
        self.tasks = {}
        self.heap = []
${versioned?'        self.versions = {}\n        self.clock = 0\n':''}        for userId, taskId, priority in tasks:
            self.add(userId, taskId, priority)

    def add(self, userId, taskId, priority):
        self.tasks[taskId] = [userId, priority]
${versioned?'        self.clock += 1\n        self.versions[taskId] = self.clock\n        heappush(self.heap, (-priority, -taskId, self.clock))':'        heappush(self.heap, (-priority, -taskId))'}

    def edit(self, taskId, newPriority):
        self.tasks[taskId][1] = newPriority
${versioned?'        self.clock += 1\n        self.versions[taskId] = self.clock\n        heappush(self.heap, (-newPriority, -taskId, self.clock))':'        heappush(self.heap, (-newPriority, -taskId))'}

    def rmv(self, taskId):
        del self.tasks[taskId]

    def execTop(self):
        while self.heap:
${versioned?'            neg_priority, neg_task, version = heappop(self.heap)':'            neg_priority, neg_task = heappop(self.heap)'}
            taskId = -neg_task
            if taskId not in self.tasks:
                continue
${versioned?'            if version != self.versions[taskId]:':'            if -neg_priority != self.tasks[taskId][1]:'}
                continue
            userId = self.tasks.pop(taskId)[0]
            return userId
        return -1`;}
module.exports=[
make('Heap + bỏ bản cũ','Lazy heap','add/edit: O(log H); rmv: O(1); execTop: amortized O(log H)','O(H + M)',lazy(false)),
make('Heap + phiên bản','Versioned heap','add/edit: O(log H); rmv: O(1); execTop: amortized O(log H)','O(H + D)',lazy(true)),
make('Danh sách sắp xếp','Sorted list','add/edit/rmv: O(M); execTop: O(1)','O(M)',`from bisect import insort

class TaskManager:
    def __init__(self, tasks):
        self.tasks = {}
        self.order = []
        for userId, taskId, priority in tasks:
            self.add(userId, taskId, priority)

    def add(self, userId, taskId, priority):
        self.tasks[taskId] = [userId, priority]
        insort(self.order, (priority, taskId))

    def edit(self, taskId, newPriority):
        priority = self.tasks[taskId][1]
        self.order.remove((priority, taskId))
        self.tasks[taskId][1] = newPriority
        insort(self.order, (newPriority, taskId))

    def rmv(self, taskId):
        priority = self.tasks[taskId][1]
        self.order.remove((priority, taskId))
        del self.tasks[taskId]

    def execTop(self):
        if not self.order:
            return -1
        priority, taskId = self.order.pop()
        userId = self.tasks.pop(taskId)[0]
        return userId`),
make('Dictionary + quét','Dictionary scan','add/edit/rmv: O(1); execTop: O(M)','O(M)',`class TaskManager:
    def __init__(self, tasks):
        self.tasks = {}
        for userId, taskId, priority in tasks:
            self.add(userId, taskId, priority)

    def add(self, userId, taskId, priority):
        self.tasks[taskId] = [userId, priority]

    def edit(self, taskId, newPriority):
        self.tasks[taskId][1] = newPriority

    def rmv(self, taskId):
        del self.tasks[taskId]

    def execTop(self):
        best = None
        for taskId in self.tasks:
            if best is None or (self.tasks[taskId][1], taskId) > (self.tasks[best][1], best):
                best = taskId
        if best is None:
            return -1
        userId = self.tasks.pop(best)[0]
        return userId`),
make('Heap có vị trí','Indexed heap','add/edit/rmv/execTop: O(log M)','O(M)',`class TaskManager:
    def __init__(self, tasks):
        self.tasks = {}
        self.heap = []
        self.pos = {}
        for userId, taskId, priority in tasks:
            self.add(userId, taskId, priority)

    def _swap(self, a, b):
        self.heap[a], self.heap[b] = self.heap[b], self.heap[a]
        self.pos[self.heap[a]] = a
        self.pos[self.heap[b]] = b

    def _up(self, index):
        while index > 0:
            parent = (index - 1) // 2
            taskId, parentId = self.heap[index], self.heap[parent]
            if (self.tasks[taskId][1], taskId) <= (self.tasks[parentId][1], parentId):
                break
            self._swap(index, parent)
            index = parent

    def _down(self, index):
        while index < len(self.heap):
            best = index
            left = 2 * index + 1
            right = left + 1
            if left < len(self.heap):
                a, b = self.heap[left], self.heap[best]
                if (self.tasks[a][1], a) > (self.tasks[b][1], b):
                    best = left
            if right < len(self.heap):
                a, b = self.heap[right], self.heap[best]
                if (self.tasks[a][1], a) > (self.tasks[b][1], b):
                    best = right
            if best == index:
                break
            self._swap(index, best)
            index = best

    def add(self, userId, taskId, priority):
        self.tasks[taskId] = [userId, priority]
        self.pos[taskId] = len(self.heap)
        self.heap.append(taskId)
        self._up(self.pos[taskId])

    def edit(self, taskId, newPriority):
        self.tasks[taskId][1] = newPriority
        self._up(self.pos[taskId])
        self._down(self.pos[taskId])

    def rmv(self, taskId):
        index = self.pos[taskId]
        last = self.heap.pop()
        del self.pos[taskId]
        if index < len(self.heap):
            self.heap[index] = last
            self.pos[last] = index
            self._up(index)
            self._down(self.pos[last])
        del self.tasks[taskId]

    def execTop(self):
        if not self.heap:
            return -1
        taskId = self.heap[0]
        userId = self.tasks[taskId][0]
        self.rmv(taskId)
        return userId`)
];
