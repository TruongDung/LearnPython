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


class SolutionApproach2:
    # Alternative approach: assume every land cell has 4 free edges, then
    # subtract 2 for each land neighbor to the LEFT or ABOVE. Because we only
    # ever look backward (left/top), each touching pair of land cells is
    # subtracted exactly once - never double-counted.
    def islandPerimeter(self, grid: List[List[int]]) -> int:
        n_rows = len(grid)
        n_cols = len(grid[0])

        total = 0

        for i in range(n_rows):
            for j in range(n_cols):
                if grid[i][j] == 1:
                    total += 4

                    if j > 0 and grid[i][j - 1] == 1:
                        total -= 2
                    if i > 0 and grid[i - 1][j] == 1:
                        total -= 2

        return total


sol = Solution()
print(sol.islandPerimeter([[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]]))  # 16
print(sol.islandPerimeter([[1]]))     # 4
print(sol.islandPerimeter([[1, 0]]))  # 4

sol2 = SolutionApproach2()
print(sol2.islandPerimeter([[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]]))  # 16
print(sol2.islandPerimeter([[1]]))     # 4
print(sol2.islandPerimeter([[1, 0]]))  # 4
