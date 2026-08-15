from typing import Optional


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution:
    def deleteDuplicates(self, head: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        prev = dummy  # last node guaranteed to be kept

        while head:
            # If current is the start of a run of duplicates, skip all of them
            if head.next and head.val == head.next.val:
                while head.next and head.val == head.next.val:
                    head = head.next
                prev.next = head.next  # remove the whole run
            else:
                prev = prev.next
            head = head.next

        return dummy.next


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
print(to_list(sol.deleteDuplicates(build([1, 2, 3, 3, 4, 4, 5]))))  # [1,2,5]
print(to_list(sol.deleteDuplicates(build([1, 1, 1, 2, 3]))))        # [2,3]
