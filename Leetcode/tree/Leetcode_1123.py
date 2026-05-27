class Solution:
    def lcaDeepestLeaves(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        # Helper function returns (depth, lca_node)
        def dfs(node):
            if not node:
                return 0, None
            
            # Post-order: get info from children first
            left_depth, left_lca = dfs(node.left)
            right_depth, right_lca = dfs(node.right)
            
            # Case 1: Subtrees are equally deep
            # This node is the current candidate for LCA
            if left_depth == right_depth:
                return left_depth + 1, node
            
            # Case 2: Left side is deeper
            # The LCA must be somewhere in the left subtree
            if left_depth > right_depth:
                return left_depth + 1, left_lca
            
            # Case 3: Right side is deeper
            # The LCA must be somewhere in the right subtree
            else:
                return right_depth + 1, right_lca
        
        # The second element of the tuple is our final result
        return dfs(root)[1]