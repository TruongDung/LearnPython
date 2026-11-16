class Solution:
    def maxTotalReward(self, rewardValues):
        rewards = sorted(set(rewardValues))
        rows, cols = len(rewards) + 1, 2 * max(rewards)
        dp = [[False] * cols for _ in range(rows)]
        dp[0][0] = True
        for row in range(1, rows):
            reward = rewards[row-1]
            for total in range(cols):
                skip = dp[row-1][total]
                take = False
                if reward <= total < 2 * reward:
                    take = dp[row-1][total-reward]
                dp[row][total] = skip or take
        return max(total for total in range(cols) if dp[rows-1][total])
