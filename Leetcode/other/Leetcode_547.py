class Solution:
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        n = len(isConnected)
        visited = [False for _ in range(n)]
        count = 0
        def dfs(curr):
            visited[curr] = True
            for next in range(n):
                if isConnected[curr][next] == 1:
                    if not visited[next]:
                        dfs(next)
        
        for i in range(n):
            if not visited[i]:
                dfs(i)
                count += 1
        return count
    

isConnected = [
    [1, 1, 0],
    [1, 1, 0],
    [0, 0, 1]
]

sol = Solution()
result = sol.findCircleNum(isConnected)