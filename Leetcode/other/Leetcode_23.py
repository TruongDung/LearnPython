import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution:
    def mergeKLists(self, lists):
        heap = []

        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i, node))

        dummy = ListNode(0)
        cur = dummy

        while heap:
            val, i, node = heapq.heappop(heap)

            cur.next = node
            cur = cur.next

            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))

        return dummy.next

def build_list(arr):
    dummy = ListNode(0)
    cur = dummy

    for val in arr:
        cur.next = ListNode(val)
        cur = cur.next

    return dummy.next
lists = [[1,4,5],[1,3,4],[2,6]]
linked_lists = [build_list(lst) for lst in lists]

def print_list(node):
    while node:
        print(node.val, end=" -> ")
        node = node.next
    print("NULL")

sol = Solution()
print_list(sol.mergeKLists(linked_lists))
