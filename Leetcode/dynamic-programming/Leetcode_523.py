from typing import List


class Solution:
    def CheckSumArray(self, nums: List[int], k: int) -> bool:
        prefix_mod = 0
        # Maps each remainder to the earliest index where it appeared.
        first_index = {0: -1}

        for i, num in enumerate(nums):
            prefix_mod = (prefix_mod + num) % k

            if prefix_mod in first_index:
                # Same remainder seen before -> the subarray between them
                # sums to a multiple of k. We need it to be at least length 2.
                if i - first_index[prefix_mod] > 1:
                    return True
            else:
                first_index[prefix_mod] = i

        return False


sol = Solution()
print(sol.CheckSumArray([1, 5, 2, 1, 5, 2, 1, 3], 5))
