class ServerAllocator:
    def __init__(self, existingCategory):
        self.init(existingCategory)

    def init(self, existingCategory):
        self.used = {}
        self.free = {}
        self.next_id = {}

    def allocate(self, server_type):
        