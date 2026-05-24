from collections import defaultdict
import heapq


class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        graph = defaultdict(list)

        for u, v, w in times:
            graph[u].append((v, w))

        dist = [float("inf")] * (n + 1)
        dist[k] = 0

        pq = [(0, k)]  # (time, node)

        while pq:
            cur_time, node = heapq.heappop(pq)

            if cur_time > dist[node]:
                continue

            for nei, weight in graph[node]:
                new_time = cur_time + weight

                if new_time < dist[nei]:
                    dist[nei] = new_time
                    heapq.heappush(pq, (new_time, nei))

        ans = max(dist[1:])

        return ans if ans != float("inf") else -1

sol = Solution()
print(sol.networkDelayTime([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2))