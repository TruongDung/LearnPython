class Solution:
    def calculateMinimumHP(self, dungeon):
        rows, cols = len(dungeon), len(dungeon[0])
        dp = [[0]*cols for _ in range(rows)]
        dp[rows-1][cols-1] = max(1, 1 - dungeon[rows-1][cols-1])
        # Last row
        for col in range(cols-2, -1, -1):
            dp[rows-1][col] = max(1, dp[rows-1][col+1] - dungeon[rows-1][col])
        # Last col
        for row in range(rows-2, -1, -1):
            dp[row][cols-1] = max(1, dp[row+1][cols-1] - dungeon[row][cols-1])
        # Rest
        for row in range(rows-2, -1, -1):
            for col in range(cols-2, -1, -1):
                dp[row][col] = max(1, min(dp[row+1][col], dp[row][col+1]) - dungeon[row][col])
        return dp[0][0]
