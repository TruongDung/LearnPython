class Solution:
    def minKnightMoves(self, x: int, y: int) -> int:
        x, y = abs(x), abs(y)

        directions = [ (-2,-1), (-1,-2), (1, -2), (2, -1), (-1, 2), (1, 2), (2, 1)]
        return 0