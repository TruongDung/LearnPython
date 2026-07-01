class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


from typing import Optional

# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        diameter = 0

        def depth(node: Optional[TreeNode]) -> int:
            nonlocal diameter
            if node is None:
                return 0

            left_depth = depth(node.left)
            right_depth = depth(node.right)

            diameter = max(diameter, left_depth + right_depth)
            return max(left_depth, right_depth) + 1

        depth(root)
        return diameter
