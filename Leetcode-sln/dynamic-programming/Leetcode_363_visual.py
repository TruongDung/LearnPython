import bisect

class Solution:
    def maxSumSubmatrix(self, matrix, k):
        rows, cols = len(matrix), len(matrix[0])
        best = float('-inf')
        rectangle = None
        for top in range(rows):
            col_sums = [0] * cols
            for bottom in range(top, rows):
                for col in range(cols):
                    col_sums[col] += matrix[bottom][col]
                prefixes = [(0, -1)]
                prefix = 0
                for right in range(cols):
                    prefix += col_sums[right]
                    threshold = prefix - k
                    pos = bisect.bisect_left(prefixes, (threshold, -1))
                    if pos < len(prefixes):
                        previous, left_index = prefixes[pos]
                        candidate = prefix - previous
                        if candidate > best:
                            best = candidate
                            rectangle = (top, left_index + 1, bottom, right)
                    bisect.insort(prefixes, (prefix, right))
        return best
