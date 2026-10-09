from collections import deque
from typing import List

class Solution:
    def shortestPath(self, grid: List[List[int]], k: int) -> int:
        m, n = len(grid), len(grid[0])

        if k >= m + n - 2:
            return m + n - 2

        queue = deque([(0, 0, k)])
        visited = {(0, 0, k)}
        steps = 0

        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        while queue:
            for _ in range(len(queue)):
                r, c, remaining = queue.popleft()

                if r == m - 1 and c == n - 1:
                    return steps

                for dr, dc in directions:
                    nr, nc = r + dr, c + dc

                    if 0 <= nr < m and 0 <= nc < n:
                        new_remaining = remaining - grid[nr][nc]

                        if new_remaining >= 0:
                            state = (nr, nc, new_remaining)

                            if state not in visited:
                                visited.add(state)
                                queue.append(state)

            steps += 1

        return -1