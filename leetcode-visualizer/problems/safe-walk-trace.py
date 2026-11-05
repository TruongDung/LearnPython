"""Record actual Python health-BFS statements with a bounded picture budget."""
import itertools
import json
import sys


def safe_walk_trace(payload):
    code = payload['code']
    lines = code.splitlines()
    filename = '<safe-walk-3286>'
    scope = {}
    # Only bundled lesson source enters this tracer.
    exec(compile(code, filename, 'exec'), scope)  # pylint: disable=exec-used
    grid, health = payload['args']
    height, width = len(grid), len(grid[0])
    method = payload['method']
    limit = payload.get('maxEvents', 1600)
    events, count, omitted = [], 0, 0
    last_line = None

    def inside(cell):
        return cell is not None and 0 <= cell[0] < height and 0 <= cell[1] < width

    def axis(size, current, probe):
        if size <= 5:
            return list(range(size))
        return sorted({0, size-1, *[v for v in (current, probe) if v is not None and 0 <= v < size]})

    def capture(frame, final, answer, previous_line):
        local = frame.f_locals
        source = lines[frame.f_lineno-1].strip()
        previous = lines[previous_line-1].strip() if previous_line is not None else ''
        best = local.get('best')
        current = [local['r'], local['c']] if 'r' in local else [0, 0]
        phase = 'line'
        if source.startswith('start_hp =') or source.startswith('if start_hp'):
            phase = 'start'
        elif source == 'r, c, hp = q.popleft()':
            phase = 'pop'
        elif source.startswith('if hp <'):
            phase = 'stale'
        elif source.startswith('if (r,c)'):
            phase = 'target'
        elif source.startswith('if not (0 <= nr'):
            phase = 'bounds'
        elif source.startswith('nhp ='):
            phase = 'damage'
        elif source == 'if nhp <= 0:':
            phase = 'alive'
        elif source.startswith('if nhp <= best'):
            phase = 'improve'
        elif source.startswith('best[nr'):
            phase = 'update'
        elif source.startswith('parent[(nr'):
            phase = 'parent'
        elif source.startswith('q.append'):
            phase = 'enqueue'
        elif source == 'continue':
            phase = ('dead' if previous == 'if nhp <= 0:' else
                     'dominated' if previous.startswith('if nhp <= best') else
                     'stale-skip' if previous.startswith('if hp <') else 'outside')
        probe = None
        if phase in ('bounds', 'damage', 'alive', 'improve', 'update', 'parent', 'enqueue',
                     'dead', 'dominated', 'outside') and 'nr' in local:
            target = [local['nr'], local['nc']]
            valid = inside(target)
            ready = phase not in ('bounds', 'damage', 'outside')
            probe = {'from': current[:], 'to': target, 'inside': valid,
                     'cost': grid[target[0]][target[1]] if valid else None,
                     'nextHp': local.get('nhp') if ready and valid else None,
                     'bestHp': best[target[0]][target[1]] if valid and best else None}
        rows = axis(height, current[0], probe['to'][0] if probe else None)
        cols = axis(width, current[1], probe['to'][1] if probe else None)
        cells = [[{'r': r, 'c': c, 'value': grid[r][c], 'bestHp': best[r][c] if best else None}
                  for c in cols] for r in rows]
        queue = list(itertools.islice(local.get('q', []), 12))
        queue_best = [best[r][c] for r, c, _ in queue] if best else []
        route_states = []
        if final and answer:
            state = (local['r'], local['c'], local['hp'])
            seen = set()
            while state is not None and state not in seen:
                seen.add(state)
                route_states.append(list(state))
                state = local['parent'].get(state)
            route_states.reverse()
        names = ('m', 'n', 'health', 'start_hp', 'r', 'c', 'hp', 'nr', 'nc', 'nhp', 'dr', 'dc')
        values = {name: local[name] for name in names if name in local}
        remaining = local.get('hp', local.get('start_hp', health))
        picture = {
            'height': height, 'width': width, 'health': health, 'rows': rows, 'cols': cols,
            'cells': cells, 'cropped': len(rows) < height or len(cols) < width,
            'source': {'line': frame.f_lineno, 'text': lines[frame.f_lineno-1], 'scope': method,
                       'timing': 'return' if final else 'before'},
            'phase': 'result' if final else phase, 'current': current, 'probe': probe,
            'locals': values, 'remainingHp': remaining,
            'queue': queue, 'queueBest': queue_best, 'queueSize': len(local.get('q', [])),
            'routeStates': route_states, 'route': [state[:2] for state in route_states],
            'hits': [{'cell': [r, c], 'before': hp+1, 'after': hp}
                     for r, c, hp in route_states if grid[r][c] == 1],
            'final': final, 'answer': answer if final else None,
            'failure': ('start' if local.get('start_hp', health) <= 0 else 'exhausted')
                       if final and not answer else None,
        }
        events.append(json.loads(json.dumps(picture)))

    def trace(frame, event, arg):
        nonlocal count, omitted, last_line
        if frame.f_code.co_filename != filename or frame.f_code.co_name != method:
            return None
        if event == 'line' and last_line == frame.f_lineno:
            return trace
        final = event == 'return'
        if event == 'line' or final:
            previous_line = last_line
            if event == 'line':
                last_line = frame.f_lineno
            count += 1
            if len(events) < limit or final:
                capture(frame, final, arg if final else None, previous_line)
            else:
                omitted += 1
        return trace

    try:
        sys.settrace(trace)
        answer = getattr(scope['Solution'](), method)(grid, health)
    finally:
        sys.settrace(None)
    return json.dumps({
        'answer': answer, 'events': events,
        'trace': {'events': count, 'captured': len(events), 'omitted': omitted, 'truncated': omitted > 0},
    }, separators=(',', ':'))
