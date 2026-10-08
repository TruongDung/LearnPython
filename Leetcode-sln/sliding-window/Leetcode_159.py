class Solution:
    def lengthOfLongestSubstringTwoDistinct(self, s: str) -> int:
        freq = {}
        left = 0
        answer = 0
        for right, ch in enumerate(s):
            freq[ch] = freq.get(ch, 0) + 1
            while len(freq) > 2:
                freq[s[left]] -= 1
                if freq[s[left]] == 0:
                    del freq[s[left]]
                left += 1
            answer = max(answer, right - left + 1)
        return answer


if __name__ == '__main__':
    print(Solution().lengthOfLongestSubstringTwoDistinct('eceba'))
    print(Solution().lengthOfLongestSubstringTwoDistinct('ccaabbb'))
