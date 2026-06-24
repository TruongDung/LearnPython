from ast import List

class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False

class MagicDictionary:

    def __init__(self):
        self.root = TrieNode()
        
    def buildDict(self, dictionary: List[str]) -> None:
        for word in dictionary:
            node = self.root

            for char in word:
                if char not in node.children:
                    node.children[char] = TrieNode()
                node = node.children[char]
            node.is_word = True
    def search(self, searchWord: str) -> bool:
        def dfs(node, index, modified):
            if index == len(searchWord):
                return modified and node.is_word
            
            char = searchWord[index]
            if char in node.children:
                if dfs(node.children[char], index + 1, modified):
                    return True
            
            if not modified:
                for child_char, child_node in node.children.items():
                    if child_char != char:
                        if dfs(child_node, index + 1, True):
                            return True
            
            return False
        
        return dfs(self.root, 0, False)
    
sol = MagicDictionary()
sol.buildDict(["hello", "hallo", "leetcode"])
print(sol.search("hello"))
print(sol.search("hhllo"))
print(sol.search("hell"))
print(sol.search("leetcoded"))