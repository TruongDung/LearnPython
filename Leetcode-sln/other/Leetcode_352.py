"""LeetCode 352: Data Stream as Disjoint Intervals."""


class SummaryRanges:
    """Track a stream of integers as sorted disjoint intervals.

    ``addNum`` binary-searches the first interval whose start exceeds
    ``value``, then inspects only its two neighbours to decide between
    covering, bridging both sides, extending one side, or inserting fresh.
    """

    def __init__(self):
        self.intervals = []

    def addNum(self, value: int) -> None:
        intervals = self.intervals
        left, right = 0, len(intervals)
        while left < right:
            mid = (left + right) // 2
            if intervals[mid][0] <= value:
                left = mid + 1
            else:
                right = mid

        touches_prev = False
        if left > 0:
            prev_start, prev_end = intervals[left - 1]
            if prev_start <= value <= prev_end:
                return
            touches_prev = prev_end + 1 == value
        next_start = intervals[left][0] if left < len(intervals) else None
        touches_next = next_start is not None and next_start - 1 == value

        if touches_prev and touches_next:
            intervals[left - 1][1] = intervals[left][1]
            del intervals[left]
        elif touches_prev:
            intervals[left - 1][1] = value
        elif touches_next:
            intervals[left][0] = value
        else:
            intervals.insert(left, [value, value])

    def getIntervals(self) -> list[list[int]]:
        return [interval[:] for interval in self.intervals]
