import random

class Solution:
    def __init__(self, nums):
        self.nums = nums

    def pick(self, target):
        chosen = -1
        count = 0
        for i, value in enumerate(self.nums):
            if value == target:
                count += 1
                roll = random.randrange(count)
                if roll == 0:
                    chosen = i
        return chosen
