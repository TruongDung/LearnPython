from typing import List


class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        # last index where each value was seen
        last_index = {}
        for i, num in enumerate(nums):
            if num in last_index and i - last_index[num] <= k:
                return True
            last_index[num] = i
        return False


sol = Solution()
print(sol.containsNearbyDuplicate([1, 2, 3, 1], 3))        # True
print(sol.containsNearbyDuplicate([1, 0, 1, 1], 1))        # True
print(sol.containsNearbyDuplicate([1, 2, 3, 1, 2, 3], 2))  # False
