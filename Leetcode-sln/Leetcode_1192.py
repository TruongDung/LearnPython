from collections import defaultdict
from typing import List


class Solution:
    def criticalConnections(self, n: int, connections: List[List[int]]) -> List[List[int]]:
        graph = defaultdict(list)
        for u, v in connections:
            graph[u].append(v)
            graph[v].append(u)

        disc = [-1] * n   # discovery time of each node
        low = [0] * n     # lowest discovery time reachable
        bridges = []
        timer = [0]

        def dfs(node, parent):
            disc[node] = low[node] = timer[0]
            timer[0] += 1

            for nxt in graph[node]:
                if nxt == parent:
                    continue
                if disc[nxt] == -1:
                    dfs(nxt, node)
                    low[node] = min(low[node], low[nxt])
                    # If the lowest node reachable from nxt is below node,
                    # the edge (node, nxt) is a bridge (critical connection)
                    if low[nxt] > disc[node]:
                        bridges.append([node, nxt])
                else:
                    low[node] = min(low[node], disc[nxt])

        for i in range(n):
            if disc[i] == -1:
                dfs(i, -1)

        return bridges


sol = Solution()
print(sol.criticalConnections(4, [[0, 1], [1, 2], [2, 0], [1, 3]]))  # [[1, 3]]
print(sol.criticalConnections(2, [[0, 1]]))                          # [[0, 1]]
