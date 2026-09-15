from collections import defaultdict
from typing import DefaultDict, List, Set


class Solution:
    def findLadders(
        self, beginWord: str, endWord: str, wordList: List[str]
    ) -> List[List[str]]:
        word_set = set(wordList)
        if endWord not in word_set:
            return []

        parents: DefaultDict[str, Set[str]] = defaultdict(set)
        layer = {beginWord}
        found = False

        while layer and not found:
            word_set -= layer
            next_layer = set()

            for word in layer:
                for index in range(len(word)):
                    for letter in "abcdefghijklmnopqrstuvwxyz":
                        new_word = word[:index] + letter + word[index + 1 :]
                        if new_word in word_set:
                            next_layer.add(new_word)
                            parents[new_word].add(word)
                            if new_word == endWord:
                                found = True

            layer = next_layer

        if not found:
            return []

        result = []

        def dfs(word: str, path: List[str]) -> None:
            if word == beginWord:
                result.append(list(reversed(path)))
                return

            for parent in parents[word]:
                path.append(parent)
                dfs(parent, path)
                path.pop()

        dfs(endWord, [endWord])
        return result


if __name__ == "__main__":
    solution = Solution()
    paths = solution.findLadders(
        "hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]
    )
    assert sorted(paths) == sorted(
        [
            ["hit", "hot", "dot", "dog", "cog"],
            ["hit", "hot", "lot", "log", "cog"],
        ]
    )
    assert solution.findLadders("hit", "cog", ["hot", "dot", "dog"]) == []
