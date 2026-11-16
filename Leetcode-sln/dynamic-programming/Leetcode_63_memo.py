from functools import lru_cache

class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid):
        rows, cols = len(obstacleGrid), len(obstacleGrid[0])

        @lru_cache(None)
        def dfs(row, col):
            if row >= rows or col >= cols:
                return 0

            if obstacleGrid[row][col] == 1:
                return 0

            if row == rows - 1 and col == cols - 1:
                return 1

            down = dfs(row + 1, col)
            right = dfs(row, col + 1)

            return down + right

        return dfs(0, 0)
