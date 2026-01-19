class Solution:
    def maxScore(self, cardPoints: List[int], k: int) -> int:
        size = len(cardPoints) - k
        S = sum(cardPoints[size:])
        res = S
        for i in range(k) :
            S += cardPoints[i]
            S -= cardPoints[i+size]
            res = max(res, S)
        return res
    
sol = Solution()
print(sol.maxScore([1,2,3,4,5,6,1], 3))