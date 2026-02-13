class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        groupPrev = dummy

        while True:
            kth = self.getKth(groupPrev, k)
            if kth is None:
                break
        groupNext = kth.next
        pre = groupNext
        curr = groupPrev.next

        while curr != groupNext:
            temp = curr.next
            curr.next = pre
            pre = curr
            curr = temp

        temp = groupPrev.next
        groupPrev.next = kth
        groupPrev = temp

        return dummy.next

    def getKth(self, groupPrev, k) -> Optional[ListNode]:
        i = 1
        while i < k:
            groupPrev = groupPrev.next
            i += 1
        return groupPrev
    
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

head = ListNode(1)
head.next = ListNode(2)
head.next.next = ListNode(3)
head.next.next.next = ListNode(4)
head.next.next.next.next = ListNode(5)

sol = Solution()
print(sol.reverseKGroup(head, 2))