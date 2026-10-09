from collections import defaultdict


class Library:
    def __init__(self):
        self.resgistrations = {}
    def Register(self, name, val):
        self.resgistrations[name] = val
    def Evaluate(self, template):
        visited = set()
        def dfs(s, visited):
            res = []
            variable = []
            inside = False
            for char in s:
                if char == "%":
                    if inside: #close
                        name = ''.join(variable)

                        if name in visited:
                            raise ValueError("Cycle detected")

                        visited.add(name)
                        res.append(dfs(self.resgistrations.get(name,""), visited))

                        visited.remove(name)

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
        return dfs(template, visited)

sol = Library()
sol.Register("NAME", "NAME")
sol.Register("DATE","DATE")
print(sol.Evaluate("Hello %NAME%, %DATE%"))
