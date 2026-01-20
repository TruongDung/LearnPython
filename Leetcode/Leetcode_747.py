class Solution:
    def dominantIndex(self, nums: List[int]) -> int:
        max_num = max(nums)
        for i in range(len(nums)):
            if nums[i]!=max_num and max_num < 2 * nums[i]:
                return -1
        return nums.index(max_num)

sol = Solution()
print(sol.dominantIndex([3,6,0,1]))