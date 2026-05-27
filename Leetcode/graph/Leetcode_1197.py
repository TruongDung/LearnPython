from collections import deque


class Solution:
    def minKnightMoves(self, x: int, y: int) -> int:
        x, y = abs(x), abs(y)

        directions = [ (-2,-1), (-1,-2), (1, -2), (2, -1), (-1, 2), (1, 2), (2, 1)]

        queue = deque([(0, 0, 0)])
        visited = set()

        while queue:
            row, col, step = queue.popleft()

            if row == x and col == y:
                return step
            
            for dr, dc in directions:
                nr = dr + row
                nc = dc + col

                if(nr, nc) not in visited and nr >=-2 and nc >= -2:
                    visited.add((nr, nc))
                    queue.append((nr, nc, step + 1))
