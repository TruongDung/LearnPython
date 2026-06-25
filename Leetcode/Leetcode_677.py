class TrieNode:
    def __init__(self):
        self.children = {}
        self.total = 0

class MapSum:

    def __init__(self):
        self.root = TrieNode()
        self.val = {}
        

    def insert(self, key: str, val: int) -> None:
        delta = val - self.val.get(key, 0)
        self.val[key] = val

        node = self.root
        node.total += delta
        
        for ch in key:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]

            node.total += delta

    def sum(self, prefix: str) -> int:
        node = self.root

        for ch in prefix:
            if ch not in node.children:
                return 0
            node = node.children[ch]
        
        return node.total

sol = MapSum()
sol.insert("apple", 3)
print(sol.sum("ap"))  # Output: 3
print(sol.insert("app", 2))  # Output: None
print(sol.sum("ap"))  # Output: 5