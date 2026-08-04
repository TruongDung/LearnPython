import heapq
from typing import List


class Solution:
    def minRefuelStops(self, target: int, start_fuel: int, stations: List[List[int]]) -> int:
        # Max-heap of fuel amounts at stations already within reach,
        # simulated with negated values (Python's heapq is a min-heap).
        heap = []
        fuel = start_fuel
        stops = 0
        i = 0
        n = len(stations)

        while fuel < target:
            # Push every station reachable with the CURRENT fuel level.
            while i < n and stations[i][0] <= fuel:
                heapq.heappush(heap, -stations[i][1])
                i += 1

            if not heap:
                # No reachable station has fuel left to take -> stuck.
                return -1

            # Greedy: always refuel at the station with the MOST fuel
            # among those already reachable.
            fuel += -heapq.heappop(heap)
            stops += 1

        return stops


sol = Solution()
print(sol.minRefuelStops(1, 1, []))                                            # 0
print(sol.minRefuelStops(100, 1, [[10, 100]]))                                 # -1
print(sol.minRefuelStops(100, 10, [[10, 60], [20, 30], [30, 30], [60, 40]]))   # 2
