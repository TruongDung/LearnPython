from collections import defaultdict


class Library:
    def __init__(self):
        self.resgistrations = {}
    def Register(self, name, val):
        self.resgistrations[name] = val
    def Evaluate(self, template):
        res = []
        variable = []
        inside = False
        for char in template:
            if char == "%":
                if inside: #close 
                    name = ''.join(variable)
                    res.append(self.resgistrations.get(name,""))
                    variable = []
                    inside = False
                else: #open
                    inside = True
            else:
                if inside: 
                    variable.append(char)
                else:
                    res.append(char)
        return ''.join(res)

sol = Library()
sol.Register("NAME", "NAME")
sol.Register("DATE","DATE")
print(sol.Evaluate("Hello %NAME%, %DATE%"))
