from collections import defaultdict
import heapq

class YT:
    def __init__(self, k):
        self.k = k
        self.videos = defaultdict(int)

    def records(self, video_id):
        self.videos[video_id] += 1

        min_heap = []

        for id, score in self.videos.items():
            heapq.heappush(min_heap,(score, id))

            if len(min_heap) > self.k:
                heapq.heappop(min_heap)

        res = []
        while min_heap:
            score, id = heapq.heappop(min_heap)
            res.append(id)

        return reversed(res)
