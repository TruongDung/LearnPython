from typing import List
class Solution:
    def validPath(self, n: int, edges: List[List[int]], source: int, destination: int) -> bool:
        #convert to graph
        graph = [[] for _ in range(n)]
        for edge in edges:
            u, v = edge[0], edge[1]
            graph[u].append(v)
            graph[v].append(u)


        visited = [False for _ in range(n)]

        #DFS
        def dfs(curr):
            visited[curr] = True

            if curr == destination:
                return True

            for neightbor in graph[curr]:
                if not visited[neightbor]:
                    if dfs(neightbor):
                        return True
            return False
        
        return dfs(source)
    
sol = Solution() 
n = 6
edges = [[0,1],[0,2],[3,5],[5,4],[4,3]]
source = 0
destination = 5
result = sol.validPath(n, edges, source, destination)
print(result)