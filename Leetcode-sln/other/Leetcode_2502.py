class Allocator:

    def __init__(self, n: int):
        self.arr = [0] * n

    def allocate(self, size: int, mID: int) -> int:
        n = len(self.arr)
        count_0 = 0
        for i in range(n):
            if self.arr[i] == 0:
                count_0 += 1
            else:
                count_0 = 0

            if count_0 == size:
                start = i - size + 1
                for j in range(start, i + 1):
                    self.arr[j] = mID
                return start       

        return -1

    def freeMemory(self, mID: int) -> int:
        count = 0
        for i in range(len(self.arr)):
            if self.arr[i] == mID:
                self.arr[i] = 0
                count += 1
        return count

all = Allocator(10)
all.allocate(1,1)
all.allocate(1,2)
all.allocate(1,3)
all.freeMemory(2)
all.allocate(3,4)
