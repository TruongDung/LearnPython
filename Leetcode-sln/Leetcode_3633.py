from typing import List

class Solution:
    def earliestFinishTime(
        self,
        landStartTime: List[int],
        landDuration: List[int],
        waterStartTime: List[int],
        waterDuration: List[int],
    ) -> int:
        ans = float("inf")

        for i in range(len(landStartTime)):
            for j in range(len(waterStartTime)):
                # Case 1:
                finish_land = landStartTime[i] + landDuration[i]
                finish_all = max(finish_land, waterStartTime[j]) + waterDuration[j]
                ans = min(ans, finish_all)

                # Case 2:
                finish_water = waterStartTime[j] + waterDuration[j]
                finish_all = max(finish_water, landStartTime[i]) + landDuration[i]
                ans = min(ans, finish_all)

        return ans

sol = Solution()
print(sol.earliestFinishTime([2,8], [4,1], [6], [3]))
