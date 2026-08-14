from typing import List


class Solution:
    def nextPermutation(self, nums: List[int]) -> None:
        n = len(nums)

        # 1) Find the first index i (from right) where nums[i] < nums[i+1]
        i = n - 2
        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1

        # 2) If such i exists, find j > i with the smallest value > nums[i]
        if i >= 0:
            j = n - 1
            while nums[j] <= nums[i]:
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]

        # 3) Reverse the suffix after i to get the smallest arrangement
        left, right = i + 1, n - 1
        while left < right:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
            right -= 1


sol = Solution()
a = [1, 2, 3]
sol.nextPermutation(a)
print(a)  # [1, 3, 2]
b = [3, 2, 1]
sol.nextPermutation(b)
print(b)  # [1, 2, 3]
c = [1, 1, 5]
sol.nextPermutation(c)
print(c)  # [1, 5, 1]
