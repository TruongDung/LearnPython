class MyCircularDeque:

    def __init__(self, k: int):
        self.capacity = k
        self.data = []

    def insertFront(self, value: int) -> bool:
        if self.isFull():
            return False
        self.data.insert(0, value)
        return True

    def insertLast(self, value: int) -> bool:
        if self.isFull():
            return False
        self.data.append(value)
        return True

    def deleteFront(self) -> bool:
        if self.isEmpty():
            return False
        self.data.pop(0)
        return True

    def deleteLast(self) -> bool:
        if self.isEmpty():
            return False
        self.data.pop()
        return True

    def getFront(self) -> int:
        return self.data[0] if self.data else -1

    def getRear(self) -> int:
        return self.data[-1] if self.data else -1

    def isEmpty(self) -> bool:
        return len(self.data) == 0

    def isFull(self) -> bool:
        return len(self.data) == self.capacity
