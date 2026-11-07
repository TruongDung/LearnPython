"""Completed Python statements and stable node identities for linked-list lessons."""
import ast
import json
import sys


def linked_list_trace(payload):
    """Run bundled source; capture actual aliases and every next link after each line."""
    nodes = []

    class ListNode:
        """LeetCode's node, with an identity independent of its value or position."""

        def __init__(self, val=0, next=None, node_id=-1):  # pylint: disable=redefined-builtin
            self.val = val
            self.next = next
            self.node_id = node_id
            nodes.append(self)

    values, k = payload['args']
    original = [ListNode(value, node_id=index) for index, value in enumerate(values)]
    for left, right in zip(original, original[1:]):
        left.next = right
    head = original[0] if original else None
    filename = '<linked-list-lesson>'
    code = payload['code']
    scope = {'ListNode': ListNode}
    # Only the repository's bundled lesson source is executed here.
    exec(compile(code, filename, 'exec'), scope)  # pylint: disable=exec-used
    branches = {}
    for node in ast.walk(ast.parse(code)):
        if isinstance(node, (ast.If, ast.For, ast.While)):
            branches[node.lineno] = {
                line for stmt in node.body for line in range(stmt.lineno, stmt.end_lineno + 1)
            }

    def ref(value):
        return None if value is None else value.node_id

    def encode(value):
        if isinstance(value, ListNode):
            return {'id': value.node_id, 'value': value.val}
        return value

    events, pending = [], {}

    def trace(frame, event, arg):
        if frame.f_code.co_filename != filename or frame.f_code.co_name != payload['method']:
            return trace
        if event in ('line', 'return'):
            if frame in pending:
                line = pending.pop(frame)
                state = {name: encode(value) for name, value in frame.f_locals.items() if name != 'self'}
                pointers = {
                    name: ref(value) for name, value in frame.f_locals.items()
                    if isinstance(value, ListNode) or value is None
                }
                events.append({
                    'line': line, 'locals': state, 'pointers': pointers,
                    'nodes': [{'id': n.node_id, 'value': n.val, 'next': ref(n.next)} for n in nodes],
                    'branch': frame.f_lineno in branches[line] if line in branches else None,
                    'returned': encode(arg) if event == 'return' else None,
                    'returning': event == 'return',
                })
            if event == 'line':
                pending[frame] = frame.f_lineno
        return trace

    try:
        sys.settrace(trace)
        result = getattr(scope['Solution'](), payload['method'])(head, k)
    finally:
        sys.settrace(None)
    order, answer, seen = [], [], set()
    while result is not None:
        if result.node_id in seen:
            raise ValueError('The returned list contains a cycle.')
        seen.add(result.node_id)
        order.append(result.node_id)
        answer.append(result.val)
        result = result.next
    return json.dumps({'events': events, 'answer': answer, 'order': order})
