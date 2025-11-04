class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        n = len(nums)
        max_val = float('-inf')
        for i in range(n):
            current_sum = 0
            for j in range(1, n):
                current_sum = current_sum + nums[j]
                max_val = max(max_val, current_sum)
        return max_val
    
sol = Solution()
print(sol.maxSubArray([-2,1,-3,4,-1,2,1,-5,4]))

