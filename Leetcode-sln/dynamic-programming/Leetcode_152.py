from typing import List


class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        cur_max = cur_min = result = nums[0]

        for x in nums[1:]:
            candidates = (x, cur_max * x, cur_min * x)
            cur_max = max(candidates)
            cur_min = min(candidates)
            result = max(result, cur_max)

        return result
