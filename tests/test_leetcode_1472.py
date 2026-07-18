"""Tests for LeetCode 1472: Design Browser History."""

from Leetcode.other.Leetcode_1472 import (  # pylint: disable=no-name-in-module
    BrowserHistory,
    DoubleListNode,
)


def test_double_list_node_links():
    """The supplied prev and next pointers are stored unchanged."""
    previous = DoubleListNode("previous")
    following = DoubleListNode("following")
    node = DoubleListNode("current", previous, following)

    assert node.val == "current"
    assert node.prev is previous
    assert node.next is following


def test_browser_history_leetcode_example():
    """Run the operation sequence from the problem statement."""
    history = BrowserHistory("leetcode.com")
    history.visit("google.com")
    history.visit("facebook.com")
    history.visit("youtube.com")

    assert history.back(1) == "facebook.com"
    assert history.back(1) == "google.com"
    assert history.forward(1) == "facebook.com"

    history.visit("linkedin.com")

    assert history.forward(2) == "linkedin.com"
    assert history.back(2) == "google.com"
    assert history.back(7) == "leetcode.com"


def test_visit_discards_forward_history():
    """Visiting after back overwrites the old forward chain."""
    history = BrowserHistory("home")
    history.visit("a")
    history.visit("b")
    assert history.back(1) == "a"

    discarded = history.curr.next
    history.visit("c")

    assert history.curr.val == "c"
    assert history.curr.prev.val == "a"
    assert history.curr.prev.next is history.curr
    assert history.forward(10) == "c"
    assert discarded.val == "b"
    assert discarded is not history.curr


def test_back_and_forward_stop_at_boundaries():
    """Moving past either end stays on the nearest boundary page."""
    history = BrowserHistory("home")
    history.visit("a")

    assert history.back(100) == "home"
    assert history.back(1) == "home"
    assert history.forward(100) == "a"
    assert history.forward(1) == "a"
