from typing import List

from collections import defaultdict, deque


class Solution:
    def minimumSemesters(self, n: int, relations: List[List[int]]) -> int:
        graph = defaultdict(int)
        indegree = [0 for _ in range(n)]
        for u, v in relations:
            graph[u-1].append(v-1)
            indegree[v-1] += 1
        return 0
sol = Solution()
print(sol.minimumSemesters(3,  [[1,3],[2,3]]))
