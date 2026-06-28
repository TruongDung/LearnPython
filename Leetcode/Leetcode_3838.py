from typing import List


class Solution:
    def mapWordWeights(self, words: List[str], weights: List[int]) -> str:
        alphabet = 'zyxwvutsrqponmlkjihgfedcba'
        ans = []
        for word in words:
            s = 0
            for c in word:
                s += weights[ord(c) - ord("a")]
            ans.append(alphabet[s%26])
        return "".join(ans)



sol = Solution()
words = ["abcd","def","xyz"]
weights = [5,3,12,14,1,2,3,2,10,6,6,9,7,8,7,10,8,9,6,9,9,8,3,7,7,2]
print(sol.mapWordWeights(words, weights))
