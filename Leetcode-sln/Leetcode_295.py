import heapq


class MedianFinder:
    def __init__(self):
        # max-heap (store negatives) for the smaller half
        self.small = []
        # min-heap for the larger half
        self.large = []

    def addNum(self, num: int) -> None:
        # Push to max-heap first
        heapq.heappush(self.small, -num)

        # Ensure every element in small <= every element in large
        if self.small and self.large and (-self.small[0] > self.large[0]):
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)

        # Rebalance sizes (small can have at most 1 more than large)
        if len(self.small) > len(self.large) + 1:
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        if len(self.large) > len(self.small):
            val = heapq.heappop(self.large)
            heapq.heappush(self.small, -val)

    def findMedian(self) -> float:
        if len(self.small) > len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2


mf = MedianFinder()
mf.addNum(1)
mf.addNum(2)
print(mf.findMedian())  # 1.5
mf.addNum(3)
print(mf.findMedian())  # 2
