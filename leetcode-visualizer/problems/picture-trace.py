"""Record completed source statements. Only bundled lesson code enters here."""
import ast
import collections
import itertools
import json
import math
import sys
import types

def picture_trace(payload):
    code = payload['code']
    filename = '<picture-lesson>'
    scope = {}
    # Execute bundled lesson code so its real statements can be traced.
    exec(compile(code, filename, 'exec'), scope)  # pylint: disable=exec-used
    branches = {}
    comprehension_targets = {}
    for node in ast.walk(ast.parse(code)):
        if isinstance(node, (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)):
            names = {n.id for generator in node.generators for n in ast.walk(generator.target) if isinstance(n, ast.Name)}
            comprehension_targets.setdefault(node.lineno, set()).update(names)
        if isinstance(node, (ast.If, ast.While, ast.For)):
            branches[node.lineno] = {line for stmt in node.body for line in range(stmt.lineno, stmt.end_lineno + 1)}

    def encode(value):
        if value is None or isinstance(value, (str, bool, int)):
            return value
        if isinstance(value, float):
            return value if math.isfinite(value) else ('∞' if value > 0 else '−∞')
        if isinstance(value, dict):
            if all(isinstance(k, str) for k in value):
                return {k: encode(v) for k, v in value.items()}
            return {'__pairs__': [[encode(k), encode(v)] for k, v in value.items()]}
        if isinstance(value, (list, tuple, collections.deque)) or type(value).__name__ in payload.get('sequenceClasses', []):
            return [encode(v) for v in value]
        if isinstance(value, (set, frozenset)):
            try:
                return [encode(v) for v in sorted(value)]
            except TypeError:
                return [encode(v) for v in sorted(value, key=repr)]
        return repr(value)

    def local(frame, suspended=False):
        # Python 3.12 inlines comprehensions; their temporary bindings are not
        # locals of the enclosing statement, unlike actual source variables.
        temporary = comprehension_targets.get(pending.get(frame), set()) if suspended else set()
        values = {}
        summaries = payload.get('summarizeLocals', {})
        for name, value in frame.f_locals.items():
            if name == 'self' or name in temporary or callable(value) or isinstance(value, types.ModuleType):
                continue
            if name not in summaries:
                values[name] = encode(value)
                continue
            values[f'len({name})'] = len(value)
            limit = summaries[name]
            if limit:
                items = value.items() if isinstance(value, dict) else value
                expression = f'list({name}.items())' if isinstance(value, dict) else f'list({name})'
                values[f'{expression}[:{limit}]'] = encode(list(itertools.islice(items, limit)))
        instance = frame.f_locals.get('self')
        if type(instance).__name__ in payload.get('stateClasses', []):
            values['self'] = {name: encode(value) for name, value in vars(instance).items()}
        return values

    events, pending = [], {}
    entry, truncated = None, False
    event_limit = payload.get('maxEvents')
    def trace(frame, event, arg):
        nonlocal entry, truncated
        if frame.f_code.co_filename != filename or frame.f_code.co_name.startswith('<'):
            return trace
        if frame.f_code.co_name == payload['method']:
            entry = frame
        if event in ('line', 'return'):
            # Ignore repeated line events inside an inlined comprehension.
            if event == 'line' and pending.get(frame) == frame.f_lineno:
                return trace
            if frame in pending:
                if event_limit and len(events) >= event_limit and not (event == 'return' and frame is entry):
                    truncated = True
                    sys.settrace(None)
                    return None
                line = pending.pop(frame)
                cursor, outer, frames = frame, frame, []
                while cursor:
                    if cursor.f_code.co_filename == filename and not cursor.f_code.co_name.startswith('<'):
                        outer = cursor
                        frames.append({'name': cursor.f_code.co_name, 'locals': local(cursor, cursor is not frame)})
                    cursor = cursor.f_back
                events.append({'line': line, 'scope': frame.f_code.co_name, 'locals': local(frame),
                               'outer': local(outer, outer is not frame), 'frames': list(reversed(frames)),
                               'returned': encode(arg) if event == 'return' else None,
                               'returning': event == 'return',
                               'branch': (frame.f_lineno in branches[line]) if line in branches else None})
            if event == 'line':
                pending[frame] = frame.f_lineno
        return trace

    args = payload['args']
    try:
        sys.settrace(trace)
        answer = getattr(scope['Solution'](), payload['method'])(*args)
    finally:
        sys.settrace(None)
        pending.clear()
    if truncated:
        # Retaining the real entry frame lets the bounded replay finish with its actual return state.
        state = local(entry)
        events.append({'line': entry.f_lineno, 'scope': entry.f_code.co_name, 'locals': state,
                       'outer': state, 'frames': [{'name': entry.f_code.co_name, 'locals': state}],
                       'returned': encode(answer), 'returning': True, 'branch': None})
    return json.dumps({'answer': encode(answer), 'events': events,
                       'trace': {'captured': len(events), 'truncated': truncated, 'limit': event_limit}},
                      separators=(',', ':'))
