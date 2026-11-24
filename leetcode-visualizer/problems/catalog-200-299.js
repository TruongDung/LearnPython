"use strict";
const { define } = require("./catalog-lesson");
const lessons = {};
const add=(id,title,group,sample,expected,source,options={})=>lessons[id]=define(id,title,group,sample,expected,source,options);
add(201,"Bitwise AND of Numbers Range","bits",[5,7],4,`
class Solution:
    def rangeBitwiseAnd(self, left, right):
        assert 0 <= left <= right
        shift = 0
        while left < right:
            left >>= 1
            right >>= 1
            shift += 1
        return left << shift
`,{time:"O(log right)",space:"O(1)",description:"Only the common binary prefix survives AND across the entire inclusive interval."});
add(216,"Combination Sum III","backtracking",[3,9],[[1,2,6],[1,3,5],[2,3,4]],`
class Solution:
    def combinationSum3(self, k, n):
        assert 1 <= k <= 9
        answer = []
        def dfs(start, remaining, path):
            if len(path) == k:
                if remaining == 0:
                    answer.append(path[:])
                return
            for value in range(start, 10):
                if value > remaining:
                    break
                path.append(value)
                dfs(value + 1, remaining - value, path)
                path.pop()
        dfs(1, n, [])
        return answer
`,{time:"O(k·C(9,k))",space:"O(k) + output",description:"Choose k distinct numbers from 1–9 in increasing order whose sum is n."});
add(220,"Contains Duplicate III","sliding",[[1,2,3,1],3,0],true,`
class Solution:
    def containsNearbyAlmostDuplicate(self, nums, indexDiff, valueDiff):
        assert indexDiff >= 1 and valueDiff >= 0
        buckets = {}
        width = valueDiff + 1
        for i, value in enumerate(nums):
            bucket = value // width
            for key in (bucket - 1, bucket, bucket + 1):
                if key in buckets and abs(value - buckets[key]) <= valueDiff:
                    return True
            buckets[bucket] = value
            if i >= indexDiff:
                del buckets[nums[i - indexDiff] // width]
        return False
`,{time:"O(n) expected",space:"O(indexDiff)",difficulty:"hard",description:"Bucket values by valueDiff+1; check adjacent buckets inside a window of indexDiff positions."});
add(222,"Count Complete Tree Nodes","tree",[[1,2,3,4,5,6]],6,`
class Solution:
    def countNodes(self, root):
        if not root:
            return 0
        left = right = root
        lh = rh = 0
        while left:
            lh += 1
            left = left.left
        while right:
            rh += 1
            right = right.right
        if lh == rh:
            return (1 << lh) - 1
        return 1 + self.countNodes(root.left) + self.countNodes(root.right)
`,{kinds:["tree"],time:"O(log² n)",space:"O(log n)",difficulty:"easy",description:"Input must be a complete binary tree. Equal outer heights identify perfect subtrees immediately."});
add(225,"Implement Stack using Queues","design",[[["push",1],["push",2],["top"],["pop"],["empty"]]],[null,null,2,2,false],`
class Solution:
    def simulate(self, operations):
        from collections import deque
        queue, answer = deque(), []
        for operation in operations:
            if operation[0] == 'push':
                queue.append(operation[1])
                for _ in range(len(queue) - 1):
                    queue.append(queue.popleft())
                answer.append(None)
            elif operation[0] == 'pop':
                answer.append(queue.popleft())
            elif operation[0] == 'top':
                answer.append(queue[0])
            else:
                assert operation[0] == 'empty'
                answer.append(not queue)
        return answer
`,{time:"push O(n); others O(1)",space:"O(n)",difficulty:"easy",description:"Rotate the queue after each push so the newest element is always at its front."});
add(227,"Basic Calculator II","string",["3+2*2"],7,`
class Solution:
    def calculate(self, s):
        assert set(s) <= set('0123456789 +-*/')
        stack, number, operation = [], 0, '+'
        for ch in s + '+':
            if ch.isdigit():
                number = number * 10 + int(ch)
            elif ch != ' ':
                if operation == '+':
                    stack.append(number)
                elif operation == '-':
                    stack.append(-number)
                elif operation == '*':
                    stack[-1] *= number
                else:
                    assert number != 0
                    value = stack.pop()
                    stack.append((abs(value) // number) * (-1 if value < 0 else 1))
                operation, number = ch, 0
        return sum(stack)
`,{time:"O(n)",space:"O(n)",description:"Resolve multiplication and division immediately; defer addition and subtraction in a stack. Division truncates toward zero."});
add(229,"Majority Element II","array",[[3,2,3]],[3],`
class Solution:
    def majorityElement(self, nums):
        a = b = None
        ca = cb = 0
        for value in nums:
            if value == a:
                ca += 1
            elif value == b:
                cb += 1
            elif ca == 0:
                a, ca = value, 1
            elif cb == 0:
                b, cb = value, 1
            else:
                ca -= 1
                cb -= 1
        return sorted(v for v in {a, b} if v is not None and nums.count(v) > len(nums) // 3)
`,{time:"O(n)",space:"O(1)",description:"Boyer–Moore retains at most two candidates, then verifies which occur more than n/3 times."});
add(232,"Implement Queue using Stacks","design",[[["push",1],["push",2],["peek"],["pop"],["empty"]]],[null,null,1,1,false],`
class Solution:
    def simulate(self, operations):
        incoming, outgoing, answer = [], [], []
        for operation in operations:
            command = operation[0]
            if command == 'push':
                incoming.append(operation[1])
                answer.append(None)
            elif command == 'empty':
                answer.append(not incoming and not outgoing)
            else:
                assert command in ('pop', 'peek')
                if not outgoing:
                    while incoming:
                        outgoing.append(incoming.pop())
                answer.append(outgoing.pop() if command == 'pop' else outgoing[-1])
        return answer
`,{time:"O(1) amortized per operation",space:"O(n)",difficulty:"easy",description:"Transfer the input stack only when the output stack is empty, reversing order to implement FIFO."});
add(233,"Number of Digit One","math",[13],6,`
class Solution:
    def countDigitOne(self, n):
        assert n >= 0
        answer, factor = 0, 1
        while factor <= n:
            higher = n // (factor * 10)
            current = (n // factor) % 10
            lower = n % factor
            answer += higher * factor
            if current == 1:
                answer += lower + 1
            elif current > 1:
                answer += factor
            factor *= 10
        return answer
`,{time:"O(log n)",space:"O(1)",difficulty:"hard",description:"Count the ones contribution of each decimal position using higher, current and lower digits."});
add(237,"Delete Node in a Linked List","list",[[4,5,1,9],1],[4,1,9],`
class Solution:
    def deleteNode(self, values, index):
        assert 0 <= index < len(values) - 1
        nodes = [ListNode(v) for v in values]
        for i in range(len(nodes) - 1):
            nodes[i].next = nodes[i + 1]
        node = nodes[index]
        node.val = node.next.val
        node.next = node.next.next
        return nodes[0]
`,{answerKind:"list",time:"O(1) deletion; O(n) fixture",space:"O(n) fixture",description:"Given a non-tail node by its index, copy its successor's value and bypass that successor."});
add(243,"Shortest Word Distance","array",[["practice","makes","perfect","coding","makes"],"coding","practice"],3,`
class Solution:
    def shortestDistance(self, words, word1, word2):
        assert word1 != word2 and word1 in words and word2 in words
        a = b = -1
        answer = len(words)
        for i, word in enumerate(words):
            if word == word1:
                a = i
            if word == word2:
                b = i
            if a >= 0 and b >= 0:
                answer = min(answer, abs(a - b))
        return answer
`,{time:"O(n)",space:"O(1)",difficulty:"easy",description:"Track the latest occurrence of each distinct target word."});
add(244,"Shortest Word Distance II","design",[["practice","makes","perfect","coding","makes"],[["coding","practice"],["makes","coding"]]],[3,1],`
class Solution:
    def shortestQueries(self, words, queries):
        from collections import defaultdict
        positions = defaultdict(list)
        for i, word in enumerate(words):
            positions[word].append(i)
        answer = []
        for word1, word2 in queries:
            assert word1 != word2 and word1 in positions and word2 in positions
            a, b = positions[word1], positions[word2]
            i = j = 0
            best = len(words)
            while i < len(a) and j < len(b):
                best = min(best, abs(a[i] - b[j]))
                if a[i] < b[j]:
                    i += 1
                else:
                    j += 1
            answer.append(best)
        return answer
`,{time:"O(n) build; O(a+b) per query",space:"O(n)",description:"Index occurrences once, then merge two sorted position lists per distance query."});
add(245,"Shortest Word Distance III","array",[["practice","makes","perfect","coding","makes"],"makes","makes"],3,`
class Solution:
    def shortestWordDistance(self, words, word1, word2):
        a = b = -1
        answer = len(words)
        for i, word in enumerate(words):
            if word == word1:
                if word1 == word2:
                    if a >= 0:
                        answer = min(answer, i - a)
                    a = i
                else:
                    a = i
            if word1 != word2 and word == word2:
                b = i
            if word1 != word2 and a >= 0 and b >= 0:
                answer = min(answer, abs(a - b))
        assert answer < len(words), 'Targets must have valid occurrences'
        return answer
`,{time:"O(n)",space:"O(1)",description:"When targets are identical compare consecutive occurrences; otherwise track their latest positions separately."});
add(247,"Strobogrammatic Number II","backtracking",[2],["11","69","88","96"],`
class Solution:
    def findStrobogrammatic(self, n):
        assert 1 <= n <= 5
        def build(length):
            if length == 0:
                return ['']
            if length == 1:
                return ['0', '1', '8']
            answer = []
            for middle in build(length - 2):
                for a, b in [('0','0'), ('1','1'), ('6','9'), ('8','8'), ('9','6')]:
                    if length == n and a == '0':
                        continue
                    answer.append(a + middle + b)
            return answer
        return sorted(build(n))
`,{time:"O(n·5^(n/2))",space:"O(n·5^(n/2))",description:"Wrap valid inner strings with rotatable digit pairs, forbidding an outer leading zero. Visual n ≤5."});
add(248,"Strobogrammatic Number III","backtracking",["50","100"],3,`
class Solution:
    def strobogrammaticInRange(self, low, high):
        assert low.isdigit() and high.isdigit() and 0 <= int(low) <= int(high) and len(high) <= 6
        pairs = [('0','0'), ('1','1'), ('6','9'), ('8','8'), ('9','6')]
        answer = 0
        def build(length, total):
            if length == 0:
                return ['']
            if length == 1:
                return ['0', '1', '8']
            return [a + middle + b for middle in build(length - 2, total) for a, b in pairs if a != '0' or length != total]
        for length in range(len(str(int(low))), len(str(int(high))) + 1):
            for value in build(length, length):
                if int(low) <= int(value) <= int(high):
                    answer += 1
        return answer
`,{time:"O(L·5^(L/2))",space:"O(L·5^(L/2))",difficulty:"hard",description:"Enumerate rotatable numbers by length, then filter against inclusive numeric bounds. Visual maximum: six digits."});
add(249,"Group Shifted Strings","string",[["abc","bcd","acef","xyz","az","ba","a","z"]],[["abc","bcd","xyz"],["acef"],["az","ba"],["a","z"]],`
class Solution:
    def groupStrings(self, strings):
        groups = {}
        for word in strings:
            assert word and word.isalpha() and word.islower()
            key = tuple((ord(ch) - ord(word[0])) % 26 for ch in word)
            groups.setdefault(key, []).append(word)
        return list(groups.values())
`,{time:"O(total characters)",space:"O(total characters)",description:"Normalize each letter relative to the first modulo 26; equal signatures share one shift group."});
add(251,"Flatten 2D Vector","design",[[[1,2],[],[3],[4]],["hasNext","next","next","next","next","hasNext"]],[true,1,2,3,4,false],`
class Solution:
    def simulate(self, vector, operations):
        row = col = 0
        answer = []
        for command in operations:
            while row < len(vector) and col == len(vector[row]):
                row += 1
                col = 0
            if command == 'hasNext':
                answer.append(row < len(vector))
            else:
                assert command == 'next' and row < len(vector)
                answer.append(vector[row][col])
                col += 1
        return answer
`,{time:"O(rows + elements + operations)",space:"O(1) iterator + output",description:"A row/column cursor lazily skips empty rows; next is called only when an element remains."});
add(254,"Factor Combinations","backtracking",[12],[[2,6],[2,2,3],[3,4]],`
class Solution:
    def getFactors(self, n):
        assert 1 <= n <= 10000
        answer = []
        def dfs(value, start, path):
            for factor in range(start, math.isqrt(value) + 1):
                if value % factor == 0:
                    answer.append(path + [factor, value // factor])
                    dfs(value // factor, factor, path + [factor])
        import math
        dfs(n, 2, [])
        return answer
`,{time:"O(search tree)",space:"O(log n) + output",description:"Choose nondecreasing factors up to the square root, then recursively factor the quotient. Visual n ≤10000."});
add(256,"Paint House","dp",[[[17,2,17],[16,16,5],[14,3,19]]],10,`
class Solution:
    def minCost(self, costs):
        previous = [0, 0, 0]
        for house in costs:
            assert len(house) == 3
            current = [house[c] + min(previous[(c + 1) % 3], previous[(c + 2) % 3]) for c in range(3)]
            previous = current
        return min(previous)
`,{time:"O(n)",space:"O(1)",description:"For each house and color, add the cheapest different color from the preceding house."});
add(259,"3Sum Smaller","array",[[-2,0,1,3],2],2,`
class Solution:
    def threeSumSmaller(self, nums, target):
        nums.sort()
        answer = 0
        for i in range(len(nums) - 2):
            left, right = i + 1, len(nums) - 1
            while left < right:
                if nums[i] + nums[left] + nums[right] < target:
                    answer += right - left
                    left += 1
                else:
                    right -= 1
        return answer
`,{time:"O(n²)",space:"O(n) Python sort",description:"After sorting, one successful pair counts all right endpoints between left and right."});
add(260,"Single Number III","bits",[[1,2,1,3,2,5]],[3,5],`
class Solution:
    def singleNumber(self, nums):
        combined = 0
        for value in nums:
            combined ^= value
        bit = combined & -combined
        a = b = 0
        for value in nums:
            if value & bit:
                a ^= value
            else:
                b ^= value
        return sorted([a, b])
`,{time:"O(n)",space:"O(1)",description:"A set bit of XOR separates the two unique values; duplicated pairs cancel inside each partition."});
add(262,"Trips and Users","sql",[[{"client_id":1,"driver_id":10,"status":"completed","request_at":"2013-10-01"},{"client_id":2,"driver_id":10,"status":"cancelled_by_client","request_at":"2013-10-01"}],[{"users_id":1,"banned":"No"},{"users_id":2,"banned":"No"},{"users_id":10,"banned":"No"}],"2013-10-01","2013-10-03"],[{"Day":"2013-10-01","Cancellation Rate":0.5}],`
class Solution:
    def cancellation(self, trips, users, start, end):
        from decimal import Decimal, ROUND_HALF_UP
        allowed = {u['users_id'] for u in users if u['banned'] == 'No'}
        totals, cancelled = {}, {}
        for trip in trips:
            day = trip['request_at']
            if start <= day <= end and trip['client_id'] in allowed and trip['driver_id'] in allowed:
                totals[day] = totals.get(day, 0) + 1
                cancelled[day] = cancelled.get(day, 0) + int(trip['status'] != 'completed')
        return [{'Day': day, 'Cancellation Rate': float((Decimal(cancelled[day]) / Decimal(totals[day])).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))} for day in sorted(totals)]
`,{difficulty:"hard",time:"O(T + U + D log D)",space:"O(U + D)",description:"Exclude trips with banned clients or drivers, then compute cancelled/total per day within the date range.",reference:"SELECT t.request_at AS Day, ROUND(AVG(t.status <> 'completed'),2) AS `Cancellation Rate`\nFROM Trips t JOIN Users c ON c.users_id=t.client_id AND c.banned='No'\nJOIN Users d ON d.users_id=t.driver_id AND d.banned='No'\nWHERE t.request_at BETWEEN '2013-10-01' AND '2013-10-03' GROUP BY t.request_at;"});
add(263,"Ugly Number","math",[6],true,`
class Solution:
    def isUgly(self, n):
        if n <= 0:
            return False
        for prime in (2, 3, 5):
            while n % prime == 0:
                n //= prime
        return n == 1
`,{time:"O(log n)",space:"O(1)",difficulty:"easy",description:"Remove every factor of two, three and five; a remaining value other than one is invalid."});
add(265,"Paint House II","dp",[[[1,5,3],[2,9,4]]],5,`
class Solution:
    def minCostII(self, costs):
        if not costs:
            return 0
        k = len(costs[0])
        assert k and (k > 1 or len(costs) == 1) and all(len(r) == k for r in costs)
        previous = [0] * k
        for house in costs:
            best = min(range(k), key=lambda i: previous[i])
            second = min((previous[i] for i in range(k) if i != best), default=0)
            current = [house[c] + (second if c == best else previous[best]) for c in range(k)]
            previous = current
        return min(previous)
`,{time:"O(nk)",space:"O(k)",difficulty:"hard",description:"Keep the smallest and second-smallest previous costs to avoid repainting adjacent houses the same color."});
add(266,"Palindrome Permutation","string",["aab"],true,`
class Solution:
    def canPermutePalindrome(self, s):
        odd = set()
        for ch in s:
            if ch in odd:
                odd.remove(ch)
            else:
                odd.add(ch)
        return len(odd) <= 1
`,{time:"O(n)",space:"O(alphabet)",difficulty:"easy",description:"A multiset can form a palindrome exactly when at most one character has an odd frequency."});
add(267,"Palindrome Permutation II","backtracking",["aabb"],["abba","baab"],`
class Solution:
    def generatePalindromes(self, s):
        from collections import Counter
        assert len(s) <= 12
        counts = Counter(s)
        middle = [c for c in counts if counts[c] % 2]
        if len(middle) > 1:
            return []
        center = ''.join(middle)
        for c in counts:
            counts[c] //= 2
        length = len(s) // 2
        answer = []
        def dfs(path):
            if len(path) == length:
                half = ''.join(path)
                answer.append(half + center + half[::-1])
                return
            for c in sorted(counts):
                if counts[c]:
                    counts[c] -= 1
                    dfs(path + [c])
                    counts[c] += 1
        dfs([])
        return answer
`,{time:"O(n·(n/2)!)",space:"O(n) + output",description:"Permute only the half-counts, insert the optional odd character, then mirror. Visual string length ≤12."});
add(271,"Encode and Decode Strings","design",[["lint","code","","a#b"]],{encoded:"4#lint4#code0#3#a#b",decoded:["lint","code","","a#b"]},`
class Solution:
    def roundTrip(self, strings):
        encoded = ''.join(str(len(s)) + '#' + s for s in strings)
        decoded, i = [], 0
        while i < len(encoded):
            end = encoded.index('#', i)
            length = int(encoded[i:end])
            i = end + 1
            decoded.append(encoded[i:i + length])
            i += length
        return dict(encoded=encoded, decoded=decoded)
`,{time:"O(total characters)",space:"O(total characters)",description:"Length-prefix framing handles empty strings and embedded delimiter characters without ambiguity."});
add(273,"Integer to English Words","math",[12345],"Twelve Thousand Three Hundred Forty Five",`
class Solution:
    def numberToWords(self, num):
        assert 0 <= num <= 2147483647
        if num == 0:
            return 'Zero'
        small = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
        tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']
        def chunk(n):
            if n < 20:
                return small[n]
            if n < 100:
                return (tens[n // 10] + ' ' + small[n % 10]).strip()
            return (small[n // 100] + ' Hundred ' + chunk(n % 100)).strip()
        words = []
        for value, label in [(10**9,'Billion'), (10**6,'Million'), (1000,'Thousand'), (1,'')]:
            count, num = divmod(num, value)
            if count:
                words.append((chunk(count) + ' ' + label).strip())
        return ' '.join(words)
`,{time:"O(log num)",space:"O(log num)",difficulty:"hard",description:"Convert groups of three digits, attaching Billion, Million and Thousand labels without extra spaces."});
add(274,"H-Index","array",[[3,0,6,1,5]],3,`
class Solution:
    def hIndex(self, citations):
        ranked = sorted(citations, reverse=True)
        h = 0
        for i, count in enumerate(ranked, 1):
            if count < i:
                break
            h = i
        return h
`,{time:"O(n log n)",space:"O(n)",description:"The hth ranked paper needs at least h citations; find the longest valid prefix."});
add(275,"H-Index II","search",[[0,1,3,5,6]],3,`
class Solution:
    def hIndex(self, citations):
        assert citations == sorted(citations)
        lo, hi = 0, len(citations)
        while lo < hi:
            mid = (lo + hi) // 2
            if citations[mid] >= len(citations) - mid:
                hi = mid
            else:
                lo = mid + 1
        return len(citations) - lo
`,{time:"O(log n)",space:"O(1)",description:"In sorted citations, binary-search the first index supporting n-index papers."});
add(277,"Find the Celebrity","graph",[[[1,1,0],[0,1,0],[1,1,1]]],1,`
class Solution:
    def findCelebrity(self, knows):
        n = len(knows)
        assert n and all(len(row) == n for row in knows)
        candidate = 0
        for person in range(1, n):
            if knows[candidate][person]:
                candidate = person
        for person in range(n):
            if person != candidate and (knows[candidate][person] or not knows[person][candidate]):
                return -1
        return candidate
`,{time:"O(n) knows calls",space:"O(1) algorithm",description:"The knows matrix models the judge API. Eliminate candidates in one pass, then verify the survivor."});
add(280,"Wiggle Sort","array",[[3,5,2,1,6,4]],[3,5,1,6,2,4],`
class Solution:
    def wiggleSort(self, nums):
        for i in range(1, len(nums)):
            if (i % 2 == 1 and nums[i] < nums[i - 1]) or (i % 2 == 0 and nums[i] > nums[i - 1]):
                nums[i], nums[i - 1] = nums[i - 1], nums[i]
        return nums
`,{time:"O(n)",space:"O(1)",description:"Swap adjacent elements whenever the required ≤ ≥ ≤ ≥ relation is violated."});
add(281,"Zigzag Iterator","design",[[1,2],[3,4,5,6]],[1,3,2,4,5,6],`
class Solution:
    def zigzag(self, v1, v2):
        from collections import deque
        vectors = [v1, v2]
        queue = deque((i, 0) for i in range(2) if vectors[i])
        output = []
        while queue:
            vector, index = queue.popleft()
            output.append(vectors[vector][index])
            if index + 1 < len(vectors[vector]):
                queue.append((vector, index + 1))
        return output
`,{time:"O(n + m)",space:"O(1) iterator + output",description:"Rotate cursors through nonempty vectors, skipping exhausted ones."});
add(284,"Peeking Iterator","design",[[1,2,3],["peek","next","next","peek","next","hasNext"]],[1,1,2,3,3,false],`
class Solution:
    def simulate(self, values, operations):
        index, cached = 0, None
        has_cache = False
        answer = []
        for command in operations:
            if command == 'hasNext':
                answer.append(has_cache or index < len(values))
                continue
            if not has_cache:
                assert index < len(values)
                cached = values[index]
                index += 1
                has_cache = True
            answer.append(cached)
            if command == 'next':
                has_cache = False
            else:
                assert command == 'peek'
        return answer
`,{time:"O(1) per operation",space:"O(1) + output",description:"Cache one element for peek; next consumes the cache and hasNext checks both cache and underlying iterator."});
add(288,"Unique Word Abbreviation","design",[["deer","door","cake","card"],["dear","cart","cane","make"]],[false,true,false,true],`
class Solution:
    def checkWords(self, dictionary, queries):
        def abbrev(word):
            return word if len(word) <= 2 else word[0] + str(len(word) - 2) + word[-1]
        groups = {}
        for word in dictionary:
            groups.setdefault(abbrev(word), set()).add(word)
        answer = []
        for word in queries:
            matches = groups.get(abbrev(word), set())
            answer.append(not matches or matches == {word})
        return answer
`,{time:"O(total characters)",space:"O(dictionary)",description:"An abbreviation is unique if absent or if all dictionary words sharing it equal the query."});
add(289,"Game of Life","array",[[[0,1,0],[0,0,1],[1,1,1],[0,0,0]]],[[0,0,0],[1,0,1],[0,1,1],[0,1,0]],`
class Solution:
    def gameOfLife(self, board):
        if not board:
            return board
        rows, cols = len(board), len(board[0])
        assert all(len(row) == cols and set(row) <= {0,1} for row in board)
        for r in range(rows):
            for c in range(cols):
                live = 0
                for dr, dc in [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols:
                        live += board[nr][nc] & 1
                if live == 3 or (live == 2 and board[r][c] & 1):
                    board[r][c] |= 2
        for r in range(rows):
            for c in range(cols):
                board[r][c] >>= 1
        return board
`,{time:"O(rows·cols)",space:"O(1)",description:"Store the next generation in bit 1 while reading original states from bit 0, then shift all cells."});
add(291,"Word Pattern II","backtracking",["abab","redblueredblue"],true,`
class Solution:
    def wordPatternMatch(self, pattern, s):
        assert len(pattern) <= 8 and len(s) <= 30
        mapping, used = {}, set()
        def dfs(i, j):
            if i == len(pattern) or j == len(s):
                return i == len(pattern) and j == len(s)
            ch = pattern[i]
            if ch in mapping:
                word = mapping[ch]
                return s.startswith(word, j) and dfs(i + 1, j + len(word))
            for end in range(j + 1, len(s) + 1):
                word = s[j:end]
                if word not in used:
                    mapping[ch] = word
                    used.add(word)
                    if dfs(i + 1, end):
                        return True
                    used.remove(word)
                    del mapping[ch]
            return False
        return dfs(0, 0)
`,{time:"O(exponential search)",space:"O(|s| + |pattern|)",difficulty:"hard",description:"Backtrack a bijection from pattern characters to nonempty substrings. Visual pattern ≤8, text ≤30."});
add(292,"Nim Game","math",[4],false,`
class Solution:
    def canWinNim(self, n):
        assert n >= 1
        remainder = n % 4
        return remainder != 0
`,{time:"O(1)",space:"O(1)",difficulty:"easy",description:"With removals of 1–3 stones, multiples of four are losing positions under optimal play."});
add(293,"Flip Game","string",["++++"],["--++","+--+","++--"],`
class Solution:
    def generatePossibleNextMoves(self, currentState):
        assert set(currentState) <= {'+', '-'}
        answer = []
        for i in range(len(currentState) - 1):
            if currentState[i:i + 2] == '++':
                answer.append(currentState[:i] + '--' + currentState[i + 2:])
        return answer
`,{time:"O(n²)",space:"O(n²) output",difficulty:"easy",description:"Generate every state obtained by replacing exactly one adjacent ++ with --."});
add(294,"Flip Game II","backtracking",["++++"],true,`
class Solution:
    def canWin(self, currentState):
        from functools import lru_cache
        assert len(currentState) <= 18 and set(currentState) <= {'+', '-'}
        @lru_cache(None)
        def win(state):
            for i in range(len(state) - 1):
                if state[i:i + 2] == '++':
                    following = state[:i] + '--' + state[i + 2:]
                    if not win(following):
                        return True
            return False
        return win(currentState)
`,{time:"O(n²·2ⁿ) upper bound",space:"O(n·2ⁿ)",description:"A position wins if any legal flip leaves a losing position for the opponent; memoize states. Visual length ≤18."});
add(296,"Best Meeting Point","array",[[[1,0,0,0,1],[0,0,0,0,0],[0,0,1,0,0]]],6,`
class Solution:
    def minTotalDistance(self, grid):
        rows, cols = [], []
        for r, row in enumerate(grid):
            for c, value in enumerate(row):
                if value:
                    rows.append(r)
                    cols.append(c)
        if not rows:
            return 0
        rows.sort()
        cols.sort()
        mr, mc = rows[len(rows) // 2], cols[len(cols) // 2]
        return sum(abs(r - mr) for r in rows) + sum(abs(c - mc) for c in cols)
`,{time:"O(RC + H log H)",space:"O(H)",difficulty:"hard",description:"Row and column medians independently minimize total Manhattan distance."});
add(299,"Bulls and Cows","string",["1807","7810"],"1A3B",`
class Solution:
    def getHint(self, secret, guess):
        from collections import Counter
        assert len(secret) == len(guess) and secret.isdigit() and guess.isdigit()
        bulls = 0
        a, b = Counter(), Counter()
        for x, y in zip(secret, guess):
            if x == y:
                bulls += 1
            else:
                a[x] += 1
                b[y] += 1
        cows = sum((a & b).values())
        return str(bulls) + 'A' + str(cows) + 'B'
`,{time:"O(n)",space:"O(10)",description:"Count exact-position bulls first; match remaining digit frequencies to obtain cows."});
module.exports=lessons;
