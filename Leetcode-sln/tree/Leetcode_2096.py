from typing import List, Optional


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def getDirections(self, root: Optional[TreeNode], startValue: int, destValue: int) -> str:
        # Directions from the root down to a value, as a list of "L"/"R".
        # Returns None when the value is not in this subtree. The success case
        # returns [] (an empty list), so every check must use `is not None`:
        # a plain truthiness test would mistake "found it at the root" for
        # "not found here".
        def path_to(node, target):
            if not node:
                return None
            if node.val == target:
                return []
            left = path_to(node.left, target)
            if left is not None:
                return ["L"] + left
            right = path_to(node.right, target)
            if right is not None:
                return ["R"] + right
            return None

        start_path = path_to(root, startValue)
        dest_path = path_to(root, destValue)

        # The shared prefix is the walk down to the lowest common ancestor.
        # Everything after it is the part of each path that actually differs.
        common = 0
        while (
            common < len(start_path)
            and common < len(dest_path)
            and start_path[common] == dest_path[common]
        ):
            common += 1

        # Climb out of the start branch, then descend into the dest branch.
        return "U" * (len(start_path) - common) + "".join(dest_path[common:])


def build_tree(values: List[Optional[int]]) -> Optional[TreeNode]:
    """Build a tree from LeetCode level-order input."""
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = [root]
    index = 1
    head = 0
    while head < len(queue) and index < len(values):
        node = queue[head]
        head += 1
        if index < len(values) and values[index] is not None:
            node.left = TreeNode(values[index])
            queue.append(node.left)
        index += 1
        if index < len(values) and values[index] is not None:
            node.right = TreeNode(values[index])
            queue.append(node.right)
        index += 1
    return root


if __name__ == "__main__":
    solution = Solution()

    # LeetCode example 1: the LCA is the root, so both U's come first.
    assert solution.getDirections(build_tree([5, 1, 2, 3, None, 6, 4]), 3, 6) == "UURL"
    # LeetCode example 2: start is the parent of dest, so no U at all.
    assert solution.getDirections(build_tree([2, 1]), 2, 1) == "L"

    # start is a descendant of dest: the answer is all U's.
    assert solution.getDirections(build_tree([1, 2, 3, 4, 5]), 4, 1) == "UU"
    # Sibling leaves under the same parent.
    assert solution.getDirections(build_tree([1, 2, 3, 4, 5]), 4, 5) == "UR"
    # Deep left leaf to deep right leaf across the root.
    assert solution.getDirections(build_tree([1, 2, 3, 4, None, None, 7]), 4, 7) == "UURR"
