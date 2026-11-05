"""Capture completed Python statements for the maximum probability lesson."""
import json
import sys


def maximum_probability_trace(payload):
    lines = payload['code'].splitlines()
    filename = '<maximum-probability-1514>'
    scope = {}
    # Only bundled lesson source is executed, keeping the trace tied to the shown Python.
    exec(compile(payload['code'], filename, 'exec'), scope)  # pylint: disable=exec-used
    n, edges, probabilities, start, end = payload['args']
    weighted = [[a, b, p] for (a, b), p in zip(edges, probabilities)]
    edge_lookup = {tuple(sorted((a, b))): [a, b, p] for a, b, p in weighted}
    limit = payload.get('maxEvents', 1600)
    events, count, omitted = [], 0, 0
    pending, old_best = None, None
    settled, parents = set(), {}
    built = 0

    def observe(frame, line, final, returned, next_line):
        nonlocal count, omitted, old_best, built
        local = frame.f_locals
        source = lines[line-1].strip()
        best, heap, node = local.get('best'), local.get('heap', []), local.get('u')
        phase, active, candidate, improves = 'build', None, None, None
        if source.startswith(('graph[a].append', 'graph[b].append')):
            built += 1
        if source.startswith('for (a, b), probability') and next_line == line+1:
            active = {'u': local['a'], 'v': local['b'], 'p': local['probability']}
        elif source.startswith(('graph[a].append', 'graph[b].append')):
            active = {'u': local['a'], 'v': local['b'], 'p': local['probability']}
        elif source.startswith(('best =', 'best[start_node]', 'heap =')):
            phase = 'init'
        elif source == 'while heap:' or source.startswith(('neg_prob, u =', 'prob =')):
            phase = 'pop'
        elif source == 'if prob < best[u]:':
            phase = 'stale' if local['prob'] < best[node] else 'pop'
            if phase != 'stale':
                settled.add(node)
        elif source == 'continue':
            phase = 'stale'
        elif source == 'if u == end_node:':
            phase = 'target'
        elif source == 'for v, edge_prob in graph[u]:':
            phase = 'inspect' if next_line == line+1 else 'scan-done'
        elif source == 'new_prob = prob * edge_prob':
            phase = 'calculate'
        elif source == 'if new_prob > best[v]:':
            phase = 'compare'
        elif source == 'best[v] = new_prob':
            phase = 'update'
            parents[local['v']] = node
        elif source.startswith('heapq.heappush'):
            phase = 'push'
        if phase in ('inspect', 'calculate', 'compare', 'update', 'push'):
            active = {'u': node, 'v': local['v'], 'p': local['edge_prob']}
            if phase in ('inspect', 'calculate', 'compare'):
                old_best = best[local['v']]
            if phase != 'inspect':
                candidate = local['new_prob']
                improves = candidate > old_best
        if final:
            phase, active = 'done', None
        count += 1
        # Continue computing after the picture budget; always include the true return value.
        if len(events) >= limit and not final:
            omitted += 1
            return
        path = []
        if final and returned > 0:
            path = [end]
            while path[-1] != start and path[-1] in parents and len(path) <= n:
                path.append(parents[path[-1]])
            path.reverse()
        priorities = [start, end, node, active['u'] if active else None, active['v'] if active else None]
        priorities += path + sorted(settled, reverse=True) + list(range(n))
        nodes = list(dict.fromkeys(i for i in priorities if i is not None))[:6] if n > 6 else list(range(n))
        path_pairs = {frozenset(pair) for pair in zip(path, path[1:])}
        # At most 15 lookups per picture, even when the input has 20000 edges.
        visible = [edge_lookup[key] for i, a in enumerate(nodes) for b in nodes[i+1:]
                   if (key := tuple(sorted((a, b)))) in edge_lookup]
        active_pair = frozenset((active['u'], active['v'])) if active else None
        visible.sort(key=lambda edge: (frozenset(edge[:2]) != active_pair, frozenset(edge[:2]) not in path_pairs))
        visible = visible[:15]
        names = ('n', 'start_node', 'end_node', 'a', 'b', 'probability', 'neg_prob', 'u',
                 'prob', 'v', 'edge_prob', 'new_prob')
        values = {name: local[name] for name in names if name in local}
        if 'heap' in local:
            values['len(heap)'] = len(heap)
        if best is not None and node is not None:
            values['best[u]'] = best[node]
        if best is not None and 'v' in local:
            values['best[v]'] = best[local['v']]
        picture = {
            'n': n, 'start': start, 'end': end, 'phase': phase,
            'source': {'line': line, 'text': lines[line-1], 'scope': payload['method'], 'timing': 'after'},
            'locals': values, 'nodes': nodes, 'edges': visible, 'edgeCount': len(edges), 'builtCount': built,
            'cropped': len(nodes) < n or len(visible) < len(edges),
            'best': [{'node': i, 'value': best[i] if best is not None else None} for i in nodes],
            'heap': [{'raw': list(entry), 'best': best[entry[1]]} for entry in heap[:15]], 'heapSize': len(heap),
            'settled': sorted(settled), 'parents': [[child, parent] for child, parent in parents.items()],
            'currentNode': node, 'activeEdge': active, 'candidate': candidate,
            'oldBest': old_best, 'improves': improves,
            'path': path, 'pathEdges': [edge for edge in weighted if frozenset(edge[:2]) in path_pairs],
            'final': final, 'answer': returned if final else None,
        }
        events.append(picture)

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
        answer = getattr(scope['Solution'](), payload['method'])(n, edges, probabilities, start, end)
    finally:
        sys.settrace(None)
        pending = None
    return json.dumps({
        'answer': answer, 'events': events,
        'trace': {'events': count, 'captured': len(events), 'omitted': omitted, 'truncated': omitted > 0},
    }, separators=(',', ':'))
