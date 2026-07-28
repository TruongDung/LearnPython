from typing import List


class Solution:
    def partition(self, s: str) -> List[List[str]]:
        result = []
        n = len(s)

        def is_palindrome(sub: str) -> bool:
            return sub == sub[::-1]

        def backtrack(start: int, path: List[str]) -> None:
            if start == n:
                result.append(list(path))
                return
            for end in range(start + 1, n + 1):
                piece = s[start:end]
                if is_palindrome(piece):
                    path.append(piece)
                    backtrack(end, path)
                    path.pop()

        backtrack(0, [])
        return result


sol = Solution()
print(sol.partition("aab"))  # [['a','a','b'],['aa','b']]
print(sol.partition("a"))    # [['a']]
