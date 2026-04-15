class Solution:
    def closestTarget(self, words: List[str], target: str, startIndex: int) -> int:
        res = float('int')
        n = len(words)

        for i in range(n):
            if words[i] == target:
                diff = abs(i - startIndex)
                res = min(res, diff, n - diff)
        return res