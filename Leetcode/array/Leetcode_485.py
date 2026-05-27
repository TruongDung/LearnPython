class Solution:
    def findMaxConsecutiveOnes(self, nums: List[int]) -> int:
        i = 0
        max_length = 0

        for j in range(len(nums)):
            if nums[j] == 0: 
                i = j + 1
            max_length = max(max_length, j - i + 1)

        return max_length
    
sol = Solution()
print(sol.findMaxConsecutiveOnes([1,1,0,1,1,1]))