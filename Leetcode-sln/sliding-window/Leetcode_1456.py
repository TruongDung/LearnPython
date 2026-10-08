class Solution:
    def maxVowels(self, s: str, k: int) -> int:
        count = answer = 0
        for right, ch in enumerate(s):
            if ch in 'aeiou':
                count += 1
            if right >= k and s[right - k] in 'aeiou':
                count -= 1
            if right >= k - 1:
                answer = max(answer, count)
        return answer


if __name__ == '__main__':
    print(Solution().maxVowels('abciiidef', 3))
