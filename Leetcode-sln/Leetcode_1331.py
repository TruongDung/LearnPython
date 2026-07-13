from collections import defaultdict
from collections import Counter
from typing import List

class Solution:
    def arrayRankTransform(self, arr: List[int]) -> List[int]:
        num_to_rank = {}
        count = 0
        for num in sorted(arr):
            if num not in num_to_rank:
                count += 1
            num_to_rank[num] = count
            
        res = []
        for num in arr:
            res.append(num_to_rank[num])
        return res

sol = Solution()
print(sol.arrayRankTransform([40,40,10,20,30]))
