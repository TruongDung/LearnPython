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

    # Approach 2: measure nothing. Shrink the circle to its centre and grow the
    # rectangle by radius; the two meet exactly when the centre lands in that
    # grown region (the Minkowski sum), which is a rounded rectangle:
    #   wide slab [x1-r, x2+r] x [y1, y2]   covers the left/right edges
    #   tall slab [x1, x2] x [y1-r, y2+r]   covers the bottom/top edges
    #   four radius-r discs at the corners  cover the rounded parts
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
        in_wide = x1 - radius <= xCenter <= x2 + radius and y1 <= yCenter <= y2
        in_tall = x1 <= xCenter <= x2 and y1 - radius <= yCenter <= y2 + radius
        if in_wide or in_tall:
            return True
        radius_squared = radius * radius
        for corner_x, corner_y in ((x1, y1), (x1, y2), (x2, y1), (x2, y2)):
            dx = xCenter - corner_x
            dy = yCenter - corner_y
            if dx * dx + dy * dy <= radius_squared:
                return True
        return False

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

    # The two approaches are derived differently, so cross-check them over a
    # grid that lands in every region: inside, the four edge slabs, and the
    # four corner discs.
    for r in range(1, 5):
        for cx in range(-6, 7):
            for cy in range(-6, 7):
                args = (r, cx, cy, -2, -1, 3, 2)
                assert solution.checkOverlap(*args) == solution.checkOverlap2(*args), args
