from typing import List


class Solution:
    def numRookCaptures(self, board: List[List[str]]) -> int:
        rook_row = rook_col = -1
        for row in range(8):
            for col in range(8):
                if board[row][col] == "R":
                    rook_row, rook_col = row, col

        captures = 0
        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))
        for row_step, col_step in directions:
            row, col = rook_row + row_step, rook_col + col_step
            while 0 <= row < 8 and 0 <= col < 8:
                piece = board[row][col]
                if piece == "B":
                    break
                if piece == "p":
                    captures += 1
                    break
                row += row_step
                col += col_step
        return captures
