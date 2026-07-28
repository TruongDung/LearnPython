from collections import defaultdict, deque
from typing import List


class Solution:
    def alienOrder(self, words: List[str]) -> str:
        # Build graph
        graph = defaultdict(set)
        indegree = {c: 0 for word in words for c in word}

        for i in range(len(words) - 1):
            w1, w2 = words[i], words[i + 1]
            min_len = min(len(w1), len(w2))

            # Invalid: w1 is longer but a prefix of w2 order
            if len(w1) > len(w2) and w1[:min_len] == w2[:min_len]:
                return ""

            for j in range(min_len):
                if w1[j] != w2[j]:
                    if w2[j] not in graph[w1[j]]:
                        graph[w1[j]].add(w2[j])
                        indegree[w2[j]] += 1
                    break

        # Topological sort (BFS / Kahn's algorithm)
        queue = deque([c for c in indegree if indegree[c] == 0])
        result = []

        while queue:
            c = queue.popleft()
            result.append(c)
            for nxt in graph[c]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)

        if len(result) < len(indegree):
            return ""  # cycle detected

        return "".join(result)


sol = Solution()
print(sol.alienOrder(["wrt", "wrf", "er", "ett", "rftt"]))  # "wertf"
print(sol.alienOrder(["z", "x"]))                            # "zx"
print(sol.alienOrder(["z", "x", "z"]))                       # ""
