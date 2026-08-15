from typing import List


class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda x: x[0])
        merged = []

        for start, end in intervals:
            # If no overlap with the last merged interval, append a new one
            if not merged or start > merged[-1][1]:
                merged.append([start, end])
            else:
                # Overlap: extend the end of the last interval
                merged[-1][1] = max(merged[-1][1], end)

        return merged


sol = Solution()
print(sol.merge([[1, 3], [2, 6], [8, 10], [15, 18]]))  # [[1,6],[8,10],[15,18]]
print(sol.merge([[1, 4], [4, 5]]))                      # [[1,5]]
