from collections import deque
from typing import List


class Solution:
    def minJumps(self, arr: List[int]) -> int:
        n = len(arr)
        if n <= 1:
            return 0

        
        graph = defaultdict(list)
        for i, val in enumerate(arr):
            graph[val].append(i)

        visited = set([0])
        q = deque([0])
        steps = 0

        while q:
            for _ in range(len(q)):
                i = q.popleft()

                if i == n - 1:
                    return steps

                # neighbors
                neighbors = graph[arr[i]] + [i - 1, i + 1]

                for nxt in neighbors:
                    if 0 <= nxt < n and nxt not in visited:
                        visited.add(nxt)
                        q.append(nxt)

               
                graph[arr[i]].clear()

            steps += 1

        return -1