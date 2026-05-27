from collections import defaultdict
class Solution:
    def numJewelsInStones(self, jewels: str, stones: str) -> int:
        s = set()
        count = 0
        for i in jewels:
            if i in stones:
                count += 1
        
        return count

    
sol = Solution()
sol.numJewelsInStones("aA", "aAAbbbb" )