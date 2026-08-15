from typing import List
from collections import defaultdict
import heapq


class Solution:
    # Approach 1: Sort reverse + pop()
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

    # Approach 2: Priority Queue (min-heap per node)
    def findItinerary2(self, tickets: List[List[str]]) -> List[str]:
        graph = defaultdict(list)

        for src, dst in tickets:
            heapq.heappush(graph[src], dst)   # min-heap → smallest dst first

        result = []

        def dfs(airport):
            while graph[airport]:
                next_dest = heapq.heappop(graph[airport])  # always lex smallest
                dfs(next_dest)
            result.append(airport)

        dfs("JFK")
        return result[::-1]


sol = Solution()
tickets = [["MUC", "LHR"], ["JFK", "MUC"], ["SFO", "SJC"], ["LHR", "SFO"]]
print(sol.findItinerary(tickets))   # Approach 1: ["JFK","MUC","LHR","SFO","SJC"]
print(sol.findItinerary2(tickets))  # Approach 2: ["JFK","MUC","LHR","SFO","SJC"]
