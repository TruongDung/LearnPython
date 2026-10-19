class TrieNode:
    def __init__(self):
        self.children = {}
        self.total = 0

class FileSizeIndex:
    def __init__(self, files):
        self.root = TrieNode()
        for size, path in files:
            node = self.root
            node.total += size
            for part in path[5:].split('/'):
                node = node.children.setdefault(part, TrieNode())
                node.total += size

    def calculate_size(self, path):
        node = self.root
        for part in path.rstrip('/')[5:].split('/'):
            node = node.children.get(part)
            if node is None:
                return 0
        return node.total

class Solution:
    def calculateSizes(self, files, queries):
        index = FileSizeIndex(files)
        return [index.calculate_size(path) for path in queries]

sol = Solution()
files = [2400,"fo://acme-assets.example.com/training/onboarding.mp4"],[800,"fo://acme-assets.example.com/training/intro_clip.mp4"],[350,"fo://acme-assets.example.com/podcasts/welcome.mp3"]
quer = ["fo://acme-assets.example.com/training","fo://acme-assets.example.com/podcasts/welcome.mp3","fo://acme-assets.example.com","fo://acme-assets.example.com/unavailable"]
sol.calculateSizes(files, quer)
