class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def recoverTree(self, root: Optional[TreeNode]) -> None:
        self.first_wrong = None
        self.second_wrong = None
        self.prev = TreeNode(float('-inf'))

        self.inorder(root)
        self.first_wrong.val, self.second_wrong.val = self.second_wrong.val, self.first_wrong.val


    def inorder(self, curr):
        if not curr:
            return

        self.inorder(curr.left)
        if curr.val < self.prev.val:
            if not self.first_wrong:
                self.first_wrong = self.prev
            self.second_wrong = curr
        self.prev = curr

        self.inorder(curr.right)

node_3 = TreeNode(3)
node_1 = TreeNode(1)
node_4 = TreeNode(4)
node_2 = TreeNode(2)
node_3.left = node_1      
node_3.right = node_4     
node_4.left = node_2      
root = node_3

sol = Solution()
sol.recoverTree(root)