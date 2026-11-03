import heapq
from collections import defaultdict

class Solution:
    def networkDelayTime(self, times, n, k) -> int:
        graph = defaultdict(list)

        for u,v,w in times:
            graph[u].append((v,w))

        dist = (float("inf")) * (n+1)

        dist[k] = 0

        minHeap = (0,k)

        while minHeap:
            time, node = heapq.heappop(minHeap)

            if time > dist[node]:
                continue

            for nei, weight in graph[node]:
                newTime = time + weight

                if newTime < dist[nei]:
                    dist[nei] = newTime

                heapq.heappush(minHeap, (newTime, nei))

            ans = max(dist[1:])

            return ans if ans!=float("inf") else -1