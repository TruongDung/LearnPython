
from typing import List


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
        return self._dfs(searchWord, 0, self.root, False)
    
    def _dfs(self, word: str, index: int, node: TrieNode, changed: bool) -> bool:
        if node is None:
            return False
        
        if index == len(word):
            return changed and node.is_word
        
        c = word[index]

        for ch, child in node.children.items():
            if ch == c:
                if self._dfs(word, index + 1, child, changed):
                    return True
            elif not changed:
                if self._dfs(word, index + 1, child, True):
                    return True
                
        return False
    
    
    
sol = MagicDictionary()
sol.buildDict(["hello", "leetcode"])
#print(sol.search("hello"))
print(sol.search("hhllo"))
#print(sol.search("hell"))
#print(sol.search("leetcoded"))