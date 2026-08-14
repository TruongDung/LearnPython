"""LeetCode 1584: Min Cost to Connect All Points.

Connect all points on a plane with the minimum total cost, where the cost of
connecting two points is their Manhattan distance |xi-xj| + |yi-yj|. This is a
Minimum Spanning Tree (MST) problem; here we use Prim's algorithm with a
min-heap.

Prim grows the tree from node 0: repeatedly pop the cheapest edge that reaches
a not-yet-connected point, add that point, and push its edges to the remaining
points. Total of the chosen edges is the answer.

Examples:
    [[0,0],[2,2],[3,10],[5,2],[7,0]] -> 20
    [[3,12],[-2,5],[-4,1]] -> 18
"""
import heapq
from typing import List


class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        visited = [False] * n
        heap = [(0, 0, -1)]  # (cost, node, parent)
        total = 0
        edges_used = 0
        while edges_used < n:
            cost, i, parent = heapq.heappop(heap)
            if visited[i]:
                continue
            visited[i] = True
            total += cost
            edges_used += 1
            for j in range(n):
                if not visited[j]:
                    d = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
                    heapq.heappush(heap, (d, j, i))
        return total


if __name__ == "__main__":
    sol = Solution()
    print(sol.minCostConnectPoints([[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]))  # 20
    print(sol.minCostConnectPoints([[3, 12], [-2, 5], [-4, 1]]))                # 18
