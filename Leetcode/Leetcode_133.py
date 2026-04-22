"""
# Definition for a Node.
class Node:
    def __init__(self, val = 0, neighbors = None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []
"""

from typing import Optional
class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        if node == None:
            return None
        m = {}

        def dfs(curr):
            if node in m:
                return m[node]
            
            new_node = Node(curr.val)

            m[node] = new_node

            if nei in 