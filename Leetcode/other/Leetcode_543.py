# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        def post_order(node: Optional[TreeNode]) -> int:
            if node == None:
                return 0

                left_depth = post_order(node.left)
                right_depth = post_order(node.right)

                return max(left_depth) + max(right_depth) + 1
            
            return post_order(root)