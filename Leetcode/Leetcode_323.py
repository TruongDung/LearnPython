class Solution:
    def countComponents(self, n: int, edges: List[List[int]]) -> int:
        graph = [[] for _ in range(n)]
        for edge in edges:
            u, v = edge[0], edge[1]
            graph[u].append(v)
            graph[v].append(u)

        visited = [False for _ in range(n)]

        def dfs(curr):
            visited[curr] = True
            for next in graph[curr]:
                if not visited[next]:
                    dfs(next)
                    
        count = 0
        for i in range(n):
            if not visited[i]:
                dfs(i)
                count += 1
                
        return count
        
