from typing import List


class Solution:
    def getModifiedArray(self, length: int, updates: List[List[int]]) -> List[int]:
        diff = [0] * (length + 1)

        for start, end, inc in updates:
            diff[start] += inc
            diff[end + 1] -= inc

        res = []
        running = 0
        for i in range(length):
            running += diff[i]
            res.append(running)
        return res


sol = Solution()
print(sol.getModifiedArray(5, [[1, 3, 2], [2, 4, 3], [0, 2, -2]]))
