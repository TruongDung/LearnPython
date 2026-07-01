from typing import List


class NumArray:
    def __init__(self, nums: List[int]):
        # prefix[i] holds the sum of the first i numbers.
        self.prefix = [0] * (len(nums) + 1)
        for i, num in enumerate(nums):
            self.prefix[i + 1] = self.prefix[i] + num

    def sumRange(self, left: int, right: int) -> int:
        return self.prefix[right + 1] - self.prefix[left]


obj = NumArray([-2, 0, 3, -5, 2, 1])
print(obj.sumRange(0, 2))
