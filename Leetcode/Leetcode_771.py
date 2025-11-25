from collections import defaultdict
class Solution:
    def numJewelsInStones(self, jewels: str, stones: str) -> int:
        d = defaultdict(int)
        for i, val in enumerate(stones):
            d[val] += 1
        
        count = 0
        for c in jewels:
            count += d[c]

        return count
    
sol = Solution()
sol.numJewelsInStones("aA", "aAAbbbb" )