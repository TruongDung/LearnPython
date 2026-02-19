import pytest

from Leetcode.Leetcode_2 import Solution, ListNode


def build_list(values):
    dummy = ListNode(0)
    cur = dummy
    for v in values:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next


def to_list(node):
    out = []
    while node:
        out.append(node.val)
        node = node.next
    return out


@pytest.mark.parametrize(
    "l1, l2, expected",
    [
        ([2, 4, 3], [5, 6, 4], [7, 0, 8]),
        ([9, 9, 9], [1], [0, 0, 0, 1]),
        ([0], [0], [0]),
        ([1, 8], [0], [1, 8]),
    ],
)

def test_add_two_numbers(l1, l2, expected):
    sol = Solution()
    head = sol.addTwoNumbers(build_list(l1), build_list(l2))
    assert to_list(head) == expected
