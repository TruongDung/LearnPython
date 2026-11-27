"""Independent small-input oracles for the 4000–5000 teaching algorithms."""

import collections
import copy
import functools
import itertools
import json
import math
import pathlib
import random
from fractions import Fraction


def subtree_weights(graph):
    """Count descendants within one tree, without capturing a loop's next tree."""
    weights = [0] * len(graph)

    def visit(node, parent):
        weights[node] = 1
        for child in graph[node]:
            if child != parent:
                visit(child, node)
                weights[node] += weights[child]

    visit(0, -1)
    return weights


def maximum_trade_earnings(prices, costs, cooldown):
    """Enumerate every valid sequence of nonoverlapping trades."""
    n = len(prices)

    def trades(day):
        return max(
            [0]
            + [
                prices[sell] - prices[buy] - costs[sell - buy] + trades(sell + cooldown + 1)
                for buy in range(day, n)
                for sell in range(buy + 1, n)
            ]
        )

    return trades(0)


def minimum_turn_cost(grid, turn_limit):
    """Enumerate simple paths and return the cheapest path within the turn limit."""
    rows, columns = len(grid), len(grid[0])

    def walk(row, column, seen, *, direction, turns, cost):
        if (row, column) == (rows - 1, columns - 1):
            return cost
        best_cost = math.inf
        for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
            rr, cc = row + dr, column + dc
            next_turns = turns + (direction is not None and direction != (dr, dc))
            if 0 <= rr < rows and 0 <= cc < columns and (rr, cc) not in seen and next_turns <= turn_limit:
                best_cost = min(
                    best_cost,
                    walk(
                        rr,
                        cc,
                        seen | {(rr, cc)},
                        direction=(dr, dc),
                        turns=next_turns,
                        cost=cost + grid[rr][cc],
                    ),
                )
        return best_cost

    result = walk(0, 0, {(0, 0)}, direction=None, turns=0, cost=grid[0][0])
    return result if result < math.inf else -1


root = pathlib.Path(__file__).resolve().parents[1]
data = {e["id"]: e for e in json.loads((root / "problems/guided-4000-5000.json").read_text(encoding="utf8"))}
solvers = {}
checks = collections.Counter()
rng = random.Random(4000)
for id, e in data.items():
    ns = {}
    # Execute the trusted repository implementation being checked against independent oracles.
    exec(e["prelude"] + "\n" + e["code"], ns)  # pylint: disable=exec-used
    solvers[id] = getattr(ns["Solution"](), e["method"])


def check(id, args, expected):
    got = solvers[id](*copy.deepcopy(args))
    assert got == expected, (id, args, got, expected)
    checks[id] += 1


@functools.cache
def xor_bfs(state):
    q = collections.deque([(state, 0)])
    seen = {state}
    while q:
        a, d = q.popleft()
        if functools.reduce(int.__xor__, a) == 0:
            return d
        for i, j in itertools.permutations(range(len(a)), 2):
            if a[i] == a[j]:
                continue
            updated = list(a)
            updated[i] ^= updated[j]
            successor = tuple(sorted(updated))
            if successor not in seen:
                seen.add(successor)
                q.append((successor, d + 1))
    return -1


for n in range(1, 5):
    for a in itertools.combinations_with_replacement(range(1, 8), n):
        check(4047, [list(a)], xor_bfs(a))
print("XOR cases", checks[4047], flush=True)


def elevator(n, start, requests):
    full = (1 << len(requests)) - 1

    def fulfill(mask, floor, time):
        for i, (arrival, destination) in enumerate(requests):
            if arrival <= time and floor == destination:
                mask |= 1 << i
        return mask

    states = {(start, fulfill(0, start, 0))}
    time = 0
    while True:
        if any(mask == full for _, mask in states):
            return time
        time += 1
        states = {
            (q, fulfill(mask, q, time)) for floor, mask in states for q in [floor - 1, floor, floor + 1] if 0 <= q < n
        }


for _ in range(160):
    n = rng.randrange(2, 6)
    start = rng.randrange(n)
    req = [[rng.randrange(7), rng.randrange(n)] for _ in range(rng.randrange(1, 5))]
    check(4029, [n, start, req], elevator(n, start, req))
    req = sorted(set(rng.sample(range(n), rng.randrange(1, n + 1))))
    best = math.inf
    for order in itertools.permutations(req):
        floor = start
        time = 0
        seen = {start}
        cost = 0
        for goal in order:
            if goal in seen:
                continue
            step = 1 if goal > floor else -1
            for f in range(floor + step, goal + step, step):
                time += 1
                if f in req and f not in seen:
                    cost += time
                    seen.add(f)
            floor = goal
        best = min(best, cost)
    check(4023, [n, start, req], best)


def fleet(pos, speeds, distance):
    groups = list(zip(map(Fraction, pos), speeds))
    while True:
        merged = []
        for i, g in enumerate(groups):
            if i and g[0] - groups[i - 1][0] <= distance:
                merged[-1] = g
            else:
                merged.append(g)
        groups = merged
        times = [
            (groups[i + 1][0] - groups[i][0] - distance) / (groups[i][1] - groups[i + 1][1])
            for i in range(len(groups) - 1)
            if groups[i][1] > groups[i + 1][1]
        ]
        if not times:
            return len(groups)
        dt = min(times)
        groups = [(p + s * dt, s) for p, s in groups]


for _ in range(200):
    n = rng.randrange(1, 8)
    pos = sorted(rng.sample(range(30), n))
    speeds = [rng.randrange(1, 7) for _ in pos]
    distance = rng.randrange(5)
    check(4045, [pos, speeds, distance], fleet(pos, speeds, distance))
for _ in range(100):
    a = [rng.randrange(16) for _ in range(rng.randrange(1, 7))]

    def power(p):
        out = []
        for bit in range(14, -1, -1):
            j = 0
            while j < len(p) and p[j] >> bit & 1:
                j += 1
            out.append(j)
        return out

    check(4059, [a], max(power(p) for p in itertools.permutations(a)))
for x in list(range(600)) + [999, 9998, 10001, 99999, 100002, 987654]:
    expected = min(abs(y - x) // 2 for y in range(0, max(20, 2 * x + 20)) if y % 2 == x % 2 and str(y) == str(y)[::-1])
    check(4053, [[x]], expected)


def settle(grid):
    boxes = {(r, c) for r, row in enumerate(grid) for c, v in enumerate(row) if v == "#"}
    bombs = {(r, c) for r, row in enumerate(grid) for c, v in enumerate(row) if v == "*"}
    m = len(grid)
    while True:
        before = boxes.copy()
        active = {b for b in bombs if any(abs(b[0] - r) + abs(b[1] - c) == 1 for r, c in boxes)}
        boxes = {b for b in boxes if not any(max(abs(b[0] - r), abs(b[1] - c)) <= 1 for r, c in active)}
        moving = boxes.copy()
        changed = True
        while changed:
            next_moving = {
                b
                for b in moving
                if b[0] < m - 1
                and (b[0] + 1, b[1]) not in bombs
                and ((b[0] + 1, b[1]) not in boxes or (b[0] + 1, b[1]) in moving)
            }
            changed = next_moving != moving
            moving = next_moving
        boxes = (boxes - moving) | {(r + 1, c) for r, c in moving}
        if boxes == before:
            return [
                ["#" if (r, c) in boxes else "*" if (r, c) in bombs else "-" for c in range(len(grid[0]))]
                for r in range(m)
            ]


for _ in range(200):
    m, n = rng.randrange(1, 6), rng.randrange(1, 5)
    grid = [[rng.choice("#-*") for _ in range(n)] for _ in range(m)]
    check(4096, [grid], settle(grid))


@functools.cache
def deletion(a):
    if not a:
        return 0
    return min(
        [a[i] + a[j] + deletion(a[:i] + a[j + 1 :]) for i in range(len(a)) for j in range(i + 1, len(a))] + [math.inf]
    )


for _ in range(250):
    a = tuple(rng.randrange(-5, 8) for _ in range(rng.randrange(2, 9)))
    check(4123, [list(a)], deletion(a))
for n in range(1, 12):
    good = sum(
        all(len(run) % 2 for run in map(list, (group for _, group in itertools.groupby(s))))
        for s in itertools.product("ab", repeat=n)
    )
    check(4073, [n], good)
for _ in range(150):
    n, s = rng.randrange(2, 35), rng.randrange(0, 80)
    primes = [i for i in range(2, n + 1) if all(i % d for d in range(2, math.isqrt(i) + 1))]
    subsets = [list(c) for k in range(len(primes) + 1) for c in itertools.combinations(primes, k) if sum(c) <= s]
    check(4081, [n, s], min(subsets, key=lambda a: (-sum(a), len(a), a)))


@functools.cache
def remove_groups(a, sizes):
    if not a:
        return True
    for i, (t, c) in enumerate(a):
        k = sizes[t]
        if a[i : i + k] == ((t, c),) * k and remove_groups(a[:i] + a[i + k :], sizes):
            return True
    return False


for _ in range(250):
    n = rng.randrange(1, 10)
    types = [rng.randrange(2) for _ in range(n)]
    colors = [rng.randrange(2) for _ in range(n)]
    sizes = tuple(rng.randrange(1, 4) for _ in range(2))
    check(4103, [types, colors, list(sizes)], remove_groups(tuple(zip(types, colors)), sizes))
for _ in range(200):
    a = "".join(rng.choice("ab") for _ in range(rng.randrange(1, 6)))
    b = "".join(rng.choice("ab") for _ in range(rng.randrange(1, 6)))
    x, y = rng.randrange(1, 8), rng.randrange(1, 8)
    check(4105, [a, b, x, y], b * y in a * x)
for _ in range(120):
    n = rng.randrange(1, 8)
    edges = [[i, rng.randrange(i)] for i in range(1, n)]
    colors = "".join(rng.choice("RB") for _ in range(n))
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    weights = subtree_weights(graph)
    best = math.inf
    for mask in range(1 << n):
        chosen = {i for i in range(n) if mask >> i & 1}
        seen = set()
        stack = list(chosen)[:1]
        while stack:
            u = stack.pop()
            if u in seen:
                continue
            seen.add(u)
            stack.extend(v for v in graph[u] if v in chosen and v not in seen)
        if seen == chosen:
            best = min(best, sum(weights[i] for i in range(n) if (i in chosen) != (colors[i] == "R")))
    check(4108, [n, colors, edges], best)
for _ in range(180):
    a = [rng.randrange(16) for _ in range(rng.randrange(1, 9))]
    k = rng.randrange(1, len(a) + 1)
    ands = [functools.reduce(int.__and__, a[i : i + k]) for i in range(len(a) - k + 1)]
    valid = [y.bit_count() for y in range(1, 16) if all(y & v for v in ands)]
    check(4119, [a, k], min(valid, default=-1))
for _ in range(150):
    a = [rng.randrange(1, 6) for _ in range(rng.randrange(1, 5))]
    tables = []
    limit = math.lcm(*a)
    for start in a:
        dist = {start: 0}
        q = collections.deque([start])
        while q:
            v = q.popleft()
            following = [v * k for k in range(2, limit // v + 1)] + [v // k for k in range(2, v) if v % k == 0]
            for w in following:
                if w not in dist:
                    dist[w] = dist[v] + 1
                    q.append(w)
        tables.append(dist)
    check(4005, [a], min(sum(t.get(v, math.inf) for t in tables) for v in range(1, limit + 1)))
for _ in range(150):
    demands = [rng.randrange(1, 6) for _ in range(rng.randrange(1, 7))]
    fuel = [rng.randrange(0, 12), rng.randrange(0, 12)]
    out = []
    for assignment in itertools.product(range(2), repeat=len(demands)):
        remain = fuel.copy()
        ends = [0, 0]
        allowed = waiting = served = 0
        for amount, pump in zip(demands, assignment):
            if remain[pump] < amount:
                break
            start = max(allowed, ends[pump])
            waiting = max(waiting, start - allowed)
            allowed = start
            ends[pump] = start + amount
            remain[pump] -= amount
            served += 1
        out.append((-served, waiting))
    served, wait = min(out)
    check(4009, [demands, fuel], wait if served else -1)
for _ in range(100):
    a = [rng.randrange(5) for _ in range(rng.randrange(1, 9))]
    left = rng.randrange(len(a))
    right = rng.randrange(left, len(a))
    k = rng.randrange(1, 5)
    counts = [a[left : right + 1].count(v) for v in set(a[left : right + 1])]
    check(4033, [a, k, [[left, right]]], [len(counts) == k and all(v % 2 == 0 for v in counts)])
    n = len(a)
    stair = 0
    for i in range(n):
        for j in range(i + 1, n + 1):
            part = a[i:j]
            order = list(dict.fromkeys(part))
            stair += all(part.count(v) == rank + 1 for rank, v in enumerate(order))
    check(4095, [a], stair)
    q = [[1, left, right], [2, left, 8], [1, 0, n - 1]]
    b = a.copy()
    expected = []
    for query in q:
        if query[0] == 2:
            b[query[1]] = query[2]
            continue
        l, r = query[1:]
        expected.append(
            sum(
                any(b[p] > b[p - 1] and b[p] > b[p + 1] for p in range(i + 1, j))
                for i in range(l, r + 1)
                for j in range(i + 2, r + 1)
            )
        )
    check(4017, [a, q], expected)
    expected = []
    for query in range(5):
        part = a[left : right + 1]
        valid = len(set(part)) == k and all(part.count(v) % 2 == 0 for v in part)
        expected.append(valid)
        change = left + right if valid else right - left
        left, right = sorted([(left ^ change) % n, (right ^ change) % n])
    check(4042, [a, k, q[0][1], q[0][2], 5], expected)
    for id, transform in [
        (4058, lambda a, l, r: a[:l] + a[l + 1 : r + 1] + a[l : l + 1] + a[r + 1 :]),
        (4072, lambda a, l, r: a[:l] + a[l + 1 :]),
    ]:
        if id == 4058:
            candidates = [a] + [transform(a, l, r) for l in range(n) for r in range(l + 1, n)]
            best = max(sum(v * (-1) ** i for i, v in enumerate(b)) for b in candidates)
        else:
            candidates = [a] + [a[:l] + a[l + 1 :] for l in range(n)]
            best = max(
                sum(v * (-1) ** i for i, v in enumerate(b[l:r]))
                for b in candidates
                for l in range(len(b))
                for r in range(l + 1, len(b) + 1)
            )
        check(id, [a], best)
    target = [rng.randrange(5) for _ in range(n + 3)]
    patterns = collections.Counter(tuple(a[:i] + sorted(a[i:], reverse=True)) for i in range(n))
    check(4109, [a, target], [patterns[tuple(target[i : i + n])] for i in range(4)])
for _ in range(90):
    n = rng.randrange(2, 7)
    edges = [[i, rng.randrange(i)] for i in range(1, n)]
    groups = [rng.randrange(3) for _ in range(n)]
    weights = [rng.randrange(1, 7) for _ in edges]
    values = [rng.randrange(8) for _ in range(n)]
    graph = [[] for _ in range(n)]
    for (u, v), w in zip(edges, weights):
        graph[u].append((v, w))
        graph[v].append((u, w))
    distance_sum = 0
    best = math.inf
    for start in range(n):
        parent = {start: None}
        q = [start]
        for u in q:
            for v, w in graph[u]:
                if v not in parent:
                    parent[v] = (u, w)
                    q.append(v)
        for end in range(start + 1, n):
            path = [end]
            cost = 0
            u = end
            while u != start:
                u, w = parent[u]
                cost += w
                path.append(u)
            if groups[start] == groups[end]:
                distance_sum += len(path) - 1
            if sum(values[u].bit_count() for u in path) % 2 == 0:
                best = min(best, cost)
    check(4018, [n, edges, groups], distance_sum)
    check(4100, [[[*edge, w] for edge, w in zip(edges, weights)], values], best if best < math.inf else -1)
for _ in range(120):
    s = "".join(rng.choice("abc") for _ in range(rng.randrange(1, 10)))
    parts = [s[i:j] for i in range(len(s)) for j in range(i + 1, len(s) + 1)]
    check(4102, [s], sum("abc" not in p for p in parts))
    check(
        4104,
        [s],
        sum(
            not any(p[i] + p[j] + p[k] == "abc" for i, j, k in itertools.combinations(range(len(p)), 3)) for p in parts
        ),
    )
for _ in range(120):
    n = rng.randrange(2, 7)
    prices = [rng.randrange(1, 9) for _ in range(n)]
    costs = [rng.randrange(4) for _ in range(n)]
    cooldown = rng.randrange(3)
    check(4069, [prices, cooldown, costs], maximum_trade_earnings(prices, costs, cooldown))
for _ in range(80):
    n = rng.randrange(1, 7)
    required = [rng.randrange(1, 4) for _ in range(n)]
    edges = [[a, b, rng.randrange(1, 5)] for a in range(n) for b in range(n) if a != b and rng.random() < 0.3]
    times = [math.inf] * n
    times[0] = 0
    for round in range(n * 3):
        changed = False
        for u in range(1, n):
            incoming = {}
            for a, b, delay in edges:
                if b == u:
                    incoming[a] = min(incoming.get(a, math.inf), times[a] + delay)
            arrivals = sorted(incoming.values())
            candidate = arrivals[required[u] - 1] if len(arrivals) >= required[u] else math.inf
            if candidate < times[u]:
                times[u] = candidate
                changed = True
        if not changed:
            break
    check(4122, [n, edges, required], [t if t < math.inf else -1 for t in times])
for _ in range(35):
    a = [rng.randrange(1, 5) for _ in range(rng.randrange(3, 6))]
    n = len(a)
    best = math.inf
    for peak in range(1, n - 1):
        for height in range(2, 8):
            for left in itertools.combinations(range(1, height), peak):
                for right in itertools.combinations(range(1, height), n - peak - 1):
                    mountain = left + (height,) + right[::-1]
                    best = min(best, sum(abs(x - y) for x, y in zip(a, mountain)))
    check(4118, [a], best)
for _ in range(60):
    candidates = ["a", "b", "aa", "ab", "ba", "bb", "aaa", "aab", "aba", "abb"]
    words = rng.sample(candidates, rng.randrange(2, 7))
    target = list(range(len(words)))
    rng.shuffle(target)
    rank = {v: i for i, v in enumerate(target)}
    best = math.inf
    for order in itertools.permutations(range(len(words))):
        valid = True
        for prefix in {w[:i] for w in words for i in range(1, len(w) + 1)}:
            indices = [i for i, v in enumerate(order) if words[v].startswith(prefix)]
            if max(indices) - min(indices) + 1 != len(indices):
                valid = False
                break
            terminal = next((v for v, w in enumerate(words) if w == prefix), None)
            if terminal is not None and order[min(indices)] != terminal:
                valid = False
                break
        if valid:
            best = min(
                best, sum(rank[order[i]] > rank[order[j]] for i in range(len(order)) for j in range(i + 1, len(order)))
            )
    check(4077, [words, target], best)


class Node:
    def __init__(self, v, left=None, right=None):
        self.val = v
        self.left = left
        self.right = right


for _ in range(70):
    a = [rng.randrange(-2, 4) for _ in range(3)]
    rootnode = Node(a[0], Node(a[1]), Node(a[2]))
    best = min(
        sum(abs(x - y) for x, y in zip(a, b))
        for b in itertools.product(range(min(a), max(a) + 1), repeat=3)
        if abs(b[0] - b[1]) <= 1 and abs(b[0] - b[2]) <= 1
    )
    check(4082, [rootnode], best)
for _ in range(100):
    m, n = 2, 3
    grid = [[rng.randrange(1, 8) for _ in range(n)] for _ in range(m)]
    k = rng.randrange(1, 4)
    best = math.inf
    check(4046, [grid, k], minimum_turn_cost(grid, k))
print(json.dumps({"checks": sum(checks.values()), "byProblem": dict(checks)}, indent=2))
