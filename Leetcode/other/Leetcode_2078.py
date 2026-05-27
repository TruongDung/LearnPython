class Solution:
    def maxDistance(self, colors: List[int]) -> int:
        result = 0 
        n = len(colors)
        for j in range(n - 1, -1, -1):
            if colors[j] != colors[0]:
                result = j
                break
        for i in range(n):
            if colors[i] != colors[n - 1]:
                result = max(result, n - 1 - i)
                break
        return result