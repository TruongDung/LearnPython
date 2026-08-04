from typing import List


class Solution:
    def islandPerimeter(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        perimeter = 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] != 1:
                    continue
                # Each land cell contributes an edge to the perimeter
                # for every side that is water or outside the grid.
                for delta_r, delta_c in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                    next_r, next_c = r + delta_r, c + delta_c
                    out_of_bounds = next_r < 0 or next_r >= rows or next_c < 0 or next_c >= cols
                    if out_of_bounds or grid[next_r][next_c] == 0:
                        perimeter += 1

        return perimeter


sol = Solution()
print(sol.islandPerimeter([[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]]))  # 16
print(sol.islandPerimeter([[1]]))     # 4
print(sol.islandPerimeter([[1, 0]]))  # 4
