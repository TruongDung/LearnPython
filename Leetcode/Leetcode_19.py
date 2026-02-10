class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        arr = [head]
        while arr[-1].next:
            arr.append(arr[-1].next)

        cur = head
        pre = head

        k = len(arr) - n 
        j = 0 
        while cur:
            if j == k:
                pre.next = cur.next
            cur = cur.next
            j += 1

        return pre

head = ListNode(1)
head.next = ListNode(2)
head.next.next = ListNode(3)
head.next.next.next = ListNode(4)
head.next.next.next.next = ListNode(5)
sol = Solution()
print(sol.removeNthFromEnd(head, 2))

        #arr1 = [1,2,3,4,5] 
        #len1 = len(arr1)   
        #print(arr1[0:len1 - n] + arr1[len1 - n+1:len1])