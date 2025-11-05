class TreeNode:
    def __init__(self, value):
        self.left = None
        self.right = None
        self.val = value


n = TreeNode(1)
n.left = TreeNode(2)   
n.right = TreeNode(3)
print(n.left.val)