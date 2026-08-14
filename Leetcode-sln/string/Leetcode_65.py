class Solution:
    def isNumber(self, s: str) -> bool:
        # Deterministic finite automaton (DFA) states
        # Each state maps an input group -> next state
        states = [
            {"space": 0, "sign": 1, "digit": 2, "dot": 3},          # 0: start
            {"digit": 2, "dot": 3},                                   # 1: after sign
            {"digit": 2, "dot": 4, "e": 5, "space": 8},              # 2: integer digits
            {"digit": 4},                                             # 3: dot (no int digits yet)
            {"digit": 4, "e": 5, "space": 8},                        # 4: digits after dot
            {"sign": 6, "digit": 7},                                  # 5: after 'e'/'E'
            {"digit": 7},                                             # 6: sign in exponent
            {"digit": 7, "space": 8},                                # 7: exponent digits
            {"space": 8},                                            # 8: trailing spaces
        ]
        accepting = {2, 4, 7, 8}

        def group(ch: str) -> str:
            if ch == " ":
                return "space"
            if ch in "+-":
                return "sign"
            if ch.isdigit():
                return "digit"
            if ch == ".":
                return "dot"
            if ch in "eE":
                return "e"
            return "invalid"

        state = 0
        for ch in s:
            g = group(ch)
            if g == "invalid" or g not in states[state]:
                return False
            state = states[state][g]

        return state in accepting


sol = Solution()
print(sol.isNumber("0"))         # True
print(sol.isNumber("e"))         # False
print(sol.isNumber("."))         # False
print(sol.isNumber("-90E3"))     # True
print(sol.isNumber("1e"))        # False
print(sol.isNumber("2e10"))      # True
print(sol.isNumber("53.5e93"))   # True
print(sol.isNumber("abc"))       # False
