"""LeetCode 1697: Checking Existence of Edge Length Limited Paths.

n nodes; edgeList[i] = [u, v, dist]; queries[j] = [p, q, limit]. For each
query, decide whether there is a path from p to q using only edges whose
distance is strictly less than limit.

Offline Union-Find: sort edges by distance and queries by limit. Sweep queries
in increasing limit order, unioning every edge with dist < limit as we go, then
answer each query by checking whether p and q share a root.

Examples:
    n=3, edges=[[0,1,2],[1,2,4],[2,0,8],[1,0,16]], queries=[[0,1,2],[0,2,5]]
        -> [False, True]
"""
from typing import List


class Solution:
    def distanceLimitedPathsExist(self, n: int, edgeList: List[List[int]],
                                  queries: List[List[int]]) -> List[bool]:
        edgeList.sort(key=lambda e: e[2])
        order = sorted(range(len(queries)), key=lambda i: queries[i][2])
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        answer = [False] * len(queries)
        ei = 0
        for i in order:
            p, q, limit = queries[i]
            while ei < len(edgeList) and edgeList[ei][2] < limit:
                parent[find(edgeList[ei][0])] = find(edgeList[ei][1])
                ei += 1
            answer[i] = find(p) == find(q)
        return answer


if __name__ == "__main__":
    sol = Solution()
    print(sol.distanceLimitedPathsExist(
        3, [[0, 1, 2], [1, 2, 4], [2, 0, 8], [1, 0, 16]],
        [[0, 1, 2], [0, 2, 5]]))  # [False, True]
    print(sol.distanceLimitedPathsExist(
        5, [[0, 1, 10], [1, 2, 5], [2, 3, 9], [3, 4, 13]],
        [[0, 4, 14], [1, 4, 13]]))  # [True, False]
