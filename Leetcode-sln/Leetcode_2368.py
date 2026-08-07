"""LeetCode 2368: Reachable Nodes With Restrictions.

Undirected tree with n nodes labelled 0..n-1 given by `edges`, plus a list of
`restricted` nodes. Starting from node 0 (never restricted), count how many
nodes are reachable without ever stepping on a restricted node.

Approach: build an adjacency list, then DFS/BFS from node 0, skipping any
neighbour that is restricted or already visited. The number of visited nodes
is the answer.

Examples:
    n=7, edges=[[0,1],[1,2],[3,1],[4,0],[0,5],[5,6]], restricted=[4,5] -> 4
    n=7, edges=[[0,1],[0,2],[0,5],[0,4],[3,2],[6,5]], restricted=[4,2,1] -> 3
"""
from collections import defaultdict
from typing import List


class Solution:
    def reachableNodes(self, n: int, edges: List[List[int]],
                       restricted: List[int]) -> int:
        blocked = set(restricted)
        adj = defaultdict(list)
        for a, b in edges:
            adj[a].append(b)
            adj[b].append(a)
        visited = {0}
        stack = [0]
        count = 0
        while stack:
            node = stack.pop()
            count += 1
            for nb in adj[node]:
                if nb not in visited and nb not in blocked:
                    visited.add(nb)
                    stack.append(nb)
        return count


if __name__ == "__main__":
    sol = Solution()
    print(sol.reachableNodes(7, [[0, 1], [1, 2], [3, 1], [4, 0], [0, 5], [5, 6]], [4, 5]))   # 4
    print(sol.reachableNodes(7, [[0, 1], [0, 2], [0, 5], [0, 4], [3, 2], [6, 5]], [4, 2, 1]))  # 3
