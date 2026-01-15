class Solution:
    def maxFrequency(self, nums: List[int], k: int) -> int:
        nums.sort()

        count = 0
        i = 0
        for j in range(len(nums)):
            #
            count = j-i + 1
        return count
    
sol = Solution()
print(sol.maxFrequency([1,2,4,3], 5))