from collections import defaultdict, deque


class Solution:
    def minimumSemesters(self, n: int, relations: List[List[int]]) -> int:
        graph = defaultdict(list)
        indegree = [0 for _ in range(n)]
        for u, v in relations:
            graph[u-1].append(v-1)
            indegree[v-1] += 1
        queue = deque()
        for i in range(n):
            if indegree[i] == 0:
                queue.append(i)
        semester = 0
        count = 0
        while queue:
            size = len(queue)
            for _ in range(size):
                curr = queue.popleft()
                count += 1

                for nei in graph[curr]:
                    indegree[nei] -= 1
                    if indegree[nei] == 0:
                        queue.append(nei)
            semester += 1
        if count == n:
            return semester
        else:
            return -1

sol = Solution()
print(sol.minimumSemesters(3,  [[1,3],[2,3]]))

        