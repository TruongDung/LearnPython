from collections import defaultdict, OrderedDict


class LFUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.min_freq = 0
        self.key_to_val = {}                       # key -> value
        self.key_to_freq = {}                      # key -> frequency
        self.freq_to_keys = defaultdict(OrderedDict)  # freq -> {key: None} (LRU order)

    def _touch(self, key: int) -> None:
        # Move key to the next frequency bucket
        freq = self.key_to_freq[key]
        del self.freq_to_keys[freq][key]

        if not self.freq_to_keys[freq]:
            del self.freq_to_keys[freq]
            if self.min_freq == freq:
                self.min_freq += 1

        self.key_to_freq[key] = freq + 1
        self.freq_to_keys[freq + 1][key] = None

    def get(self, key: int) -> int:
        if key not in self.key_to_val:
            return -1
        self._touch(key)
        return self.key_to_val[key]

    def put(self, key: int, value: int) -> None:
        if self.capacity == 0:
            return

        if key in self.key_to_val:
            self.key_to_val[key] = value
            self._touch(key)
            return

        # Evict least-frequently-used (and least-recently-used on tie)
        if len(self.key_to_val) >= self.capacity:
            evict_key, _ = self.freq_to_keys[self.min_freq].popitem(last=False)
            del self.key_to_val[evict_key]
            del self.key_to_freq[evict_key]

        self.key_to_val[key] = value
        self.key_to_freq[key] = 1
        self.freq_to_keys[1][key] = None
        self.min_freq = 1


cache = LFUCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))  # 1
cache.put(3, 3)      # evicts key 2
print(cache.get(2))  # -1
print(cache.get(3))  # 3
