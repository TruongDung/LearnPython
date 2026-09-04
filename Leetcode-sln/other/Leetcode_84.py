from typing import List


class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        stack = []
        max_area = 0
        bars = heights + [0]
        for i in range(len(bars)):
            while stack and bars[stack[-1]] >= bars[i]:
                top = stack.pop()
                width = i - stack[-1] - 1 if stack else i
                max_area = max(max_area, bars[top] * width)
            stack.append(i)
        return max_area

sol = Solution()
sol.largestRectangleArea([2,1,5,6,2,3])