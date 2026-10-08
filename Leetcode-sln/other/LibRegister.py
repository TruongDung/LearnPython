from collections import defaultdict


class Library:
    def __init__(self):
        self.resgistrations = defaultdict(str)
    def Register(self, name, val):
        self.resgistrations[name] = val
    def Evaluate(self, template):
        res = []
        inside = False
        for char in template:
            if char == "%":
                # open
                inside = True

                
            else: # having %
                pass
        return ''.join(res)

sol = Library()
sol.Register("NAME", "dv")
sol.Register("DATE","1/1/1990")
print(sol.Evaluate("Hello %NAME%, %DATE%"))
