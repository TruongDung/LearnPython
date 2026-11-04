'use strict';
const header='from collections import deque\n\nclass Solution:\n    def minFlips(self, mat):\n';
const prepare=`        rows, cols = len(mat), len(mat[0])
        total = rows * cols
        start = 0
        flips = []
        for r in range(rows):
            for c in range(cols):
                start |= mat[r][c] << (r * cols + c)
                flip = 0
                for dr, dc in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)):
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols:
                        flip |= 1 << (nr * cols + nc)
                flips.append(flip)
`;
const make=(vi,en,time,space,body,prep=true)=>({label:{vi,en},time,space,code:(header+(prep?prepare:'')+body).split('\n')});
module.exports=[
make('BFS bitmask','Bitmask BFS','O(N × 2^N)','O(N × 2^N)',`        q = deque([(start, [])])
        seen = {start}
        while q:
            mask, path = q.popleft()
            if mask == 0:
                return len(path)
            for index, flip in enumerate(flips):
                nxt = mask ^ flip
                if nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, path + [index]))
        return -1`),
make('BFS ma trận','Matrix BFS','O(N² × 2^N)','O(N × 2^N)',`        rows, cols = len(mat), len(mat[0])
        start = tuple(map(tuple, mat))
        q = deque([(start, [])])
        seen = {start}
        while q:
            board, path = q.popleft()
            if not any(map(any, board)):
                return len(path)
            for index in range(rows * cols):
                r, c = divmod(index, cols)
                # Manhattan distance <= 1 selects the cross.
                nxt = tuple(tuple(board[x][y] ^ (abs(x - r) + abs(y - c) <= 1) for y in range(cols)) for x in range(rows))
                if nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, path + [index]))
        return -1`,false),
make('BFS hai chiều','Bidirectional BFS','O(N × 2^N)','O(N × 2^N)',`        if start == 0:
            return 0
        front = {start: []}
        back = {0: []}
        seen_front = {start: []}
        seen_back = {0: []}
        forward = True
        while front and back:
            if len(front) > len(back):
                front, back = back, front
                seen_front, seen_back = seen_back, seen_front
                forward = not forward
            next_front = {}
            for mask, path in front.items():
                for index, flip in enumerate(flips):
                    nxt = mask ^ flip
                    if nxt in seen_back:
                        if forward:
                            solution = path + [index] + seen_back[nxt][::-1]
                        else:
                            solution = seen_back[nxt] + [index] + path[::-1]
                        return len(solution)
                    if nxt not in seen_front:
                        seen_front[nxt] = path + [index]
                        next_front[nxt] = path + [index]
            front = next_front
        return -1`),
make('Duyệt tập ô bấm','Enumerate press subsets','O(N × 2^N)','O(N)',`        best = total + 1
        solution = []
        # Each cell only needs to be pressed zero or one time.
        for press in range(1 << total):
            mask = start
            path = []
            for index, flip in enumerate(flips):
                if press & (1 << index):
                    mask ^= flip
                    path.append(index)
            if mask == 0 and len(path) < best:
                best = len(path)
                solution = path[:]
        return best if best <= total else -1`),
make('DFS chọn / bỏ','DFS take / skip','O(N × 2^N)','O(N²)',`        best = total + 1
        solution = []
        def dfs(index, mask, path):
            nonlocal best, solution
            if mask == 0:
                if len(path) < best:
                    best = len(path)
                    solution = path[:]
                return
            if index == total or len(path) >= best:
                return
            dfs(index + 1, mask ^ flips[index], path + [index])
            dfs(index + 1, mask, path)
        dfs(0, start, [])
        return best if best <= total else -1`),
make('Thử hàng đầu, ép hàng sau','First row + row chasing','O(N × 2^C)','O(N)',`        best = total + 1
        solution = []
        for first in range(1 << cols):
            mask = start
            path = []
            for c in range(cols):
                if first & (1 << c):
                    index = c
                    mask ^= flips[index]
                    path.append(index)
            for r in range(1, rows):
                for c in range(cols):
                    above = (r - 1) * cols + c
                    if mask & (1 << above):
                        index = r * cols + c
                        mask ^= flips[index]
                        path.append(index)
            if mask == 0 and len(path) < best:
                best = len(path)
                solution = path[:]
        return best if best <= total else -1`),
make('Khử Gauss XOR + biến tự do','GF(2) elimination + free variables','O(N³ + N² × 2^F)','O(N²)',`        equations = []
        for cell in range(total):
            row = 0
            for index, flip in enumerate(flips):
                if flip & (1 << cell):
                    row |= 1 << index
            row |= ((start >> cell) & 1) << total
            equations.append(row)
        pivot_cols = []
        rank = 0
        for col in range(total):
            pivot = next((r for r in range(rank, total) if equations[r] & (1 << col)), None)
            if pivot is None:
                continue
            equations[rank], equations[pivot] = equations[pivot], equations[rank]
            for r in range(total):
                if r != rank and equations[r] & (1 << col):
                    equations[r] ^= equations[rank]
            pivot_cols.append(col)
            rank += 1
        for row in equations:
            if (row & ((1 << total) - 1)) == 0 and (row >> total):
                return -1
        free_cols = []
        for col in range(total):
            if col not in pivot_cols:
                free_cols.append(col)
        best = total + 1
        solution = []
        for choice in range(1 << len(free_cols)):
            press = 0
            for bit, col in enumerate(free_cols):
                if choice & (1 << bit):
                    press |= 1 << col
            for r, col in enumerate(pivot_cols):
                parity = bin(equations[r] & press).count("1") % 2
                value = (equations[r] >> total) ^ parity
                if value:
                    press |= 1 << col
            path = []
            for index in range(total):
                if press & (1 << index):
                    path.append(index)
            if len(path) < best:
                best = len(path)
                solution = path[:]
        return best`)
];
