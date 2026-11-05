"""Record real completed statements for all five minimum-subgraph algorithms."""
import json
import math
import sys


def minimum_subgraph_trace(payload):
    lines = payload['code'].splitlines()
    filename = '<minimum-subgraph-2203>'
    scope = {}
    # Execute bundled lesson code so the highlighted Python is the code producing the pictures.
    exec(compile(payload['code'], filename, 'exec'), scope)  # pylint: disable=exec-used
    n, edges, src1, src2, dest = payload['args']
    method, limit = payload['approach'], payload.get('maxEvents', 1600)
    events, pending, old = [], {}, {}
    main_frame, truncated = None, False
    settled = {'src1': set(), 'src2': set(), 'dest': set()}
    starts = {src1: 'src1', src2: 'src2', dest: 'dest'}
    incoming, outgoing, by_pair = {}, {}, {}
    for index, (u, v, weight) in enumerate(edges):
        incoming.setdefault(v, []).append(index)
        outgoing.setdefault(u, []).append(index)
        by_pair.setdefault((u, v), []).append([u, v, weight, index])

    def value(number):
        return '∞' if isinstance(number, float) and math.isinf(number) else number

    def winning_routes(local):
        meeting = local.get('meeting', -1)
        if meeting < 0:
            return [[], [], []]
        routes = []
        for name, start in [('d1', src1), ('d2', src2)]:
            distance, current, route = local[name], meeting, []
            while current != start:
                index = next(i for i in incoming.get(current, [])
                             if distance[edges[i][0]] + edges[i][2] == distance[current])
                route.append(index)
                current = edges[index][0]
            routes.append(list(reversed(route)))
        current, route, distance = meeting, [], local['dt']
        while current != dest:
            index = next(i for i in outgoing.get(current, [])
                         if edges[i][2] + distance[edges[i][1]] == distance[current])
            route.append(index)
            current = edges[index][1]
        return routes + [route]

    def observe(frame, line, final=False, returned=None, next_line=None):
        nonlocal truncated
        if len(events) >= limit and not final:
            truncated = True
            # The full algorithm continues at normal speed; its final frame is recorded below.
            sys.settrace(None)
            return
        local, outer = frame.f_locals, main_frame.f_locals
        source, helper = lines[line-1].strip(), frame is not main_frame
        run = starts[local['start']] if helper else None
        vectors = [outer.get('d1'), outer.get('d2'), outer.get('dt')]
        if helper and 'dist' in local:
            vectors[['src1', 'src2', 'dest'].index(run)] = local['dist']
        matrix = outer.get('dist') if method == 3 else None
        if matrix is not None:
            vectors = [matrix[src1], matrix[src2], None]
        phase, active, candidate, improves = 'build', None, None, None
        node = local.get('u') if helper or method == 3 else None
        phase = 'init' if helper else phase
        if source.startswith(('graph[u].append', 'reverse[v].append')):
            active = {'u': local['u'], 'v': local['v'], 'w': local['weight']}
        if helper:
            if source.startswith(('while heap:', 'while q:', 'distance, u =', 'u = q.popleft')):
                phase = 'pop'
            elif source == 'if distance != dist[u]:':
                phase = 'stale' if local['distance'] != local['dist'][node] else 'pop'
                if phase != 'stale':
                    settled[run].add(node)
            elif source == 'continue':
                phase = 'stale'
            elif source == 'used[u] = True':
                phase = 'scan'
                settled[run].add(node)
            elif source.startswith(('u =', 'for node', 'if not used', 'if u ==')):
                phase = 'scan'
            elif source.startswith(('for pass_index', 'changed =', 'if not changed', 'break')):
                phase = 'pass'
            elif source == 'for v, weight in adjacency[u]:':
                phase = 'inspect' if next_line == line+1 else 'scan-done'
            elif source.startswith('candidate ='):
                phase = 'calculate'
            elif source == 'if candidate < dist[v]:':
                phase = 'compare'
            elif source == 'dist[v] = candidate':
                phase = 'update'
            elif source.startswith(('heapq.heappush', 'q.append', 'in_queue[v] =')):
                phase = 'push'
            elif source == 'return dist':
                phase = 'run-done'
            if phase in ('inspect', 'calculate', 'compare', 'update', 'push'):
                active = {'u': node, 'v': local['v'], 'w': local['weight']}
                if phase in ('inspect', 'calculate', 'compare'):
                    old[frame] = local['dist'][local['v']]
                if phase != 'inspect':
                    candidate = local['candidate']
                    improves = candidate < old[frame]
        check = None
        if method == 3:
            floyd_line = source.startswith(('for ', 'candidate', 'if candidate', 'dist[u][v]'))
            phase = 'floyd' if 'k' in local and floyd_line else 'init'
            if all(name in local for name in ('u', 'v', 'k')) and phase == 'floyd':
                u, v, k = local['u'], local['v'], local['k']
                if source.startswith(('candidate =', 'if candidate')):
                    old[frame] = matrix[u][v]
                if source.startswith(('candidate =', 'if candidate', 'dist[u][v] = candidate')):
                    candidate = local['candidate']
                    improves = candidate < old[frame]
                check = {'from': u, 'to': v, 'intermediate': k, 'oldDistance': value(old.get(frame)),
                         'leftDistance': value(matrix[u][k]), 'rightDistance': value(matrix[k][v]),
                         'candidate': value(candidate), 'improves': improves}
        if not helper and source.startswith(('d1 =', 'd2 =', 'dt =')):
            phase = 'run-done'
            run = 'src1' if source.startswith('d1') else 'src2' if source.startswith('d2') else 'dest'
        if not helper and source.startswith(('answer =', 'meeting =', 'for node in range', 'total =', 'if total')):
            if 'd1' in outer and 'dt' in outer:
                phase, node = 'combine', local.get('node')
        if final:
            phase, active, run, node = 'done', None, None, outer.get('meeting')
        reversed_run = run == 'dest'
        if active:
            active.update({'originalU': active['v'] if reversed_run else active['u'],
                           'originalV': active['u'] if reversed_run else active['v'], 'reversed': reversed_run})
        best_meeting = outer.get('meeting', -1)
        priorities = [src1, src2, dest, best_meeting, node]
        if active:
            priorities += [active['u'], active['v']]
        if check:
            priorities += [check['intermediate'], check['from'], check['to']]
        nodes = list(dict.fromkeys(i for i in priorities if i is not None and i >= 0))[:6]
        for i in range(n):
            if len(nodes) >= min(n, 6):
                break
            if i not in nodes:
                nodes.append(i)
        nodes.sort()
        rows = []
        for i in (range(n) if n <= 8 else nodes):
            numbers = [vector[i] if vector is not None else None for vector in vectors]
            if matrix is not None:
                numbers[2] = matrix[i][dest]
            rows.append({'node': i, 'd1': value(numbers[0]), 'd2': value(numbers[1]), 'dt': value(numbers[2]),
                         'total': value(sum(numbers)) if None not in numbers else None})
        visible = [edge for a in nodes for b in nodes for edge in by_pair.get((a, b), [])]
        visible.sort(key=lambda edge: not (active and edge[:3] == [active['originalU'], active['originalV'], active['w']]))
        visible = visible[:18]
        names = ('n', 'src1', 'src2', 'dest', 'start', 'u', 'v', 'weight', 'distance', 'candidate',
                 'pass_index', 'changed', 'node', 'k', 'total', 'answer', 'meeting')
        values = {name: value(local[name]) for name in names if name in local}
        heap, queue = local.get('heap', []), local.get('q', [])
        used = local.get('used', [])
        events.append({
            'n': n, 'src1': src1, 'src2': src2, 'dest': dest, 'phase': phase, 'activeRun': run,
            'source': {'line': line, 'text': lines[line-1], 'scope': frame.f_code.co_name, 'timing': 'after'},
            'locals': values, 'nodes': nodes, 'edges': visible, 'edgeCount': len(edges),
            'cropped': len(nodes) < n or len(visible) < len(edges), 'rows': rows,
            'currentNode': node if node is not None and node >= 0 else None,
            'settled': sorted(settled[run]) if run else [], 'activeEdge': active,
            'candidate': value(candidate), 'oldDistance': value(old.get(frame)), 'improves': improves,
            'heap': [list(entry) for entry in heap[:15]], 'heapSize': len(heap),
            'heapBest': [value(local['dist'][entry[1]]) for entry in heap[:15]],
            'queue': list(queue)[:12], 'queueSize': len(queue),
            'scan': [{'node': i, 'used': used[i]} for i in nodes] if used else [], 'matrix': check,
            'matrixCells': [[value(matrix[a][b]) for b in nodes] for a in nodes] if matrix is not None else [],
            'combineNode': outer.get('node') if phase == 'combine' else best_meeting if final else None,
            'bestMeeting': best_meeting if best_meeting >= 0 else None,
            'answer': returned if final else value(outer.get('answer')), 'final': final,
            'routes': winning_routes(outer) if final and returned != -1 else [[], [], []],
        })

    def trace(frame, event, arg):
        nonlocal main_frame
        if frame.f_code.co_filename != filename or frame.f_code.co_name.startswith('<'):
            return None
        if frame.f_code.co_name == payload['method']:
            main_frame = frame
        if event in ('line', 'return'):
            if event == 'line' and pending.get(frame) == frame.f_lineno:
                return trace
            if frame in pending:
                observe(frame, pending.pop(frame), event == 'return' and frame is main_frame, arg, frame.f_lineno)
            if event == 'line':
                pending[frame] = frame.f_lineno
        return trace

    try:
        sys.settrace(trace)
        answer = getattr(scope['Solution'](), payload['method'])(n, edges, src1, src2, dest)
    finally:
        sys.settrace(None)
        pending.clear()
    if not events or not events[-1]['final']:
        observe(main_frame, len(lines), True, answer)
    return json.dumps({'answer': answer, 'events': events,
                       'trace': {'captured': len(events), 'truncated': truncated, 'limit': limit}}, separators=(',', ':'))
