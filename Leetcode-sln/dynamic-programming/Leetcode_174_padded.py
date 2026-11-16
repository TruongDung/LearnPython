from typing import List

class Solution:
    def calculateMinimumHP(self, dungeon: List[List[int]]) -> int:
        rows, cols = len(dungeon), len(dungeon[0])

        dp = [[float('inf')] * (cols + 1) for _ in range(rows + 1)]

        dp[rows][cols - 1] = 1
        dp[rows - 1][cols] = 1

        for row in range(rows - 1, -1, -1):
            for col in range(cols - 1, -1, -1):
                down = dp[row + 1][col]
                right = dp[row][col + 1]

                dp[row][col] = max(
                    1,
                    min(down, right) - dungeon[row][col]
                )

        return dp[0][0]
