from typing import List


class Solution:
    def largestIsland(self, grid: List[List[int]]) -> int:
        n = len(grid)
        size = {}

        def dfs(r, c, island_id):
            if r < 0 or r >= n or c < 0 or c >= n or grid[r][c] != 1:
                return 0
            grid[r][c] = island_id
            area = 1
            area += dfs(r + 1, c, island_id)
            area += dfs(r - 1, c, island_id)
            area += dfs(r, c + 1, island_id)
            area += dfs(r, c - 1, island_id)
            return area

        # Step 1: label every island with a unique id (>= 2) and its area.
        island_id = 2
        for r in range(n):
            for c in range(n):
                if grid[r][c] == 1:
                    size[island_id] = dfs(r, c, island_id)
                    island_id += 1

        # Covers the all-land case where there is no 0 to flip.
        best = max(size.values(), default=0)

        # Step 2: try flipping every water cell, summing DISTINCT
        # neighboring island sizes (+1 for the flipped cell itself).
        for r in range(n):
            for c in range(n):
                if grid[r][c] == 0:
                    seen = set()
                    total = 1
                    for delta_r, delta_c in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                        next_r, next_c = r + delta_r, c + delta_c
                        if 0 <= next_r < n and 0 <= next_c < n and grid[next_r][next_c] > 1:
                            neighbor_id = grid[next_r][next_c]
                            if neighbor_id not in seen:
                                seen.add(neighbor_id)
                                total += size[neighbor_id]
                    best = max(best, total)

        return best


sol = Solution()
print(sol.largestIsland([[1, 0], [0, 1]]))  # 3
print(sol.largestIsland([[1, 1], [1, 0]]))  # 4
print(sol.largestIsland([[1, 1], [1, 1]]))  # 4
