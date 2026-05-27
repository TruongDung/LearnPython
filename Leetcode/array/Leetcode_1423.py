class Solution:
    def maxScore(self, cardPoints: List[int], k: int) -> int:
        max_card = sum(cardPoints[0:k])
        i = 1
        for j in range(k+1, len(cardPoints)):
            sum1 = sum(cardPoints[i:j])
            i += 1
            if sum1 > max_card:
                max_card = sum1
        return max_card
    
sol = Solution()
sol.maxScore([1,2,3,4,5,6,1], 3)