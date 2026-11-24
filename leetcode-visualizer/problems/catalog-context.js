"use strict";
// Bundled LeetCode judge context, kept outside traced learner source.
module.exports = String.raw`
import json, math, random
from collections import deque
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right
class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next
class Node:
    def __init__(self, val=0, children=None):
        self.val, self.children = val, children or []
def _tree(values):
    if not values or values[0] is None: return None
    root = TreeNode(values[0]); q = deque([root]); i = 1
    while q and i < len(values):
        node = q.popleft()
        for side in ('left', 'right'):
            if i >= len(values): break
            if values[i] is not None:
                child = TreeNode(values[i]); setattr(node, side, child); q.append(child)
            i += 1
    if any(v is not None for v in values[i:]): raise ValueError('Disconnected tree input')
    return root
def _list(values):
    dummy = tail = ListNode()
    for value in values: tail.next = ListNode(value); tail = tail.next
    return dummy.next
def _tree_values(root):
    if not root: return []
    out, q = [], [root]
    for node in q:
        out.append(node.val if node else None)
        if node: q.extend([node.left, node.right])
    while out and out[-1] is None: out.pop()
    return out
def _viz_args(args):
    for i, kind in enumerate(_viz_config.get('kinds', [])):
        if kind == 'tree': args[i] = _tree(args[i])
        if kind == 'list': args[i] = _list(args[i])
    return args
def _viz_answer(answer):
    kind = _viz_config.get('answerKind')
    if kind == 'tree': return _tree_values(answer)
    if kind == 'list':
        out, seen = [], set()
        while answer:
            if id(answer) in seen: raise ValueError('Unexpected output cycle')
            seen.add(id(answer)); out.append(answer.val); answer = answer.next
        return out
    return answer
`;
