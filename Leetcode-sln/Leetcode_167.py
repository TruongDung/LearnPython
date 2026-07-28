from typing import List


class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        left, right = 0, len(numbers) - 1

        while left < right:
            total = numbers[left] + numbers[right]
            if total == target:
                return [left + 1, right + 1]  # 1-indexed
            if total < target:
                left += 1  # need a larger sum
            else:
                right -= 1  # need a smaller sum

        return []


sol = Solution()
print(sol.twoSum([2, 7, 11, 15], 9))   # [1,2]
print(sol.twoSum([2, 3, 4], 6))        # [1,3]
print(sol.twoSum([-1, 0], -1))         # [1,2]
