# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeKLists(self, lists):
        heap = []

        # 1. đưa head của mỗi linked list vào heap
        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i, node))

        dummy = ListNode(0)
        cur = dummy

        # 2. lấy nhỏ nhất ra, nối vào kết quả
        while heap:

            val, i, node = heapq.heappop(heap)

            cur.next = node
            cur = cur.next

            # 3. nếu còn node tiếp theo → push vào heap
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))

        return dummy.next
