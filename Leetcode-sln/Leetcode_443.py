from typing import List


class Solution:
    def compress(self, chars: List[str]) -> int:
        write = 0   # position to write next
        read = 0    # position to read from
        n = len(chars)

        while read < n:
            ch = chars[read]
            count = 0
            # Count the run of identical characters
            while read < n and chars[read] == ch:
                read += 1
                count += 1

            # Write the character
            chars[write] = ch
            write += 1

            # Write the count (as digits) only if > 1
            if count > 1:
                for digit in str(count):
                    chars[write] = digit
                    write += 1

        return write


sol = Solution()
a = ["a", "a", "b", "b", "c", "c", "c"]
length = sol.compress(a)
print(length, a[:length])  # 6 ['a','2','b','2','c','3']
b = ["a"]
print(sol.compress(b), b)  # 1 ['a']
c = ["a", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b"]
length = sol.compress(c)
print(length, c[:length])  # 4 ['a','b','1','2']
