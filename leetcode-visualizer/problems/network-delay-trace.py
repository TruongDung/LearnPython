"""Record completed statements of the numbered Network Delay Time solution."""
import json
import math
import sys


def network_delay_trace(payload):
    code = payload['code']
    lines = code.splitlines()
    filename = '<network-delay-743>'
    scope = {}
    # Bundled lesson source is executed so pictures match actual Python statements.
    exec(compile(code, filename, 'exec'), scope)  # pylint: disable=exec-used
    times, n, k = payload['args']
    limit = payload.get('maxEvents', 1600)
    events, count, omitted = [], 0, 0
    pending = None
    settled, parents = set(), {}
    old_distance = None
    built = 0

    def value(number):
        return '∞' if isinstance(number, float) and math.isinf(number) else number

    def observe(frame, line, final, returned, next_line):
        nonlocal count, omitted, old_distance, built
        local = frame.f_locals
        source = lines[line-1].strip()
        dist = local.get('dist')
        heap = local.get('minHeap', [])
        node = local.get('node')
        phase, active = 'build', None
        candidate, improves = None, None
        if source == 'graph[u].append((v, w))':
            built += 1
        if source == 'for u, v, w in times:' and next_line == line+1:
            active = {'u': local['u'], 'v': local['v'], 'w': local['w']}
        elif source == 'graph[u].append((v, w))':
            active = {'u': local['u'], 'v': local['v'], 'w': local['w']}
        elif source.startswith(('dist =', 'dist[k]', 'minHeap =')):
            phase = 'init'
        elif source == 'while minHeap:' or source.startswith('time, node ='):
            phase = 'pop'
        elif source == 'if time > dist[node]:':
            phase = 'stale' if local['time'] > dist[node] else 'pop'
            if phase != 'stale':
                settled.add(node)
        elif source == 'continue':
            phase = 'stale'
        elif source == 'for neighbor, weight in graph[node]:':
            phase = 'inspect' if next_line == line+1 else 'scan-done'
        elif source == 'newTime = time + weight':
            phase = 'calculate'
        elif source == 'if newTime < dist[neighbor]:':
            phase = 'compare'
        elif source == 'dist[neighbor] = newTime':
            phase = 'update'
            parents[local['neighbor']] = node
        elif source.startswith('heapq.heappush'):
            phase = 'push'
        elif source.startswith('answer ='):
            phase = 'result'
        if phase in ('inspect', 'calculate', 'compare', 'update', 'push'):
            active = {'u': node, 'v': local['neighbor'], 'w': local['weight']}
            if phase in ('inspect', 'calculate', 'compare'):
                old_distance = dist[local['neighbor']]
            if phase != 'inspect':
                candidate = local['newTime']
                improves = candidate < old_distance
        if final:
            phase, active = 'done', None
        count += 1
        if len(events) >= limit and not final:
            omitted += 1
            return
        distances = [{'node': i, 'value': value(dist[i]) if dist else '∞'} for i in range(1, n+1)]
        unreachable = [item['node'] for item in distances if item['value'] == '∞']
        finite = [item for item in distances if item['value'] != '∞']
        latest = max((item['value'] for item in finite), default=None)
        slowest = [item['node'] for item in finite if item['value'] == latest]
        priorities = [k, node, active['u'] if active else None, active['v'] if active else None]
        if final:
            priorities += unreachable[:1] + slowest[:1]
        priorities += sorted(settled, reverse=True) + [1, n] + list(range(1, n+1))
        nodes = list(dict.fromkeys(i for i in priorities if i is not None))[:6] if n > 6 else list(range(1, n+1))
        node_set = set(nodes)
        edges = [edge for edge in times if edge[0] in node_set and edge[1] in node_set]
        edges.sort(key=lambda edge: (not (active and edge == [active['u'], active['v'], active['w']]),
                                     parents.get(edge[1]) != edge[0]))
        visible_edges = edges[:18]
        names = ('n', 'k', 'u', 'v', 'w', 'time', 'node', 'neighbor', 'weight', 'newTime', 'answer')
        values = {name: value(local[name]) for name in names if name in local}
        if 'minHeap' in local:
            values['len(minHeap)'] = len(heap)
        if dist and node is not None:
            values['dist[node]'] = value(dist[node])
        picture = {
            'n': n, 'k': k, 'phase': phase,
            'source': {'line': line, 'text': lines[line-1], 'scope': payload['method'], 'timing': 'after'},
            'locals': values, 'nodes': nodes, 'edges': visible_edges, 'edgeCount': len(times), 'builtCount': built,
            'cropped': len(nodes) < n or len(visible_edges) < len(times),
            'distances': distances, 'heap': [list(entry) for entry in heap[:15]], 'heapSize': len(heap),
            'settled': sorted(settled), 'parents': [[child, parent] for child, parent in parents.items()],
            'currentNode': node, 'activeEdge': active, 'candidate': candidate,
            'oldDistance': value(old_distance), 'improves': improves,
            'unreachable': unreachable if final else [], 'slowest': slowest if final and not unreachable else [],
            'final': final, 'answer': returned if final else None,
        }
        events.append(json.loads(json.dumps(picture)))

    def trace(frame, event, arg):
        nonlocal pending
        if frame.f_code.co_filename != filename or frame.f_code.co_name != payload['method']:
            return None
        if event in ('line', 'return'):
            if event == 'line' and pending == frame.f_lineno:
                return trace
            if pending is not None:
                observe(frame, pending, event == 'return', arg, frame.f_lineno)
            pending = frame.f_lineno if event == 'line' else None
        return trace

    try:
        sys.settrace(trace)
        answer = getattr(scope['Solution'](), payload['method'])(times, n, k)
    finally:
        sys.settrace(None)
        pending = None
    return json.dumps({
        'answer': answer, 'events': events,
        'trace': {'events': count, 'captured': len(events), 'omitted': omitted, 'truncated': omitted > 0},
    }, separators=(',', ':'))
