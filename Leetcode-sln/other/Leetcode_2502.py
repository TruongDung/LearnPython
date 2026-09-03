class Allocator:

    def __init__(self, n: int):
        self.arr = [0] * n

    def allocate(self, size: int, mID: int) -> int:
        n = len(self.arr)
        for i in range(n):
            count = 0
            while count < size:
                self.arr[i] = mID
                count += 1
            break

        print(self.arr)

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