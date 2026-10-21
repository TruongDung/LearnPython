class Solution:
    def lengthOfLIS(self, nums):
        # 1
        # n = len(nums)
        # dp = [1] * n
        # for i in range(1, n):
        #     for j in range(i):
        #         if nums[j] < nums[i]:
        #             dp[i] = max(dp[i], dp[j] + 1)
        # return max(dp)

        #2
        

sol = Solution()
#print(sol.lengthOfLIS([1,3,5,4]))
print(sol.lengthOfLIS([10, 20, 30, 0, 40]))