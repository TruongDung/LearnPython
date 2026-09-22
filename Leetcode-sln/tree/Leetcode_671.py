from typing import Optional


class TreeNode:
    def __init__(self, val: int = 0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def findSecondMinimumValue(self, root: Optional[TreeNode]) -> int:
        first = root.val

        def dfs(node: Optional[TreeNode]) -> int:
            if not node:
                return -1
            if node.val > first:
                return node.val

            left = dfs(node.left)
            right = dfs(node.right)
            if left == -1:
                return right
            if right == -1:
                return left
            return min(left, right)

        return dfs(root)


if __name__ == "__main__":
    root = TreeNode(2, TreeNode(2), TreeNode(5, TreeNode(5), TreeNode(7)))
    assert Solution().findSecondMinimumValue(root) == 5
