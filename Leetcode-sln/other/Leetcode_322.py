from typing import List


# class Solution:
#     def coinChange(self, coins: List[int], amount: int) -> int:
#         dp = [float('inf')] * (amount + 1)
#         dp[0] = 0
#         traceback = [0] * (amount + 1)
#         for i in range(1, amount + 1):
#             for coin in coins:
#                 if i - coin >= 0:
#                     dp[i] = min(dp[i], dp[i-coin]+1)
#                     traceback[i] = coin
#
#         if dp[amount] == float('inf'):
#             return -1
#
#         res = []
#         cur_amount = amount
#         while cur_amount > 0:
#             coin = traceback[cur_amount]
#             res.append(cur_amount)
#             cur_amount -= coin
#         print(res)
#
#         return dp[amount]
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [float('inf')] * (amount + 1)
        dp[0] = 0
        traceback = [0] * (amount + 1)
        for i in range(1, amount + 1):
            for coin in coins:
                if i - coin >= 0:
                    if dp[i - coin] + 1 < dp[i]:  # new < old
                        dp[i] = dp[i - coin] + 1
                        traceback[i] = coin

        if dp[amount] == float('inf'):
            return -1

        result = []
        cur_amount = amount
        while cur_amount > 0:
            coin = traceback[cur_amount]
            result.append(coin)
            cur_amount -= coin
        print(result)

        return dp[amount]


sol = Solution()
print(sol.coinChange([1, 2, 5], 11))
