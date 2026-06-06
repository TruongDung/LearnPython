class Solution:
    def leftRightDifference(self, nums: List[int]) -> List[int]:

        n = len(nums)
        left_sum = [0]
        for x in range(n - 1):
            left_sum.append(left_sum[-1] + nums[x])
            
        right_sum = [0]
        nums.reverse()
        for x in range(n - 1):
            right_sum.append(right_sum[-1] + nums[x])
        
        right_sum.reverse()
        res = [0] * n
        for i in range(n):
            res[i] = abs(left_sum[i] - right_sum[i])

        return res
        
sol = Solution()
print(sol.leftRightDifference([10,4,8,3]))
