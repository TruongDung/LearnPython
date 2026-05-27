class Solution:
    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:
        if k <= 1:
             return 0
        i = 0
        count = 0
        product = 1
        for j in range(len(nums)):
            product *= nums[j]
            while product > k:
                product //= nums[i]
                i += 1
            count = max(count, j - i + 1)
        return count
    
sol = Solution()
print(sol.numSubarrayProductLessThanK([10, 5, 2, 6], 100))
