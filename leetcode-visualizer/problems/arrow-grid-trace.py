"""Bounded, immutable BEFORE-line pictures of the bundled 1368 solutions.

The code shown in the debugger is the code executed by Python. Recording stops
at the picture budget; computation continues and always records the final path.
"""
import heapq
import itertools
import json
import math
import sys


def arrow_grid_trace(payload):
    code = payload['code']
    lines = code.splitlines()
    filename = '<arrow-grid-1368>'
    scope = {}
    exec(compile(code, filename, 'exec'), scope)
    grid = payload['args'][0]
    height, width = len(grid), len(grid[0])
    method = payload['approach']
    limit = payload.get('maxEvents', 1600)
    events, count, omitted = [], 0, 0
    dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)]

    def scalar(value):
        return '∞' if isinstance(value, float) and math.isinf(value) else value

    def inside(cell):
        return cell is not None and 0 <= cell[0] < height and 0 <= cell[1] < width

    def axis(size, current, probe):
        if size <= 5:
            return list(range(size))
        return sorted({0, size-1, *[v for v in (current, probe) if v is not None and 0 <= v < size]})

    def capture(frame, final, answer=None):
        chain, cursor = [], frame
        while cursor and cursor.f_code.co_filename == filename:
            chain.append(cursor)
            cursor = cursor.f_back
        main, local = chain[-1].f_locals, frame.f_locals
        merged = {**main, **local}
        source = lines[frame.f_lineno-1].strip()
        current = [local['r'], local['c']] if 'r' in local and 'c' in local else None
        probe = None
        neighbor_line = source.startswith((
            'if not (0 <= nr', 'if 0 <= nr', 'if (nr', 'w =', 'nd =',
            'if nd', 'dist[nr', 'parent[(nr', 'if w', 'dq.append',
            'heappush', 'dfs(nr',
        )) or source == 'changed = True'
        if neighbor_line and 'nr' in local:
            probe = [local['nr'], local['nc']]
        if frame.f_code.co_name == 'flood' and local.get('prev') is not None:
            current, probe = list(local['prev']), [local['r'], local['c']]
        if final:
            current, probe = [height-1, width-1], None
        rows = axis(height, current[0] if current else None, probe[0] if probe else None)
        cols = axis(width, current[1] if current else None, probe[1] if probe else None)
        dist = main.get('dist')
        dfs_frames = [f.f_locals for f in reversed(chain) if f.f_code.co_name == 'dfs']
        path = main.get('path', [])
        costs = {(f['r'], f['c']): f['cost'] for f in dfs_frames if (f['r'], f['c']) in path}
        cells = [[{'r': r, 'c': c, 'arrow': grid[r][c],
                   'distance': scalar(dist[r][c]) if dist else costs.get((r, c), '∞')}
                  for c in cols] for r in rows]
        frontier = main.get('heap', main.get('dq', main.get('frontier', [])))
        if method == 2:
            queue = heapq.nsmallest(12, frontier)
        else:
            queue = list(itertools.islice(frontier, 12))
        if method == 4:
            queue = [[scalar(dist[r][c]), r, c] for r, c in queue]
        edge = None
        if current and probe:
            edge = {'from': current[:], 'to': probe[:], 'inside': inside(probe), 'direction': None, 'weight': None}
            if inside(current) and inside(probe):
                delta = (probe[0]-current[0], probe[1]-current[1])
                if delta in dirs:
                    direction = dirs.index(delta)+1
                    edge.update(direction=direction, weight=int(grid[current[0]][current[1]] != direction), original=grid[current[0]][current[1]])
        route = []
        if final:
            if method == 1:
                route = [list(cell) for cell in main['best_path']]
            else:
                parents = main.get('parent', {})
                cell, seen = (height-1, width-1), set()
                while cell is not None and cell not in seen:
                    seen.add(cell)
                    route.append(list(cell))
                    if cell == (0, 0):
                        break
                    cell = parents.get(cell)
                route.reverse()
        names = ('m', 'n', 'r', 'c', 'cost', 'nr', 'nc', 'k', 'w', 'nd', 'best', 'turn', 'changed', 'layer', 'dr', 'dc')
        values = {name: scalar(merged[name]) for name in names if name in merged}
        picture = {
            'method': method, 'height': height, 'width': width, 'rows': rows, 'cols': cols,
            'cells': cells, 'cropped': len(rows) < height or len(cols) < width,
            'source': {'line': frame.f_lineno, 'text': lines[frame.f_lineno-1],
                       'scope': frame.f_code.co_name, 'timing': 'return' if final else 'before'},
            'current': current, 'probe': edge, 'locals': values,
            'queue': queue, 'queueSize': len(frontier),
            'stack': [[f['cost'], f['r'], f['c']] for f in dfs_frames],
            'floodStack': [[r, c] for r, c, _ in local.get('stack', [])],
            'path': [list(cell) for cell in path], 'route': route,
            'bestPath': [list(cell) for cell in main.get('best_path', [])],
            'changes': [{'cell': a, 'from': grid[a[0]][a[1]], 'to': dirs.index((b[0]-a[0], b[1]-a[1]))+1}
                        for a, b in zip(route, route[1:]) if grid[a[0]][a[1]] != dirs.index((b[0]-a[0], b[1]-a[1]))+1],
            'final': final, 'answer': answer,
        }
        # Copy immediately: Python locals and the frontier are mutated later.
        events.append(json.loads(json.dumps(picture)))

    def trace(frame, event, arg):
        nonlocal count, omitted
        if frame.f_code.co_filename != filename or frame.f_code.co_name not in ('minCost', 'dfs', 'flood'):
            return None
        final = event == 'return' and frame.f_code.co_name == 'minCost'
        if event == 'line' or final:
            count += 1
            if len(events) < limit or final:
                capture(frame, final, arg if final else None)
            else:
                omitted += 1
        return trace

    try:
        sys.settrace(trace)
        answer = scope['Solution']().minCost(grid)
    finally:
        sys.settrace(None)
    return json.dumps({'answer': answer, 'events': events,
                       'trace': {'events': count, 'captured': len(events), 'omitted': omitted, 'truncated': omitted > 0}}, separators=(',', ':'))
