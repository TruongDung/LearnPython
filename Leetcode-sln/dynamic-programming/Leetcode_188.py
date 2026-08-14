from typing import List


class Solution:
    def maxProfit(self, k: int, prices: List[int]) -> int:
        n = len(prices)
        if n == 0 or k == 0:
            return 0

        # If k is large enough, it's the unlimited-transactions case
        if k >= n // 2:
            profit = 0
            for i in range(1, n):
                if prices[i] > prices[i - 1]:
                    profit += prices[i] - prices[i - 1]
            return profit

        # buy[j] = max profit after at most j buys (holding a stock)
        # sell[j] = max profit after at most j sells (not holding)
        buy = [float('-inf')] * (k + 1)
        sell = [0] * (k + 1)

        for price in prices:
            for j in range(1, k + 1):
                buy[j] = max(buy[j], sell[j - 1] - price)
                sell[j] = max(sell[j], buy[j] + price)

        return sell[k]


sol = Solution()
print(sol.maxProfit(2, [2, 4, 1]))            # 2
print(sol.maxProfit(2, [3, 2, 6, 5, 0, 3]))   # 7
