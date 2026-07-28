from typing import List, Optional


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> List[List[int]]:
        result = []

        def dfs(node, remaining, path):
            if not node:
                return
            path.append(node.val)
            remaining -= node.val
            # Leaf and sum matches → record a copy of the path
            if not node.left and not node.right and remaining == 0:
                result.append(list(path))
            else:
                dfs(node.left, remaining, path)
                dfs(node.right, remaining, path)
            path.pop()  # backtrack

        dfs(root, targetSum, [])
        return result


def build(values):
    if not values:
        return None
    nodes = [TreeNode(v) if v is not None else None for v in values]
    kids = nodes[::-1]
    root = kids.pop()
    for node in nodes:
        if node:
            if kids:
                node.left = kids.pop()
            if kids:
                node.right = kids.pop()
    return root


sol = Solution()
print(sol.pathSum(build([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, 5, 1]), 22))
# [[5,4,11,2],[5,8,4,5]]
