from typing import List


class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        # Build a trie of all words
        trie = {}
        for word in words:
            node = trie
            for ch in word:
                node = node.setdefault(ch, {})
            node['$'] = word  # mark end of word, store the full word

        rows, cols = len(board), len(board[0])
        result = []

        def dfs(r: int, c: int, node: dict) -> None:
            ch = board[r][c]
            if ch not in node:
                return

            nxt = node[ch]
            word = nxt.get('$')
            if word is not None:
                result.append(word)
                del nxt['$']  # avoid adding duplicates

            board[r][c] = '#'  # mark visited
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != '#':
                    dfs(nr, nc, nxt)
            board[r][c] = ch  # restore

        for r in range(rows):
            for c in range(cols):
                dfs(r, c, trie)

        return result


sol = Solution()
board = [
    ["o", "a", "a", "n"],
    ["e", "t", "a", "e"],
    ["i", "h", "k", "r"],
    ["i", "f", "l", "v"],
]
print(sol.findWords(board, ["oath", "pea", "eat", "rain"]))  # ['oath', 'eat']
