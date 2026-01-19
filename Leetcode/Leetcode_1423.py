class Solution:
    def maxScore(self, cardPoints: List[int], k: int) -> int:
        n = len(cardPoints)
        
        # Nếu lấy hết
        if k == n:
            return sum(cardPoints)

        window = n - k
        total = sum(cardPoints)

        # tổng cửa sổ đầu tiên
        cur = sum(cardPoints[:window])
        min_sum = cur

        # trượt cửa sổ
        for i in range(window, n):
            cur += cardPoints[i]
            cur -= cardPoints[i - window]
            min_sum = min(min_sum, cur)

        return total - min_sum
    
sol = Solution()
print(sol.maxScore([1,2,3,4,5,6,1], 3))