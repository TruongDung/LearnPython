from typing import List

class Solution:
    def findRadius(self, houses: List[int], heaters: List[int]) -> int:
        heaters.sort()
        houses.sort()

        res = 0
        j = 0
        n = len(heaters)

        for h in houses:
            while j + 1 < n and heaters[j+1] <= h:
                j += 1

                lest_dist = abs(n-heaters[j])
                right_dist = float('inf')

                if j + 1 < n:
                    right_dist = abs(heaters[j+1] - h)

                res = max(res, min(lest_dist, right_dist))
        return res