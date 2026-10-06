class Solution:
    def reverseWords(self, s: str) -> str:
        chars = list(s)
        start = 0
        for end in range(len(chars) + 1):
            if end == len(chars) or chars[end] == ' ':
                left, right = start, end - 1
                while left < right:
                    chars[left], chars[right] = chars[right], chars[left]
                    left += 1
                    right -= 1
                start = end + 1
        return ''.join(chars)


if __name__ == '__main__':
    solution = Solution()
    print(solution.reverseWords("Let's take LeetCode contest"))
    print(solution.reverseWords('Mr Ding'))
