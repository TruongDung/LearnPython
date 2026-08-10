
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_root = False
        self.word = ''

class Solution:
    def replaceWords(self, dictionary, sentence):
        root = TrieNode()
        # Build Trie from dictionary
        for w in dictionary:
            node = root
            for ch in w:
                if ch not in node.children:
                    node.children[ch] = TrieNode()
                node = node.children[ch]
            node.is_root = True
            node.word = w
        # Replace each word
        result = []
        for word in sentence.split():
            node = root
            for ch in word:
                if node.is_root:
                    break
                if ch not in node.children:
                    break
                node = node.children[ch]
            result.append(node.word if node.is_root else word)
        return ' '.join(result)

sol = Solution()
print(sol.replaceWords(["cat","bat","rat"], "the cattle was rattled by the battery"))