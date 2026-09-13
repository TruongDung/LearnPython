from typing import List


class Solution:
    def cyclicShift(
        self,
        n: int,
        grid: List[List[int]],
        rowShift: List[int],
        colShift: List[int],
    ) -> List[List[int]]:
        after_rows = [
            row[shift:] + row[:shift]
            for row, shift in zip(grid, rowShift)
        ]

        result = [[0] * n for _ in range(n)]
        for col, shift in enumerate(colShift):
            for row in range(n):
                result[(row - shift) % n][col] = after_rows[row][col]

        return result


if __name__ == "__main__":
    solution = Solution()
    assert solution.cyclicShift(
        2,
        [[1, 2], [3, 4]],
        [1, 0],
        [0, 1],
    ) == [[2, 4], [3, 1]]
    assert solution.cyclicShift(
        3,
        [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
        [1, 2, 0],
        [2, 2, 1],
    ) == [[7, 8, 5], [2, 3, 9], [6, 4, 1]]
