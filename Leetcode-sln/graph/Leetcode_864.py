from collections import deque
from typing import List


class Solution:
    def shortestPathAllKeys(self, grid: List[str]) -> int:
        rows, cols = len(grid), len(grid[0])
        all_keys = 0
        start = (0, 0)

        # Find start and count total keys
        for r in range(rows):
            for c in range(cols):
                ch = grid[r][c]
                if ch == '@':
                    start = (r, c)
                elif ch.islower():
                    all_keys |= (1 << (ord(ch) - ord('a')))

        # BFS state: (row, col, keys_bitmask)
        queue = deque([(start[0], start[1], 0, 0)])  # r, c, keys, steps
        visited = {(start[0], start[1], 0)}
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        while queue:
            r, c, keys, steps = queue.popleft()

            if keys == all_keys:
                return steps

            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if not (0 <= nr < rows and 0 <= nc < cols):
                    continue

                ch = grid[nr][nc]
                if ch == '#':
                    continue  # wall

                # Locked door we don't have the key for
                if ch.isupper() and not (keys & (1 << (ord(ch) - ord('A')))):
                    continue

                new_keys = keys
                if ch.islower():
                    new_keys |= (1 << (ord(ch) - ord('a')))

                if (nr, nc, new_keys) not in visited:
                    visited.add((nr, nc, new_keys))
                    queue.append((nr, nc, new_keys, steps + 1))

        return -1


sol = Solution()
print(sol.shortestPathAllKeys(["@.a..", "###.#", "b.A.B"]))  # 8
print(sol.shortestPathAllKeys(["@..aA", "..B#.", "....b"]))  # 6
