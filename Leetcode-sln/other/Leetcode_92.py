from typing import Optional


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution:
    def reverseBetween(self, head: Optional[ListNode], left: int, right: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        prev = dummy

        # Advance prev to the node just before position `left`
        for _ in range(left - 1):
            prev = prev.next

        # `curr` is the first node to be reversed
        curr = prev.next

        # Reverse the sublist from left to right using "insert-at-front" trick
        for _ in range(right - left):
            nxt = curr.next
            curr.next = nxt.next
            nxt.next = prev.next
            prev.next = nxt

        return dummy.next


def build(values):
    dummy = ListNode()
    node = dummy
    for v in values:
        node.next = ListNode(v)
        node = node.next
    return dummy.next


def to_list(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result


sol = Solution()
print(to_list(sol.reverseBetween(build([1, 2, 3, 4, 5]), 2, 4)))  # [1,4,3,2,5]
print(to_list(sol.reverseBetween(build([5]), 1, 1)))               # [5]
print(to_list(sol.reverseBetween(build([1, 2, 3]), 1, 3)))         # [3,2,1]
