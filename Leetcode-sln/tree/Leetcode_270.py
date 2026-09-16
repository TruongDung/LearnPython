from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class TreeNode:
    val: int
    left: Optional["TreeNode"] = None
    right: Optional["TreeNode"] = None


class Solution:
    def closestValue(self, root: TreeNode, target: float) -> int:
        closest = root.val
        node = root

        while node:
            candidate = (abs(node.val - target), node.val)
            best = (abs(closest - target), closest)
            if candidate < best:
                closest = node.val

            if target < node.val:
                node = node.left
            else:
                node = node.right

        return closest


if __name__ == "__main__":
    root = TreeNode(4)
    root.left = TreeNode(2, TreeNode(1), TreeNode(3))
    root.right = TreeNode(5)

    solution = Solution()
    assert solution.closestValue(root, 3.714286) == 4
    assert solution.closestValue(root, 3.5) == 3
    assert solution.closestValue(root, 2.1) == 2
