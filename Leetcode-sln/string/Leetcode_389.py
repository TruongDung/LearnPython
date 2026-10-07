class Solution:
    def findTheDifference(self, s: str, t: str) -> str:
        count = {}
        for ch in s:
            count[ch] = count.get(ch, 0) + 1
        for ch in t:
            if count.get(ch, 0) == 0:
                return ch
            count[ch] -= 1


if __name__ == '__main__':
    solution = Solution()
    print(solution.findTheDifference('abcd', 'abcde'))
    print(solution.findTheDifference('', 'y'))
    print(solution.findTheDifference('a', 'aa'))
