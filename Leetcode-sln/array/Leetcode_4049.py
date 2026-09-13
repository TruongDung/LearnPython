from collections import defaultdict
from typing import List


class Solution:
    def countSpecialIntegers(self, nums: List[int]) -> int:
        positions = defaultdict(list)
        for index, value in enumerate(nums):
            positions[value].append(index)

        answer = 0
        for value, indices in positions.items():
            if len(indices) < 3:
                continue
            gap = indices[1] - indices[0]
            equally_spaced = True
            for i in range(2, len(indices)):
                if indices[i] - indices[i - 1] != gap:
                    equally_spaced = False
                    break
            if equally_spaced:
                answer += 1
        return answer


if __name__ == "__main__":
    solution = Solution()
    assert solution.countSpecialIntegers([1, 8, 1, 5, 1, 5, 8, 5]) == 2
    assert solution.countSpecialIntegers([8, 8, 8, 8]) == 1
    assert solution.countSpecialIntegers([8, 6, 6, 8, 8]) == 0
