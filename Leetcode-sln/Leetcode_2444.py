from typing import List


class Solution:
    def countSubarrays(self, nums: List[int], minK: int, maxK: int) -> int:
        res = 0
        bad = -1       # last index where nums[i] < minK or nums[i] > maxK
        min_pos = -1   # last index where nums[i] == minK
        max_pos = -1   # last index where nums[i] == maxK

        for i, num in enumerate(nums):
            # If out of [minK, maxK], update bad boundary
            if num < minK or num > maxK:
                bad = i

            # Track last occurrence of minK and maxK
            if num == minK:
                min_pos = i
            if num == maxK:
                max_pos = i

            # Number of valid subarrays ending at i:
            # left boundary must be > bad, and must include both minK and maxK
            count = max(0, min(min_pos, max_pos) - bad)
            res += count

        return res


sol = Solution()
print(sol.countSubarrays([1, 3, 5, 2, 7, 5], 1, 5))  # Output: 2
print(sol.countSubarrays([1, 1, 1, 1], 1, 1))          # Output: 10
