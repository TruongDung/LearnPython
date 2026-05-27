class Solution:
    def hIndex(self, citations: List[int]) -> int:
        citations.sort()
        n = len(citations) 
        h = 0
        for c,i in enumerate(citations, 1):
            
        return h

       
        return h
sol = Solution()
print(sol.hIndex([3,0,6,1,5]))