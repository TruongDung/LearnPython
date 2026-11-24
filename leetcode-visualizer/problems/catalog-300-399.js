"use strict";
const { define } = require("./catalog-lesson");
const lessons={};
const add=(id,title,group,sample,expected,source,options={})=>lessons[id]=define(id,title,group,sample,expected,source,options);
add(302,"Smallest Rectangle Enclosing Black Pixels","graph",[["0010","0110","0100"],0,2],6,`
class Solution:
    def minArea(self, image, x, y):
        from collections import deque
        assert image and image[x][y] == '1'
        rows, cols = len(image), len(image[0])
        queue, seen = deque([(x, y)]), {(x, y)}
        top = bottom = x
        left = right = y
        while queue:
            r, c = queue.popleft()
            top, bottom = min(top, r), max(bottom, r)
            left, right = min(left, c), max(right, c)
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and image[nr][nc] == '1' and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    queue.append((nr, nc))
        return (bottom - top + 1) * (right - left + 1)
`,{time:"O(black pixels)",space:"O(black pixels)",difficulty:"hard",description:"The black pixels form one connected component. BFS from the supplied black pixel expands its bounding rectangle."});
add(306,"Additive Number","backtracking",["112358"],true,`
class Solution:
    def isAdditiveNumber(self, num):
        assert num.isdigit() and len(num) <= 30
        n = len(num)
        for i in range(1, n):
            if num[0] == '0' and i > 1:
                break
            for j in range(i + 1, n):
                if num[i] == '0' and j > i + 1:
                    break
                a, b, cursor = int(num[:i]), int(num[i:j]), j
                while cursor < n:
                    following = str(a + b)
                    if not num.startswith(following, cursor):
                        break
                    cursor += len(following)
                    a, b = b, a + b
                if cursor == n:
                    return True
        return False
`,{time:"O(n³)",space:"O(n)",description:"Try the first two numbers, then require each subsequent substring to equal their sum; reject leading zeros."});
add(311,"Sparse Matrix Multiplication","array",[[[1,0,0],[-1,0,3]],[[7,0,0],[0,0,0],[0,0,1]]],[[7,0,0],[-7,0,3]],`
class Solution:
    def multiply(self, mat1, mat2):
        assert mat1 and mat2 and len(mat1[0]) == len(mat2)
        rows, shared, cols = len(mat1), len(mat2), len(mat2[0])
        answer = [[0] * cols for _ in range(rows)]
        nonzero = [[(c, v) for c, v in enumerate(row) if v] for row in mat2]
        for r in range(rows):
            for k in range(shared):
                if mat1[r][k]:
                    for c, value in nonzero[k]:
                        answer[r][c] += mat1[r][k] * value
        return answer
`,{time:"O(RK + KC + nonzero products)",space:"O(nonzero B + output)",description:"Skip zero factors and multiply only compatible nonzero matrix entries."});
add(313,"Super Ugly Number","dp",[12,[2,7,13,19]],32,`
class Solution:
    def nthSuperUglyNumber(self, n, primes):
        assert 1 <= n <= 80 and primes and all(p >= 2 for p in primes)
        ugly = [1]
        indices = [0] * len(primes)
        for _ in range(1, n):
            candidates = [p * ugly[indices[i]] for i, p in enumerate(primes)]
            following = min(candidates)
            ugly.append(following)
            for i, value in enumerate(candidates):
                if value == following:
                    indices[i] += 1
        return ugly[-1]
`,{time:"O(nk)",space:"O(n+k)",description:"Merge one increasing multiple stream per supplied prime; advance every stream tied at the minimum. Visual n ≤80."});
add(320,"Generalized Abbreviation","backtracking",["word"],["4","3d","2r1","2rd","1o2","1o1d","1or1","1ord","w3","w2d","w1r1","w1rd","wo2","wo1d","wor1","word"],`
class Solution:
    def generateAbbreviations(self, word):
        assert len(word) <= 6
        answer = []
        def dfs(index, prefix, count):
            if index == len(word):
                answer.append(prefix + (str(count) if count else ''))
                return
            dfs(index + 1, prefix, count + 1)
            dfs(index + 1, prefix + (str(count) if count else '') + word[index], 0)
        dfs(0, '', 0)
        return answer
`,{time:"O(n·2ⁿ)",space:"O(n) + output",description:"At each letter either increase the abbreviated run length or flush that count and keep the letter. Visual length ≤6."});
add(324,"Wiggle Sort II","array",[[1,5,1,1,6,4]],[1,6,1,5,1,4],`
class Solution:
    def wiggleSort(self, nums):
        ordered = sorted(nums)
        middle = (len(nums) + 1) // 2
        small, large = ordered[:middle][::-1], ordered[middle:][::-1]
        nums[::2] = small
        nums[1::2] = large
        assert all((nums[i - 1] < nums[i] if i % 2 else nums[i - 1] > nums[i]) for i in range(1, len(nums))), 'No strict wiggle arrangement'
        return nums
`,{time:"O(n log n)",space:"O(n)",description:"Interleave reversed lower and upper sorted halves so duplicates are separated; the input must admit strict wiggle order."});
add(325,"Maximum Size Subarray Sum Equals k","array",[[1,-1,5,-2,3],3],4,`
class Solution:
    def maxSubArrayLen(self, nums, k):
        earliest = {0: -1}
        prefix = answer = 0
        for i, value in enumerate(nums):
            prefix += value
            if prefix - k in earliest:
                answer = max(answer, i - earliest[prefix - k])
            if prefix not in earliest:
                earliest[prefix] = i
        return answer
`,{time:"O(n)",space:"O(n)",description:"Retain the earliest index of every prefix sum to maximize a matching interval's length."});
add(326,"Power of Three","math",[27],true,`
class Solution:
    def isPowerOfThree(self, n):
        if n <= 0:
            return False
        while n % 3 == 0:
            n //= 3
        return n == 1
`,{time:"O(log₃ n)",space:"O(1)",difficulty:"easy",description:"Repeatedly remove factors of three; the remainder must be exactly one."});
add(328,"Odd Even Linked List","list",[[1,2,3,4,5]],[1,3,5,2,4],`
class Solution:
    def oddEvenList(self, head):
        if not head:
            return None
        odd, even = head, head.next
        even_head = even
        while even and even.next:
            odd.next = even.next
            odd = odd.next
            even.next = odd.next
            even = even.next
        odd.next = even_head
        return head
`,{kinds:["list"],answerKind:"list",time:"O(n)",space:"O(1)",description:"Separate odd and even positions (not values), preserve their relative order, then reconnect the two chains."});
add(330,"Patching Array","greedy",[[1,3],6],1,`
class Solution:
    def minPatches(self, nums, n):
        assert nums == sorted(nums) and all(v > 0 for v in nums) and n >= 0
        missing, index, patches = 1, 0, 0
        while missing <= n:
            if index < len(nums) and nums[index] <= missing:
                missing += nums[index]
                index += 1
            else:
                missing += missing
                patches += 1
        return patches
`,{time:"O(len(nums)+log n)",space:"O(1)",difficulty:"hard",description:"Maintain coverage [1, missing). Consume a usable number or patch with missing to double coverage."});
add(331,"Verify Preorder Serialization of a Binary Tree","tree",["9,3,4,#,#,1,#,#,2,#,6,#,#"],true,`
class Solution:
    def isValidSerialization(self, preorder):
        slots = 1
        for token in preorder.split(','):
            if slots == 0:
                return False
            slots -= 1
            if token != '#':
                int(token)
                slots += 2
        return slots == 0
`,{time:"O(n)",space:"O(n) tokenization",description:"Each token consumes a child slot; a non-null node produces two. A valid tree ends with exactly zero slots."});
add(334,"Increasing Triplet Subsequence","greedy",[[2,1,5,0,4,6]],true,`
class Solution:
    def increasingTriplet(self, nums):
        first = second = float('inf')
        for value in nums:
            if value <= first:
                first = value
            elif value <= second:
                second = value
            else:
                return True
        return False
`,{time:"O(n)",space:"O(1)",description:"Track the smallest first value and smallest possible second value; a larger third value completes a strict triplet."});
add(335,"Self Crossing","graph",[[2,1,1,2]],true,`
class Solution:
    def isSelfCrossing(self, distance):
        assert all(d > 0 for d in distance)
        d = distance
        for i in range(3, len(d)):
            if d[i] >= d[i - 2] and d[i - 1] <= d[i - 3]:
                return True
            if i >= 4 and d[i - 1] == d[i - 3] and d[i] + d[i - 4] >= d[i - 2]:
                return True
            if i >= 5 and d[i - 2] >= d[i - 4] and d[i] + d[i - 4] >= d[i - 2] and d[i - 1] <= d[i - 3] and d[i - 1] + d[i - 5] >= d[i - 3]:
                return True
        return False
`,{time:"O(n)",space:"O(1)",difficulty:"hard",description:"Check the three local configurations that cause a north/west/south/east turning path to touch or cross itself."});
add(336,"Palindrome Pairs","string",[["abcd","dcba","lls","s","sssll"]],[[0,1],[1,0],[2,4],[3,2]],`
class Solution:
    def palindromePairs(self, words):
        assert len(set(words)) == len(words)
        index = {word: i for i, word in enumerate(words)}
        pairs = set()
        for i, word in enumerate(words):
            for split in range(len(word) + 1):
                left, right = word[:split], word[split:]
                if left == left[::-1] and right[::-1] in index:
                    j = index[right[::-1]]
                    if i != j:
                        pairs.add((j, i))
                if right == right[::-1] and left[::-1] in index:
                    j = index[left[::-1]]
                    if i != j:
                        pairs.add((i, j))
        return sorted(pairs)
`,{time:"O(n·L²)",space:"O(n·L + output)",difficulty:"hard",description:"Split each unique word; a palindromic side can pair with the reverse of the other side."});
add(339,"Nested List Weight Sum","array",[[[1,1],2,[1,1]]],10,`
class Solution:
    def depthSum(self, nestedList):
        def dfs(items, depth):
            total = 0
            for item in items:
                if isinstance(item, int):
                    total += item * depth
                else:
                    total += dfs(item, depth + 1)
            return total
        return dfs(nestedList, 1)
`,{time:"O(n)",space:"O(depth)",description:"NestedInteger judge objects are represented as JSON integers/lists; multiply each integer by its depth."});
add(341,"Flatten Nested List Iterator","design",[[[1,1],2,[1,1]]],[1,1,2,1,1],`
class Solution:
    def flatten(self, nestedList):
        stack = list(reversed(nestedList))
        answer = []
        while stack:
            while stack and isinstance(stack[-1], list):
                current = stack.pop()
                stack.extend(reversed(current))
            if stack:
                answer.append(stack.pop())
        return answer
`,{time:"O(total nested items)",space:"O(total pending items)",description:"Lazily expand nested lists at the top of a reversed stack; integers are consumed one at a time."});
add(342,"Power of Four","bits",[16],true,`
class Solution:
    def isPowerOfFour(self, n):
        assert -(2**31) <= n < 2**31
        positive = n > 0
        one_bit = (n & (n - 1)) == 0
        even_position = (n & 0x55555555) != 0
        return positive and one_bit and even_position
`,{time:"O(1)",space:"O(1)",difficulty:"easy",description:"A signed 32-bit power of four is positive, has one set bit, and that bit lies at an even zero-based position."});
add(343,"Integer Break","dp",[10],36,`
class Solution:
    def integerBreak(self, n):
        assert 2 <= n <= 30
        dp = [0] * (n + 1)
        for total in range(2, n + 1):
            for first in range(1, total):
                dp[total] = max(dp[total], first * (total - first), first * dp[total - first])
        return dp[n]
`,{time:"O(n²)",space:"O(n)",description:"Try every first summand and choose whether to split the remainder again. At least two positive terms are required. Visual n ≤30."});
add(348,"Design Tic-Tac-Toe","design",[3,[[0,0,1],[0,2,2],[2,2,1],[1,1,2],[2,0,1],[1,0,2],[2,1,1]]],[0,0,0,0,0,0,1],`
class Solution:
    def simulate(self, n, moves):
        assert 1 <= n <= 8
        rows, cols, diagonal, anti = [0] * n, [0] * n, 0, 0
        occupied, answer, winner = set(), [], 0
        for r, c, player in moves:
            assert not winner and 0 <= r < n and 0 <= c < n and player in (1,2) and (r,c) not in occupied
            occupied.add((r,c))
            delta = 1 if player == 1 else -1
            rows[r] += delta
            cols[c] += delta
            if r == c:
                diagonal += delta
            if r + c == n - 1:
                anti += delta
            winner = player if n in [abs(rows[r]), abs(cols[c]), abs(diagonal), abs(anti)] else 0
            answer.append(winner)
        return answer
`,{time:"O(1) per move",space:"O(n²) fixture; O(n) counters",description:"Signed row, column and diagonal counters detect wins without rescanning the board. Moves must be valid and stop after a win."});
add(351,"Android Unlock Patterns","backtracking",[1,2],65,`
class Solution:
    def numberOfPatterns(self, m, n):
        assert 1 <= m <= n <= 4
        skip = {}
        for a, b, middle in [(1,3,2),(1,7,4),(3,9,6),(7,9,8),(1,9,5),(3,7,5),(2,8,5),(4,6,5)]:
            skip[a,b] = skip[b,a] = middle
        def dfs(last, used):
            count = int(m <= len(used) <= n)
            if len(used) == n:
                return count
            for following in range(1,10):
                middle = skip.get((last, following))
                if following not in used and (middle is None or middle in used):
                    count += dfs(following, used | {following})
            return count
        corners = dfs(1, {1})
        edges = dfs(2, {2})
        center = dfs(5, {5})
        return corners * 4 + edges * 4 + center
`,{time:"O(9!) upper bound",space:"O(9)",description:"DFS a 3×3 keypad; a jump over a middle key is legal only after that key is visited. Symmetry groups corners and edges. Visual max length 4."});
add(353,"Design Snake Game","design",[3,2,[[1,2],[0,1]],["R","D","R","U","L","U"]],[0,0,1,1,2,-1],`
class Solution:
    def simulate(self, width, height, food, moves):
        from collections import deque
        snake, occupied = deque([(0,0)]), {(0,0)}
        directions = {'U':(-1,0), 'D':(1,0), 'L':(0,-1), 'R':(0,1)}
        score, dead, answer = 0, False, []
        for move in moves:
            if dead:
                answer.append(-1)
                continue
            dr, dc = directions[move]
            head = (snake[0][0] + dr, snake[0][1] + dc)
            eating = score < len(food) and list(head) == food[score]
            tail = snake[-1]
            collision = head in occupied and (eating or head != tail)
            if not (0 <= head[0] < height and 0 <= head[1] < width) or collision:
                dead = True
                answer.append(-1)
                continue
            if not eating:
                occupied.remove(snake.pop())
            else:
                score += 1
            snake.appendleft(head)
            occupied.add(head)
            answer.append(score)
        return answer
`,{time:"O(1) per move",space:"O(snake length + output)",description:"Track the body with a deque and occupied-cell set. Moving into the departing tail is legal unless growing."});
add(356,"Line Reflection","math",[[[1,1],[-1,1]]],true,`
class Solution:
    def isReflected(self, points):
        if not points:
            return True
        points = set(map(tuple, points))
        total = min(x for x,y in points) + max(x for x,y in points)
        for x, y in points:
            if (total - x, y) not in points:
                return False
        return True
`,{time:"O(n)",space:"O(n)",description:"The only candidate vertical mirror is halfway between minimum and maximum x; check each reflected point."});
add(357,"Count Numbers with Unique Digits","math",[2],91,`
class Solution:
    def countNumbersWithUniqueDigits(self, n):
        assert 0 <= n <= 8
        if n == 0:
            return 1
        answer, ways, available = 10, 9, 9
        for digits in range(2, n + 1):
            ways *= available
            answer += ways
            available -= 1
        return answer
`,{time:"O(n)",space:"O(1)",description:"Count [0,10^n) by length: nine choices for the first nonzero digit, then decreasing unused digit choices."});
add(358,"Rearrange String k Distance Apart","greedy",["aabbcc",3],"abcabc",`
class Solution:
    def rearrangeString(self, s, k):
        from collections import Counter, deque
        import heapq
        assert k >= 0
        if k <= 1:
            return s
        heap = [(-count, ch) for ch, count in Counter(s).items()]
        heapq.heapify(heap)
        cooldown, output = deque(), []
        for i in range(len(s)):
            while cooldown and cooldown[0][0] <= i:
                _, count, ch = cooldown.popleft()
                heapq.heappush(heap, (count, ch))
            if not heap:
                return ''
            count, ch = heapq.heappop(heap)
            output.append(ch)
            if count + 1 < 0:
                cooldown.append((i + k, count + 1, ch))
        return ''.join(output)
`,{time:"O(n log alphabet)",space:"O(alphabet+n)",difficulty:"hard",description:"Choose the most frequent available letter and hold it in cooldown until k positions later; return empty if impossible."});
add(360,"Sort Transformed Array","array",[[-4,-2,2,4],1,3,5],[3,9,15,33],`
class Solution:
    def sortTransformedArray(self, nums, a, b, c):
        assert nums == sorted(nums)
        left, right = 0, len(nums) - 1
        answer = []
        while left <= right:
            x = a * nums[left] ** 2 + b * nums[left] + c
            y = a * nums[right] ** 2 + b * nums[right] + c
            if (x >= y if a >= 0 else x <= y):
                answer.append(x)
                left += 1
            else:
                answer.append(y)
                right -= 1
        return answer[::-1] if a >= 0 else answer
`,{time:"O(n)",space:"O(n) output",description:"A parabola's extreme transformed value lies at an endpoint; choose endpoints in the correct direction of curvature."});
add(361,"Bomb Enemy","array",[["0E00","E0WE","0E00"]],3,`
class Solution:
    def maxKilledEnemies(self, grid):
        if not grid:
            return 0
        rows, cols = len(grid), len(grid[0])
        column_hits = [0] * cols
        answer = row_hits = 0
        for r in range(rows):
            for c in range(cols):
                if c == 0 or grid[r][c - 1] == 'W':
                    row_hits = 0
                    k = c
                    while k < cols and grid[r][k] != 'W':
                        row_hits += grid[r][k] == 'E'
                        k += 1
                if r == 0 or grid[r - 1][c] == 'W':
                    column_hits[c] = 0
                    k = r
                    while k < rows and grid[k][c] != 'W':
                        column_hits[c] += grid[k][c] == 'E'
                        k += 1
                if grid[r][c] == '0':
                    answer = max(answer, row_hits + column_hits[c])
        return answer
`,{time:"O(rows·cols)",space:"O(cols)",description:"Reuse enemy counts inside horizontal and vertical wall-delimited segments; place one bomb only in an empty 0 cell."});
add(364,"Nested List Weight Sum II","array",[[1,[4,[6]]]],17,`
class Solution:
    def depthSumInverse(self, nestedList):
        integers = []
        def visit(items, depth):
            for item in items:
                if isinstance(item, int):
                    integers.append([item, depth])
                else:
                    visit(item, depth + 1)
        visit(nestedList, 1)
        maximum = max((depth for value, depth in integers), default=0)
        return sum(value * (maximum - depth + 1) for value, depth in integers)
`,{time:"O(n)",space:"O(n)",description:"Collect integer depths, find the deepest actual integer (empty nested lists add no depth), then weight each integer by maximumDepth−depth+1."});
add(365,"Water and Jug Problem","math",[3,5,4],true,`
class Solution:
    def canMeasureWater(self, x, y, target):
        import math
        assert x >= 0 and y >= 0 and target >= 0
        if target == 0:
            return True
        if target > x + y:
            return False
        divisor = math.gcd(x, y)
        return divisor != 0 and target % divisor == 0
`,{time:"O(log min(x,y))",space:"O(1)",description:"Bézout's identity: a feasible positive target must not exceed total capacity and must be divisible by gcd(x,y)."});
add(368,"Largest Divisible Subset","dp",[[1,2,3]],[1,2],`
class Solution:
    def largestDivisibleSubset(self, nums):
        assert all(v > 0 for v in nums) and len(set(nums)) == len(nums)
        if not nums:
            return []
        nums.sort()
        dp, previous = [1] * len(nums), [-1] * len(nums)
        for i in range(len(nums)):
            for j in range(i):
                if nums[i] % nums[j] == 0 and dp[j] + 1 > dp[i]:
                    dp[i], previous[i] = dp[j] + 1, j
        index = max(range(len(nums)), key=lambda i: dp[i])
        answer = []
        while index != -1:
            answer.append(nums[index])
            index = previous[index]
        return answer[::-1]
`,{time:"O(n²)",space:"O(n)",description:"After sorting distinct positive numbers, extend divisible chains and reconstruct the longest chain with predecessor links."});
add(369,"Plus One Linked List","list",[[1,2,9]],[1,3,0],`
class Solution:
    def plusOne(self, head):
        def add(node):
            if not node:
                return 1
            carry = add(node.next)
            total = node.val + carry
            node.val = total % 10
            return total // 10
        carry = add(head)
        return ListNode(1, head) if carry else head
`,{kinds:["list"],answerKind:"list",time:"O(n)",space:"O(n) recursion",description:"Propagate a carry backward from the tail; prepend a node only when the leading digit overflows."});
add(371,"Sum of Two Integers","bits",[-2,3],1,`
class Solution:
    def getSum(self, a, b):
        assert -(2**31) <= a < 2**31 and -(2**31) <= b < 2**31
        mask = 0xffffffff
        a &= mask
        b &= mask
        while b:
            a, b = (a ^ b) & mask, ((a & b) << 1) & mask
        return a if a < 2**31 else ~(a ^ mask)
`,{time:"O(32)",space:"O(1)",description:"XOR adds without carry; shifted AND computes carry. A 32-bit mask prevents infinite sign extension for negatives."});
add(372,"Super Pow","math",[2,[1,0]],1024,`
class Solution:
    def superPow(self, a, b):
        answer = 1
        for digit in b:
            assert 0 <= digit <= 9
            answer = (pow(answer, 10, 1337) * pow(a, digit, 1337)) % 1337
        return answer
`,{time:"O(number of exponent digits)",space:"O(1)",description:"Read a huge exponent one digit at a time using a^(10p+d) = (a^p)^10·a^d modulo 1337."});
add(376,"Wiggle Subsequence","greedy",[[1,7,4,9,2,5]],6,`
class Solution:
    def wiggleMaxLength(self, nums):
        if not nums:
            return 0
        up = down = 1
        for i in range(1, len(nums)):
            if nums[i] > nums[i - 1]:
                up = down + 1
            elif nums[i] < nums[i - 1]:
                down = up + 1
        return max(up, down)
`,{time:"O(n)",space:"O(1)",description:"Maintain the longest subsequence ending in an upward or downward difference; equal neighbors add nothing."});
add(377,"Combination Sum IV","dp",[[1,2,3],4],7,`
class Solution:
    def combinationSum4(self, nums, target):
        assert len(set(nums)) == len(nums) and all(v > 0 for v in nums) and 0 <= target <= 80
        dp = [0] * (target + 1)
        dp[0] = 1
        for total in range(1, target + 1):
            for value in nums:
                if value <= total:
                    dp[total] += dp[total - value]
        return dp[target]
`,{time:"O(target·n)",space:"O(target)",description:"Order matters. For each total, count sequences obtained by appending each valid last number. Visual target ≤80."});
add(382,"Linked List Random Node","list",[[1,2,3]],{oneOf:[1,2,3]},`
class Solution:
    def getRandom(self, head):
        import random
        assert head is not None
        count, chosen = 0, None
        node = head
        while node:
            count += 1
            if random.randrange(count) == 0:
                chosen = node.val
            node = node.next
        return chosen
`,{kinds:["list"],time:"O(n)",space:"O(1)",description:"Reservoir sampling replaces the selected value with probability 1/count. Replay uses a fixed seed for repeatability."});
add(384,"Shuffle an Array","array",[[1,2,3]],{permutation:[1,2,3]},`
class Solution:
    def shuffle(self, nums):
        import random
        shuffled = nums[:]
        for i in range(len(shuffled) - 1, 0, -1):
            j = random.randrange(i + 1)
            shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
        return shuffled
`,{time:"O(n)",space:"O(n)",description:"Fisher–Yates swaps each suffix endpoint with a uniformly selected earlier index. Copying preserves the original array for reset; replay uses a fixed seed."});
add(385,"Mini Parser","string",["[123,[456,[789]]]"],[123,[456,[789]]],`
class Solution:
    def deserialize(self, s):
        if s[0] != '[':
            return int(s)
        stack, number, reading = [], '', False
        root = None
        for ch in s:
            if ch == '[':
                current = []
                if stack:
                    stack[-1].append(current)
                else:
                    root = current
                stack.append(current)
            elif ch in '-0123456789':
                number += ch
                reading = True
            elif ch in ',]':
                if reading:
                    stack[-1].append(int(number))
                    number, reading = '', False
                if ch == ']':
                    stack.pop()
        return root
`,{time:"O(n)",space:"O(n)",description:"Use a stack for nested brackets and a token buffer for signed integers; NestedInteger output is shown as JSON integers/lists."});
add(386,"Lexicographical Numbers","tree",[13],[1,10,11,12,13,2,3,4,5,6,7,8,9],`
class Solution:
    def lexicalOrder(self, n):
        assert 1 <= n <= 80
        answer, current = [], 1
        for _ in range(n):
            answer.append(current)
            if current * 10 <= n:
                current *= 10
            else:
                while current % 10 == 9 or current + 1 > n:
                    current //= 10
                current += 1
        return answer
`,{time:"O(n)",space:"O(1) + output",description:"Walk the implicit decimal trie: descend by ×10, move to the next sibling, or climb until a sibling exists. Visual n ≤80."});
add(388,"Longest Absolute File Path","string",["dir\n\tsubdir1\n\tsubdir2\n\t\tfile.ext"],20,`
class Solution:
    def lengthLongestPath(self, input):
        lengths = {0: 0}
        answer = 0
        for line in input.split('\\n'):
            name = line.lstrip('\\t')
            depth = len(line) - len(name)
            current = lengths[depth] + len(name)
            if '.' in name:
                answer = max(answer, current)
            else:
                lengths[depth + 1] = current + 1
        return answer
`,{time:"O(n)",space:"O(depth)",description:"Tab indentation determines depth; prefix lengths include directory separators while file names update the maximum."});
add(390,"Elimination Game","math",[9],6,`
class Solution:
    def lastRemaining(self, n):
        assert n >= 1
        head, step, left, remaining = 1, 1, True, n
        while remaining > 1:
            if left or remaining % 2:
                head += step
            remaining //= 2
            step *= 2
            left = not left
        return head
`,{time:"O(log n)",space:"O(1)",description:"Track the first survivor, spacing and direction rather than storing the eliminated sequence."});
add(393,"UTF-8 Validation","bits",[[197,130,1]],true,`
class Solution:
    def validUtf8(self, data):
        remaining = 0
        for byte in data:
            assert 0 <= byte < 256
            if remaining:
                if byte >> 6 != 0b10:
                    return False
                remaining -= 1
            elif byte >> 7 == 0:
                continue
            elif byte >> 5 == 0b110:
                remaining = 1
            elif byte >> 4 == 0b1110:
                remaining = 2
            elif byte >> 3 == 0b11110:
                remaining = 3
            else:
                return False
        return remaining == 0
`,{time:"O(n)",space:"O(1)",description:"Check the structural UTF-8 byte-prefix rules specified by the problem and ensure every multibyte sequence has enough continuation bytes."});
add(395,"Longest Substring with At Least K Repeating Characters","string",["aaabb",3],3,`
class Solution:
    def longestSubstring(self, s, k):
        from collections import Counter
        assert k >= 1
        def solve(text):
            counts = Counter(text)
            for ch, count in counts.items():
                if count < k:
                    return max((solve(part) for part in text.split(ch)), default=0)
            return len(text)
        return solve(s)
`,{time:"O(alphabet·n)",space:"O(alphabet·n) slicing",description:"A character occurring fewer than k times cannot belong to any valid substring; split at it and solve each remaining segment."});
add(397,"Integer Replacement","greedy",[8],3,`
class Solution:
    def integerReplacement(self, n):
        assert 1 <= n <= 2147483647
        steps = 0
        while n != 1:
            if n % 2 == 0:
                n //= 2
            elif n == 3 or n % 4 == 1:
                n -= 1
            else:
                n += 1
            steps += 1
        return steps
`,{time:"O(log n)",space:"O(1)",description:"Halve even numbers. For odd numbers choose the change yielding more trailing binary zeros, with the special case n=3."});
module.exports=lessons;
