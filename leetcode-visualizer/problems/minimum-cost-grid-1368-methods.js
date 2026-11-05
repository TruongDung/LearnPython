'use strict';

const bi = (vi, en = vi) => ({ vi, en });
const source = text => text.trim().split('\n');
const definitions = [
  {
    label: bi('DFS + Backtracking'), time: 'Exponential', rating: bi('Không tối ưu', 'Not optimal'), maxCells: 12,
    code: source(`
class Solution:
    def minCost(self, grid):
        m, n = len(grid), len(grid[0])
        dirs = [(0,1), (0,-1), (1,0), (-1,0)]
        best, best_path = float('inf'), []
        seen, path = set(), []
        def dfs(r, c, cost):
            nonlocal best, best_path
            if cost >= best:
                return
            seen.add((r, c))
            path.append((r, c))
            if (r, c) == (m-1, n-1):
                best = cost
                best_path = path[:]
            else:
                for k, (dr, dc) in enumerate(dirs, 1):
                    nr, nc = r+dr, c+dc
                    if 0 <= nr < m and 0 <= nc < n:
                        if (nr, nc) not in seen:
                            w = int(grid[r][c] != k)
                            dfs(nr, nc, cost+w)
            path.pop()
            seen.remove((r, c))
        dfs(0, 0, 0)
        return best`),
  },
  {
    label: bi('Dijkstra + Min Heap'), time: 'O(MN log(MN))', rating: bi('Tốt', 'Good'),
    code: source(`
from heapq import heappop, heappush

class Solution:
    def minCost(self, grid):
        m, n = len(grid), len(grid[0])
        dirs = [(0,1), (0,-1), (1,0), (-1,0)]
        dist = [[float('inf')]*n for _ in range(m)]
        parent = {}
        dist[0][0] = 0
        heap = [(0, 0, 0)]
        while heap:
            cost, r, c = heappop(heap)
            if cost != dist[r][c]:
                continue
            if (r, c) == (m-1, n-1):
                return cost
            for k, (dr, dc) in enumerate(dirs, 1):
                nr, nc = r+dr, c+dc
                if not (0 <= nr < m and 0 <= nc < n):
                    continue
                w = int(grid[r][c] != k)
                nd = cost + w
                if nd < dist[nr][nc]:
                    dist[nr][nc] = nd
                    parent[(nr,nc)] = (r,c)
                    heappush(heap, (nd,nr,nc))
        return dist[-1][-1]`),
  },
  {
    label: bi('0-1 BFS + Deque'), time: 'O(MN)', rating: bi('Tối ưu', 'Optimal'),
    code: source(`
from collections import deque

class Solution:
    def minCost(self, grid):
        m, n = len(grid), len(grid[0])
        dirs = [(0,1), (0,-1), (1,0), (-1,0)]
        dist = [[float('inf')]*n for _ in range(m)]
        parent = {}
        dist[0][0] = 0
        dq = deque([(0, 0, 0)])
        while dq:
            cost, r, c = dq.popleft()
            if cost != dist[r][c]:
                continue
            if (r, c) == (m-1, n-1):
                return cost
            for k, (dr, dc) in enumerate(dirs, 1):
                nr, nc = r+dr, c+dc
                if not (0 <= nr < m and 0 <= nc < n):
                    continue
                w = int(grid[r][c] != k)
                nd = cost + w
                if nd < dist[nr][nc]:
                    dist[nr][nc] = nd
                    parent[(nr,nc)] = (r,c)
                    if w == 0:
                        dq.appendleft((nd,nr,nc))
                    else:
                        dq.append((nd,nr,nc))
        return dist[-1][-1]`),
  },
  {
    label: bi('BFS + DFS · Layered expansion'), time: 'O(MN)', rating: bi('Tối ưu', 'Optimal'),
    code: source(`
from collections import deque

class Solution:
    def minCost(self, grid):
        m, n = len(grid), len(grid[0])
        dirs = [(0,1), (0,-1), (1,0), (-1,0)]
        dist = [[float('inf')]*n for _ in range(m)]
        parent, frontier = {}, deque()
        def flood(r, c, cost, prev=None):
            stack = [(r, c, prev)]
            while stack:
                r, c, prev = stack.pop()
                if not (0 <= r < m and 0 <= c < n):
                    continue
                if dist[r][c] != float('inf'):
                    continue
                dist[r][c] = cost
                if prev is not None:
                    parent[(r,c)] = prev
                frontier.append((r, c))
                dr, dc = dirs[grid[r][c]-1]
                stack.append((r+dr, c+dc, (r,c)))
        flood(0, 0, 0)
        cost = 0
        while dist[-1][-1] == float('inf'):
            cost += 1
            layer = len(frontier)
            for _ in range(layer):
                r, c = frontier.popleft()
                for dr, dc in dirs:
                    flood(r+dr, c+dc, cost, (r,c))
        return dist[-1][-1]`),
  },
  {
    label: bi('Bellman-Ford'), time: 'O((MN)²)', rating: bi('Không khuyến nghị', 'Not recommended'), maxCells: 144,
    code: source(`
class Solution:
    def minCost(self, grid):
        m, n = len(grid), len(grid[0])
        dirs = [(0,1), (0,-1), (1,0), (-1,0)]
        dist = [[float('inf')]*n for _ in range(m)]
        parent = {}
        dist[0][0] = 0
        for turn in range(m*n-1):
            changed = False
            for r in range(m):
                for c in range(n):
                    if dist[r][c] == float('inf'):
                        continue
                    for k, (dr, dc) in enumerate(dirs, 1):
                        nr, nc = r+dr, c+dc
                        if not (0 <= nr < m and 0 <= nc < n):
                            continue
                        w = int(grid[r][c] != k)
                        nd = dist[r][c] + w
                        if nd < dist[nr][nc]:
                            dist[nr][nc] = nd
                            parent[(nr,nc)] = (r,c)
                            changed = True
            if not changed:
                break
        return dist[-1][-1]`),
  },
];

module.exports = definitions.map(definition => ({ ...definition, space: 'O(MN)' }));
