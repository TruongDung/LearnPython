from typing import List

class Solution:
    def pivotIndex(self, nums: List[int]) -> int:
        n = len(nums)
        prefix_sum_left = [0] * n
        prefix_sum_right = [0] * n

        sum = 0
        for i in range(n):
            sum += nums[i]
            prefix_sum_left[i] = sum
        
        sum = 0
        for i in range(n-1, -1, -1):
            sum += nums[i]
            prefix_sum_right[i] = sum
        
        for i in range(n):
            if prefix_sum_left[i] == prefix_sum_right[i]: 
                return i

        return -1
    
sol = Solution()
print(sol.pivotIndex([1,7,3,6,5,6]))