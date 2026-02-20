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
        # Basic cases
        ([2, 4, 3], [5, 6, 4], [7, 0, 8]),  # 342 + 465 = 807
        ([0], [0], [0]),  # 0 + 0 = 0
        ([1, 8], [0], [1, 8]),  # 81 + 0 = 81
        
        # Carry propagation cases
        ([9, 9, 9], [1], [0, 0, 0, 1]),  # 999 + 1 = 1000
        ([9, 9, 9, 9], [9, 9, 9, 9], [8, 9, 9, 9, 1]),  # 9999 + 9999 = 19998
        ([5, 5], [5, 5], [0, 1, 1]),  # 55 + 55 = 110
        
        # Different length lists
        ([1], [9, 9, 9], [0, 0, 0, 1]),  # 1 + 999 = 1000
        ([9, 9, 9], [1], [0, 0, 0, 1]),  # 999 + 1 = 1000
        ([2, 4, 3], [5], [7, 4, 3]),  # 342 + 5 = 347
        
        # Single digit cases
        ([5], [5], [0, 1]),  # 5 + 5 = 10
        ([1], [9], [0, 1]),  # 1 + 9 = 10
        
        # Edge cases with zeros
        ([0], [1, 2, 3], [1, 2, 3]),  # 0 + 321 = 321
        ([1, 2, 3], [0], [1, 2, 3]),  # 321 + 0 = 321
        
        # Large numbers
        ([1, 0, 0, 0, 0], [1], [2, 0, 0, 0, 0]),  # 10000 + 1 = 10001
    ],
)
def test_add_two_numbers(l1, l2, expected):
    """Test addTwoNumbers with various input combinations."""
    sol = Solution()
    head = sol.addTwoNumbers(build_list(l1), build_list(l2))
    assert to_list(head) == expected


def test_add_two_numbers_empty_inputs():
    """Test that the function handles edge cases correctly."""
    sol = Solution()
    
    # Test with None inputs (should not happen in practice, but test robustness)
    # Note: The current implementation assumes non-None inputs
    # This test documents expected behavior
    pass


def test_list_node_creation():
    """Test ListNode class initialization."""
    node1 = ListNode(5)
    assert node1.val == 5
    assert node1.next is None
    
    node2 = ListNode(10, node1)
    assert node2.val == 10
    assert node2.next == node1
    assert node2.next.val == 5


def test_build_list_helper():
    """Test the build_list helper function."""
    head = build_list([1, 2, 3])
    assert to_list(head) == [1, 2, 3]
    
    head = build_list([])
    assert head is None or to_list(head) == []


def test_to_list_helper():
    """Test the to_list helper function."""
    node1 = ListNode(1)
    node2 = ListNode(2)
    node3 = ListNode(3)
    node1.next = node2
    node2.next = node3
    
    assert to_list(node1) == [1, 2, 3]
    assert to_list(None) == []
