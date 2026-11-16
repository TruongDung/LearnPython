class Solution:
    def maxTotalReward(self, rewardValues):
        rewards = sorted(set(rewardValues))
        M = 2 * max(rewards)
        dp = [False] * M
        dp[0] = True
        for reward in rewards:
            for total in range(reward - 1, -1, -1):
                if dp[total]:
                    dp[total + reward] = True
        return max(total for total in range(M) if dp[total])
