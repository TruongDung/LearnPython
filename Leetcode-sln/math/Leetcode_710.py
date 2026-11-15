import random

class Solution:
    def __init__(self, n, blacklist):
        self.bound = n - len(blacklist)
        self.mapping = {}
        blocked = set(blacklist)
        high = self.bound
        for low in blacklist:
            if low < self.bound:
                while high in blocked:
                    high += 1
                self.mapping[low] = high
                high += 1

    def pick(self):
        roll = random.randrange(self.bound)
        return self.mapping.get(roll, roll)
