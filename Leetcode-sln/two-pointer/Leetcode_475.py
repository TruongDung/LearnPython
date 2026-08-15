import bisect
from typing import List


class Solution:
    def findRadius(self, houses: List[int], heaters: List[int]) -> int:
        heaters.sort()
        res = 0

        for h in houses:
            # Binary search: find insertion point of house h in heaters
            pos = bisect.bisect_left(heaters, h)

            # Distance to nearest heater on the left
            left_dist = abs(heaters[pos - 1] - h) if pos > 0 else float('inf')

            # Distance to nearest heater on the right
            right_dist = abs(heaters[pos] - h) if pos < len(heaters) else float('inf')

            # Minimum distance to any heater
            min_dist = min(left_dist, right_dist)

            res = max(res, min_dist)

        return res


sol = Solution()
print(sol.findRadius([1, 2, 3], [2]))       # Output: 1
print(sol.findRadius([1, 2, 3], [1, 3]))    # Output: 1
print(sol.findRadius([1, 5], [2]))          # Output: 3
