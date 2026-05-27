class Solution:
    def sortArrayByParity(self, nums: List[int]) -> List[int]:
        i = 0
        for j in range(len(nums)):
            if nums[j] %2 == 0:
                nums[i], nums[j] = nums[j], nums[i]
                i += 1
        return nums

sol = Solution()
print(sol.sortArrayByParity([3,1,2,4]))