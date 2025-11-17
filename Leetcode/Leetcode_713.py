class Solution:
    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:
        if k <= 1:
             return 0
        
        j = 0
        count = 0
        product = 1
        for i in range(len(nums)):
            product *= nums[i]
            while product >= k:
                product //= nums[j]
                j += 1
            count += i - j + 1

        return count
    
sol = Solution()
sol.numSubarrayProductLessThanK([1,1,1], 0)
