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
module.exports=[
make('Heap + bỏ bản cũ','Heap + lazy deletion','init: O(M); add/edit: O(log H); rmv: O(1); execTop: O(K log H), amortized O(log H)','O(H + M)',`from heapq import heappush, heappop, heapify
from typing import List

class TaskManager:

    def __init__(self, tasks: List[List[int]]):
        self.tasks = {}
        self.heap = []

        for userId, taskId, priority in tasks:
            self.tasks[taskId] = (userId, priority)
            self.heap.append((-priority, -taskId, userId))

        heapify(self.heap)

    def add(self, userId: int, taskId: int, priority: int) -> None:
        self.tasks[taskId] = (userId, priority)
        heappush(self.heap, (-priority, -taskId, userId))

    def edit(self, taskId: int, newPriority: int) -> None:
        userId, _ = self.tasks[taskId]
        self.tasks[taskId] = (userId, newPriority)
        heappush(self.heap, (-newPriority, -taskId, userId))

    def rmv(self, taskId: int) -> None:
        del self.tasks[taskId]

    def execTop(self) -> int:
        while self.heap:
            negPriority, negTaskId, userId = heappop(self.heap)

            priority = -negPriority
            taskId = -negTaskId

            if (
                taskId in self.tasks
                and self.tasks[taskId] == (userId, priority)
            ):
                del self.tasks[taskId]
                return userId

        return -1`),
make('SortedList','SortedList','init: O(M log M); add/edit/rmv/execTop: approximately O(log M)','O(M)',`from sortedcontainers import SortedList
from typing import List

class TaskManager:

    def __init__(self, tasks: List[List[int]]):
        self.tasks = {}
        self.sorted_tasks = SortedList()

        for userId, taskId, priority in tasks:
            self.add(userId, taskId, priority)

    def add(self, userId: int, taskId: int, priority: int) -> None:
        self.tasks[taskId] = (userId, priority)
        self.sorted_tasks.add((priority, taskId))

    def edit(self, taskId: int, newPriority: int) -> None:
        userId, oldPriority = self.tasks[taskId]

        self.sorted_tasks.remove((oldPriority, taskId))

        self.tasks[taskId] = (userId, newPriority)
        self.sorted_tasks.add((newPriority, taskId))

    def rmv(self, taskId: int) -> None:
        userId, priority = self.tasks.pop(taskId)
        self.sorted_tasks.remove((priority, taskId))

    def execTop(self) -> int:
        if not self.sorted_tasks:
            return -1

        priority, taskId = self.sorted_tasks.pop()

        userId, _ = self.tasks.pop(taskId)

        return userId`)
];
