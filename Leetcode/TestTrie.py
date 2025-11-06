
class TrieNode:
    def __init__(self):
        self.children = {}
        self.isEnd = False

class Trie:
    
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        currentNode = self.root
        for char in word:
            if char not in currentNode.children:
                currentNode.children[char] = TrieNode()
            currentNode = currentNode.children[char]
        currentNode.isEnd = True
    
    def get_all_words(self):
        words = []
        self._dfs(self.root, "", words)
        return words

    def _dfs(self, node: TrieNode, prefix: str, words: list) -> None:
        if node.isEnd:
            words.append(prefix)
        for char, childNode in node.children.items():
            self._dfs(childNode, prefix + char, words)

obj = Trie()
obj.insert("cat")
obj.insert("car")
obj.insert("can")

print(obj.get_all_words())  # Output: dict_keys(['c'])