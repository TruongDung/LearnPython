# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeKLists(self, lists):
        heap = []
        for i, node in enumerate(lists):
            if node:
                heap.heappush(heap, (node.val, i, node))

        dummy = ListNode(0)
        cur = dummy

        while heap:
            val, i, node = heap.heappop(heap)

            cur.next = node
            cur = cur.next

            if node.next:
                heap.heappush(heap, (node.next.val, i, node.next))

        return dummy.next
