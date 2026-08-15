from collections import deque
from typing import List


class Solution:
    def shortestDistance(self, grid: List[List[int]]) -> int:
        if not grid or not grid[0]:
            return -1

        rows, cols = len(grid), len(grid[0])
        total_dist = [[0] * cols for _ in range(rows)]
        reach = [[0] * cols for _ in range(rows)]
        buildings = 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    buildings += 1
                    self._bfs(grid, (r, c), total_dist, reach)

        best = float('inf')
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 0 and reach[r][c] == buildings:
                    best = min(best, total_dist[r][c])

        return best if best != float('inf') else -1

    def _bfs(self, grid, start, total_dist, reach):
        rows, cols = len(grid), len(grid[0])
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        sr, sc = start
        visited = [[False] * cols for _ in range(rows)]
        queue = deque([(sr, sc, 0)])
        visited[sr][sc] = True

        while queue:
            r, c, dist = queue.popleft()
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and not visited[nr][nc] and grid[nr][nc] == 0:
                    visited[nr][nc] = True
                    total_dist[nr][nc] += dist + 1
                    reach[nr][nc] += 1
                    queue.append((nr, nc, dist + 1))


sol = Solution()
print(sol.shortestDistance([[1, 0, 2, 0, 1], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0]]))  # 7
print(sol.shortestDistance([[1, 0]]))  # 1
print(sol.shortestDistance([[1]]))     # -1
