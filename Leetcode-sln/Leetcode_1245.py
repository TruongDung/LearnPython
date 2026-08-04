from collections import defaultdict, deque
from typing import List


class Solution:
    def treeDiameter(self, edges: List[List[int]]) -> int:
        if not edges:
            return 0

        graph = defaultdict(list)
        for u, v in edges:
            graph[u].append(v)
            graph[v].append(u)

        def bfs(start):
            visited = {start}
            queue = deque([(start, 0)])
            farthest_node, farthest_dist = start, 0
            while queue:
                node, dist = queue.popleft()
                if dist > farthest_dist:
                    farthest_node, farthest_dist = node, dist
                for neighbor in graph[node]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append((neighbor, dist + 1))
            return farthest_node, farthest_dist

        # First BFS from any node finds one endpoint of the diameter (A).
        node_a, _ = bfs(0)
        # Second BFS from A finds the other endpoint and the diameter length.
        _, diameter = bfs(node_a)
        return diameter


sol = Solution()
print(sol.treeDiameter([[0, 1], [0, 2]]))                      # 2
print(sol.treeDiameter([[0, 1], [1, 2], [2, 3], [1, 4], [4, 5]]))  # 4
