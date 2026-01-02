class NumMatrix:

    def __init__(self, matrix: List[List[int]]):
        if not matrix or not matrix[0]:
            self.ps = []
            return

        m, n = len(matrix), len(matrix[0])
        self.ps = [[0] * (n + 1) for _ in range(m + 1)]

        for i in range(1, m + 1):
            for j in range(1, n + 1):
                self.ps[i][j] = (
                    matrix[i-1][j-1]
                    + self.ps[i-1][j]
                    + self.ps[i][j-1]
                    - self.ps[i-1][j-1]
                )
        

    def sumRegion(self, row1: int, col1: int, row2: int, col2: int) -> int:
        return (
            self.ps[row2 + 1][col2 + 1]
            - self.ps[row1][col2 + 1]
            - self.ps[row2 + 1][col1]
            + self.ps[row1][col1]
        )
 

# Your NumMatrix object will be instantiated and called as such:
obj = NumMatrix([
    [3, 0, 1, 4, 2],
    [5, 6, 3, 2, 1],
    [1, 2, 0, 1, 5],
    [4, 1, 0, 1, 7],
    [1, 0, 3, 0, 5]
])
param_1 = print(obj.sumRegion(2, 1, 4, 3))