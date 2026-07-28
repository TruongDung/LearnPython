from typing import List


class Solution:
    def removeInvalidParentheses(self, s: str) -> List[str]:
        def is_valid(string: str) -> bool:
            count = 0
            for ch in string:
                if ch == '(':
                    count += 1
                elif ch == ')':
                    count -= 1
                    if count < 0:
                        return False
            return count == 0

        # BFS level by level - first level with valid strings is the answer
        level = {s}
        while level:
            valid = [string for string in level if is_valid(string)]
            if valid:
                return valid

            next_level = set()
            for string in level:
                for i in range(len(string)):
                    if string[i] in ('(', ')'):
                        next_level.add(string[:i] + string[i + 1:])
            level = next_level

        return [""]


sol = Solution()
print(sol.removeInvalidParentheses("()())()"))  # ['()()()', '(())()']
print(sol.removeInvalidParentheses("(a)())()"))  # ['(a)()()', '(a())()']
print(sol.removeInvalidParentheses(")("))        # ['']
