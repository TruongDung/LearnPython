from collections import defaultdict, deque
from typing import List


class Solution:
    def loudAndRich(self, richer: List[List[int]], quiet: List[int]) -> List[int]:
        n = len(quiet)
        # Contruct the graph
        graph = defaultdict(list)
        indegree = [0 for _ in range(n)]
        for u, v in richer:
            graph[u].append(v)
            indegree[v] += 1

        
        queue = deque()

        richer_map = defaultdict(set)

        for i in range(n):
            if indegree[i] == 0:
                queue.append(i)
        

        while queue:
            size = len(queue)
            for _ in range(size):
                cur = queue.popleft()
                for nei in graph[cur]:
                    # cur is richer than nei
                    richer_map[nei].add(cur)
                    # all people richer than curr, also ricker then nei
                    richer_map[nei].update(richer_map[cur])
                    indegree[nei] -= 1
                    if indegree[nei] == 0:
                        queue.append(nei)

        print(richer_map)
        res = []
        for i in range(n):
            richer_set = richer_map[i]
            least_quiet = quiet[i]
            index = i
            for rich in richer_set:
                if quiet[rich] < least_quiet:
                    least_quiet = quiet[rich]
                    index = rich
            res.append(index)

        return res
    
sol = Solution()
sol.loudAndRich([[1,0],[2,1],[3,1],[3,7],[4,3],[5,3],[6,3]],[3,2,5,4,6,1,7,0])