class Solution:
    def maxSubstringLength(self, s: str, k: int) -> bool:
        if k == 0:
            return True

        n = len(s)
        first = {}
        last = {}
        for i, ch in enumerate(s):
            if ch not in first:
                first[ch] = i
            last[ch] = i

        # Build every minimal "special" interval that starts at a char's first occurrence
        intervals = []
        for i in range(n):
            if first[s[i]] != i:
                continue  # only start where a character first appears

            j = last[s[i]]
            t = i
            valid = True
            while t <= j:
                # A char inside must not appear before the window start
                if first[s[t]] < i:
                    valid = False
                    break
                j = max(j, last[s[t]])
                t += 1

            # A special substring cannot be the whole string
            if valid and not (i == 0 and j == n - 1):
                intervals.append((j, i))  # (end, start)

        # Greedy: max number of non-overlapping intervals (sort by end)
        intervals.sort()
        count = 0
        prev_end = -1
        for end, start in intervals:
            if start > prev_end:
                count += 1
                prev_end = end

        return count >= k


sol = Solution()
print(sol.maxSubstringLength("abcdbaefab", 2))  # True
print(sol.maxSubstringLength("cdefdc", 3))      # False
print(sol.maxSubstringLength("abababa", 1))     # False
