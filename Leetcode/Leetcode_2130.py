class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


from typing import Optional

# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def pairSum(self, head: Optional[ListNode]) -> int:
        slow = head
        fast = head
        stack = []

        while fast is not None and fast.next is not None:
            stack.append(slow.val)
            slow = slow.next
            fast = fast.next.next

        max_sum = float('-inf')

        while slow is not None and stack:
            max_sum = max(max_sum, stack.pop() + slow.val)
            slow = slow.next

        return max_sum
