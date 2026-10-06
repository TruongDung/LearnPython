import heapq

class SmallestInfiniteSet:
    def __init__(self):
        self.cur = 1
        self.added = []
        self.added_set = set()

    def popSmallest(self) -> int:
        if self.added:
            first_val = heapq.heappop(self.added)
            self.added_set.remove(first_val)
            return first_val
        
        first_val = self.cur
        self.cur += 1
        return first_val

        
    def addBack(self, num) -> None:
        if num<self.cur and num not in self.added:
            self.added_set.add(num)
            heapq.heappush(self.added, num)