from typing import List
from collections import defaultdict


class Solution:
    def findItinerary(self, tickets: List[List[str]]) -> List[str]:
        graph = defaultdict(list)

        for src, dst in sorted(tickets, reverse=True):
            graph[src].append(dst)

        result = []

        def dfs(airport):
            while graph[airport]:
                next_dest = graph[airport].pop()
                dfs(next_dest)
            result.append(airport)

        dfs("JFK")
        return result[::-1]


sol = Solution()
print(sol.findItinerary([["MUC", "LHR"], ["JFK", "MUC"], ["SFO", "SJC"], ["LHR", "SFO"]]))
# Output: ["JFK","MUC","LHR","SFO","SJC"]
