from typing import Optional


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution:
    def rotateRight(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        if not head or not head.next or k == 0:
            return head

        # 1) find length and tail
        length = 1
        tail = head
        while tail.next:
            tail = tail.next
            length += 1

        # 2) make it circular, then break at the new tail
        k %= length
        if k == 0:
            return head
        tail.next = head
        steps_to_new_tail = length - k
        new_tail = head
        for _ in range(steps_to_new_tail - 1):
            new_tail = new_tail.next
        new_head = new_tail.next
        new_tail.next = None
        return new_head


def build(vals):
    dummy = ListNode()
    cur = dummy
    for v in vals:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next


def to_list(node):
    out = []
    while node:
        out.append(node.val)
        node = node.next
    return out


sol = Solution()
print(to_list(sol.rotateRight(build([1, 2, 3, 4, 5]), 2)))  # [4,5,1,2,3]
print(to_list(sol.rotateRight(build([0, 1, 2]), 4)))        # [2,0,1]
