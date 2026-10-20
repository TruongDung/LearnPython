class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False
class WordDictionary:
    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_word = True

    def search(self, word):
        def dfs(node , index):
            if index == len(word):
                return node.is_word

            ch = word[index]

            if ch == ".":
                for c in node.children.values():
                    if dfs(c, index+1):
                        return True
                return False

            if ch not in node.children:
                return False

            return dfs(node.children[ch], index+1)
            
        return dfs(self.root, 0)


obj = WordDictionary()

obj.addWord("bad")
obj.addWord("dad")
obj.addWord("mad")

#print(obj.search("pad"))   # False
#print(obj.search("bad"))   # True
print(obj.search(".ad"))   # True
# print(obj.search("b.."))   # True
# print(obj.search("..."))   # True
# print(obj.search("ba"))    # False
# print(obj.search("b..."))  # False
# print(obj.search("b.d"))   # True