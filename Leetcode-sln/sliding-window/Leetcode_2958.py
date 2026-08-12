from typing import List


class Solution:
    def maxSubarrayLength(self, nums: List[int], k: int) -> int:
        left = 0
        ans = 0
        count = {} # {1:3}
        for right in range(len(nums)):
            #num[right] = 1
            count[nums[right]] = count.get(nums[right], 0) + 1
            while count[nums[right]] > k:
                count[nums[left]] -= 1
                left += 1
            ans = max(ans, right - left + 1)
        return 0

sol = Solution()
print(sol.maxSubarrayLength([1,2,3,1,2,3,1,2], 2))
