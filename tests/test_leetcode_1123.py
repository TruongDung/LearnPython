import pytest

from Leetcode.Leetcode_1123 import Solution


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def build_tree(values):
    """Build a binary tree from a list of values (level order)."""
    if not values or values[0] is None:
        return None

    root = TreeNode(values[0])
    queue = [root]
    i = 1

    while queue and i < len(values):
        node = queue.pop(0)
        
        # Left child
        if i < len(values):
            if values[i] is not None:
                node.left = TreeNode(values[i])
                queue.append(node.left)
            i += 1
        
        # Right child
        if i < len(values):
            if values[i] is not None:
                node.right = TreeNode(values[i])
                queue.append(node.right)
            i += 1

    return root


@pytest.mark.parametrize(
    "tree_values, expected_val",
    [
        # Single node tree
        ([1], 1),

        # Two levels, deepest leaves are 2 and 3, LCA is 1
        ([1, 2, 3], 1),

        # Unbalanced tree, deepest leaf is 3, LCA is 3
        ([1, 2, None, 3], 3),

        # Deeper on left side, deepest leaf is 5, LCA is 5
        ([1, 2, 3, 4, None, None, None, 5], 5),

        # Balanced deeper tree, deepest leaves are 6 and 7, LCA is 3
        ([1, 2, 3, None, None, 4, 5, None, None, None, None, 6, 7], 3),

        # Tree where LCA is not root, deepest leaves are 4 and 5, LCA is 2
        ([1, 2, 3, 4, 5], 2),

        # Tree with only left subtree, deepest leaf is 3, LCA is 3
        ([1, 2, None, 3], 3),

        # Tree with only right subtree, deepest leaf is 3, LCA is 3
        ([1, None, 2, None, 3], 3),

        # Complex tree, deepest leaves are 7,8,9, LCA is 4
        ([1, 2, 3, 4, None, None, None, 5, 6, 7, 8, 9], 4),
    ],
)
def test_lca_deepest_leaves(tree_values, expected_val):
    solution = Solution()
    root = build_tree(tree_values)
    result = solution.lcaDeepestLeaves(root)
    assert result.val == expected_val