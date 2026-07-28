from collections import defaultdict
from typing import List


class AutocompleteSystem:
    def __init__(self, sentences: List[str], times: List[int]):
        self.counts = defaultdict(int)
        for sentence, time in zip(sentences, times):
            self.counts[sentence] += time
        self.prefix = ""

    def input(self, c: str) -> List[str]:
        if c == '#':
            # End of a sentence: store it and reset prefix
            self.counts[self.prefix] += 1
            self.prefix = ""
            return []

        self.prefix += c

        # Find all sentences matching the current prefix
        matches = [
            (sentence, count)
            for sentence, count in self.counts.items()
            if sentence.startswith(self.prefix)
        ]

        # Sort by count desc, then lexicographically asc; return top 3
        matches.sort(key=lambda x: (-x[1], x[0]))
        return [sentence for sentence, _ in matches[:3]]


system = AutocompleteSystem(
    ["i love you", "island", "iroman", "i love leetcode"],
    [5, 3, 2, 2],
)
print(system.input('i'))  # ['i love you', 'island', 'i love leetcode']
print(system.input(' '))  # ['i love you', 'i love leetcode']
print(system.input('a'))  # []
print(system.input('#'))  # []
