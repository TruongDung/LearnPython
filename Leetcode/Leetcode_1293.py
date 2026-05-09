from collections import deque

class Solution:
    def shortestPath(self, grid: List[List[int]], k: int) -> int:
        """
        Shortest Path in a Grid with Obstacles Elimination (LeetCode 1293)
        """
        if not grid:
            return -1
        m, n = len(grid), len(grid[0])
        if m == 1 and n == 1:
            return 0
        
        # If k is large enough to ignore all obstacles, answer is Manhattan distance.
        if k >= m + n - 2:
            return m + n - 2
        
        # BFS state: (row, col, remaining elimination count)
        dq = deque([(0, 0, k, 0)])  # r, c, remaining k, steps
        visited = {(0, 0, k)}
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        
        while dq:
            r, c, rem, steps = dq.popleft()
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n:
                    nk = rem - grid[nr][nc]
                    if nk < 0:
                        continue
                    if nr == m - 1 and nc == n - 1:
                        return steps + 1
                    state = (nr, nc, nk)
                    if state in visited:
                        continue
                    # Only keep this state if this path gives more remaining eliminations than any previously seen for this cell.
                    visited.add(state)
                    dq.append((nr, nc, nk, steps + 1))
        
        return -1
        