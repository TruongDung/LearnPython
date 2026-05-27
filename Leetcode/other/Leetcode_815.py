from collections import defaultdict, deque

class Solution:
    def numBusesToDestination(self, routes: List[List[int]], source: int, target: int) -> int:
        if source == target:
            return 0
        
        # Map each stop to the list of buses that stop there
        stop_to_buses = defaultdict(list)
        for i, route in enumerate(routes):
            for stop in route:
                stop_to_buses[stop].append(i)
        
        # Build graph where buses are nodes, connected if they share a stop
        graph = defaultdict(list)
        for buses in stop_to_buses.values():
            for i in range(len(buses)):
                for j in range(i + 1, len(buses)):
                    graph[buses[i]].append(buses[j])
                    graph[buses[j]].append(buses[i])
        
        # If source or target has no buses, impossible unless source == target (already handled)
        if source not in stop_to_buses or target not in stop_to_buses:
            return -1
        
        # BFS from buses that contain source
        visited = set()
        queue = deque()
        for bus in stop_to_buses[source]:
            queue.append((bus, 1))
            visited.add(bus)
        
        while queue:
            bus, count = queue.popleft()
            # Check if this bus goes to target
            if target in routes[bus]:
                return count
            # Visit neighbors
            for neighbor in graph[bus]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, count + 1))
        
        return -1
        