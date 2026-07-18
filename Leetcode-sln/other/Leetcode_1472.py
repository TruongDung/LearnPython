"""LeetCode 1472: Design Browser History using a doubly linked list."""


class DoubleListNode:
    """A page in browser history with links in both directions."""

    def __init__(self, val=0, prev=None, next=None):
        self.val = val
        self.prev = prev
        self.next = next


class BrowserHistory:
    """Browser history backed by a doubly linked list."""

    def __init__(self, homepage: str):
        self.curr = DoubleListNode(homepage)

    def visit(self, url: str) -> None:
        new_node = DoubleListNode(url, self.curr)
        self.curr.next = new_node
        self.curr = new_node

    def back(self, steps: int) -> str:
        while self.curr.prev and steps > 0:
            self.curr = self.curr.prev
            steps -= 1
        return self.curr.val

    def forward(self, steps: int) -> str:
        while self.curr.next and steps > 0:
            self.curr = self.curr.next
            steps -= 1
        return self.curr.val
