from typing import List


class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        n = len(edges)
        parent = list(range(n + 1))

        def find(x: int) -> int:
            while parent[x] != x:
                parent[x] = parent[parent[x]]  # path compression
                x = parent[x]
            return x

        def union(a: int, b: int) -> bool:
            ra, rb = find(a), find(b)
            if ra == rb:
                return False  # already connected → this edge is redundant
            parent[ra] = rb
            return True

        for u, v in edges:
            if not union(u, v):
                return [u, v]

        return []


sol = Solution()
print(sol.findRedundantConnection([[1, 2], [1, 3], [2, 3]]))  # [2, 3]
print(sol.findRedundantConnection([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]))  # [1, 4]
