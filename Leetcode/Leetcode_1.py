class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        d = {}
        for i in range(len(nums)):
            if target - nums[i] in d:
                return[i, d[target-nums[i]]]
            d[nums[i]]= i

sol = Solution()
print(sol.twoSum([2,7,11,15],9))