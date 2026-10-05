class Solution:
    def toLowerCase(self, s: str) -> str:
        result = []
        for i, ch in enumerate(s):
            if 'A' <= ch <= 'Z':
                ch = chr(ord(ch) + 32)
            result.append(ch)
        return ''.join(result)


if __name__ == '__main__':
    solution = Solution()
    print(solution.toLowerCase('Hello'))
    print(solution.toLowerCase('here'))
    print(solution.toLowerCase('LOVELY'))
