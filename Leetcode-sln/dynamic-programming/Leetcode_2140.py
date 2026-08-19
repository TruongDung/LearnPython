class Solution:
    def mostPoints(self, questions):
        n = len(questions)
        dp = [0] * (n + 1)
        for i in range(n - 1, -1, -1):
            points, brainpower = questions[i]
            skip = dp[i + 1]
            solve = points + dp[min(i + brainpower + 1, n)]
            dp[i] = max(skip, solve)
        return dp[0]

sol = Solution()
print(sol.mostPoints([[3,2],[4,3],[4,4],[2,5]]))