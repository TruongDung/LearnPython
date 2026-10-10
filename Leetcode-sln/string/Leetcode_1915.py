class Solution:
    def wonderfulSubstrings(self, word: str) -> int:
        frequency = [0] * (1 << 10)
        frequency[0] = 1

        mask = 0
        answer = 0

        for char in word:
            mask ^= 1 << (ord(char) - ord("a"))

            answer += frequency[mask]

            for bit in range(10):
                answer += frequency[mask ^ (1 << bit)]

            frequency[mask] += 1

        return answer
