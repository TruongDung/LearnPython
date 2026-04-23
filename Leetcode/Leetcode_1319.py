class Solution:
    def makeConnected(self, n: int, connections: List[List[int]]) -> int:
        if len(connections) < n -1 :
            return -1
        graph = [[] for _ in range(n)]

        for u, v in connections:
            graph[u].append(v)
            graph[v].append(u)

        visited = [False] * n

        def dfs(node):
            visited[node] = True

            for nei in graph[node]:
                if not visited[nei]:
                    dfs(nei)

        component = 0

        for i in range(n):
            if not visited[i]:
                dfs(i)
                component += 1

        return component - 1
    
sol = Solution()
print(sol.makeConnected(4,  [[0,1],[0,2],[1,2]]))