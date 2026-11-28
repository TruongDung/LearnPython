"use strict";
const { define } = require("./catalog-lesson");
const {attachArithmeticReplay}=require('./sequence-picture-replays');
const lessons={};
const add=(id,title,group,sample,expected,source,options={})=>lessons[id]=define(id,title,group,sample,expected,source,options);
add(400,"Nth Digit","math",[11],0,`
class Solution:
    def findNthDigit(self, n):
        assert n >= 1
        digits, count, start = 1, 9, 1
        while n > digits * count:
            n -= digits * count
            digits += 1
            count *= 10
            start *= 10
        number = start + (n - 1) // digits
        index = (n - 1) % digits
        return int(str(number)[index])
`,{time:"O(log n)",space:"O(log n)",description:"Skip complete blocks of one-, two-, three-digit numbers, then locate the exact number and digit."});
add(405,"Convert a Number to Hexadecimal","bits",[-1],"ffffffff",`
class Solution:
    def toHex(self, num):
        assert -(2**31) <= num < 2**31
        num &= 0xffffffff
        if num == 0:
            return '0'
        digits, answer = '0123456789abcdef', []
        while num:
            answer.append(digits[num & 15])
            num >>= 4
        return ''.join(reversed(answer))
`,{time:"O(8)",space:"O(8)",difficulty:"easy",description:"Mask to the signed 32-bit two's-complement representation and extract four-bit hexadecimal digits."});
add(408,"Valid Word Abbreviation","string",["internationalization","i12iz4n"],true,`
class Solution:
    def validWordAbbreviation(self, word, abbr):
        i = j = 0
        while i < len(word) and j < len(abbr):
            if abbr[j].isdigit():
                if abbr[j] == '0':
                    return False
                count = 0
                while j < len(abbr) and abbr[j].isdigit():
                    count = count * 10 + int(abbr[j])
                    j += 1
                i += count
            else:
                if word[i] != abbr[j]:
                    return False
                i += 1
                j += 1
        return i == len(word) and j == len(abbr)
`,{time:"O(n+m)",space:"O(1)",difficulty:"easy",description:"Two cursors match literal letters and numeric skips; leading-zero skip counts are invalid."});
add(411,"Minimum Unique Word Abbreviation","bits",["apple",["blade"]],"a4",`
class Solution:
    def minAbbreviation(self, target, dictionary):
        n = len(target)
        assert 1 <= n <= 10
        differences = []
        for word in dictionary:
            if len(word) == n:
                mask = sum(1 << i for i in range(n) if target[i] != word[i])
                assert mask, 'Dictionary must not contain target'
                differences.append(mask)
        best, best_cost = '', n + 1
        for keep in range(1 << n):
            if any(keep & difference == 0 for difference in differences):
                continue
            parts, count, cost = [], 0, 0
            for i, ch in enumerate(target):
                if keep >> i & 1:
                    if count:
                        parts.append(str(count))
                        cost += 1
                        count = 0
                    parts.append(ch)
                    cost += 1
                else:
                    count += 1
            if count:
                parts.append(str(count))
                cost += 1
            if cost < best_cost:
                best, best_cost = ''.join(parts), cost
        return best
`,{time:"O(2ⁿ·(n+d))",space:"O(n+d)",difficulty:"hard",description:"A kept-letter mask must intersect every dictionary difference mask. Minimize letters plus abbreviated runs (each numeric run counts as one). Visual target length ≤10."});
add(412,"Fizz Buzz","math",[5],["1","2","Fizz","4","Buzz"],`
class Solution:
    def fizzBuzz(self, n):
        assert 1 <= n <= 80
        answer = []
        for value in range(1, n + 1):
            word = ''
            if value % 3 == 0:
                word += 'Fizz'
            if value % 5 == 0:
                word += 'Buzz'
            answer.append(word or str(value))
        return answer
`,{time:"O(n)",space:"O(n) output",difficulty:"easy",description:"Append Fizz for multiples of three and Buzz for multiples of five; combine both rules when applicable."});
add(413,"Arithmetic Slices","dp",[[1,2,3,4]],3,`
class Solution:
    def numberOfArithmeticSlices(self, nums):
        ending = answer = 0
        for i in range(2, len(nums)):
            if nums[i] - nums[i - 1] == nums[i - 1] - nums[i - 2]:
                ending += 1
            else:
                ending = 0
            answer += ending
        return answer
`,{time:"O(n)",space:"O(1)",engine:'wasm',teaching:{mode:'guided',scene:{compact:true,debug:true,kind:'arithmetic-slices'}},guideVi:'Hai hiệu liên tiếp bằng nhau: thêm một đoạn mới và nối dài các đoạn trước; ending đếm các đoạn kết thúc tại i.',guide:'Equal adjacent differences create one new slice and extend previous ones; ending counts slices finishing at i.',description:"Count arithmetic subarrays of length at least three ending at each position; equal differences extend every previous slice."});
attachArithmeticReplay(lessons[413]);
add(414,"Third Maximum Number","array",[[2,2,3,1]],1,`
class Solution:
    def thirdMax(self, nums):
        assert nums
        top = set()
        for value in nums:
            top.add(value)
            if len(top) > 3:
                top.remove(min(top))
        return min(top) if len(top) == 3 else max(top)
`,{time:"O(n)",space:"O(1)",difficulty:"easy",description:"Keep at most three distinct maxima; return the third if present, otherwise the largest."});
add(415,"Add Strings","string",["456","77"],"533",`
class Solution:
    def addStrings(self, num1, num2):
        assert num1.isdigit() and num2.isdigit()
        i, j, carry = len(num1) - 1, len(num2) - 1, 0
        output = []
        while i >= 0 or j >= 0 or carry:
            a = ord(num1[i]) - ord('0') if i >= 0 else 0
            b = ord(num2[j]) - ord('0') if j >= 0 else 0
            carry, digit = divmod(a + b + carry, 10)
            output.append(str(digit))
            i -= 1
            j -= 1
        return ''.join(reversed(output))
`,{time:"O(n+m)",space:"O(n+m)",difficulty:"easy",description:"Add decimal digits from right to left while carrying; never convert the entire input strings to numbers."});
add(420,"Strong Password Checker","greedy",["aA1"],3,`
class Solution:
    def strongPasswordChecker(self, password):
        n = len(password)
        missing = int(not any(c.islower() for c in password)) + int(not any(c.isupper() for c in password)) + int(not any(c.isdigit() for c in password))
        runs, i = [], 0
        while i < n:
            j = i
            while j < n and password[j] == password[i]:
                j += 1
            if j - i >= 3:
                runs.append(j - i)
            i = j
        replacements = sum(length // 3 for length in runs)
        if n < 6:
            return max(missing, 6 - n)
        if n <= 20:
            return max(missing, replacements)
        deletions = n - 20
        remaining = deletions
        use = min(remaining, sum(length % 3 == 0 for length in runs))
        replacements -= use
        remaining -= use
        use = min(remaining, 2 * sum(length % 3 == 1 for length in runs))
        replacements -= use // 2
        remaining -= use
        replacements -= remaining // 3
        return deletions + max(missing, replacements, 0)
`,{time:"O(n)",space:"O(n)",difficulty:"hard",description:"Combine missing character types, length corrections and repeating runs. For overlong passwords, prioritize deletions by run length modulo three."});
add(421,"Maximum XOR of Two Numbers in an Array","bits",[[3,10,5,25,2,8]],28,`
class Solution:
    def findMaximumXOR(self, nums):
        assert all(0 <= v < 2**31 for v in nums)
        answer = mask = 0
        for bit in range(30, -1, -1):
            mask |= 1 << bit
            prefixes = {value & mask for value in nums}
            candidate = answer | (1 << bit)
            if any(candidate ^ prefix in prefixes for prefix in prefixes):
                answer = candidate
        return answer
`,{time:"O(31n)",space:"O(n)",description:"Build the XOR answer from its highest bit; a candidate works if two masked prefixes XOR to it."});
add(423,"Reconstruct Original Digits from English","string",["owoztneoer"],"012",`
class Solution:
    def originalDigits(self, s):
        from collections import Counter
        counts, digits = Counter(s), [0] * 10
        for value, unique, word in [(0,'z','zero'),(2,'w','two'),(4,'u','four'),(6,'x','six'),(8,'g','eight'),(3,'h','three'),(5,'f','five'),(7,'s','seven'),(1,'o','one'),(9,'i','nine')]:
            amount = counts[unique]
            assert amount >= 0
            digits[value] = amount
            for ch in word:
                counts[ch] -= amount
        assert all(count == 0 for count in counts.values()), 'Input must be a valid digit-word anagram'
        return ''.join(str(i) * digits[i] for i in range(10))
`,{time:"O(n)",space:"O(alphabet)",description:"Decode digits with unique identifying letters first, subtracting their letter counts before resolving the remaining digits."});
add(425,"Word Squares","backtracking",[["area","lead","wall","lady","ball"]],[["wall","area","lead","lady"],["ball","area","lead","lady"]],`
class Solution:
    def wordSquares(self, words):
        from collections import defaultdict
        assert words and len(words) <= 12
        n = len(words[0])
        assert 1 <= n <= 5 and all(len(word) == n for word in words)
        prefixes = defaultdict(list)
        for word in words:
            for end in range(n + 1):
                prefixes[word[:end]].append(word)
        answer = []
        def dfs(square):
            row = len(square)
            if row == n:
                answer.append(square[:])
                return
            prefix = ''.join(word[row] for word in square)
            for word in prefixes[prefix]:
                square.append(word)
                dfs(square)
                square.pop()
        dfs([])
        return answer
`,{time:"O(wordsⁿ·n) upper bound",space:"O(words·n² + output)",difficulty:"hard",description:"Each new row must start with the prefix already forced by its column. Use a prefix index to prune the search."});
add(427,"Construct Quad Tree","tree",[[[1,1],[1,1]]],{val:true,isLeaf:true},`
class Solution:
    def construct(self, grid):
        n = len(grid)
        assert 1 <= n <= 8 and n & (n - 1) == 0 and all(len(row) == n and set(row) <= {0,1} for row in grid)
        def build(r, c, size):
            value = grid[r][c]
            uniform = all(grid[i][j] == value for i in range(r,r+size) for j in range(c,c+size))
            if uniform:
                return dict(val=bool(value), isLeaf=True)
            half = size // 2
            return dict(val=True, isLeaf=False, topLeft=build(r,c,half), topRight=build(r,c+half,half), bottomLeft=build(r+half,c,half), bottomRight=build(r+half,c+half,half))
        return build(0, 0, n)
`,{time:"O(n² log n)",space:"O(n²) output",description:"Uniform squares become leaves; mixed squares split into four equal quadrants. Output names each quadrant explicitly. Visual side ≤8."});
add(428,"Serialize and Deserialize N-ary Tree","tree",[[1,[[3,[[5,[]],[6,[]]]],[2,[]],[4,[]]]]],{serialized:"1 3 3 2 5 0 6 0 2 0 4 0",decoded:[1,[[3,[[5,[]],[6,[]]]],[2,[]],[4,[]]]]},`
class Solution:
    def roundTrip(self, tree):
        if tree is None:
            return dict(serialized='', decoded=None)
        tokens = []
        def encode(node):
            value, children = node
            tokens.extend([str(value), str(len(children))])
            for child in children:
                encode(child)
        encode(tree)
        serialized = ' '.join(tokens)
        cursor = iter(serialized.split())
        def decode():
            value, count = int(next(cursor)), int(next(cursor))
            children = []
            for _ in range(count):
                children.append(decode())
            return [value, children]
        return dict(serialized=serialized, decoded=decode())
`,{time:"O(n)",space:"O(n)",difficulty:"hard",description:"N-ary nodes use [value, children] JSON form. Preorder records each value and child count so deserialization knows exactly how many children to read."});
add(431,"Encode N-ary Tree to Binary Tree","tree",[[1,[[2,[]],[3,[]],[4,[]]]]],{binary:[1,2,null,null,3,null,4],decoded:[1,[[2,[]],[3,[]],[4,[]]]]},`
class Solution:
    def roundTrip(self, tree):
        if tree is None:
            return dict(binary=[], decoded=None)
        def encode(node):
            value, children = node
            root, previous = TreeNode(value), None
            for child in children:
                encoded = encode(child)
                if previous is None:
                    root.left = encoded
                else:
                    previous.right = encoded
                previous = encoded
            return root
        def decode(node):
            children = []
            child = node.left
            while child:
                children.append(decode(child))
                child = child.right
            return [node.val, children]
        binary = encode(tree)
        queue, values = [binary], []
        for node in queue:
            values.append(node.val if node else None)
            if node:
                queue.extend([node.left, node.right])
        while values and values[-1] is None:
            values.pop()
        return dict(binary=values, decoded=decode(binary))
`,{time:"O(n)",space:"O(n)",difficulty:"hard",description:"Encode the first child on a left link and each next sibling on a right link; decode the representation back to [value, children]."});
add(433,"Minimum Genetic Mutation","graph",["AACCGGTT","AACCGGTA",["AACCGGTA"]],1,`
class Solution:
    def minMutation(self, startGene, endGene, bank):
        from collections import deque
        allowed = set(bank)
        queue, seen = deque([(startGene,0)]), {startGene}
        while queue:
            gene, distance = queue.popleft()
            if gene == endGene:
                return distance
            for i in range(len(gene)):
                for ch in 'ACGT':
                    following = gene[:i] + ch + gene[i+1:]
                    if following in allowed and following not in seen:
                        seen.add(following)
                        queue.append((following, distance + 1))
        return -1
`,{time:"O(bank·gene_length²)",space:"O(bank·gene_length)",description:"BFS changes one nucleotide at a time, visiting only valid bank genes; the first target visit gives the shortest mutation count."});
add(434,"Number of Segments in a String","string",["Hello, my name is John"],5,`
class Solution:
    def countSegments(self, s):
        answer = 0
        for i, ch in enumerate(s):
            if ch != ' ' and (i == 0 or s[i - 1] == ' '):
                answer += 1
        return answer
`,{time:"O(n)",space:"O(1)",difficulty:"easy",description:"Count transitions from an ASCII space (or the start) to a non-space character."});
add(439,"Ternary Expression Parser","string",["T?T?F:5:3"],"F",`
class Solution:
    def parseTernary(self, expression):
        stack = []
        for ch in reversed(expression):
            if stack and stack[-1] == '?':
                stack.pop()
                when_true = stack.pop()
                assert stack.pop() == ':'
                when_false = stack.pop()
                stack.append(when_true if ch == 'T' else when_false)
            else:
                stack.append(ch)
        assert len(stack) == 1
        return stack[0]
`,{time:"O(n)",space:"O(n)",description:"Scan right to left so nested ternaries, which associate to the right, collapse before their parent conditions."});
add(440,"K-th Smallest in Lexicographical Order","tree",[13,2],10,`
class Solution:
    def findKthNumber(self, n, k):
        assert 1 <= k <= n
        prefix = 1
        k -= 1
        while k:
            first, following, count = prefix, prefix + 1, 0
            while first <= n:
                count += min(n + 1, following) - first
                first *= 10
                following *= 10
            if count <= k:
                prefix += 1
                k -= count
            else:
                prefix *= 10
                k -= 1
        return prefix
`,{time:"O(log² n)",space:"O(1)",difficulty:"hard",description:"Count numbers under a decimal prefix; skip whole subtrees or descend one trie level to locate rank k."});
add(442,"Find All Duplicates in an Array","array",[[4,3,2,7,8,2,3,1]],[2,3],`
class Solution:
    def findDuplicates(self, nums):
        assert all(1 <= value <= len(nums) for value in nums)
        answer = []
        for i in range(len(nums)):
            value = abs(nums[i])
            index = value - 1
            if nums[index] < 0:
                answer.append(value)
            else:
                nums[index] = -nums[index]
        return answer
`,{time:"O(n)",space:"O(1) + output",description:"Values lie in [1,n] and appear once or twice. Use the sign at value−1 as a visited flag."});
add(445,"Add Two Numbers II","list",[[7,2,4,3],[5,6,4]],[7,8,0,7],`
class Solution:
    def addTwoNumbers(self, l1, l2):
        a, b = [], []
        while l1:
            a.append(l1.val)
            l1 = l1.next
        while l2:
            b.append(l2.val)
            l2 = l2.next
        carry, head = 0, None
        while a or b or carry:
            total = (a.pop() if a else 0) + (b.pop() if b else 0) + carry
            carry, digit = divmod(total, 10)
            head = ListNode(digit, head)
        return head
`,{kinds:["list","list"],answerKind:"list",time:"O(n+m)",space:"O(n+m)",description:"Stacks expose least-significant digits without reversing either input list; prepend each result digit."});
add(446,"Arithmetic Slices II - Subsequence","dp",[[2,4,6,8,10]],7,`
class Solution:
    def numberOfArithmeticSlices(self, nums):
        from collections import defaultdict
        dp = [defaultdict(int) for _ in nums]
        answer = 0
        for i in range(len(nums)):
            for j in range(i):
                difference = nums[i] - nums[j]
                count = dp[j][difference]
                answer += count
                dp[i][difference] += count + 1
        return answer
`,{time:"O(n²)",space:"O(n²)",difficulty:"hard",description:"dp[i][difference] counts length≥2 subsequences. Only extending an existing pair contributes a length≥3 answer."});
add(447,"Number of Boomerangs","math",[[[0,0],[1,0],[2,0]]],2,`
class Solution:
    def numberOfBoomerangs(self, points):
        answer = 0
        for i, (x, y) in enumerate(points):
            distances = {}
            for j, (a, b) in enumerate(points):
                if i != j:
                    distance = (x - a) ** 2 + (y - b) ** 2
                    distances[distance] = distances.get(distance, 0) + 1
            for count in distances.values():
                answer += count * (count - 1)
        return answer
`,{time:"O(n²)",space:"O(n)",description:"For each center, k points at the same squared distance form k·(k−1) ordered boomerangs."});
add(449,"Serialize and Deserialize BST","tree",[[2,1,3]],{serialized:"2,1,3",decoded:[2,1,3]},`
class Solution:
    def roundTrip(self, root):
        preorder = []
        def encode(node):
            if node:
                preorder.append(node.val)
                encode(node.left)
                encode(node.right)
        encode(root)
        index = 0
        def decode(lo, hi):
            nonlocal index
            if index == len(preorder) or not lo < preorder[index] < hi:
                return None
            node = TreeNode(preorder[index])
            index += 1
            node.left = decode(lo, node.val)
            node.right = decode(node.val, hi)
            return node
        rebuilt = decode(-float('inf'), float('inf'))
        assert index == len(preorder), 'Input must be a strict BST'
        queue, values = ([rebuilt] if rebuilt else []), []
        for node in queue:
            values.append(node.val if node else None)
            if node:
                queue.extend([node.left, node.right])
        while values and values[-1] is None:
            values.pop()
        return dict(serialized=','.join(map(str,preorder)), decoded=values)
`,{kinds:["tree"],time:"O(n)",space:"O(n)",description:"For distinct-key BSTs, preorder plus lower/upper bounds reconstructs the tree without null markers; output verifies the round trip."});
add(453,"Minimum Moves to Equal Array Elements","math",[[1,2,3]],3,`
class Solution:
    def minMoves(self, nums):
        assert nums
        minimum = min(nums)
        moves = 0
        for value in nums:
            moves += value - minimum
        return moves
`,{time:"O(n)",space:"O(1)",description:"Incrementing n−1 elements is equivalent, up to a uniform shift, to decrementing one element toward the minimum."});
add(455,"Assign Cookies","greedy",[[1,2,3],[1,1]],1,`
class Solution:
    def findContentChildren(self, g, s):
        g.sort()
        s.sort()
        child = 0
        for cookie in s:
            if child < len(g) and cookie >= g[child]:
                child += 1
        return child
`,{time:"O(n log n + m log m)",space:"O(n+m) Python sort",difficulty:"easy",description:"Give each smallest unserved greed requirement the smallest sufficient cookie."});
add(457,"Circular Array Loop","graph",[[2,-1,1,2,2]],true,`
class Solution:
    def circularArrayLoop(self, nums):
        n = len(nums)
        done = set()
        for start in range(n):
            if start in done:
                continue
            forward = nums[start] > 0
            path, current = {}, start
            while current not in done and nums[current] != 0 and (nums[current] > 0) == forward:
                if current in path:
                    return len(path) - path[current] > 1
                path[current] = len(path)
                following = (current + nums[current]) % n
                if following == current:
                    break
                current = following
            done.update(path)
        return False
`,{time:"O(n)",space:"O(n)",description:"Follow directed jumps modulo n, requiring one consistent sign and a cycle longer than one; mark completed paths to avoid repeated work."});
add(458,"Poor Pigs","math",[1000,15,60],5,`
class Solution:
    def poorPigs(self, buckets, minutesToDie, minutesToTest):
        assert buckets >= 1 and minutesToDie > 0 and minutesToTest >= 0
        if buckets == 1:
            return 0
        states = minutesToTest // minutesToDie + 1
        assert states > 1, 'No experiment can distinguish the buckets'
        pigs, capacity = 0, 1
        while capacity < buckets:
            capacity *= states
            pigs += 1
        return pigs
`,{time:"O(log buckets)",space:"O(1)",difficulty:"hard",description:"Each pig has rounds+1 distinguishable outcomes; find the smallest pig count whose combined outcome states cover all buckets."});
add(459,"Repeated Substring Pattern","string",["abab"],true,`
class Solution:
    def repeatedSubstringPattern(self, s):
        if not s:
            return False
        prefix = [0] * len(s)
        for i in range(1, len(s)):
            j = prefix[i - 1]
            while j and s[i] != s[j]:
                j = prefix[j - 1]
            if s[i] == s[j]:
                j += 1
            prefix[i] = j
        period = len(s) - prefix[-1]
        return prefix[-1] > 0 and len(s) % period == 0
`,{time:"O(n)",space:"O(n)",difficulty:"easy",description:"The KMP prefix table gives the candidate repeating period; it must divide the string length and be shorter than the string."});
add(462,"Minimum Moves to Equal Array Elements II","math",[[1,10,2,9]],16,`
class Solution:
    def minMoves2(self, nums):
        assert nums
        ordered = sorted(nums)
        median = ordered[len(nums) // 2]
        moves = 0
        for value in nums:
            moves += abs(value - median)
        return moves
`,{time:"O(n log n)",space:"O(n)",description:"The median minimizes total absolute distance when each operation changes one element by one."});
add(465,"Optimal Account Balancing","backtracking",[[[0,1,10],[2,0,5]]],2,`
class Solution:
    def minTransfers(self, transactions):
        from collections import defaultdict
        balance = defaultdict(int)
        for sender, receiver, amount in transactions:
            assert amount >= 0
            balance[sender] -= amount
            balance[receiver] += amount
        debts = [v for v in balance.values() if v]
        assert len(debts) <= 10
        def settle(start):
            while start < len(debts) and debts[start] == 0:
                start += 1
            if start == len(debts):
                return 0
            best, tried = len(debts), set()
            for j in range(start + 1, len(debts)):
                if debts[start] * debts[j] < 0 and debts[j] not in tried:
                    tried.add(debts[j])
                    old = debts[j]
                    debts[j] += debts[start]
                    best = min(best, 1 + settle(start + 1))
                    debts[j] = old
                    if old + debts[start] == 0:
                        break
            return best
        return settle(0)
`,{time:"O(k!) upper bound",space:"O(k)",difficulty:"hard",description:"Net out transaction balances, then settle one nonzero account with opposite-sign accounts. Backtrack with duplicate and exact-match pruning. Visual ≤10 nonzero accounts."});
add(466,"Count The Repetitions","string",["acb",4,"ab",2],2,`
class Solution:
    def getMaxRepetitions(self, s1, n1, s2, n2):
        assert s1 and s2 and n1 >= 0 and n2 > 0
        if not set(s2) <= set(s1):
            return 0
        block, matched, index = 0, 0, 0
        seen = {0: (0,0)}
        while block < n1:
            for ch in s1:
                if ch == s2[index]:
                    index += 1
                    if index == len(s2):
                        index = 0
                        matched += 1
            block += 1
            if index in seen:
                previous_block, previous_matched = seen[index]
                period = block - previous_block
                cycles = (n1 - block) // period
                block += cycles * period
                matched += cycles * (matched - previous_matched)
            else:
                seen[index] = (block, matched)
        return matched // n2
`,{time:"O(|s1|·|s2|) before cycle + tail",space:"O(|s2|)",difficulty:"hard",description:"Match s2 as a subsequence across repeated s1 blocks. Repeated cursor states identify cycles that can be skipped arithmetically."});
add(467,"Unique Substrings in Wraparound String","dp",["zab"],6,`
class Solution:
    def findSubstringInWraproundString(self, s):
        assert set(s) <= set('abcdefghijklmnopqrstuvwxyz')
        longest, length = {}, 0
        for i, ch in enumerate(s):
            if i and (ord(ch) - ord(s[i - 1])) % 26 == 1:
                length += 1
            else:
                length = 1
            longest[ch] = max(longest.get(ch, 0), length)
        return sum(longest.values())
`,{time:"O(n)",space:"O(26)",description:"For each ending letter retain the longest contiguous alphabetical wraparound run; all its shorter suffixes are distinct valid substrings."});
add(468,"Validate IP Address","string",["172.16.254.1"],"IPv4",`
class Solution:
    def validIPAddress(self, queryIP):
        if '.' in queryIP:
            parts = queryIP.split('.')
            if len(parts) != 4:
                return 'Neither'
            for part in parts:
                if not part or any(c not in '0123456789' for c in part) or len(part) > 3 or (len(part) > 1 and part[0] == '0') or int(part) > 255:
                    return 'Neither'
            return 'IPv4'
        parts = queryIP.split(':')
        if len(parts) == 8 and all(1 <= len(part) <= 4 and all(c in '0123456789abcdefABCDEF' for c in part) for part in parts):
            return 'IPv6'
        return 'Neither'
`,{time:"O(n)",space:"O(n)",description:"Validate four decimal IPv4 components without leading zeros, or exactly eight nonempty hexadecimal IPv6 components without compression."});
add(469,"Convex Polygon","math",[[[0,0],[0,1],[1,1],[1,0]]],true,`
class Solution:
    def isConvex(self, points):
        assert len(points) >= 3
        sign = 0
        for i in range(len(points)):
            a, b, c = points[i], points[(i+1)%len(points)], points[(i+2)%len(points)]
            cross = (b[0]-a[0])*(c[1]-b[1]) - (b[1]-a[1])*(c[0]-b[0])
            if cross:
                current = 1 if cross > 0 else -1
                if sign and sign != current:
                    return False
                sign = current
        return sign != 0
`,{time:"O(n)",space:"O(1)",description:"Vertices describe a simple nondegenerate polygon in boundary order. Every nonzero turn cross-product must have the same sign."});
add(470,"Implement Rand10() Using Rand7()","math",[],{oneOf:[1,2,3,4,5,6,7,8,9,10]},`
class Solution:
    def rand10(self):
        import random
        while True:
            row = random.randint(1, 7)
            col = random.randint(1, 7)
            index = (row - 1) * 7 + col
            if index <= 40:
                return (index - 1) % 10 + 1
`,{time:"O(1) expected",space:"O(1)",description:"Two uniform rand7 calls create 49 equiprobable cells. Reject cells 41–49; the remaining forty map evenly to 1–10. Replay uses a fixed seed."});
add(472,"Concatenated Words","dp",[["cat","cats","catsdogcats","dog","dogcatsdog","hippopotamuses","rat","ratcatdogcat"]],["dogcatsdog","catsdogcats","ratcatdogcat"],`
class Solution:
    def findAllConcatenatedWordsInADict(self, words):
        known, answer = set(), []
        for word in sorted(words, key=len):
            if not word:
                continue
            parts = [-1] * (len(word) + 1)
            parts[0] = 0
            for end in range(1, len(word) + 1):
                for start in range(end):
                    if parts[start] >= 0 and word[start:end] in known:
                        parts[end] = max(parts[end], parts[start] + 1)
            if parts[-1] >= 2:
                answer.append(word)
            known.add(word)
        return answer
`,{time:"O(words·L³) slicing",space:"O(total characters)",difficulty:"hard",description:"Process words by length and use word-break DP against already seen words; a result must contain at least two components."});
add(477,"Total Hamming Distance","bits",[[4,14,2]],6,`
class Solution:
    def totalHammingDistance(self, nums):
        assert all(0 <= value < 2**31 for value in nums)
        answer = 0
        for bit in range(31):
            ones = sum((value >> bit) & 1 for value in nums)
            zeroes = len(nums) - ones
            answer += ones * zeroes
        return answer
`,{time:"O(31n)",space:"O(1)",description:"Each bit contributes one differing pair for every combination of a set-bit number and an unset-bit number."});
add(478,"Generate Random Point in a Circle","math",[1,0,0],{disk:[1,0,0]},`
class Solution:
    def randPoint(self, radius, x_center, y_center):
        import random, math
        assert radius > 0
        angle = random.random() * 2 * math.pi
        distance = radius * math.sqrt(random.random())
        x = x_center + distance * math.cos(angle)
        y = y_center + distance * math.sin(angle)
        return [x, y]
`,{time:"O(1)",space:"O(1)",description:"Use a uniform angle and radius·sqrt(U), making probability uniform by area rather than radial distance. Replay uses a fixed seed."});
add(479,"Largest Palindrome Product","math",[2],987,`
class Solution:
    def largestPalindrome(self, n):
        assert 1 <= n <= 3, 'Visual enumeration supports 1–3 digit factors'
        if n == 1:
            return 9
        upper, lower = 10**n - 1, 10**(n - 1)
        for half in range(upper, lower - 1, -1):
            palindrome = int(str(half) + str(half)[::-1])
            factor = upper
            while factor * factor >= palindrome:
                if palindrome % factor == 0 and lower <= palindrome // factor <= upper:
                    return palindrome % 1337
                factor -= 1
        return 0
`,{time:"O(10^(2n)) upper bound",space:"O(n)",difficulty:"hard",description:"Generate even-length palindromes in descending order and test n-digit factor pairs until the first match; return it modulo 1337. Visual factors: 1–3 digits."});
add(481,"Magical String","string",[6],3,`
class Solution:
    def magicalString(self, n):
        assert 0 <= n <= 80
        if n == 0:
            return 0
        sequence = [1,2,2]
        head, digit = 2, 1
        while len(sequence) < n:
            count = sequence[head]
            sequence.extend([digit] * count)
            digit = 3 - digit
            head += 1
        return sequence[:n].count(1)
`,{time:"O(n)",space:"O(n)",description:"The string's own entries specify successive run lengths of alternating ones and twos. Count ones in its first n positions."});
add(482,"License Key Formatting","string",["5F3Z-2e-9-w",4],"5F3Z-2E9W",`
class Solution:
    def licenseKeyFormatting(self, s, k):
        assert k >= 1
        cleaned = s.replace('-', '').upper()
        groups = []
        end = len(cleaned)
        while end > 0:
            groups.append(cleaned[max(0,end-k):end])
            end -= k
        return '-'.join(reversed(groups))
`,{time:"O(n)",space:"O(n)",difficulty:"easy",description:"Remove old dashes, uppercase letters, then group from the right so only the first group may be shorter than k."});
add(483,"Smallest Good Base","math",["13"],"3",`
class Solution:
    def smallestGoodBase(self, n):
        value = int(n)
        assert 3 <= value <= 10**18
        for digits in range(value.bit_length(), 2, -1):
            lo = 2
            hi = min(value - 1, 1 << ((value.bit_length() + digits - 2) // (digits - 1)))
            while lo <= hi:
                base = (lo + hi) // 2
                total = 0
                for _ in range(digits):
                    total = total * base + 1
                    if total > value:
                        break
                if total == value:
                    return str(base)
                if total < value:
                    lo = base + 1
                else:
                    hi = base - 1
        return str(value - 1)
`,{time:"O(log³ n) upper bound",space:"O(1)",difficulty:"hard",description:"Try the longest all-ones representation first; binary-search its base using exact integer geometric sums to avoid floating-point root errors."});
add(484,"Find Permutation","array",["DI"],[2,1,3],`
class Solution:
    def findPermutation(self, s):
        assert set(s) <= {'D','I'}
        answer = list(range(1, len(s) + 2))
        i = 0
        while i < len(s):
            if s[i] == 'I':
                i += 1
                continue
            start = i
            while i < len(s) and s[i] == 'D':
                i += 1
            answer[start:i + 1] = reversed(answer[start:i + 1])
        return answer
`,{time:"O(n)",space:"O(n)",description:"Start with ascending 1..n+1 and reverse each maximal D run plus its following endpoint to obtain the lexicographically smallest valid permutation."});
add(488,"Zuma Game","backtracking",["WW","W"],1,`
class Solution:
    def findMinStep(self, board, hand):
        from collections import Counter, deque
        import re
        assert len(board) <= 16 and len(hand) <= 5 and set(board + hand) <= set('RYBGW')
        colors = 'RYBGW'
        counts = Counter(hand)
        def clean(text):
            while True:
                following = re.sub(r'R{3,}|Y{3,}|B{3,}|G{3,}|W{3,}', '', text)
                if following == text:
                    return text
                text = following
        initial = tuple(counts[c] for c in colors)
        queue, seen = deque([(clean(board), initial, 0)]), {(clean(board), initial)}
        while queue:
            text, available, steps = queue.popleft()
            if not text:
                return steps
            totals = Counter(text)
            if any(totals[c] and totals[c] + available[j] < 3 for j,c in enumerate(colors)):
                continue
            for index, color in enumerate(colors):
                if not available[index]:
                    continue
                remaining = list(available)
                remaining[index] -= 1
                positions = [i for i in range(len(text) + 1) if (i == 0 or text[i - 1] != color) and ((i < len(text) and text[i] == color) or (0 < i < len(text) and text[i - 1] == text[i] != color))]
                for i in positions:
                    following = clean(text[:i] + color + text[i:])
                    state = (following, tuple(remaining))
                    if state not in seen:
                        seen.add(state)
                        queue.append((following, state[1], steps + 1))
        return -1
`,{time:"O(exponential state search)",space:"O(visited states)",difficulty:"hard",traceOptions:{maxEvents:20000,summarizeLocals:{queue:8,seen:8}},description:"BFS board and hand-count states, inserting either next to a matching color or inside an equal-color pair. Splitting a pair is essential for some solutions; resolve every chain reaction after insertion. Large queues and visited sets show counts plus their first eight entries."});
add(490,"The Maze","graph",[[[0,0,1,0,0],[0,0,0,0,0],[0,0,0,1,0],[1,1,0,1,1],[0,0,0,0,0]],[0,4],[4,4]],true,`
class Solution:
    def hasPath(self, maze, start, destination):
        from collections import deque
        rows, cols = len(maze), len(maze[0])
        queue, seen = deque([tuple(start)]), {tuple(start)}
        while queue:
            r, c = queue.popleft()
            if [r,c] == destination:
                return True
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                nr, nc = r, c
                while 0 <= nr + dr < rows and 0 <= nc + dc < cols and maze[nr+dr][nc+dc] == 0:
                    nr += dr
                    nc += dc
                if (nr,nc) not in seen:
                    seen.add((nr,nc))
                    queue.append((nr,nc))
        return False
`,{time:"O(RC·(R+C))",space:"O(RC)",description:"BFS over stopping positions only. Each move rolls until the next cell is a wall or boundary; passing over the target is insufficient."});
add(492,"Construct the Rectangle","math",[4],[2,2],`
class Solution:
    def constructRectangle(self, area):
        import math
        assert area >= 1
        width = math.isqrt(area)
        while area % width:
            width -= 1
        return [area // width, width]
`,{time:"O(sqrt area)",space:"O(1)",difficulty:"easy",description:"Search downward from the integer square root for a divisor, minimizing length−width while keeping length ≥ width."});
add(495,"Teemo Attacking","array",[[1,4],2],4,`
class Solution:
    def findPoisonedDuration(self, timeSeries, duration):
        assert duration >= 0 and timeSeries == sorted(timeSeries)
        if not timeSeries:
            return 0
        total = duration
        for i in range(1, len(timeSeries)):
            total += min(duration, timeSeries[i] - timeSeries[i - 1])
        return total
`,{time:"O(n)",space:"O(1)",difficulty:"easy",description:"Each new attack adds only the smaller of its duration and the gap from the previous attack, avoiding overlap double counting."});
add(498,"Diagonal Traverse","array",[[[1,2,3],[4,5,6],[7,8,9]]],[1,2,4,7,5,3,6,8,9],`
class Solution:
    def findDiagonalOrder(self, mat):
        if not mat or not mat[0]:
            return []
        rows, cols = len(mat), len(mat[0])
        assert all(len(row) == cols for row in mat)
        answer = []
        for diagonal in range(rows + cols - 1):
            cells = []
            for r in range(max(0,diagonal-cols+1), min(rows-1,diagonal)+1):
                c = diagonal - r
                cells.append(mat[r][c])
            answer.extend(cells[::-1] if diagonal % 2 == 0 else cells)
        return answer
`,{time:"O(RC)",space:"O(min(R,C)) + output",description:"Cells on a diagonal share row+column; reverse alternate diagonal groups to follow the zigzag traversal."});
add(500,"Keyboard Row","string",[["Hello","Alaska","Dad","Peace"]],["Alaska","Dad"],`
class Solution:
    def findWords(self, words):
        rows = [set('qwertyuiop'), set('asdfghjkl'), set('zxcvbnm')]
        answer = []
        for word in words:
            letters = set(word.lower())
            if any(letters <= row for row in rows):
                answer.append(word)
        return answer
`,{time:"O(total characters)",space:"O(alphabet) + output",difficulty:"easy",description:"Normalize letter case and check whether every distinct letter belongs to one keyboard row."});
module.exports=lessons;
