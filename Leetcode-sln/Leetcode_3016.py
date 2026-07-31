from collections import Counter


class Solution:
    def minimumPushes(self, word: str) -> int:
        # Count frequency of each character
        freq = Counter(word)

        # Sort frequencies in descending order (greedy: assign most frequent first)
        frequencies = sorted(freq.values(), reverse=True)

        total_pushes = 0
        for i, count in enumerate(frequencies):
            # Position on the key: 1st-8th letters = 1 push, 9th-16th = 2 pushes, etc.
            position = (i // 8) + 1
            total_pushes += count * position

        return total_pushes


sol = Solution()
print(sol.minimumPushes("abcde"))        # 5  (each letter 1 push)
print(sol.minimumPushes("xyzxyzxyzxyz")) # 12 (x,y,z each appear 4 times, 1 push each)
print(sol.minimumPushes("aabbccddeeffgghhiiiiii"))  # 24
