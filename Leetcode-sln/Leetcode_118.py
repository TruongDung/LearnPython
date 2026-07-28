from typing import List


class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        triangle = []

        for row in range(numRows):
            # Each row starts and ends with 1
            current = [1] * (row + 1)
            # Interior values = sum of the two above
            for col in range(1, row):
                current[col] = triangle[row - 1][col - 1] + triangle[row - 1][col]
            triangle.append(current)

        return triangle


sol = Solution()
print(sol.generate(5))  # [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]
print(sol.generate(1))  # [[1]]
