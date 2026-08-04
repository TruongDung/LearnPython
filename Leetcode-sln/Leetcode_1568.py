from typing import List


class Solution:
    def minDays(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        def count_islands(g):
            visited = [[False] * cols for _ in range(rows)]

            def dfs(start_r, start_c):
                stack = [(start_r, start_c)]
                visited[start_r][start_c] = True
                while stack:
                    cur_r, cur_c = stack.pop()
                    for delta_r, delta_c in directions:
                        next_r, next_c = cur_r + delta_r, cur_c + delta_c
                        if (0 <= next_r < rows and 0 <= next_c < cols
                                and g[next_r][next_c] == 1
                                and not visited[next_r][next_c]):
                            visited[next_r][next_c] = True
                            stack.append((next_r, next_c))

            count = 0
            for r in range(rows):
                for c in range(cols):
                    if g[r][c] == 1 and not visited[r][c]:
                        count += 1
                        dfs(r, c)
            return count

        # Already disconnected (0 islands) or already multiple islands.
        if count_islands(grid) != 1:
            return 0

        # Try removing each land cell one at a time (1 day).
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    grid[r][c] = 0
                    if count_islands(grid) != 1:
                        grid[r][c] = 1
                        return 1
                    grid[r][c] = 1

        # A single connected island with no 1-cell cut always disconnects
        # within 2 days (remove any two adjacent land cells on the path).
        return 2


sol = Solution()
print(sol.minDays([[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]))  # 2
print(sol.minDays([[1, 1]]))                                     # 2
print(sol.minDays([[1, 0, 1, 0]]))                                 # 0
