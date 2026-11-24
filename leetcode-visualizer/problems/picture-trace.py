"""Record bundled lesson statements, with optional before-call transitions."""
import ast
import collections
import itertools
import json
import math
import sys
import types


class PictureTreeNode:
    """LeetCode's tree context with stable IDs for source-level pictures."""

    def __init__(self, value, node_id):
        self.val = value
        self.left = None
        self.right = None
        self.next = None
        self.node_id = node_id


def picture_tree(values, prefix):
    if not values or values[0] is None:
        return None
    root = PictureTreeNode(values[0], f'{prefix}:0')
    queue, index = collections.deque([root]), 1
    while queue:
        node = queue.popleft()
        for side in ('left', 'right'):
            if index >= len(values):
                break
            if values[index] is not None:
                child = PictureTreeNode(values[index], f'{prefix}:{index}')
                setattr(node, side, child)
                queue.append(child)
            index += 1
    return root


class PictureListNode:
    """An immutable-input linked-list context with stable IDs."""

    def __init__(self, value, node_id):
        self.val = value
        self.node_id = node_id
        self.next = None


def picture_list(values, prefix):
    head, tail = None, None
    for index, value in enumerate(values):
        node = PictureListNode(value, f'{prefix}:{index}')
        if tail is None:
            head = node
        else:
            tail.next = node
        tail = node
    return head


def picture_trace(payload):
    code = payload['code']
    filename = '<picture-lesson>'
    scope = {'TreeNode': PictureTreeNode} if payload.get('treeArgs') else {}
    # Optional, bundled context for lessons that construct new nodes or model
    # judge APIs. Compile separately so context helpers are not learner steps.
    if payload.get('prelude'):
        exec(compile(payload['prelude'], '<lesson-context>', 'exec'), scope)
    if payload.get('linkedArgs'):
        scope['ListNode'] = PictureListNode
    if payload.get('captureNext'):
        class PictureNextNode(PictureTreeNode):
            """Dummy nodes used by bundled next-pointer lessons."""
            count = 0

            def __init__(self, val=0):
                super().__init__(val, f'dummy:{PictureNextNode.count}')
                PictureNextNode.count += 1

        scope['Node'] = PictureNextNode
    # Execute bundled lesson code so its real statements can be traced.
    exec(compile(code, filename, 'exec'), scope)  # pylint: disable=exec-used
    branches = {}
    call_names = set(payload.get('traceCalls', []))
    call_lines = set()
    comprehension_targets = {}
    for node in ast.walk(ast.parse(code)):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in call_names:
            call_lines.add(node.lineno)
        if isinstance(node, (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)):
            names = {n.id for generator in node.generators for n in ast.walk(generator.target) if isinstance(n, ast.Name)}
            comprehension_targets.setdefault(node.lineno, set()).update(names)
        if isinstance(node, (ast.If, ast.While, ast.For)):
            branches[node.lineno] = {line for stmt in node.body for line in range(stmt.lineno, stmt.end_lineno + 1)}

    allocation_classes = set(payload.get('captureAllocations', []))
    allocated, allocation_ids = [], {}

    def allocation_ref(value):
        identity = id(value)
        if identity not in allocation_ids:
            allocation_ids[identity] = f'object:{len(allocated)}'
            # Retain detached nodes so IDs cannot be reused during a replay.
            allocated.append(value)
        return {'id': allocation_ids[identity], 'type': type(value).__name__}

    def encode(value):
        if type(value).__name__ in allocation_classes:
            return allocation_ref(value)
        if isinstance(value, PictureListNode):
            return {'id': value.node_id, 'val': value.val,
                    'next': value.next.node_id if value.next else None}
        if isinstance(value, PictureTreeNode):
            return {'id': value.node_id, 'val': value.val,
                    **({'next': value.next.node_id if value.next else None}
                       if payload.get('captureNext') else {})}
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
        if type(value).__name__ in payload.get('objectClasses', []):
            return {'type': type(value).__name__, **{name: encode(v) for name, v in vars(value).items()}}
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

    tree_nodes = []
    linked_nodes = []

    def tree_state():
        state = {}
        if allocation_classes:
            state['objects'] = [dict(allocation_ref(value), fields={name: encode(item)
                                for name, item in vars(value).items()}) for value in allocated]
        if payload.get('captureTrees'):
            state['trees'] = [{'id': node.node_id, 'val': node.val,
                               'left': node.left.node_id if node.left else None,
                               'right': node.right.node_id if node.right else None,
                               **({'next': node.next.node_id if node.next else None}
                                  if payload.get('captureNext') else {})} for node in tree_nodes]
        if payload.get('captureLinked'):
            state['linked'] = [encode(node) for node in linked_nodes]
        return state

    events, pending = [], {}
    entry, truncated = None, False
    event_limit = payload.get('maxEvents')

    def frame_stack(frame, line):
        cursor, outer, frames = frame, frame, []
        while cursor:
            if cursor.f_code.co_filename == filename and not cursor.f_code.co_name.startswith('<'):
                outer = cursor
                state = {'name': cursor.f_code.co_name, 'locals': local(cursor, cursor is not frame)}
                if call_names:
                    state['line'] = line if cursor is frame else pending.get(cursor, cursor.f_lineno)
                frames.append(state)
            cursor = cursor.f_back
        return outer, list(reversed(frames))

    def trace(frame, event, arg):
        nonlocal entry, truncated
        if frame.f_code.co_filename != filename or frame.f_code.co_name.startswith('<'):
            return trace
        if frame.f_code.co_name == payload['method'] and entry is None:
            entry = frame
        if event == 'call' and type(frame.f_locals.get('self')).__name__ in allocation_classes:
            allocation_ref(frame.f_locals['self'])
        if event in ('line', 'return'):
            # Ignore repeated line events inside an inlined comprehension.
            if event == 'line' and pending.get(frame) == frame.f_lineno:
                return trace
            if frame in pending:
                if event_limit and len(events) >= event_limit and not (event == 'return' and frame is entry):
                    if payload.get('failOnTruncate'):
                        raise ValueError('Example exceeds the step budget; use a smaller input.')
                    truncated = True
                    sys.settrace(None)
                    return None
                line = pending.pop(frame)
                outer, frames = frame_stack(frame, line)
                events.append({'line': line, 'scope': frame.f_code.co_name, 'locals': local(frame),
                               'outer': local(outer, outer is not frame), 'frames': frames,
                               'returned': encode(arg) if event == 'return' else None,
                               'returning': event == 'return',
                               'branch': (frame.f_lineno in branches[line]) if line in branches else None,
                               **({'event': 'return' if event == 'return' else 'statement', 'timing': 'after'}
                                  if call_names else {}),
                               **tree_state()})
            if event == 'line':
                pending[frame] = frame.f_lineno
                if frame.f_lineno in call_lines:
                    if event_limit and len(events) >= event_limit:
                        truncated = True
                        sys.settrace(None)
                        return None
                    outer, frames = frame_stack(frame, frame.f_lineno)
                    events.append({'line': frame.f_lineno, 'scope': frame.f_code.co_name,
                                   'locals': local(frame), 'outer': local(outer, outer is not frame),
                                   'frames': frames, 'returned': None, 'returning': False, 'branch': None,
                                   'event': 'call', 'timing': 'before', **tree_state()})
        return trace

    args = list(payload['args'])
    if '_viz_args' in scope:
        args = scope['_viz_args'](args)
    for index in payload.get('linkedArgs', []):
        args[index] = picture_list(args[index], index)
        if payload.get('captureLinked'):
            node = args[index]
            while node is not None:
                linked_nodes.append(node)
                node = node.next
    for index in payload.get('treeArgs', []):
        args[index] = picture_tree(args[index], index)
        if payload.get('captureTrees') and args[index] is not None:
            queue = collections.deque([args[index]])
            while queue:
                node = queue.popleft()
                tree_nodes.append(node)
                queue.extend(child for child in (node.left, node.right) if child is not None)
    random_state = None
    try:
        if 'randomSeed' in payload:
            import random
            random_state = random.getstate()
            random.seed(payload['randomSeed'])
        sys.settrace(trace)
        instance = scope['Solution'](*payload.get('constructorArgs', []))
        if 'calls' in payload:
            answer = [getattr(instance, call.get('method', payload['method']))(*call.get('args', []))
                      for call in payload['calls']]
        else:
            answer = getattr(instance, payload['method'])(*args)
    finally:
        sys.settrace(None)
        pending.clear()
        if random_state is not None:
            random.setstate(random_state)
    if truncated:
        # Retaining the real entry frame lets the bounded replay finish with its actual return state.
        state = local(entry)
        events.append({'line': entry.f_lineno, 'scope': entry.f_code.co_name, 'locals': state,
                       'outer': state, 'frames': [{'name': entry.f_code.co_name, 'locals': state}],
                       'returned': encode(answer), 'returning': True, 'branch': None, **tree_state()})
    if '_viz_answer' in scope:
        answer = scope['_viz_answer'](answer)
    return json.dumps({'answer': encode(answer), 'events': events,
                       'trace': {'captured': len(events), 'truncated': truncated, 'limit': event_limit}},
                      separators=(',', ':'))
