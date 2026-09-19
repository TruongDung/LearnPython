class Solution:
    # Approach 1: clamp the circle center into the rectangle, one axis at a
    # time, to land on the rectangle point closest to the center.
    # Every intermediate gets its own line so the step is easy to follow in a
    # debugger; min() caps at the right/top edge, max() lifts to the left/bottom.
    def checkOverlap(
        self,
        radius: int,
        xCenter: int,
        yCenter: int,
        x1: int,
        y1: int,
        x2: int,
        y2: int,
    ) -> bool:
        inner_x = min(xCenter, x2)
        closest_x = max(x1, inner_x)
        inner_y = min(yCenter, y2)
        closest_y = max(y1, inner_y)
        dx = xCenter - closest_x
        dy = yCenter - closest_y
        dist_squared = dx * dx + dy * dy
        radius_squared = radius * radius
        return dist_squared <= radius_squared

    # Approach 2: per-axis overshoot. At most one of the two gaps can be
    # positive, so the 0 in the middle of max() wins whenever the center
    # already projects inside the slab.
    def checkOverlap2(
        self,
        radius: int,
        xCenter: int,
        yCenter: int,
        x1: int,
        y1: int,
        x2: int,
        y2: int,
    ) -> bool:
        left_gap = x1 - xCenter
        right_gap = xCenter - x2
        dx = max(left_gap, 0, right_gap)
        bottom_gap = y1 - yCenter
        top_gap = yCenter - y2
        dy = max(bottom_gap, 0, top_gap)
        dist_squared = dx * dx + dy * dy
        radius_squared = radius * radius
        return dist_squared <= radius_squared

    # The same clamp written compactly, for reference.
    def checkOverlapCompact(
        self,
        radius: int,
        xCenter: int,
        yCenter: int,
        x1: int,
        y1: int,
        x2: int,
        y2: int,
    ) -> bool:
        dx = xCenter - max(x1, min(xCenter, x2))
        dy = yCenter - max(y1, min(yCenter, y2))
        return dx * dx + dy * dy <= radius * radius


if __name__ == "__main__":
    solution = Solution()

    cases = [
        ((1, 0, 0, 1, -1, 3, 1), True),
        ((1, 1, 1, 1, -3, 2, -1), False),
        ((1, 0, 0, -1, 0, 0, 1), True),
        # Corner (3, 4) is the closest point and sits exactly on the circle.
        ((5, 0, 0, 3, 4, 8, 9), True),
        # Same corner, radius one unit too short.
        ((4, 0, 0, 3, 4, 8, 9), False),
        # Center strictly inside the rectangle.
        ((1, 5, 5, 0, 0, 10, 10), True),
    ]

    for args, expected in cases:
        assert solution.checkOverlap(*args) is expected, args
        assert solution.checkOverlap2(*args) is expected, args
        assert solution.checkOverlapCompact(*args) is expected, args
