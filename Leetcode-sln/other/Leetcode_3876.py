from typing import List


class Solution:
    def uniformArray(self, nums1: List[int]) -> bool:
        min_value = min(nums1)
        is_even = True
        for num in nums1:
            if num % 2 != 0:
                is_even = False

        if is_even:
            return True

        if min_value % 2 != 0:
            return True

        return False


sol = Solution()
print(sol.uniformArray([2, 3]))
