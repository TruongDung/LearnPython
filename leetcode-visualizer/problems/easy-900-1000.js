"use strict";
const {defineEasy}=require('./easy-lesson');
const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(902,'Numbers At Most N Given Digit Set','math',[[ '1','3','5','7'],100],20,`
class Solution:
    def atMostNGivenDigitSet(self, digits, n):
        text, base = str(n), len(digits)
        answer = sum(base**length for length in range(1,len(text)))
        for i,ch in enumerate(text):
            smaller = sum(digit < ch for digit in digits)
            answer += smaller*base**(len(text)-i-1)
            if ch not in digits:
                return answer
        return answer+1
`,'Đếm số ít chữ số hơn trước. Với cùng độ dài, cố định tiền tố bằng n rồi đếm các lựa chọn nhỏ hơn ở chữ số tiếp theo.','O(|digits| log n)','O(log n)');
add(903,'Valid Permutations for DI Sequence','dp',['DID'],5,`
class Solution:
    def numPermsDISequence(self, s):
        dp, mod = [1], 1000000007
        for ch in s:
            following = [0]*(len(dp)+1)
            total = 0 if ch == 'I' else sum(dp)
            for rank in range(len(following)):
                following[rank] = total%mod
                if rank < len(dp):
                    total += dp[rank] if ch == 'I' else -dp[rank]
            dp = following
        return sum(dp)%mod
`,'dp[r] đếm cách với số cuối có thứ hạng r. I lấy tổng các hạng nhỏ hơn; D lấy tổng các hạng lớn hơn hoặc bằng trong dãy cũ.','O(n²)','O(n)',{focus:['s','dp','following','rank','total']});
add(906,'Super Palindromes','math',['4','1000'],4,`
class Solution:
    def superpalindromesInRange(self, left, right):
        import math
        low, high = int(left),int(right)
        assert 1 <= low <= high <= 10000000000, 'Picture range upper bound is 10^10'
        limit, found = math.isqrt(high), set()
        seeds = 10**((len(str(limit))+1)//2)
        for seed in range(1,seeds):
            text = str(seed)
            roots = [int(text+text[-2::-1]),int(text+text[::-1])]
            for root in roots:
                square = root*root
                if root <= limit and low <= square <= high and str(square) == str(square)[::-1]:
                    found.add(square)
        return len(found)
`,'Sinh căn bậc hai đối xứng bằng cách soi gương nửa đầu; chỉ giữ bình phương cũng đối xứng và nằm trong khoảng.','O(√√R·log R)','O(√√R)',{focus:['roots','square','found'],traceOptions:{maxEvents:20000}});
add(908,'Smallest Range I','math',[[1,3,6],3],0,`
class Solution:
    def smallestRangeI(self, nums, k):
        low, high = min(nums),max(nums)
        return max(0,high-low-2*k)
`,'Nâng số nhỏ nhất tối đa k và hạ số lớn nhất tối đa k; nếu hai vùng gặp nhau thì chênh lệch bằng 0.','O(n)','O(1)',{difficulty:'easy'});
add(909,'Snakes and Ladders','graph',[[[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,35,-1,-1,13,-1],[-1,-1,-1,-1,-1,-1],[-1,15,-1,-1,-1,-1]]],4,`
class Solution:
    def snakesAndLadders(self, board):
        from collections import deque
        n = len(board)
        def destination(square):
            row,col = divmod(square-1,n)
            col = n-1-col if row%2 else col
            jump = board[n-1-row][col]
            return square if jump == -1 else jump
        queue, seen = deque([(1,0)]), {1}
        while queue:
            square,distance = queue.popleft()
            if square == n*n:
                return distance
            for roll in range(1,7):
                if square+roll > n*n:
                    break
                following = destination(square+roll)
                if following not in seen:
                    seen.add(following)
                    queue.append((following,distance+1))
        return -1
`,'BFS theo số lần gieo xúc xắc. Đánh số bảng zíc-zắc từ dưới lên; mỗi lượt chỉ dùng một rắn hoặc thang tại ô đáp xuống.','O(n²)','O(n²)',{focus:['board','queue','seen','square','distance']});
add(910,'Smallest Range II','greedy',[[1,3,6],3],3,`
class Solution:
    def smallestRangeII(self, nums, k):
        nums = sorted(nums)
        answer = nums[-1]-nums[0]
        for i in range(len(nums)-1):
            low = min(nums[0]+k,nums[i+1]-k)
            high = max(nums[i]+k,nums[-1]-k)
            answer = min(answer,high-low)
        return answer
`,'Sau sắp xếp, chọn một chỗ chia: nhóm nhỏ cộng k, nhóm lớn trừ k. Thử mọi chỗ chia và cả trường hợp tất cả cùng dịch.','O(n log n)','O(n)');
add(912,'Sort an Array','array',[[5,2,3,1]],[1,2,3,5],`
class Solution:
    def sortArray(self, nums):
        def sort(values):
            if len(values) <= 1:
                return values
            mid = len(values)//2
            left,right = sort(values[:mid]),sort(values[mid:])
            merged, i, j = [],0,0
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    merged.append(left[i])
                    i += 1
                else:
                    merged.append(right[j])
                    j += 1
            return merged+left[i:]+right[j:]
        return sort(nums)
`,'Merge sort: chia đôi, sắp xếp từng nửa rồi trộn bằng hai con trỏ, luôn lấy số nhỏ hơn trước.','O(n log n)','O(n)',{focus:['left','right','merged','i','j']});
add(914,'X of a Kind in a Deck of Cards','math',[[1,2,3,4,4,3,2,1]],true,`
class Solution:
    def hasGroupsSizeX(self, deck):
        from collections import Counter
        from math import gcd
        counts, divisor = Counter(deck), 0
        for count in counts.values():
            divisor = gcd(divisor,count)
        return divisor >= 2
`,'Kích thước nhóm X phải chia hết tần suất mọi lá bài; tồn tại X≥2 khi ƯCLN các tần suất ≥2.','O(n log n)','O(n)',{difficulty:'easy'});
add(915,'Partition Array into Disjoint Intervals','array',[[5,0,3,8,6]],3,`
class Solution:
    def partitionDisjoint(self, nums):
        leftMax, seenMax, end = nums[0],nums[0],0
        for i in range(1,len(nums)):
            seenMax = max(seenMax,nums[i])
            if nums[i] < leftMax:
                end, leftMax = i,seenMax
        return end+1
`,'Nếu gặp số nhỏ hơn max bên trái, phải kéo nó vào phần trái và cập nhật max của toàn đoạn vừa kéo.','O(n)','O(1)');
add(916,'Word Subsets','string',[[ 'amazon','apple','facebook','google','leetcode'],['e','o']],['facebook','google','leetcode'],`
class Solution:
    def wordSubsets(self, words1, words2):
        from collections import Counter
        needed = Counter()
        for word in words2:
            counts = Counter(word)
            for ch,count in counts.items():
                needed[ch] = max(needed[ch],count)
        answer = []
        for word in words1:
            counts = Counter(word)
            if all(counts[ch] >= count for ch,count in needed.items()):
                answer.append(word)
        return answer
`,'Gộp yêu cầu bằng số lần lớn nhất của từng chữ trong words2; kiểm tra mỗi từ words1 có đủ các chữ đó không.','O(Σword lengths)','O(alphabet+output)');
add(919,'Complete Binary Tree Inserter','design',[[1,2,3,4,5,6],[7,8]],{parents:[3,4],tree:[1,2,3,4,5,6,7,8]},`
class Solution:
    def insertions(self, root, values):
        from collections import deque
        nodes, queue = [root],deque()
        for node in nodes:
            if not node.left or not node.right:
                queue.append(node)
            if node.left:
                nodes.append(node.left)
            if node.right:
                nodes.append(node.right)
        parents = []
        for value in values:
            parent, child = queue[0],TreeNode(value)
            if not parent.left:
                parent.left = child
            else:
                parent.right = child
                queue.popleft()
            queue.append(child)
            parents.append(parent.val)
        return {'parents':parents,'tree':_tree_values(root)}
`,'Hàng đợi giữ các node chưa đủ hai con theo level-order. Chèn vào node đầu, trái trước phải; đủ hai con thì bỏ khỏi đầu hàng.','O(n+q)','O(n+q)',{kinds:['tree'],focus:['queue','parents']});
add(922,'Sort Array By Parity II','array',[[4,2,5,7]],[4,5,2,7],`
class Solution:
    def sortArrayByParityII(self, nums):
        answer = nums[:]
        even,odd = 0,1
        for value in nums:
            if value%2:
                answer[odd] = value
                odd += 2
            else:
                answer[even] = value
                even += 2
        return answer
`,'Hai con trỏ đi cách 2: even đặt số chẵn vào vị trí chẵn, odd đặt số lẻ vào vị trí lẻ.','O(n)','O(n)',{difficulty:'easy'});
add(923,'3Sum With Multiplicity','math',[[1,1,2,2,3,3,4,4,5,5],8],20,`
class Solution:
    def threeSumMulti(self, arr, target):
        from collections import Counter
        from math import comb
        counts, answer = Counter(arr),0
        values = sorted(counts)
        for i,a in enumerate(values):
            for b in values[i:]:
                c = target-a-b
                if c < b or c not in counts:
                    continue
                if a == c:
                    ways = comb(counts[a],3) if counts[a] >= 3 else 0
                elif a == b:
                    ways = comb(counts[a],2)*counts[c] if counts[a] >= 2 else 0
                elif b == c:
                    ways = counts[a]*comb(counts[b],2) if counts[b] >= 2 else 0
                else:
                    ways = counts[a]*counts[b]*counts[c]
                answer = (answer+ways)%1000000007
        return answer
`,'Xét bộ giá trị a≤b≤c có tổng target; nhân tần suất nếu khác nhau, dùng tổ hợp khi có giá trị trùng.','O(u²+n)','O(u)');
add(925,'Long Pressed Name','string',['alex','aaleex'],true,`
class Solution:
    def isLongPressedName(self, name, typed):
        i = 0
        for j,ch in enumerate(typed):
            if i < len(name) and ch == name[i]:
                i += 1
            elif j == 0 or ch != typed[j-1]:
                return False
        return i == len(name)
`,'Khớp tên thì tiến con trỏ; ký tự gõ dư chỉ hợp lệ nếu lặp lại ký tự ngay trước. Cuối cùng phải khớp hết tên.','O(n+m)','O(1)',{difficulty:'easy'});
add(926,'Flip String to Monotone Increasing','dp',['00110'],1,`
class Solution:
    def minFlipsMonoIncr(self, s):
        ones,flips = 0,0
        for ch in s:
            if ch == '1':
                ones += 1
            else:
                flips = min(flips+1,ones)
        return flips
`,'Gặp 0 sau các 1: hoặc lật 0 này thành 1, hoặc lật mọi 1 trước thành 0; giữ phương án ít lần lật hơn.','O(n)','O(1)');
add(927,'Three Equal Parts','array',[[1,0,1,0,1]],[0,3],`
class Solution:
    def threeEqualParts(self, arr):
        ones = [i for i,value in enumerate(arr) if value]
        if not ones:
            return [0,len(arr)-1]
        if len(ones)%3:
            return [-1,-1]
        count = len(ones)//3
        a,b,c = ones[0],ones[count],ones[2*count]
        length = len(arr)-c
        if a+length <= b and b+length <= c and arr[a:a+length] == arr[b:b+length] == arr[c:]:
            return [a+length-1,b+length]
        return [-1,-1]
`,'Ba phần bằng số phải có cùng số bit 1 và cùng chuỗi từ bit 1 đầu tiên tới cuối, kể cả các số 0 cuối.','O(n)','O(n)');
add(932,'Beautiful Array','array',[4],[1,3,2,4],`
class Solution:
    def beautifulArray(self, n):
        assert 1 <= n <= 80
        answer = [1]
        while len(answer) < n:
            answer = [2*x-1 for x in answer if 2*x-1 <= n]+[2*x for x in answer if 2*x <= n]
        return answer
`,'Tách số lẻ trước, số chẵn sau. Hai số khác tính chẵn/lẻ không thể có trung bình nguyên; trong mỗi nửa, quy tắc đẹp được giữ qua biến đổi tuyến tính.','O(n)','O(n)',{focus:['answer']});
add(935,'Knight Dialer','dp',[2],20,`
class Solution:
    def knightDialer(self, n):
        assert 1 <= n <= 80
        moves = [[4,6],[6,8],[7,9],[4,8],[0,3,9],[],[0,1,7],[2,6],[1,3],[2,4]]
        dp = [1]*10
        for length in range(2,n+1):
            following = [0]*10
            for digit in range(10):
                for neighbor in moves[digit]:
                    following[neighbor] = (following[neighbor]+dp[digit])%1000000007
            dp = following
        return sum(dp)%1000000007
`,'dp[d] đếm dãy kết thúc ở phím d. Mỗi bước chuyển số cách tới các phím quân mã có thể nhảy tới.','O(n)','O(10)',{focus:['dp','following','digit','neighbor']});
add(936,'Stamping The Sequence','greedy',['abc','ababc'],[0,2],`
class Solution:
    def movesToStamp(self, stamp, target):
        remaining, answer = list(target),[]
        while any(ch != '?' for ch in remaining):
            progress = False
            for start in range(len(target)-len(stamp)+1):
                window = remaining[start:start+len(stamp)]
                if any(ch != '?' for ch in window) and all(ch == '?' or ch == expected for ch,expected in zip(window,stamp)):
                    remaining[start:start+len(stamp)] = ['?']*len(stamp)
                    answer.append(start)
                    progress = True
            if not progress:
                return []
        return answer[::-1]
`,'Làm ngược: xóa một vùng có thể đã được đóng dấu, cho phép ? là ô đã xóa. Đảo thứ tự các lần xóa để được thứ tự đóng dấu.','O(mn²)','O(n)',{focus:['stamp','remaining','window','answer']});
add(937,'Reorder Data in Log Files','string',[[ 'dig1 8 1 5 1','let1 art can','dig2 3 6','let2 own kit dig','let3 art zero']],['let1 art can','let3 art zero','let2 own kit dig','dig1 8 1 5 1','dig2 3 6'],`
class Solution:
    def reorderLogFiles(self, logs):
        letters,digits = [],[]
        for log in logs:
            identifier,content = log.split(' ',1)
            if content[0].isdigit():
                digits.append(log)
            else:
                letters.append((content,identifier,log))
        letters.sort()
        return [row[2] for row in letters]+digits
`,'Log chữ xếp theo nội dung rồi ID; log số giữ thứ tự ban đầu và đặt sau toàn bộ log chữ.','O(nL log n)','O(nL)');
add(942,'DI String Match','greedy',['IDID'],[0,4,1,3,2],`
class Solution:
    def diStringMatch(self, s):
        low,high,answer = 0,len(s),[]
        for ch in s:
            if ch == 'I':
                answer.append(low)
                low += 1
            else:
                answer.append(high)
                high -= 1
        return answer+[low]
`,'Gặp I lấy số nhỏ nhất còn lại để chắc chắn tăng ở bước sau; gặp D lấy số lớn nhất để chắc chắn giảm.','O(n)','O(n)',{difficulty:'easy'});
add(944,'Delete Columns to Make Sorted','array',[[ 'cba','daf','ghi']],1,`
class Solution:
    def minDeletionSize(self, strs):
        deleted = []
        for c in range(len(strs[0])):
            if any(strs[r-1][c] > strs[r][c] for r in range(1,len(strs))):
                deleted.append(c)
        return len(deleted)
`,'Xét riêng từng cột từ trên xuống; chỉ cần một cặp giảm là cột đó phải xóa.','O(mn)','O(n)',{difficulty:'easy',focus:['strs','deleted']});
add(945,'Minimum Increment to Make Array Unique','greedy',[[3,2,1,2,1,7]],6,`
class Solution:
    def minIncrementForUnique(self, nums):
        ordered = sorted(nums)
        nextFree,answer = -float('inf'),0
        for value in ordered:
            assigned = max(value,nextFree)
            answer += assigned-value
            nextFree = assigned+1
        return answer
`,'Sắp tăng dần; gán mỗi số vào vị trí trống nhỏ nhất không nhỏ hơn nó. Cộng số lần tăng cần dùng.','O(n log n)','O(n)');
add(946,'Validate Stack Sequences','array',[[1,2,3,4,5],[4,5,3,2,1]],true,`
class Solution:
    def validateStackSequences(self, pushed, popped):
        stack,j = [],0
        for value in pushed:
            stack.append(value)
            while stack and j < len(popped) and stack[-1] == popped[j]:
                stack.pop()
                j += 1
        return j == len(popped)
`,'Mô phỏng push; hễ đỉnh stack đúng phần tử popped cần tiếp theo thì pop ngay, lặp đến khi không còn khớp.','O(n)','O(n)',{focus:['pushed','popped','stack','j']});
add(948,'Bag of Tokens','greedy',[[100,200,300,400],200],2,`
class Solution:
    def bagOfTokensScore(self, tokens, power):
        tokens = sorted(tokens)
        left,right,score,best = 0,len(tokens)-1,0,0
        while left <= right:
            if power >= tokens[left]:
                power -= tokens[left]
                left += 1
                score += 1
                best = max(best,score)
            elif score and left < right:
                power += tokens[right]
                right -= 1
                score -= 1
            else:
                break
        return best
`,'Đủ năng lượng thì mua điểm bằng token rẻ nhất; thiếu thì bán một điểm lấy token đắt nhất. Giữ điểm cao nhất từng đạt.','O(n log n)','O(n)');
add(949,'Largest Time for Given Digits','backtracking',[[1,2,3,4]],'23:41',`
class Solution:
    def largestTimeFromDigits(self, arr):
        from itertools import permutations
        best = -1
        for a,b,c,d in permutations(arr):
            hour,minute = 10*a+b,10*c+d
            if hour < 24 and minute < 60:
                best = max(best,60*hour+minute)
        return '' if best < 0 else f'{best//60:02d}:{best%60:02d}'
`,'Thử 24 thứ tự bốn chữ số; chỉ giữ giờ <24 và phút <60, rồi lấy thời điểm muộn nhất.','O(4!)','O(1)');
add(950,'Reveal Cards In Increasing Order','array',[[17,13,11,2,3,5,7]],[2,13,3,11,5,17,7],`
class Solution:
    def deckRevealedIncreasing(self, deck):
        from collections import deque
        positions = deque(range(len(deck)))
        answer = [0]*len(deck)
        for card in sorted(deck):
            index = positions.popleft()
            answer[index] = card
            if positions:
                positions.append(positions.popleft())
        return answer
`,'Mô phỏng thứ tự mở các vị trí bằng hàng đợi; đặt lá nhỏ nhất còn lại vào vị trí sắp được mở.','O(n log n)','O(n)',{focus:['positions','answer','card','index']});
add(953,'Verifying an Alien Dictionary','string',[[ 'hello','leetcode'],'hlabcdefgijkmnopqrstuvwxyz'],true,`
class Solution:
    def isAlienSorted(self, words, order):
        rank = {ch:i for i,ch in enumerate(order)}
        previous = None
        for word in words:
            key = [rank[ch] for ch in word]
            if previous is not None and previous > key:
                return False
            previous = key
        return True
`,'Đổi chữ thành thứ hạng trong bảng chữ cái mới; so các dãy thứ hạng, tự xử lý cả trường hợp tiền tố.','O(Σ|word|)','O(alphabet+max word length)',{difficulty:'easy'});
add(954,'Array of Doubled Pairs','greedy',[[4,-2,2,-4]],true,`
class Solution:
    def canReorderDoubled(self, arr):
        from collections import Counter
        counts = Counter(arr)
        if counts[0]%2:
            return False
        counts[0] = 0
        for value in sorted(counts,key=abs):
            needed = counts[value]
            if counts[2*value] < needed:
                return False
            counts[2*value] -= needed
        return True
`,'Xử lý theo trị tuyệt đối tăng dần để ghép x với 2x; riêng số 0 phải có số lượng chẵn.','O(n log n)','O(n)');
add(955,'Delete Columns to Make Sorted II','greedy',[[ 'ca','bb','ac']],1,`
class Solution:
    def minDeletionSize(self, strs):
        resolved = [False]*(len(strs)-1)
        deleted = []
        for c in range(len(strs[0])):
            if any(not resolved[r] and strs[r][c] > strs[r+1][c] for r in range(len(resolved))):
                deleted.append(c)
                continue
            for r in range(len(resolved)):
                if strs[r][c] < strs[r+1][c]:
                    resolved[r] = True
        return len(deleted)
`,'Chỉ cặp hàng chưa phân định mới cần xét cột tiếp. Nếu cột làm cặp đó đảo thứ tự thì xóa; nếu nhỏ hơn thì cặp được phân định vĩnh viễn.','O(mn)','O(m+n)',{focus:['strs','resolved','deleted']});
add(957,'Prison Cells After N Days','array',[[0,1,0,1,1,0,0,1],7],[0,0,1,1,0,0,0,0],`
class Solution:
    def prisonAfterNDays(self, cells, n):
        seen, state = {},tuple(cells)
        while n:
            if state in seen:
                cycle = seen[state]-n
                n %= cycle
            else:
                seen[state] = n
            if n == 0:
                break
            n -= 1
            state = tuple(int(0 < i < len(state)-1 and state[i-1] == state[i+1]) for i in range(len(state)))
        return list(state)
`,'Ngày mới chỉ phụ thuộc hai ô hàng xóm của ngày cũ. Khi trạng thái lặp, dùng modulo để bỏ qua nguyên chu kỳ.','O(min(days,2^cells)·cells)','O(2^cells·cells)',{focus:['state','seen','n','cycle']});
add(958,'Check Completeness of a Binary Tree','tree',[[1,2,3,4,5,6]],true,`
class Solution:
    def isCompleteTree(self, root):
        from collections import deque
        queue, gap = deque([root]),False
        while queue:
            node = queue.popleft()
            if node is None:
                gap = True
            else:
                if gap:
                    return False
                queue.extend([node.left,node.right])
        return True
`,'Duyệt level-order kể cả chỗ trống; một khi gặp chỗ trống thì không được gặp node thật phía sau.','O(n)','O(n)',{kinds:['tree']});
add(959,'Regions Cut By Slashes','graph',[[ ' /','/ ']],2,String.raw`
class Solution:
    def regionsBySlashes(self, grid):
        n = len(grid)
        parent = list(range(4*n*n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        def union(a,b):
            parent[find(a)] = find(b)
        for r,row in enumerate(grid):
            for c,ch in enumerate(row):
                base = 4*(r*n+c)
                if ch != '/':
                    union(base,base+1)
                    union(base+2,base+3)
                if ch != '\\':
                    union(base,base+3)
                    union(base+1,base+2)
                if c+1 < n:
                    union(base+1,base+7)
                if r+1 < n:
                    union(base+2,base+4*n)
        return len({find(i) for i in range(4*n*n)})
`,'Mỗi ô chia thành bốn tam giác trên/phải/dưới/trái. Dấu gạch ngăn nối trong ô; nối cạnh kề giữa các ô rồi đếm nhóm DSU.','O(n²·α(n²))','O(n²)',{focus:['grid','parent','base']});
add(960,'Delete Columns to Make Sorted III','dp',[[ 'babca','bbazb']],3,`
class Solution:
    def minDeletionSize(self, strs):
        n = len(strs[0])
        dp = [1]*n
        for j in range(n):
            for i in range(j):
                if all(row[i] <= row[j] for row in strs):
                    dp[j] = max(dp[j],dp[i]+1)
        return n-max(dp,default=0)
`,'Giữ dãy cột dài nhất sao cho mọi hàng đều không giảm. Cột i được nối trước j khi tất cả hàng có ký tự i ≤ j.','O(mn²)','O(n)',{focus:['strs','dp']});
add(961,'N-Repeated Element in Size 2N Array','array',[[1,2,3,3]],3,`
class Solution:
    def repeatedNTimes(self, nums):
        seen = set()
        for value in nums:
            if value in seen:
                return value
            seen.add(value)
`,'Theo điều kiện đề, chỉ một số xuất hiện nhiều lần; lần đầu gặp lại số đã có trong seen là đáp án.','O(n)','O(n)',{difficulty:'easy'});
add(966,'Vowel Spellchecker','string',[[ 'KiTe','kite','hare','Hare'],['kite','Kite','KiTe','Hare','HARE','Hear','hear','keti','keet','keto']],['kite','KiTe','KiTe','Hare','hare','','','KiTe','','KiTe'],`
class Solution:
    def spellchecker(self, wordlist, queries):
        exact, lower, vowels = set(wordlist),{},{}
        def key(word):
            return ''.join('*' if ch in 'aeiou' else ch for ch in word.lower())
        for word in wordlist:
            lower.setdefault(word.lower(),word)
            vowels.setdefault(key(word),word)
        answer = []
        for query in queries:
            answer.append(query if query in exact else lower.get(query.lower(),vowels.get(key(query),'')))
        return answer
`,'Ưu tiên khớp chính xác, rồi không phân biệt hoa thường, rồi xem mọi nguyên âm tương đương. Hai mức sau giữ từ đầu tiên trong wordlist.','O(total characters)','O(total characters)',{focus:['queries','lower','vowels','answer']});
add(967,'Numbers With Same Consecutive Differences','backtracking',[3,7],[181,292,707,818,929],`
class Solution:
    def numsSameConsecDiff(self, n, k):
        assert 1 <= n <= 4 and 0 <= k <= 9
        if n == 1:
            return list(range(10))
        values = list(range(1,10))
        for length in range(2,n+1):
            following = []
            for value in values:
                last = value%10
                for digit in sorted({last-k,last+k}):
                    if 0 <= digit <= 9:
                        following.append(10*value+digit)
            values = following
        return sorted(values)
`,'Bắt đầu bằng 1..9; chữ số kế chỉ có thể là chữ số cuối ±k. Dùng tập để không tạo bản sao khi k=0.','O(2^n)','O(2^n)',{focus:['values','following','last','digit']});
add(969,'Pancake Sorting','array',[[3,2,4,1]],[3,4,2,3,2],`
class Solution:
    def pancakeSort(self, arr):
        values, flips = arr[:],[]
        for size in range(len(values),1,-1):
            index = values.index(max(values[:size]))
            if index == size-1:
                continue
            if index:
                values[:index+1] = values[:index+1][::-1]
                flips.append(index+1)
            values[:size] = values[:size][::-1]
            flips.append(size)
        return flips
`,'Đưa số lớn nhất của phần chưa xếp lên đầu bằng một lần lật, rồi lật cả phần để đưa nó về cuối.','O(n²)','O(n)',{focus:['values','flips','size','index']});
add(970,'Powerful Integers','math',[2,3,10],[2,3,4,5,7,9,10],`
class Solution:
    def powerfulIntegers(self, x, y, bound):
        def powers(base):
            values, current = [],1
            while current <= bound:
                values.append(current)
                if base == 1:
                    break
                current *= base
            return values
        first,second = powers(x),powers(y)
        answer = set()
        for a in first:
            for b in second:
                if a+b <= bound:
                    answer.add(a+b)
        return sorted(answer)
`,'Liệt kê lũy thừa của x và y không vượt bound rồi ghép tổng; dùng tập loại trùng, dừng riêng khi cơ số là 1.','O(log bound²)','O(log bound²)');
add(971,'Flip Binary Tree To Match Preorder Traversal','tree',[[1,2,3],[1,3,2]],[1],`
class Solution:
    def flipMatchVoyage(self, root, voyage):
        cursor,flips = 0,[]
        def visit(node):
            nonlocal cursor
            if not node:
                return True
            if cursor == len(voyage) or voyage[cursor] != node.val:
                return False
            cursor += 1
            if node.left and cursor < len(voyage) and node.left.val != voyage[cursor]:
                flips.append(node.val)
                return visit(node.right) and visit(node.left)
            return visit(node.left) and visit(node.right)
        return flips if visit(root) and cursor == len(voyage) else [-1]
`,'Preorder phải khớp voyage. Nếu con trái không phải giá trị kế, cần lật thứ tự thăm hai con tại node hiện tại.','O(n)','O(h)',{kinds:['tree'],focus:['voyage','flips','cursor']});
add(972,'Equal Rational Numbers','math',['0.(52)','0.5(25)'],true,`
class Solution:
    def isRationalEqual(self, s, t):
        from fractions import Fraction
        def parse(text):
            integer, dot, tail = text.partition('.')
            nonrepeat, bracket, repeat = tail.partition('(')
            value = Fraction(int(integer))
            if nonrepeat:
                value += Fraction(int(nonrepeat),10**len(nonrepeat))
            if bracket:
                repeat = repeat[:-1]
                value += Fraction(int(repeat),10**len(nonrepeat)*(10**len(repeat)-1))
            return value
        first,second = parse(s),parse(t)
        return first == second
`,'Đổi phần thập phân hữu hạn và lặp thành phân số chính xác. Nhóm lặp dài r có mẫu 10^r−1, dịch thêm theo phần không lặp.','O(d)','O(d)',{focus:['s','t','first','second']});
add(976,'Largest Perimeter Triangle','greedy',[[2,1,2]],5,`
class Solution:
    def largestPerimeter(self, nums):
        ordered = sorted(nums,reverse=True)
        for i in range(len(ordered)-2):
            a,b,c = ordered[i:i+3]
            if b+c > a:
                return a+b+c
        return 0
`,'Thử ba cạnh liên tiếp từ lớn xuống nhỏ; bộ đầu thỏa hai cạnh nhỏ cộng lại lớn hơn cạnh lớn cho chu vi lớn nhất.','O(n log n)','O(n)',{difficulty:'easy'});
add(978,'Longest Turbulent Subarray','dp',[[9,4,2,10,7,8,8,1,9]],5,`
class Solution:
    def maxTurbulenceSize(self, arr):
        up,down,best = 1,1,1
        for i in range(1,len(arr)):
            if arr[i] > arr[i-1]:
                up,down = down+1,1
            elif arr[i] < arr[i-1]:
                up,down = 1,up+1
            else:
                up,down = 1,1
            best = max(best,up,down)
        return best
`,'up là độ dài đoạn kết thúc bằng bước tăng, down kết thúc bằng bước giảm. Bước mới phải nối từ loại đối lập; bằng nhau thì bắt đầu lại.','O(n)','O(1)');
add(981,'Time Based Key-Value Store','design',[[['set','foo','bar',1],['get','foo',1],['get','foo',3],['set','foo','bar2',4],['get','foo',4],['get','foo',5]]],[null,'bar','bar',null,'bar2','bar2'],`
class Solution:
    def timeMap(self, operations):
        history,answer = {},[]
        for operation in operations:
            command,key = operation[:2]
            if command == 'set':
                value,timestamp = operation[2:]
                rows = history.setdefault(key,[])
                assert not rows or timestamp > rows[-1][0]
                rows.append([timestamp,value])
                answer.append(None)
            else:
                timestamp = operation[2]
                rows = history.get(key,[])
                left,right = 0,len(rows)
                while left < right:
                    mid = (left+right)//2
                    if rows[mid][0] <= timestamp:
                        left = mid+1
                    else:
                        right = mid
                answer.append(rows[left-1][1] if left else '')
        return answer
`,'Mỗi key giữ lịch sử thời gian tăng dần. get tìm nhị phân bản ghi mới nhất có timestamp không vượt thời gian yêu cầu.','O(q log q)','O(q)',{focus:['history','rows','answer','left','right','mid']});
add(982,'Triples with Bitwise AND Equal To Zero','bits',[[2,1,3]],12,`
class Solution:
    def countTriplets(self, nums):
        pairs = {}
        for a in nums:
            for b in nums:
                mask = a & b
                pairs[mask] = pairs.get(mask,0)+1
        answer = 0
        for c in nums:
            for mask,count in pairs.items():
                if mask & c == 0:
                    answer += count
        return answer
`,'Đếm trước AND của mọi cặp có thứ tự (i,j); với số thứ ba, cộng tần suất các mask có AND bằng 0. Chỉ số được phép trùng.','O(n²+n·u)','O(u)',{focus:['nums','pairs','mask','answer']});
add(984,'String Without AAA or BBB','greedy',[1,2],'bab',`
class Solution:
    def strWithout3a3b(self, a, b):
        assert a >= 0 and b >= 0 and a+b <= 80 and max(a,b) <= 2*(min(a,b)+1)
        answer = ''
        while a or b:
            if answer.endswith('aa'):
                ch = 'b'
            elif answer.endswith('bb'):
                ch = 'a'
            else:
                ch = 'a' if a >= b else 'b'
            answer += ch
            a -= ch == 'a'
            b -= ch == 'b'
        return answer
`,'Ưu tiên chữ còn nhiều hơn; nếu hai chữ cuối giống nhau thì bắt buộc dùng chữ còn lại để tránh bộ ba.','O(a+b)','O(a+b)',{focus:['answer','a','b']});
add(985,'Sum of Even Numbers After Queries','array',[[1,2,3,4],[[1,0],[-3,1],[-4,0],[2,3]]],[8,6,2,4],`
class Solution:
    def sumEvenAfterQueries(self, nums, queries):
        nums = nums[:]
        total,answer = sum(value for value in nums if value%2 == 0),[]
        for value,index in queries:
            if nums[index]%2 == 0:
                total -= nums[index]
            nums[index] += value
            if nums[index]%2 == 0:
                total += nums[index]
            answer.append(total)
        return answer
`,'Giữ tổng chẵn hiện tại: bỏ đóng góp cũ của ô bị sửa, cập nhật ô rồi thêm đóng góp mới nếu chẵn.','O(n+q)','O(n+q)',{focus:['nums','queries','total','answer']});
add(989,'Add to Array-Form of Integer','array',[[1,2,0,0],34],[1,2,3,4],`
class Solution:
    def addToArrayForm(self, num, k):
        answer,carry = [],k
        for digit in reversed(num):
            carry += digit
            answer.append(carry%10)
            carry //= 10
        while carry:
            answer.append(carry%10)
            carry //= 10
        return answer[::-1]
`,'Cộng từ hàng đơn vị; carry chứa phần chưa cộng của k và số nhớ. Ghi chữ số %10 rồi chuyển phần //10 sang hàng kế.','O(n+log k)','O(n+log k)',{difficulty:'easy',focus:['num','answer','carry']});
add(991,'Broken Calculator','greedy',[2,3],2,`
class Solution:
    def brokenCalc(self, startValue, target):
        assert startValue >= 1 and target >= 1
        operations = 0
        while target > startValue:
            target = target+1 if target%2 else target//2
            operations += 1
        return operations+startValue-target
`,'Đi ngược từ target: số lẻ cộng 1, số chẵn chia 2. Khi target không lớn hơn start, phần còn lại chỉ cần trừ ở chiều xuôi.','O(log target)','O(1)');
add(993,'Cousins in Binary Tree','tree',[[1,2,3,null,4,null,5],4,5],true,`
class Solution:
    def isCousins(self, root, x, y):
        from collections import deque
        queue,found = deque([(root,None,0)]),{}
        while queue:
            node,parent,depth = queue.popleft()
            if not node:
                continue
            if node.val in (x,y):
                found[node.val] = (depth,parent)
            queue.extend([(node.left,node.val,depth+1),(node.right,node.val,depth+1)])
        return x in found and y in found and found[x][0] == found[y][0] and found[x][1] != found[y][1]
`,'Ghi tầng và cha của hai node cần tìm; anh em họ phải cùng tầng nhưng khác cha.','O(n)','O(n)',{kinds:['tree'],difficulty:'easy'});
add(996,'Number of Squareful Arrays','backtracking',[[1,17,8]],2,`
class Solution:
    def numSquarefulPerms(self, nums):
        from collections import Counter
        from functools import lru_cache
        from math import isqrt
        counts = Counter(nums)
        values = sorted(counts)
        initial = tuple(counts[v] for v in values)
        @lru_cache(None)
        def solve(state,last):
            if not any(state):
                return 1
            total = 0
            for i,value in enumerate(values):
                if state[i] and (last == -1 or isqrt(value+values[last])**2 == value+values[last]):
                    remaining = list(state)
                    remaining[i] -= 1
                    total += solve(tuple(remaining),i)
            return total
        assert len(nums) <= 12 and min(nums) >= 0
        return solve(initial,-1)
`,'Quay lui theo tần suất để tránh đếm trùng hoán vị. Chỉ nối số khi tổng với số trước là chính phương; ghi nhớ trạng thái còn lại và số cuối.','O(u²·∏(count+1))','O(u·∏(count+1))',{focus:['values','state','remaining','last','total'],traceOptions:{maxEvents:20000}});
add(997,'Find the Town Judge','graph',[3,[[1,3],[2,3]]],3,`
class Solution:
    def findJudge(self, n, trust):
        assert 1 <= n <= 80
        incoming,outgoing = [0]*(n+1),[0]*(n+1)
        for a,b in trust:
            outgoing[a] += 1
            incoming[b] += 1
        for person in range(1,n+1):
            if incoming[person] == n-1 and outgoing[person] == 0:
                return person
        return -1
`,'Thẩm phán được n−1 người tin và không tin ai. Đếm số cạnh vào/ra của từng người rồi kiểm tra hai điều kiện.','O(n+edges)','O(n)',{difficulty:'easy',focus:['incoming','outgoing','trust']});
add(998,'Maximum Binary Tree II','tree',[[4,1,3,null,null,2],5],[5,4,null,1,3,null,null,2],`
class Solution:
    def insertIntoMaxTree(self, root, val):
        def insert(node):
            if not node or val > node.val:
                return TreeNode(val,node)
            node.right = insert(node.right)
            return node
        return insert(root)
`,'Số mới nối ở cuối mảng gốc nên chỉ đi theo nhánh phải. Khi lớn hơn node đang xét, nó làm cha mới và cây cũ nằm bên trái.','O(h)','O(h)',{kinds:['tree'],answerKind:'tree'});
module.exports=lessons;
