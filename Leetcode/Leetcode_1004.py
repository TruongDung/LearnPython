class Solution:
    def longestOnes(self, nums: List[int], k: int) -> int:
        i = 0
        max_length = 0
        zero_count = 0
        for j in range(len(nums)):
            if nums[j] == 0:
                zero_count += 1

                while zero_count>k:
                    if nums[i] == 0:
                        zero_count -= 1
                    
                    i += 1
            max_length = max(max_length, j - i + 1)
        return max_length
    
sol = Solution()
print(sol.longestOnes([1,1,1,0,0,0,1,1,1,1,0], 2))