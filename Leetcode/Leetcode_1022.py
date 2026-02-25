# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(arr):
    if not arr:
        return None
    
    nodes = [TreeNode(val) if val is not None else None for val in arr]
    
    for i in range(len(arr)):
        if nodes[i] is not None:
            left_index = 2*i + 1
            right_index = 2*i + 2
            
            if left_index < len(arr):
                nodes[i].left = nodes[left_index]
            if right_index < len(arr):
                nodes[i].right = nodes[right_index]
    
    return nodes[0]

root = build_tree([1,0,1,0,1,0,1])



class Solution:
    def sumRootToLeaf(self, root: Optional[TreeNode]) -> int:
        res = []
        def pre_order(node: Optional[TreeNode], res):
            if node == None:
                return 0
            
            res.append(node.val)


            return pre_order(node.left, res) or pre_order(node.right, res)
        
        pre_order(root, res)

        return 0
    
sol = Solution()
print(sol.sumRootToLeaf(root))