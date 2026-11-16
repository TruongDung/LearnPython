class Solution:
    def maxUncrossedLines(self, nums1, nums2):
        rows, cols = len(nums1) + 1, len(nums2) + 1
        dp = [[0] * cols for _ in range(rows)]
        for row in range(1, rows):
            for col in range(1, cols):
                if nums1[row-1] == nums2[col-1]:
                    dp[row][col] = dp[row-1][col-1] + 1
                else:
                    dp[row][col] = max(dp[row-1][col], dp[row][col-1])
        return dp[rows-1][cols-1]
