from typing import List


class Solution:
    def maxNumOfSubstrings(self, s: str) -> List[str]:
        n = len(s)

        first = {}
        last = {}

        for i, ch in enumerate(s):
            if ch not in first:
                first[ch] = i
            last[ch] = i

        intervals = []

        for ch in first:
            start = first[ch]
            end = last[ch]

            i = start
            valid = True

            while i <= end:
                c = s[i]

                if first[c] < start:
                    valid = False
                    break

                end = max(end, last[c])

                i += 1

            if valid:
                intervals.append((start, end))

        intervals.sort(key=lambda x: x[1])

        result = []
        prev_end = -1

        for start, end in intervals:
            if start > prev_end:
                result.append(s[start:end + 1])
                prev_end = end

        return result
