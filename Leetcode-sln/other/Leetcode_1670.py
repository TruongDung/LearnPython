from collections import deque


class FrontMiddleBackQueue:

    def __init__(self):
        self.q = deque()

    def pushFront(self, val: int) -> None:
        self.q.appendleft(val)

    def pushMiddle(self, val: int) -> None:
        self.q.insert(len(self.q) // 2, val)

    def pushBack(self, val: int) -> None:
        self.q.append(val)

    def popFront(self) -> int:
        return self.q.popleft() if self.q else -1

    def popMiddle(self) -> int:
        if not self.q:
            return -1
        mid = (len(self.q) - 1) // 2
        val = self.q[mid]
        del self.q[mid]
        return val

    def popBack(self) -> int:
        return self.q.pop() if self.q else -1
