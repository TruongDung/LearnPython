import heapq

def dijkstra(n, graph, start):
    dist = [float("inf")] * n
    dist[start] = 0

    pq = [(0, start)]  # (distance, node)

    while pq:
        d, u = heapq.heappop(pq)

        # bản cũ trong heap → bỏ qua
        if d > dist[u]:
            continue

        for v, w in graph[u]:
            new_dist = d + w

            if new_dist < dist[v]:
                dist[v] = new_dist
                heapq.heappush(pq, (new_dist, v))

    return dist


# Demo graph
# 0 --4--> 1
# 0 --1--> 2
# 2 --2--> 1
# 1 --1--> 3
# 2 --5--> 3
# 3 --3--> 4

n = 5
graph = [[] for _ in range(n)]

edges = [
    (0, 1, 4),
    (0, 2, 1),
    (2, 1, 2),
    (1, 3, 1),
    (2, 3, 5),
    (3, 4, 3),
]

for u, v, w in edges:
    graph[u].append((v, w))

print(dijkstra(n, graph, 0))