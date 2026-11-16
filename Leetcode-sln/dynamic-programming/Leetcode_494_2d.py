class Solution:
    def findTargetSumWays(self, nums, target):
        total = sum(nums)
        if abs(target) > total or (total + target) % 2 != 0:
            return 0
        positive = (total + target) // 2
        rows, cols = len(nums) + 1, positive + 1
        dp = [[0] * cols for _ in range(rows)]
        dp[0][0] = 1
        for row in range(1, rows):
            num = nums[row-1]
            for col in range(cols):
                skip = dp[row-1][col]
                take = 0
                if col >= num:
                    take = dp[row-1][col-num]
                dp[row][col] = skip + take
        return dp[rows-1][cols-1]
