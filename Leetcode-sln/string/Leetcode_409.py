class Solution:
    def longestPalindrome(self, s: str) -> int:
        count = {}
        for ch in s:
            count[ch] = count.get(ch, 0) + 1
        length, has_odd = 0, False
        for ch in sorted(count):
            pairs = count[ch] // 2
            length += pairs * 2
            if count[ch] % 2:
                has_odd = True
        return length + int(has_odd)


if __name__ == '__main__':
    solution = Solution()
    print(solution.longestPalindrome('abccccdd'))
    print(solution.longestPalindrome('a'))
    print(solution.longestPalindrome('Aa'))
