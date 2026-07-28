class Logger:
    def __init__(self):
        # message -> earliest timestamp it may be printed again
        self.last_printed = {}

    def shouldPrintMessage(self, timestamp: int, message: str) -> bool:
        if message not in self.last_printed or timestamp >= self.last_printed[message]:
            self.last_printed[message] = timestamp + 10
            return True
        return False


logger = Logger()
print(logger.shouldPrintMessage(1, "foo"))   # True
print(logger.shouldPrintMessage(2, "bar"))   # True
print(logger.shouldPrintMessage(3, "foo"))   # False (within 10s)
print(logger.shouldPrintMessage(8, "bar"))   # False
print(logger.shouldPrintMessage(10, "foo"))  # False
print(logger.shouldPrintMessage(11, "foo"))  # True (10s passed)
