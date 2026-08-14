from collections import defaultdict
from typing import List, Optional


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def verticalTraversal(self, root: Optional[TreeNode]) -> List[List[int]]:
        # column -> list of (row, value)
        columns = defaultdict(list)

        def dfs(node, row, col):
            if not node:
                return
            columns[col].append((row, node.val))
            dfs(node.left, row + 1, col - 1)
            dfs(node.right, row + 1, col + 1)

        dfs(root, 0, 0)

        result = []
        for col in sorted(columns):
            # Sort by row, then by value (tie-break)
            col_vals = sorted(columns[col], key=lambda rv: (rv[0], rv[1]))
            result.append([val for _, val in col_vals])

        return result


def build(values):
    """Build a tree from a level-order list with None for missing nodes."""
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
print(sol.verticalTraversal(build([3, 9, 20, None, None, 15, 7])))
# [[9], [3, 15], [20], [7]]
print(sol.verticalTraversal(build([1, 2, 3, 4, 5, 6, 7])))
# [[4], [2], [1, 5, 6], [3], [7]]
