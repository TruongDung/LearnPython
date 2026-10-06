class Solution:
    def reverseStr(self, s: str, k: int) -> str:
        chars = list(s)
        for start in range(0, len(chars), 2 * k):
            left = start
            right = min(start + k, len(chars)) - 1
            while left < right:
                chars[left], chars[right] = chars[right], chars[left]
                left += 1
                right -= 1
        return ''.join(chars)


if __name__ == '__main__':
    solution = Solution()
    print(solution.reverseStr('abcdefg', 2))
    print(solution.reverseStr('abcd', 2))
