from collections import Counter


class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        if len(s1) > len(s2):
            return False
        need = Counter(s1)
        window = {}
        left = 0
        for right, ch in enumerate(s2):
            window[ch] = window.get(ch, 0) + 1
            if right - left + 1 > len(s1):
                outgoing = s2[left]
                window[outgoing] -= 1
                if window[outgoing] == 0:
                    del window[outgoing]
                left += 1
            if right - left + 1 == len(s1) and window == need:
                return True
        return False


if __name__ == '__main__':
    print(Solution().checkInclusion('ab', 'eidbaooo'))
    print(Solution().checkInclusion('ab', 'eidboaoo'))
