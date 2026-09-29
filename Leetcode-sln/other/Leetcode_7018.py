class ServerAllocator:
    def __init__(self, existingCategory):
        self.used = {}
        self.free = {}
        self.next_id = {}

    def allocate(self, server_type):
        # Return a placeholder implementation
        return f"{server_type}1"