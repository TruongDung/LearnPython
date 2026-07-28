from typing import List


class Solution:
    def firstMissingPositive(self, nums: List[int]) -> int:
        n = len(nums)

        # Place each value v (1..n) at index v-1 via cyclic swaps
        for i in range(n):
            while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
                target = nums[i] - 1
                nums[i], nums[target] = nums[target], nums[i]

        # First index i where nums[i] != i+1 → answer is i+1
        for i in range(n):
            if nums[i] != i + 1:
                return i + 1

        return n + 1


sol = Solution()
print(sol.firstMissingPositive([1, 2, 0]))       # 3
print(sol.firstMissingPositive([3, 4, -1, 1]))   # 2
print(sol.firstMissingPositive([7, 8, 9, 11, 12]))  # 1
