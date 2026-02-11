class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0)
        dummy.next = head

        fast = slow = dummy

        # fast đi trước n bước
        for _ in range(n):
            fast = fast.next

        # cùng đi cho tới khi fast ở node cuối
        while fast.next:
            fast = fast.next
            slow = slow.next

        # xoá node
        slow.next = slow.next.next

        return dummy.next

head = ListNode(1)
head.next = ListNode(2)
head.next.next = ListNode(3)
head.next.next.next = ListNode(4)
head.next.next.next.next = ListNode(5)
head.next.next.next.next.next = ListNode(6)
sol = Solution()
print(sol.removeNthFromEnd(head, 2))

        #arr1 = [1,2,3,4,5] 
        #len1 = len(arr1)   
        #print(arr1[0:len1 - n] + arr1[len1 - n+1:len1])