from typing import List


class Solution:
    def largestIsland(self, grid: List[List[int]]) -> int:
        n = len(grid)
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        # Label each island with an id >= 2, record its size
        island_size = {}
        island_id = 2

        def dfs(r: int, c: int, idx: int) -> int:
            stack = [(r, c)]
            grid[r][c] = idx
            size = 0
            while stack:
                cr, cc = stack.pop()
                size += 1
                for dr, dc in directions:
                    nr, nc = cr + dr, cc + dc
                    if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 1:
                        grid[nr][nc] = idx
                        stack.append((nr, nc))
            return size

        for r in range(n):
            for c in range(n):
                if grid[r][c] == 1:
                    island_size[island_id] = dfs(r, c, island_id)
                    island_id += 1

        # Best without flipping (grid may be all land)
        best = max(island_size.values(), default=0)

        # Try flipping each 0: sum sizes of distinct neighboring islands + 1
        for r in range(n):
            for c in range(n):
                if grid[r][c] == 0:
                    seen = set()
                    total = 1
                    for dr, dc in directions:
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] > 1:
                            idx = grid[nr][nc]
                            if idx not in seen:
                                seen.add(idx)
                                total += island_size[idx]
                    best = max(best, total)

        return best


sol = Solution()
print(sol.largestIsland([[1, 0], [0, 1]]))  # 3
print(sol.largestIsland([[1, 1], [1, 0]]))  # 4
print(sol.largestIsland([[1, 1], [1, 1]]))  # 4
