from ast import List


class MagicDictionary:

    def __init__(self):
        #self.root = TrieNode()
        self.dic = set()
        
    def buildDict(self, dictionary: List[str]) -> None:
        # node = self.root

        for word in dictionary:
            self.dic.add(word)

    def search(self, searchWord: str) -> bool:
        for word in self.dic:
            if word == searchWord:
                return True
        
        return False
    
sol = MagicDictionary()
sol.buildDict(["hello", "hallo", "leetcode"])
print(sol.search("hello"))
print(sol.search("hhllo"))
print(sol.search("hell"))
print(sol.search("leetcoded"))