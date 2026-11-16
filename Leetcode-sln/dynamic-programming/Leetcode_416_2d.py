class Solution:
    def canPartition(self, nums):
        total = sum(nums)
        if total % 2 != 0:
            return False
        target = total // 2
        rows, cols = len(nums) + 1, target + 1
        dp = [[False] * cols for _ in range(rows)]
        for row in range(rows):
            dp[row][0] = True
        for row in range(1, rows):
            num = nums[row-1]
            for col in range(1, cols):
                skip = dp[row-1][col]
                take = False
                if col >= num:
                    take = dp[row-1][col-num]
                dp[row][col] = skip or take
        return dp[rows-1][cols-1]
