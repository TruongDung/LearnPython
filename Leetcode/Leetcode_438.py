class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        need = Counter(p)
        window = Counter()


        res = []
        left = 0
        k = len(p)

        for right in range(len(s)):
            window[s[right]] += 1

            if right - left + 1> k:
                window[s[left]] -= 1
                if window[s[left]] == 0:
                    def window[s[left]]
                left += 1

            if right - left + 1 == k and window == need:
                res.append(left)


        return res