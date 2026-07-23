from typing import List
from collections import Counter
import heapq

class Solution:
    def topKFrequent(self, words, k):
        freq = Counter(words)
        heap = []
        for word, count in freq.items():
            heapq.heappush(heap, (-count, word))
        result = []
        for _ in range(k):
            count, word = heapq.heappop(heap)
            result.append(word)
        return result

sol = Solution()
words = ["i", "love", "leetcode", "i", "love", "coding"]
k = 2
print(sol.topKFrequent(words, k)) 