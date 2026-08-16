from collections import Counter
from typing import List


class Solution:
    def countPalindromePaths(self, parent: List[int], s: str) -> int:
        n = len(parent)
        children = [[] for _ in range(n)]
        for node in range(1, n):
            children[parent[node]].append(node)

        masks = [0] * n
        stack = [0]
        while stack:
            node = stack.pop()
            for child in children[node]:
                bit = 1 << (ord(s[child]) - ord("a"))
                masks[child] = masks[node] ^ bit
                stack.append(child)

        answer = 0
        seen = Counter()
        for mask in masks:
            answer += seen[mask]
            for bit in range(26):
                answer += seen[mask ^ (1 << bit)]
            seen[mask] += 1

        return answer


if __name__ == "__main__":
    sol = Solution()
    print(sol.countPalindromePaths([-1, 0, 0, 1, 1, 2], "acaabc"))  # 8
    print(sol.countPalindromePaths([-1, 0, 0, 0, 0], "aaaaa"))      # 10
