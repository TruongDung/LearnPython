"""Execute every Solution-style default snippet with its prepared live arguments."""

from __future__ import annotations

import bisect
import collections
import contextlib
import functools
import heapq
import io
import itertools
import json
import math
import sys
import traceback
from bisect import bisect_left, bisect_right
from collections import Counter, defaultdict, deque
from functools import cache, lru_cache
from itertools import accumulate
from math import gcd
from typing import Dict, List, Optional, Set, Tuple


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Node:
    # One compatibility type covers the different Node shapes used by LeetCode.
    def __init__(  # pylint: disable=too-many-positional-arguments
        self, val=0, next=None, random=None, child=None, neighbors=None,
        left=None, right=None, parent=None,
    ):
        self.val = val
        self.next = next
        self.random = random
        self.child = child
        self.neighbors = neighbors if neighbors is not None else []
        self.left = left
        self.right = right
        self.parent = parent


class HtmlParser:
    def __init__(self, edges):
        self.graph = defaultdict(list)
        for source, target in edges:
            self.graph[source].append(target)

    def getUrls(self, url):
        return self.graph.get(url, [])


def build_list(values):
    dummy = ListNode()
    tail = dummy
    for value in values:
        tail.next = ListNode(value)
        tail = tail.next
    return dummy.next


def build_tree(values):
    if not values or values[0] is None:
        return None, []
    root = TreeNode(values[0])
    nodes = [root]
    queue = deque([root])
    index = 1
    while queue and index < len(values):
        parent = queue.popleft()
        if index < len(values) and values[index] is not None:
            parent.left = TreeNode(values[index])
            nodes.append(parent.left)
            queue.append(parent.left)
        index += 1
        if index < len(values) and values[index] is not None:
            parent.right = TreeNode(values[index])
            nodes.append(parent.right)
            queue.append(parent.right)
        index += 1
    return root, nodes


def build_node_tree(values, with_parent=False):
    if not values or values[0] is None:
        return None, []
    root = Node(values[0])
    nodes = [root]
    queue = deque([root])
    index = 1
    while queue and index < len(values):
        parent = queue.popleft()
        if index < len(values) and values[index] is not None:
            parent.left = Node(values[index], parent=parent if with_parent else None)
            nodes.append(parent.left)
            queue.append(parent.left)
        index += 1
        if index < len(values) and values[index] is not None:
            parent.right = Node(values[index], parent=parent if with_parent else None)
            nodes.append(parent.right)
            queue.append(parent.right)
        index += 1
    return root, nodes


def materialize(value, context):
    if isinstance(value, dict) and value.get("__viz_type") == "binary_tree":
        root, nodes = build_tree(value.get("values", []))
        context["tree:" + value.get("tree_id", "root")] = (root, nodes)
        return root
    if isinstance(value, dict) and value.get("__viz_type") == "binary_tree_next":
        root, nodes = build_node_tree(value.get("values", []))
        context["tree:" + value.get("tree_id", "root")] = (root, nodes)
        return root
    if isinstance(value, dict) and value.get("__viz_type") in {"binary_tree_ref", "binary_tree_refs"}:
        _, nodes = context.get("tree:" + value.get("tree_id", "root"), (None, []))
        wanted = value.get("values", []) if value["__viz_type"] == "binary_tree_refs" else [value.get("value")]
        matches = [next((node for node in nodes if node.val == target), None) for target in wanted]
        return matches if value["__viz_type"] == "binary_tree_refs" else matches[0]
    if isinstance(value, dict) and value.get("__viz_type") == "linked_list":
        return build_list(value.get("values", []))
    if isinstance(value, dict) and value.get("__viz_type") == "graph_node":
        nodes = {index: Node(index) for index in range(1, value.get("n", 0) + 1)}
        for left, right in value.get("edges", []):
            nodes[left].neighbors.append(nodes[right])
            nodes[right].neighbors.append(nodes[left])
        return nodes.get(value.get("start"))
    if isinstance(value, dict) and value.get("__viz_type") == "random_list":
        entries = value.get("entries", [])
        nodes = [Node(entry[0]) for entry in entries]
        for index, node in enumerate(nodes):
            node.next = nodes[index + 1] if index + 1 < len(nodes) else None
            random_index = entries[index][1]
            node.random = nodes[random_index] if 0 <= random_index < len(nodes) else None
        return nodes[0] if nodes else None
    if isinstance(value, dict) and value.get("__viz_type") == "multilevel_list":
        def make_chain(values):
            nodes = [Node(item) for item in values]
            for index, node in enumerate(nodes):
                node.prev = nodes[index - 1] if index else None
                node.next = nodes[index + 1] if index + 1 < len(nodes) else None
            return nodes

        top = make_chain(value.get("values", []))
        by_value = {node.val: node for node in top}
        for group in str(value.get("children", "")).split(";"):
            if not group or ":" not in group:
                continue
            parent_value, children_text = group.split(":", 1)
            children = make_chain([int(item) for item in children_text.split(",") if item])
            if children and int(parent_value) in by_value:
                by_value[int(parent_value)].child = children[0]
                by_value.update({node.val: node for node in children})
        return top[0] if top else None
    if isinstance(value, dict) and value.get("__viz_type") == "html_parser":
        return HtmlParser(value.get("edges", []))
    if isinstance(value, dict) and value.get("__viz_type") == "parent_tree_ref":
        root, nodes = build_node_tree(value.get("values", []), True)
        context["tree:" + value.get("tree_id", "parent_tree")] = (root, nodes)
        return next((node for node in nodes if node.val == value.get("value")), None)
    if isinstance(value, dict) and value.get("__viz_type") == "parent_tree_existing_ref":
        _, nodes = context.get("tree:" + value.get("tree_id", "parent_tree"), (None, []))
        return next((node for node in nodes if node.val == value.get("value")), None)
    if isinstance(value, dict) and value.get("__viz_type") == "previous_result":
        return context.get("previous_result")
    if isinstance(value, dict) and value.get("__viz_type") == "intersecting_lists":
        values_a = value.get("head_a", [])
        values_b = value.get("head_b", [])
        intersection = value.get("intersection")
        index_a = next((i for i, item in enumerate(values_a) if item == intersection), len(values_a))
        index_b = next((i for i, item in enumerate(values_b) if item == intersection), len(values_b))
        shared = build_list(values_a[index_a:])

        def with_shared(prefix):
            head = build_list(prefix)
            if head is None:
                return shared
            tail = head
            while tail.next:
                tail = tail.next
            tail.next = shared
            return head

        context["intersecting_lists"] = (with_shared(values_a[:index_a]), with_shared(values_b[:index_b]))
        return context["intersecting_lists"][0]
    if isinstance(value, dict) and value.get("__viz_type") == "intersecting_lists_ref":
        return context.get("intersecting_lists", (None, None))[1]
    if isinstance(value, list):
        return [materialize(item, context) for item in value]
    if isinstance(value, dict):
        return {key: materialize(item, context) for key, item in value.items()}
    return value


def namespace():
    return {
        "bisect": bisect,
        "bisect_left": bisect_left,
        "bisect_right": bisect_right,
        "cache": cache,
        "accumulate": accumulate,
        "collections": collections,
        "contextlib": contextlib,
        "Counter": Counter,
        "defaultdict": defaultdict,
        "deque": deque,
        "Dict": Dict,
        "functools": functools,
        "heapq": heapq,
        "gcd": gcd,
        "inf": float("inf"),
        "itertools": itertools,
        "List": List,
        "ListNode": ListNode,
        "lru_cache": lru_cache,
        "math": math,
        "Node": Node,
        "HtmlParser": HtmlParser,
        "Optional": Optional,
        "Set": Set,
        "TreeNode": TreeNode,
        "Tuple": Tuple,
    }


payload = json.load(sys.stdin)
failures = []
passed = 0
for case in payload["cases"]:
    if case.get("prepareError"):
        failures.append({"id": case["id"], "block": case.get("block", 1), "error": case["prepareError"]})
        continue
    try:
        scope = namespace()
        safe_code = case["code"].encode("utf-8", "replace").decode("utf-8")
        # The audit runner intentionally executes snippets generated by this repository.
        exec(  # pylint: disable=exec-used
            compile(safe_code, f"<problem-{case['id']}>", "exec"), scope
        )
        context = {}
        with contextlib.redirect_stdout(io.StringIO()):
            design = case.get("design")
            if design and design.get("functionName"):
                args = [materialize(value, context) for value in design.get("args", [])]
                scope[design["functionName"]](*args)
            elif design:
                args = [materialize(value, context) for value in design.get("constructorArgs", [])]
                instance = scope[design["className"]](*args)
                for operation in design.get("operations", []):
                    operation_args = [materialize(value, context) for value in operation.get("args", [])]
                    context["previous_result"] = getattr(instance, operation["name"])(*operation_args)
            else:
                solution = scope["Solution"]()
                args = [materialize(value, context) for value in case["args"]]
                getattr(solution, case["method"])(*args)
        passed += 1
    # Keep auditing subsequent snippets regardless of how one snippet fails.
    except Exception as error:  # pylint: disable=broad-exception-caught
        failures.append({
            "id": case["id"],
            "block": case.get("block", 1),
            "error": f"{type(error).__name__}: {error}",
            "trace": traceback.format_exc(limit=2).strip().splitlines()[-1],
        })

print(json.dumps({
    "passed": passed,
    "failed": len(failures),
    "skippedDesignProblems": payload["skipped"],
    "failures": failures,
}, indent=2))
sys.exit(1 if failures else 0)
