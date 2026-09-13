from bisect import bisect_left
from typing import List


class Solution:
    def shadowPairs(self, nums: List[int]) -> int:
        candidates: List[int] = []
        answer = 0

        for value in nums:
            answer += bisect_left(candidates, value)

            while candidates and candidates[-1] > value:
                candidates.pop()
            candidates.append(value)

        return answer


if __name__ == "__main__":
    solution = Solution()
    assert solution.shadowPairs([3, 1, 4, 1, 5]) == 3
    assert solution.shadowPairs([6, 7, 6, 6, 7]) == 4
    assert solution.shadowPairs([1, 2, 3, 4]) == 6
