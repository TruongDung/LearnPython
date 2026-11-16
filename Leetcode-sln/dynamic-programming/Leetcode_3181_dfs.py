class Solution:
    def maxTotalReward(self, rewardValues):
        rewards = sorted(set(rewardValues))
        n = len(rewards)

        def dfs(index, total):
            if index == n:
                return total

            skip = dfs(index + 1, total)
            take = total
            if total < rewards[index]:
                take = dfs(index + 1, total + rewards[index])

            return max(skip, take)

        return dfs(0, 0)
