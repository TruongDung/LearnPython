class Solution:
    def arrayStringsAreEqual(self, word1, word2) -> bool:
        s1 = ''.join(word1)
        s2 = ''.join(word2)
        if len(s1) != len(s2):
            return False
        for i, ch in enumerate(s1):
            if ch != s2[i]:
                return False
        return True


if __name__ == '__main__':
    solution = Solution()
    print(solution.arrayStringsAreEqual(['ab', 'c'], ['a', 'bc']))
    print(solution.arrayStringsAreEqual(['a', 'cb'], ['ab', 'c']))
    print(solution.arrayStringsAreEqual(['abc', 'd', 'defg'], ['abcddefg']))
