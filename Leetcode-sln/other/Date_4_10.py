from collections import defaultdict


class Library:
    def __init__(self):
        self.resgistrations = defaultdict(str)
    def Register(self, a, b):
        self.resgistrations[a] = b
    def Evaluate(self, s):
        res = []

        whole_word = s.split(' ')
        for word in whole_word:
            if word.startswith('%') and word.endwith('%'):
                res.append(self.resgistrations[word[1:-1]])
            else:
                res.append(word)

        return ' '.join(res)

sol = Library()
sol.__init__()
sol.Register("a","%b%")
print(sol.Evaluate("aaaa bbb ccc ddd eee %b% "))