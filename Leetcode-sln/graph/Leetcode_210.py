from collections import defaultdict, deque
from typing import List


class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        graph = defaultdict(list)
        indegree = [0] * numCourses

        for course, prereq in prerequisites:
            graph[prereq].append(course)
            indegree[course] += 1

        # Kahn's algorithm: start with courses having no prerequisites
        queue = deque([c for c in range(numCourses) if indegree[c] == 0])
        order = []

        while queue:
            course = queue.popleft()
            order.append(course)
            for nxt in graph[course]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)

        # If we couldn't take all courses, there's a cycle
        return order if len(order) == numCourses else []


sol = Solution()
print(sol.findOrder(2, [[1, 0]]))                       # [0, 1]
print(sol.findOrder(4, [[1, 0], [2, 0], [3, 1], [3, 2]]))  # [0,1,2,3] or [0,2,1,3]
print(sol.findOrder(1, []))                             # [0]
print(sol.findOrder(2, [[0, 1], [1, 0]]))               # [] (cycle)
