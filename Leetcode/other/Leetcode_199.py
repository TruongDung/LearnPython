# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

import collections


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(lst):
    if not lst:
        return None

    root = TreeNode(lst[0])
    queue = [root]
    i = 1

    while queue and i < len(lst):
        node = queue.pop(0)

        # left child
        if i < len(lst) and lst[i] is not None:
            node.left = TreeNode(lst[i])
            queue.append(node.left)
        i += 1

        # right child
        if i < len(lst) and lst[i] is not None:
            node.right = TreeNode(lst[i])
            queue.append(node.right)
        i += 1

    return root

# Test
root = build_tree([1, 2, 3, 4, None, None, None, 5])

class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        res = []
        if root == None:
            return res
        queue = collections.deque()
        queue.append(root)
        while queue:
            size = len(queue)
            current_level_list = []
            for _ in range(size):
                curr = queue.popleft()

                current_level_list.append(curr.val)

                if curr.left:
                   queue.append(curr.left)
                if curr.right:
                    queue.append(curr.right)

                if _ == size - 1:
                    res.append(curr.val)

            #res.append(current_level_list)
        return res
    
sol = Solution()
print(sol.rightSideView(root))