import random
from bisect import bisect_right

class Solution:
    def __init__(self, rects):
        self.rects = rects
        self.prefix = []
        self.total = 0
        for x1, y1, x2, y2 in rects:
            self.total += (x2 - x1 + 1) * (y2 - y1 + 1)
            self.prefix.append(self.total)

    def pick(self):
        ticket = random.randrange(self.total)
        index = bisect_right(self.prefix, ticket)
        before = self.prefix[index - 1] if index else 0
        offset = ticket - before
        x1, y1, x2, y2 = self.rects[index]
        width = x2 - x1 + 1
        return [x1 + offset % width, y1 + offset // width]
