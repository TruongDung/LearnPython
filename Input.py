import math
import heapq

# name = input("name: ")
# print(f'hello {name}')

print (f"{math.pi:.2f}")
pq = []

heapq.heappush(pq, 'b')
heapq.heappush(pq, 'c')
heapq.heappush(pq, 'a')


print(heapq.heappop(pq))