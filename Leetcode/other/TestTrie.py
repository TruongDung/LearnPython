class MapSum:

    def __init__(self):
        self.hash_map = {}

    def insert(self, key: str, val: int) -> None:
        self.hash_map[key] = val

    def sum(self, prefix: str) -> int:
        total = 0
        for k in self.hash_map:
            if len(prefix) <= len(k) and k[:len(prefix)] == prefix:
                total += self.hash_map[k]
        return total
    

mapSum = MapSum()
mapSum.insert("apple", 3)
print(mapSum.sum("app"))