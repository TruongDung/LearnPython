"""Record completed source statements. Only bundled lesson code enters here."""
import ast
import collections
import json
import math
import sys
import types

def picture_trace(payload):
    code = payload['code']
    filename = '<picture-lesson>'
    scope = {}
    exec(compile(code, filename, 'exec'), scope)
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
        if isinstance(value, (list, tuple, collections.deque)):
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
        return {k: encode(v) for k, v in frame.f_locals.items()
                if k != 'self' and k not in temporary and not callable(v) and not isinstance(v, types.ModuleType)}

    events, pending = [], {}
    def trace(frame, event, arg):
        if frame.f_code.co_filename != filename or frame.f_code.co_name.startswith('<'):
            return trace
        if event in ('line', 'return'):
            # Ignore repeated line events inside an inlined comprehension.
            if event == 'line' and pending.get(frame) == frame.f_lineno:
                return trace
            if frame in pending:
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
    return json.dumps({'answer': encode(answer), 'events': events}, separators=(',', ':'))
