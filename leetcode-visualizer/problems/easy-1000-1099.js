"use strict";
const {defineEasy}=require('./easy-lesson');const lessons={};const add=(...args)=>{const p=defineEasy(...args);lessons[p.id]=p;};
add(1001,'Grid Illumination','array',[5,[[0,0],[4,4]],[[1,1],[1,0]]],[1,0],`
class Solution:
    def gridIllumination(self, n, lamps, queries):
        from collections import Counter
        active = {tuple(p) for p in lamps}
        rows,cols,diagonals,anti = Counter(),Counter(),Counter(),Counter()
        for r,c in active:
            rows[r] += 1
            cols[c] += 1
            diagonals[r-c] += 1
            anti[r+c] += 1
        answer = []
        for r,c in queries:
            answer.append(int(bool(rows[r] or cols[c] or diagonals[r-c] or anti[r+c])))
            for dr in (-1,0,1):
                for dc in (-1,0,1):
                    a,b = r+dr,c+dc
                    if (a,b) in active:
                        active.remove((a,b))
                        rows[a] -= 1
                        cols[b] -= 1
                        diagonals[a-b] -= 1
                        anti[a+b] -= 1
        return answer
`,'Đếm đèn theo hàng, cột và hai đường chéo. Trả lời trước, sau đó tắt mọi đèn trong vùng 3×3 quanh truy vấn.','O(lamps+queries)','O(lamps)',{difficulty:'hard',focus:['active','queries','answer']});
add(1002,'Find Common Characters','string',[[ 'bella','label','roller']],['e','l','l'],`
class Solution:
    def commonChars(self, words):
        from collections import Counter
        common = Counter(words[0])
        for word in words[1:]:
            common &= Counter(word)
        return [ch for ch,count in sorted(common.items()) for _ in range(count)]
`,'Mỗi chữ được giữ số lần bằng tần suất nhỏ nhất của nó trong tất cả các từ.','O(total characters)','O(alphabet)',{difficulty:'easy'});
add(1003,'Check If Word Is Valid After Substitutions','string',['aabcbc'],true,`
class Solution:
    def isValid(self, s):
        stack = []
        for ch in s:
            stack.append(ch)
            if stack[-3:] == ['a','b','c']:
                del stack[-3:]
        return not stack
`,'Làm ngược phép chèn abc: hễ ba chữ cuối stack là abc thì xóa chúng. Cuối cùng stack phải rỗng.','O(n)','O(n)',{focus:['s','stack']});
add(1005,'Maximize Sum Of Array After K Negations','greedy',[[-4,-2,-3],4],5,`
class Solution:
    def largestSumAfterKNegations(self, nums, k):
        values = sorted(nums)
        for i in range(len(values)):
            if values[i] < 0 and k:
                values[i] = -values[i]
                k -= 1
        total = sum(values)
        return total-2*min(values) if k%2 else total
`,'Đổi các số âm nhỏ nhất trước. Khi hết số âm, hai lần đổi triệt tiêu; nếu còn lẻ thì đổi số có trị tuyệt đối nhỏ nhất.','O(n log n)','O(n)',{difficulty:'easy'});
add(1006,'Clumsy Factorial','math',[4],7,`
class Solution:
    def clumsy(self, n):
        assert 1 <= n <= 80
        stack,operation = [n],0
        for value in range(n-1,0,-1):
            if operation == 0:
                stack[-1] *= value
            elif operation == 1:
                stack[-1] = int(stack[-1]/value)
            elif operation == 2:
                stack.append(value)
            else:
                stack.append(-value)
            operation = (operation+1)%4
        return sum(stack)
`,'Lặp phép ×, ÷, +, −. Stack xử lý nhân/chia ngay, cộng/trừ để cuối cùng; phép chia lấy phần nguyên về 0.','O(n)','O(n)');
add(1007,'Minimum Domino Rotations For Equal Row','array',[[2,1,2,4,2,2],[5,2,6,2,3,2]],2,`
class Solution:
    def minDominoRotations(self, tops, bottoms):
        best = float('inf')
        for target in {tops[0],bottoms[0]}:
            topRotations,bottomRotations = 0,0
            for a,b in zip(tops,bottoms):
                if target not in (a,b):
                    break
                topRotations += a != target
                bottomRotations += b != target
            else:
                best = min(best,topRotations,bottomRotations)
        return -1 if best == float('inf') else best
`,'Giá trị chung bắt buộc nằm trên domino đầu. Thử hai ứng viên; đếm số lần lật để đồng nhất hàng trên hoặc dưới.','O(n)','O(1)');
add(1009,'Complement of Base 10 Integer','bits',[5],2,`
class Solution:
    def bitwiseComplement(self, n):
        width = max(1,n.bit_length())
        mask = (1 << width)-1
        return n ^ mask
`,'Tạo mặt nạ toàn bit 1 đúng độ dài biểu diễn nhị phân rồi XOR để đảo từng bit; số 0 dùng một bit.','O(log n)','O(1)',{difficulty:'easy'});
add(1010,'Pairs of Songs With Total Durations Divisible by 60','array',[[30,20,150,100,40]],3,`
class Solution:
    def numPairsDivisibleBy60(self, time):
        counts,answer = [0]*60,0
        for duration in time:
            remainder = duration%60
            answer += counts[(-remainder)%60]
            counts[remainder] += 1
        return answer
`,'Một số dư r ghép với dư (60−r)%60. Đếm các bài trước có dư cần thiết rồi mới thêm bài hiện tại.','O(n)','O(60)');
add(1012,'Numbers With Repeated Digits','math',[100],10,`
class Solution:
    def numDupDigitsAtMostN(self, n):
        import math
        def permutations(a,b):
            return math.perm(a,b) if 0 <= b <= a else 0
        text,unique,used = str(n),0,set()
        for length in range(1,len(text)):
            unique += 9*permutations(9,length-1)
        for i,ch in enumerate(text):
            digit = int(ch)
            for smaller in range(1 if i == 0 else 0,digit):
                if smaller not in used:
                    unique += permutations(9-i,len(text)-i-1)
            if digit in used:
                break
            used.add(digit)
        else:
            unique += 1
        return n-unique
`,'Đếm số không lặp chữ số bằng cách xây tiền tố; mỗi chỗ chọn nhỏ hơn n thì phần đuôi là chỉnh hợp. Lấy n trừ số không lặp.','O(log n·10)','O(10)',{difficulty:'hard'});
add(1013,'Partition Array Into Three Parts With Equal Sum','array',[[0,2,1,-6,6,-7,9,1,2,0,1]],true,`
class Solution:
    def canThreePartsEqualSum(self, arr):
        total = sum(arr)
        if total%3 or len(arr) < 3:
            return False
        target,current,parts = total//3,0,0
        for value in arr[:-1]:
            current += value
            if current == target:
                parts += 1
                current = 0
                if parts == 2:
                    return True
        return False
`,'Tổng phải chia hết cho 3. Cắt hai tiền tố liên tiếp có tổng bằng một phần; luôn chừa ít nhất một ô cho phần cuối.','O(n)','O(1)',{difficulty:'easy'});
add(1014,'Best Sightseeing Pair','array',[[8,1,5,2,6]],11,`
class Solution:
    def maxScoreSightseeingPair(self, values):
        bestLeft,answer = values[0],-float('inf')
        for j in range(1,len(values)):
            candidate = bestLeft+values[j]-j
            answer = max(answer,candidate)
            bestLeft = max(bestLeft,values[j]+j)
        return answer
`,'Tách điểm thành (values[i]+i)+(values[j]−j); giữ vế trái tốt nhất từ các vị trí trước j.','O(n)','O(1)');
add(1015,'Smallest Integer Divisible by K','math',[3],3,`
class Solution:
    def smallestRepunitDivByK(self, k):
        assert 1 <= k <= 1000
        if k%2 == 0 or k%5 == 0:
            return -1
        remainder = 0
        for length in range(1,k+1):
            remainder = (remainder*10+1)%k
            if remainder == 0:
                return length
        return -1
`,'Không tạo số 111... rất lớn; chỉ giữ số dư khi nối chữ số 1. Trong tối đa k số dư phải tìm được đáp án nếu k không chứa thừa số 2 hoặc 5.','O(k)','O(1)',{traceOptions:{maxEvents:10000}});
add(1016,'Binary String With Substrings Representing 1 To N','string',['0110',3],true,`
class Solution:
    def queryString(self, s, n):
        assert 1 <= n <= 200
        for value in range(1,n+1):
            binary = format(value,'b')
            if binary not in s:
                return False
        return True
`,'Đổi từng số từ 1 tới n sang nhị phân; mỗi biểu diễn phải xuất hiện như một đoạn liên tiếp trong s.','O(n·|s|·log n)','O(log n)');
add(1017,'Convert to Base -2','math',[2],'110',`
class Solution:
    def baseNeg2(self, n):
        if n == 0:
            return '0'
        digits = []
        while n:
            n,remainder = divmod(n,-2)
            if remainder < 0:
                n += 1
                remainder += 2
            digits.append(str(remainder))
        return ''.join(digits[::-1])
`,'Chia cho −2; điều chỉnh số dư về 0 hoặc 1 rồi đọc các số dư theo thứ tự ngược.','O(log n)','O(log n)');
add(1018,'Binary Prefix Divisible By 5','bits',[[0,1,1]],[true,false,false],`
class Solution:
    def prefixesDivBy5(self, nums):
        remainder,answer = 0,[]
        for bit in nums:
            remainder = (2*remainder+bit)%5
            answer.append(remainder == 0)
        return answer
`,'Thêm bit vào cuối tương đương nhân 2 rồi cộng bit. Chỉ cần giữ phần dư modulo 5 thay vì cả số lớn.','O(n)','O(n)',{difficulty:'easy'});
add(1023,'Camelcase Matching','string',[[ 'FooBar','FooBarTest','FootBall','FrameBuffer','ForceFeedBack'],'FB'],[true,false,true,true,false],`
class Solution:
    def camelMatch(self, queries, pattern):
        answer = []
        for query in queries:
            i,valid = 0,True
            for ch in query:
                if i < len(pattern) and ch == pattern[i]:
                    i += 1
                elif ch.isupper():
                    valid = False
            answer.append(valid and i == len(pattern))
        return answer
`,'Khớp pattern như dãy con. Chữ thường dư được phép chèn; chữ hoa dư làm truy vấn không hợp lệ.','O(total characters)','O(queries)');
add(1024,'Video Stitching','greedy',[[[0,2],[4,6],[8,10],[1,9],[1,5],[5,9]],10],3,`
class Solution:
    def videoStitching(self, clips, time):
        clips = sorted(clips)
        end,index,answer = 0,0,0
        while end < time:
            farthest = end
            while index < len(clips) and clips[index][0] <= end:
                farthest = max(farthest,clips[index][1])
                index += 1
            if farthest == end:
                return -1
            end = farthest
            answer += 1
        return answer
`,'Từ đoạn đã phủ tới end, xét mọi clip bắt đầu không muộn hơn end và chọn clip kéo xa nhất. Không kéo thêm được thì thất bại.','O(n log n)','O(n)');
add(1025,'Divisor Game','dp',[4],true,`
class Solution:
    def divisorGame(self, n):
        assert 1 <= n <= 40
        dp = [False]*(n+1)
        for value in range(2,n+1):
            for divisor in range(1,value):
                if value%divisor == 0 and not dp[value-divisor]:
                    dp[value] = True
                    break
        return dp[n]
`,'dp[v] là thế thắng: chỉ cần chọn một ước x khiến đối thủ nhận thế thua v−x. Không có lựa chọn thắng thì dp[v] là False.','O(n²)','O(n)',{difficulty:'easy'});
add(1026,'Maximum Difference Between Node and Ancestor','tree',[[8,3,10,1,6,null,14,null,null,4,7,13]],7,`
class Solution:
    def maxAncestorDiff(self, root):
        def visit(node, low, high):
            if not node:
                return high-low
            low,high = min(low,node.val),max(high,node.val)
            return max(visit(node.left,low,high),visit(node.right,low,high))
        return visit(root,root.val,root.val)
`,'Truyền min/max trên đường từ gốc xuống node; chênh lệch lớn nhất của một đường chính là max−min.','O(n)','O(h)',{kinds:['tree']});
add(1027,'Longest Arithmetic Subsequence','dp',[[3,6,9,12]],4,`
class Solution:
    def longestArithSeqLength(self, nums):
        dp,answer = [{} for _ in nums],1
        for j in range(len(nums)):
            for i in range(j):
                difference = nums[j]-nums[i]
                dp[j][difference] = max(dp[j].get(difference,0),dp[i].get(difference,1)+1)
                answer = max(answer,dp[j][difference])
        return answer
`,'dp[j][d] là dãy cấp số cộng dài nhất kết thúc ở j, công sai d. Nối nums[j] vào dãy có cùng công sai tại i.','O(n²)','O(n²)',{focus:['nums','dp','difference','answer']});
add(1028,'Recover a Tree From Preorder Traversal','tree',['1-2--3--4-5--6--7'],[1,2,5,3,4,6,7],`
class Solution:
    def recoverFromPreorder(self, traversal):
        stack,cursor = [],0
        while cursor < len(traversal):
            depth = 0
            while traversal[cursor] == '-':
                depth += 1
                cursor += 1
            start = cursor
            while cursor < len(traversal) and traversal[cursor].isdigit():
                cursor += 1
            node = TreeNode(int(traversal[start:cursor]))
            while len(stack) > depth:
                stack.pop()
            assert len(stack) == depth
            if stack:
                if not stack[-1].left:
                    stack[-1].left = node
                else:
                    stack[-1].right = node
            stack.append(node)
        return stack[0]
`,'Số dấu gạch là độ sâu. Stack giữ đường tới node hiện tại; lùi về đúng tầng cha rồi gắn con trái trước, con phải sau.','O(L)','O(n)',{answerKind:'tree'});
add(1029,'Two City Scheduling','greedy',[[[10,20],[30,200],[400,50],[30,20]]],110,`
class Solution:
    def twoCitySchedCost(self, costs):
        ordered = sorted(costs,key=lambda pair:pair[0]-pair[1])
        half = len(costs)//2
        answer = 0
        for i,(a,b) in enumerate(ordered):
            answer += a if i < half else b
        return answer
`,'Sắp chênh lệch chi phí A−B; n người lợi hơn khi đi A nhất gửi tới A, n người còn lại tới B.','O(n log n)','O(n)');
add(1030,'Matrix Cells in Distance Order','array',[2,3,1,2],[[1,2],[0,2],[1,1],[0,1],[1,0],[0,0]],`
class Solution:
    def allCellsDistOrder(self, rows, cols, rCenter, cCenter):
        assert 1 <= rows <= 12 and 1 <= cols <= 12
        cells = [[r,c] for r in range(rows) for c in range(cols)]
        cells.sort(key=lambda p:abs(p[0]-rCenter)+abs(p[1]-cCenter))
        return cells
`,'Liệt kê các ô và sắp theo khoảng cách Manhattan tới tâm; các ô cùng khoảng cách có thể đứng theo bất kỳ thứ tự nào.','O(mn log(mn))','O(mn)',{difficulty:'easy',diagram:'coordinates'});
add(1031,'Maximum Sum of Two Non-Overlapping Subarrays','dp',[[0,6,5,2,2,5,1,9,4],1,2],20,`
class Solution:
    def maxSumTwoNoOverlap(self, nums, firstLen, secondLen):
        prefix = [0]
        for value in nums:
            prefix.append(prefix[-1]+value)
        def ordered(leftLen,rightLen):
            bestLeft,answer = -float('inf'),-float('inf')
            for end in range(leftLen+rightLen,len(nums)+1):
                split = end-rightLen
                bestLeft = max(bestLeft,prefix[split]-prefix[split-leftLen])
                answer = max(answer,bestLeft+prefix[end]-prefix[split])
            return answer
        return max(ordered(firstLen,secondLen),ordered(secondLen,firstLen))
`,'Cố định đoạn bên phải, giữ tổng tốt nhất của đoạn bên trái đã kết thúc trước nó. Thử cả hai thứ tự độ dài.','O(n)','O(n)',{focus:['nums','prefix','bestLeft','answer']});
add(1032,'Stream of Characters','design',[[ 'cd','f','kl'],['a','b','c','d','e','f','g','h','i','j','k','l']],[false,false,false,true,false,true,false,false,false,false,false,true],`
class Solution:
    def streamChecker(self, words, queries):
        trie = {}
        for word in words:
            node = trie
            for ch in reversed(word):
                node = node.setdefault(ch,{})
            node['#'] = True
        suffix,answer = '',[]
        limit = max(map(len,words))
        for ch in queries:
            suffix = (suffix+ch)[-limit:]
            node,matched = trie,False
            for letter in reversed(suffix):
                if letter not in node:
                    break
                node = node[letter]
                if '#' in node:
                    matched = True
                    break
            answer.append(matched)
        return answer
`,'Trie lưu các từ theo chiều ngược. Mỗi ký tự mới chỉ cần kiểm tra hậu tố từ cuối về đầu, tới dấu # là có từ khớp.','O(total word length+q·max word length)','O(total word length+q)',{difficulty:'hard',focus:['suffix','node','trie','answer']});
add(1033,'Moving Stones Until Consecutive','math',[1,2,5],[1,2],`
class Solution:
    def numMovesStones(self, a, b, c):
        a,b,c = sorted([a,b,c])
        leftGap,rightGap = b-a,c-b
        minimum = 0 if leftGap == rightGap == 1 else 1 if min(leftGap,rightGap) <= 2 else 2
        maximum = c-a-2
        return [minimum,maximum]
`,'Ít nhất: đã liên tiếp thì 0, có khe ≤2 thì 1, còn lại 2. Nhiều nhất bằng tổng số ô trống giữa hai đầu.','O(1)','O(1)');
add(1036,'Escape a Large Maze','graph',[[[0,1],[1,0]],[0,0],[0,2]],false,`
class Solution:
    def isEscapePossible(self, blocked, source, target):
        from collections import deque
        walls = {tuple(p) for p in blocked}
        limit = len(walls)*(len(walls)-1)//2
        def escape(start, finish):
            queue,seen = deque([tuple(start)]),{tuple(start)}
            while queue and len(seen) <= limit:
                r,c = queue.popleft()
                if [r,c] == finish:
                    return True
                for dr,dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                    point = (r+dr,c+dc)
                    if 0 <= point[0] < 1000000 and 0 <= point[1] < 1000000 and point not in walls and point not in seen:
                        seen.add(point)
                        queue.append(point)
            return len(seen) > limit
        return escape(source,target) and escape(target,source)
`,'B đèn chắn không thể vây quá B(B−1)/2 ô. BFS vượt ngưỡng nghĩa là thoát vùng vây; phải kiểm tra từ cả nguồn và đích.','O(B²)','O(B²)',{difficulty:'hard',traceOptions:{maxEvents:100000,summarizeLocals:{seen:20,queue:20}}});
add(1037,'Valid Boomerang','math',[[[1,1],[2,3],[3,2]]],true,`
class Solution:
    def isBoomerang(self, points):
        a,b,c = points
        cross = (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
        return cross != 0
`,'Ba điểm tạo boomerang khi không thẳng hàng; tích chéo khác 0 cũng loại trường hợp hai điểm trùng nhau.','O(1)','O(1)',{difficulty:'easy'});
add(1038,'Binary Search Tree to Greater Sum Tree','tree',[[4,1,6,0,2,5,7,null,null,null,3,null,null,null,8]],[30,36,21,36,35,26,15,null,null,null,33,null,null,null,8],`
class Solution:
    def bstToGst(self, root):
        total = 0
        def visit(node):
            nonlocal total
            if not node:
                return
            visit(node.right)
            total += node.val
            node.val = total
            visit(node.left)
        visit(root)
        return root
`,'Duyệt BST theo thứ tự phải–gốc–trái để gặp số lớn trước. Tổng đã gặp chính là giá trị mới của node.','O(n)','O(h)',{kinds:['tree'],answerKind:'tree'});
add(1039,'Minimum Score Triangulation of Polygon','dp',[[1,3,1,4,1,5]],13,`
class Solution:
    def minScoreTriangulation(self, values):
        n = len(values)
        dp = [[0]*n for _ in values]
        for length in range(3,n+1):
            for left in range(n-length+1):
                right = left+length-1
                dp[left][right] = min(dp[left][mid]+dp[mid][right]+values[left]*values[mid]*values[right] for mid in range(left+1,right))
        return dp[0][-1]
`,'Giữ cạnh left–right; thử đỉnh mid tạo một tam giác, cộng chi phí chia hai đa giác con hai bên.','O(n³)','O(n²)',{focus:['values','dp','left','right']});
add(1040,'Moving Stones Until Consecutive II','sliding',[[7,4,9]],[1,2],`
class Solution:
    def numMovesStonesII(self, stones):
        stones = sorted(stones)
        n = len(stones)
        maximum = max(stones[-2]-stones[0],stones[-1]-stones[1])-(n-2)
        minimum,left = n,0
        for right in range(n):
            while stones[right]-stones[left]+1 > n:
                left += 1
            kept = right-left+1
            moves = 2 if kept == n-1 and stones[right]-stones[left] == n-2 else n-kept
            minimum = min(minimum,moves)
        return [minimum,maximum]
`,'Cửa sổ chứa nhiều nhất các viên có thể giữ trong n ô liên tiếp. Ngoại lệ n−1 viên đã liền nhau cần 2 bước để không di chuyển đầu mút thành đầu mút mới.','O(n log n)','O(n)');
add(1041,'Robot Bounded In Circle','array',['GGLLGG'],true,`
class Solution:
    def isRobotBounded(self, instructions):
        x,y,direction = 0,0,0
        directions = [(0,1),(1,0),(0,-1),(-1,0)]
        for command in instructions:
            if command == 'L':
                direction = (direction-1)%4
            elif command == 'R':
                direction = (direction+1)%4
            else:
                dx,dy = directions[direction]
                x,y = x+dx,y+dy
        return (x == 0 and y == 0) or direction != 0
`,'Chạy một chu kỳ: về gốc thì bị chặn trong vùng hữu hạn; nếu đổi hướng thì tối đa 4 chu kỳ sẽ quay lại. Chỉ đi xa mãi khi còn hướng Bắc và lệch gốc.','O(n)','O(1)');
add(1043,'Partition Array for Maximum Sum','dp',[[1,15,7,9,2,5,10],3],84,`
class Solution:
    def maxSumAfterPartitioning(self, arr, k):
        dp = [0]*(len(arr)+1)
        for end in range(1,len(arr)+1):
            maximum = 0
            for length in range(1,min(k,end)+1):
                maximum = max(maximum,arr[end-length])
                candidate = dp[end-length]+maximum*length
                dp[end] = max(dp[end],candidate)
        return dp[-1]
`,'Thử mọi độ dài ≤k của đoạn cuối. Cả đoạn được thay bằng số lớn nhất của nó; cộng với tổng tối ưu của tiền tố trước.','O(nk)','O(n)',{focus:['arr','dp','maximum','candidate']});
add(1045,'Customers Who Bought All Products','sql',[[{customer_id:1,product_key:5},{customer_id:1,product_key:6},{customer_id:2,product_key:6}],[5,6]],[1],`
class Solution:
    def customers(self, purchases, products):
        required,groups = set(products),{}
        for row in purchases:
            groups.setdefault(row['customer_id'],set()).add(row['product_key'])
        return sorted(customer for customer,bought in groups.items() if required <= bought)
`,'Nhóm tập sản phẩm mỗi khách đã mua; chọn khách có tập chứa toàn bộ danh mục sản phẩm. Không đếm trùng lượt mua.','O(purchases+products)','O(purchases)');
add(1047,'Remove All Adjacent Duplicates In String','string',['abbaca'],'ca',`
class Solution:
    def removeDuplicates(self, s):
        stack = []
        for ch in s:
            if stack and stack[-1] == ch:
                stack.pop()
            else:
                stack.append(ch)
        return ''.join(stack)
`,'Chữ mới giống đỉnh stack thì xóa cả cặp, khác thì đẩy vào. Các cặp mới sinh ra cũng được xử lý tự nhiên.','O(n)','O(n)',{difficulty:'easy',focus:['s','stack']});
add(1050,'Actors and Directors Who Cooperated At Least Three Times','sql',[[{actor_id:1,director_id:1,timestamp:0},{actor_id:1,director_id:1,timestamp:1},{actor_id:1,director_id:1,timestamp:2},{actor_id:2,director_id:1,timestamp:3}]],[{actor_id:1,director_id:1}],`
class Solution:
    def cooperation(self, rows):
        from collections import Counter
        counts = Counter((r['actor_id'],r['director_id']) for r in rows)
        return [{'actor_id':a,'director_id':d} for (a,d),count in sorted(counts.items()) if count >= 3]
`,'Khóa nhóm là cặp diễn viên–đạo diễn; giữ những cặp có ít nhất ba lần hợp tác.','O(n log n)','O(n)',{difficulty:'easy'});
add(1051,'Height Checker','array',[[1,1,4,2,1,3]],3,`
class Solution:
    def heightChecker(self, heights):
        expected = sorted(heights)
        mismatches = []
        for i,(actual,wanted) in enumerate(zip(heights,expected)):
            if actual != wanted:
                mismatches.append(i)
        return len(mismatches)
`,'Tạo thứ tự chiều cao đúng bằng sắp xếp; đếm vị trí khác thứ tự đúng, không phải số lần đổi chỗ.','O(n log n)','O(n)',{difficulty:'easy',focus:['heights','expected','mismatches']});
add(1053,'Previous Permutation With One Swap','array',[[3,1,1,3]],[1,3,1,3],`
class Solution:
    def prevPermOpt1(self, arr):
        values = arr[:]
        i = len(values)-2
        while i >= 0 and values[i] <= values[i+1]:
            i -= 1
        if i < 0:
            return values
        j = len(values)-1
        while values[j] >= values[i]:
            j -= 1
        while j > i+1 and values[j] == values[j-1]:
            j -= 1
        values[i],values[j] = values[j],values[i]
        return values
`,'Tìm chỗ giảm từ phải; đổi nó với số lớn nhất nhỏ hơn ở đuôi. Nếu số đó lặp, dùng vị trí trái nhất để phần đuôi lớn nhất.','O(n)','O(n)');
add(1054,'Distant Barcodes','greedy',[[1,1,1,2,2,2]],[1,2,1,2,1,2],`
class Solution:
    def rearrangeBarcodes(self, barcodes):
        import heapq
        from collections import Counter
        counts = Counter(barcodes)
        assert max(counts.values()) <= (len(barcodes)+1)//2
        heap = [(-count,value) for value,count in counts.items()]
        heapq.heapify(heap)
        previous,answer = (0,None),[]
        while heap:
            count,value = heapq.heappop(heap)
            answer.append(value)
            if previous[0] < 0:
                heapq.heappush(heap,previous)
            previous = (count+1,value)
        return answer
`,'Lấy mã còn nhiều nhất từ heap; giữ mã vừa dùng bên ngoài heap một lượt để nó không đứng sát chính nó.','O(n log u)','O(n)');
add(1056,'Confusing Number','math',[6],true,`
class Solution:
    def confusingNumber(self, n):
        mapping = {'0':'0','1':'1','6':'9','8':'8','9':'6'}
        rotated = ''
        for ch in reversed(str(n)):
            if ch not in mapping:
                return False
            rotated += mapping[ch]
        return int(rotated) != n
`,'Quay 180° phải đảo thứ tự chữ số và đổi 6↔9; chỉ số hợp lệ sau quay mà khác số ban đầu mới là confusing.','O(d)','O(d)',{difficulty:'easy'});
add(1057,'Campus Bikes','greedy',[[[0,0],[2,1]],[[1,2],[3,3]]],[1,0],`
class Solution:
    def assignBikes(self, workers, bikes):
        pairs = sorted((abs(a-c)+abs(b-d),i,j) for i,(a,b) in enumerate(workers) for j,(c,d) in enumerate(bikes))
        answer,used = [-1]*len(workers),set()
        for distance,worker,bike in pairs:
            if answer[worker] == -1 and bike not in used:
                answer[worker] = bike
                used.add(bike)
        return answer
`,'Sắp mọi cặp theo khoảng cách, rồi ID người, rồi ID xe; lần lượt chọn cặp mà cả người và xe đều chưa được gán.','O(wb log(wb))','O(wb)');
add(1058,'Minimize Rounding Error to Meet Target','greedy',[[ '0.700','2.800','4.900'],8],'1.000',`
class Solution:
    def minimizeError(self, prices, target):
        from decimal import Decimal
        fractions,base = [],0
        for text in prices:
            value = Decimal(text)
            floor = int(value)
            base += floor
            if value != floor:
                fractions.append(value-floor)
        ceilCount = target-base
        if not 0 <= ceilCount <= len(fractions):
            return '-1'
        fractions.sort(reverse=True)
        error = sum(fractions)+ceilCount-2*sum(fractions[:ceilCount])
        return format(error,'.3f')
`,'Làm tròn tất cả xuống trước; cần ceilCount lần làm tròn lên. Chọn các phần lẻ lớn nhất vì chúng giảm sai số nhiều nhất.','O(n log n)','O(n)');
add(1060,'Missing Element in Sorted Array','search',[[4,7,9,10],3],8,`
class Solution:
    def missingElement(self, nums, k):
        def missing(i):
            return nums[i]-nums[0]-i
        if k > missing(len(nums)-1):
            return nums[-1]+k-missing(len(nums)-1)
        left,right = 1,len(nums)-1
        while left < right:
            mid = (left+right)//2
            if missing(mid) < k:
                left = mid+1
            else:
                right = mid
        return nums[left-1]+k-missing(left-1)
`,'missing(i) đếm số bị thiếu từ nums[0] tới nums[i]. Tìm biên đầu tiên có ít nhất k số thiếu rồi suy ra vị trí trong khoảng trống.','O(log n)','O(1)');
add(1062,'Longest Repeating Substring','search',['abbaba'],2,`
class Solution:
    def longestRepeatingSubstring(self, s):
        def repeated(length):
            seen = set()
            for start in range(len(s)-length+1):
                word = s[start:start+length]
                if word in seen:
                    return True
                seen.add(word)
            return False
        left,right = 0,len(s)-1
        while left < right:
            mid = (left+right+1)//2
            if repeated(mid):
                left = mid
            else:
                right = mid-1
        return left
`,'Thử độ dài mid bằng tập các đoạn con. Có đoạn lặp dài mid thì mọi độ dài nhỏ hơn cũng được, nên tìm nhị phân độ dài lớn nhất.','O(n² log n)','O(n²)');
add(1064,'Fixed Point','search',[[-10,-5,0,3,7]],3,`
class Solution:
    def fixedPoint(self, arr):
        left,right = 0,len(arr)
        while left < right:
            mid = (left+right)//2
            if arr[mid] < mid:
                left = mid+1
            else:
                right = mid
        return left if left < len(arr) and arr[left] == left else -1
`,'Mảng tăng nghiêm ngặt nên arr[i]−i không giảm. Tìm biên đầu arr[i]≥i rồi kiểm tra có bằng i không.','O(log n)','O(1)',{difficulty:'easy'});
add(1065,'Index Pairs of a String','string',['thestoryofleetcodeandme',['story','fleet','leetcode']],[[3,7],[9,13],[10,17]],`
class Solution:
    def indexPairs(self, text, words):
        dictionary,answer = set(words),[]
        for start in range(len(text)):
            for end in range(start+1,len(text)+1):
                if text[start:end] in dictionary:
                    answer.append([start,end-1])
        return answer
`,'Thử từng đoạn text[start:end]; khớp từ điển thì lưu chỉ số đầu và cuối, kể cả các đoạn chồng nhau.','O(n³+dictionary length)','O(n²)',{difficulty:'easy'});
add(1066,'Campus Bikes II','dp',[[[0,0],[2,1]],[[1,2],[3,3]]],6,`
class Solution:
    def assignBikes(self, workers, bikes):
        from functools import lru_cache
        assert 1 <= len(workers) <= len(bikes) <= 8
        @lru_cache(None)
        def solve(worker, mask):
            if worker == len(workers):
                return 0
            best = float('inf')
            for bike,point in enumerate(bikes):
                if mask >> bike & 1:
                    continue
                distance = abs(workers[worker][0]-point[0])+abs(workers[worker][1]-point[1])
                best = min(best,distance+solve(worker+1,mask | (1 << bike)))
            return best
        return solve(0,0)
`,'Gán lần lượt từng người; mask đánh dấu xe đã dùng. Thử mọi xe còn trống và ghi nhớ tổng khoảng cách tối thiểu.','O(wb·2^b)','O(w·2^b)',{traceOptions:{maxEvents:20000}});
add(1067,'Digit Count in Range','math',[1,1,13],6,`
class Solution:
    def digitsCount(self, d, low, high):
        def count(n):
            if n < 0:
                return 0
            total,factor = int(d == 0),1
            while factor <= n:
                higher,current,lower = n//(factor*10),(n//factor)%10,n%factor
                if d:
                    total += higher*factor+(factor if current > d else lower+1 if current == d else 0)
                elif higher:
                    total += (higher-1)*factor+(factor if current else lower+1)
                factor *= 10
            return total
        return count(high)-count(low-1)
`,'Đếm đóng góp riêng ở từng hàng đơn vị/chục/trăm bằng phần cao, chữ số hiện tại và phần thấp; với chữ số 0 phải bỏ các số 0 ở đầu.','O(log high)','O(1)',{difficulty:'hard'});
add(1068,'Product Sales Analysis I','sql',[[{sale_id:1,product_id:100,year:2008,quantity:10,price:5000}],[{product_id:100,product_name:'Nokia'}]],[{product_name:'Nokia',year:2008,price:5000}],`
class Solution:
    def sales(self, sales, products):
        names = {p['product_id']:p['product_name'] for p in products}
        answer = []
        for row in sales:
            answer.append({'product_name':names[row['product_id']],'year':row['year'],'price':row['price']})
        return answer
`,'Nối mỗi dòng bán hàng với tên sản phẩm qua product_id rồi lấy tên, năm và giá.','O(s+p)','O(p+s)',{difficulty:'easy'});
add(1069,'Product Sales Analysis II','sql',[[{product_id:100,quantity:10},{product_id:100,quantity:12},{product_id:200,quantity:15}]],[{product_id:100,total_quantity:22},{product_id:200,total_quantity:15}],`
class Solution:
    def quantities(self, sales):
        totals = {}
        for row in sales:
            product = row['product_id']
            totals[product] = totals.get(product,0)+row['quantity']
        return [{'product_id':p,'total_quantity':q} for p,q in sorted(totals.items())]
`,'Nhóm theo product_id và cộng quantity của mọi năm bán hàng.','O(n log n)','O(n)',{difficulty:'easy'});
add(1070,'Product Sales Analysis III','sql',[[{product_id:100,year:2008,quantity:10,price:5000},{product_id:100,year:2009,quantity:12,price:5000},{product_id:200,year:2011,quantity:15,price:9000}]],[{product_id:100,first_year:2008,quantity:10,price:5000},{product_id:200,first_year:2011,quantity:15,price:9000}],`
class Solution:
    def firstYear(self, sales):
        first = {}
        for row in sales:
            p = row['product_id']
            first[p] = min(first.get(p,row['year']),row['year'])
        return [{'product_id':r['product_id'],'first_year':r['year'],'quantity':r['quantity'],'price':r['price']} for r in sales if r['year'] == first[r['product_id']]]
`,'Tìm năm bán đầu tiên riêng từng sản phẩm, rồi giữ các dòng thuộc đúng năm đó.','O(n)','O(n)');
add(1071,'Greatest Common Divisor of Strings','string',['ABCABC','ABC'],'ABC',`
class Solution:
    def gcdOfStrings(self, str1, str2):
        from math import gcd
        if str1+str2 != str2+str1:
            return ''
        length = gcd(len(str1),len(str2))
        return str1[:length]
`,'Nếu hai chuỗi cùng được lặp từ một mẫu, đổi thứ tự nối không thay kết quả. Độ dài mẫu lớn nhất là ƯCLN hai độ dài.','O(m+n)','O(m+n)',{difficulty:'easy'});
add(1072,'Flip Columns For Maximum Number of Equal Rows','array',[[[0,1],[1,0]]],2,`
class Solution:
    def maxEqualRowsAfterFlips(self, matrix):
        counts = {}
        for row in matrix:
            signature = tuple(value ^ row[0] for value in row)
            counts[signature] = counts.get(signature,0)+1
        return max(counts.values())
`,'Hai hàng có thể cùng thành hàng đồng nhất khi chúng giống nhau hoặc đối bit hoàn toàn. Chuẩn hóa mỗi hàng để bit đầu thành 0 rồi đếm nhóm lớn nhất.','O(mn)','O(mn)');
add(1073,'Adding Two Negabinary Numbers','bits',[[1,1,1,1,1],[1,0,1]],[1,0,0,0,0],`
class Solution:
    def addNegabinary(self, arr1, arr2):
        i,j,carry,answer = len(arr1)-1,len(arr2)-1,0,[]
        while i >= 0 or j >= 0 or carry:
            total = carry+(arr1[i] if i >= 0 else 0)+(arr2[j] if j >= 0 else 0)
            bit = total & 1
            answer.append(bit)
            carry = (total-bit)//-2
            i,j = i-1,j-1
        while len(answer) > 1 and answer[-1] == 0:
            answer.pop()
        return answer[::-1]
`,'Cộng từ phải; bit = total mod 2, nhưng số nhớ chia cho −2 nên có thể âm. Bỏ các số 0 thừa ở đầu kết quả.','O(m+n)','O(m+n)',{focus:['arr1','arr2','answer','carry']});
add(1074,'Number of Submatrices That Sum to Target','dp',[[[0,1,0],[1,1,1],[0,1,0]],0],4,`
class Solution:
    def numSubmatrixSumTarget(self, matrix, target):
        m,n,answer = len(matrix),len(matrix[0]),0
        for top in range(m):
            columns = [0]*n
            for bottom in range(top,m):
                columns = [a+b for a,b in zip(columns,matrix[bottom])]
                counts,prefix = {0:1},0
                for value in columns:
                    prefix += value
                    answer += counts.get(prefix-target,0)
                    counts[prefix] = counts.get(prefix,0)+1
        return answer
`,'Cố định hàng trên/dưới để nén hình chữ nhật thành mảng tổng cột. Đếm đoạn tổng target bằng tần suất tổng tiền tố.','O(m²n)','O(n)',{difficulty:'hard',focus:['matrix','columns','counts','prefix','answer']});
add(1075,'Project Employees I','sql',[[{project_id:1,employee_id:1},{project_id:1,employee_id:2}],[{employee_id:1,experience_years:3},{employee_id:2,experience_years:2}]],[{project_id:1,average_years:2.5}],`
class Solution:
    def projectExperience(self, projects, employees):
        from decimal import Decimal,ROUND_HALF_UP
        experience = {r['employee_id']:r['experience_years'] for r in employees}
        groups = {}
        for row in projects:
            groups.setdefault(row['project_id'],[]).append(experience[row['employee_id']])
        return [{'project_id':p,'average_years':float((Decimal(sum(v))/len(v)).quantize(Decimal('.01'),rounding=ROUND_HALF_UP))} for p,v in sorted(groups.items())]
`,'Nối kinh nghiệm nhân viên vào dự án, lấy trung bình theo project_id và làm tròn hai chữ số.','O(p+e)','O(p+e)',{difficulty:'easy'});
add(1076,'Project Employees II','sql',[[{project_id:1,employee_id:1},{project_id:1,employee_id:2},{project_id:2,employee_id:1}]],[1],`
class Solution:
    def largestProjects(self, projects):
        from collections import Counter
        counts = Counter(row['project_id'] for row in projects)
        largest = max(counts.values(),default=0)
        return sorted(project for project,count in counts.items() if count == largest)
`,'Đếm số người của từng dự án và giữ tất cả dự án đồng hạng nhiều người nhất.','O(n log n)','O(n)',{difficulty:'easy'});
add(1077,'Project Employees III','sql',[[{project_id:1,employee_id:1},{project_id:1,employee_id:2},{project_id:2,employee_id:2}],[{employee_id:1,experience_years:3},{employee_id:2,experience_years:2}]],[{project_id:1,employee_id:1},{project_id:2,employee_id:2}],`
class Solution:
    def mostExperienced(self, projects, employees):
        experience = {r['employee_id']:r['experience_years'] for r in employees}
        best = {}
        for row in projects:
            project,employee = row['project_id'],row['employee_id']
            best[project] = max(best.get(project,0),experience[employee])
        return [row for row in projects if experience[row['employee_id']] == best[row['project_id']]]
`,'Tìm mức kinh nghiệm cao nhất riêng trong mỗi dự án; giữ mọi nhân viên đạt mức đó, kể cả hòa.','O(p+e)','O(p+e)');
add(1078,'Occurrences After Bigram','string',['alice is a good girl she is a good student','a','good'],['girl','student'],`
class Solution:
    def findOcurrences(self, text, first, second):
        words,answer = text.split(),[]
        for i in range(2,len(words)):
            if words[i-2] == first and words[i-1] == second:
                answer.append(words[i])
        return answer
`,'Trượt cửa sổ ba từ; hai từ đầu khớp first,second thì lấy từ thứ ba.','O(L)','O(L)',{difficulty:'easy'});
add(1079,'Letter Tile Possibilities','backtracking',['AAB'],8,`
class Solution:
    def numTilePossibilities(self, tiles):
        from collections import Counter
        counts = Counter(tiles)
        def count():
            total = 0
            for ch in counts:
                if counts[ch]:
                    counts[ch] -= 1
                    total += 1+count()
                    counts[ch] += 1
            return total
        assert len(tiles) <= 7
        return count()
`,'Chọn một chữ còn lại để nối vào dãy; lựa chọn đó tạo một dãy mới và mọi cách nối tiếp. Dùng tần suất để không đếm trùng chữ giống nhau.','O(n!·n)','O(n)',{traceOptions:{maxEvents:50000}});
add(1082,'Sales Analysis I','sql',[[{seller_id:1,price:2000},{seller_id:1,price:2000},{seller_id:2,price:4000},{seller_id:3,price:1000}]],[1,2],`
class Solution:
    def bestSellers(self, sales):
        totals = {}
        for row in sales:
            seller = row['seller_id']
            totals[seller] = totals.get(seller,0)+row['price']
        best = max(totals.values())
        return sorted(s for s,total in totals.items() if total == best)
`,'Cộng doanh thu price theo người bán; lấy tất cả người có tổng lớn nhất.','O(n log n)','O(n)',{difficulty:'easy'});
add(1083,'Sales Analysis II','sql',[[{buyer_id:1,product_id:1},{buyer_id:2,product_id:1},{buyer_id:2,product_id:2}],[{product_id:1,product_name:'S8'},{product_id:2,product_name:'iPhone'}]],[1],`
class Solution:
    def buyers(self, sales, products):
        names = {r['product_id']:r['product_name'] for r in products}
        s8,iphone = set(),set()
        for row in sales:
            if names[row['product_id']] == 'S8':
                s8.add(row['buyer_id'])
            if names[row['product_id']] == 'iPhone':
                iphone.add(row['buyer_id'])
        return sorted(s8-iphone)
`,'Lập tập người mua S8 và tập người mua iPhone; đáp án là hiệu hai tập.','O(s+p)','O(s+p)',{difficulty:'easy'});
add(1084,'Sales Analysis III','sql',[[{product_id:1,sale_date:'2019-01-21'},{product_id:2,sale_date:'2019-02-17'},{product_id:2,sale_date:'2019-06-02'}],[{product_id:1,product_name:'S8'},{product_id:2,product_name:'G4'}]],[{product_id:1,product_name:'S8'}],`
class Solution:
    def springOnly(self, sales, products):
        dates = {}
        for row in sales:
            dates.setdefault(row['product_id'],[]).append(row['sale_date'])
        return [p for p in products if p['product_id'] in dates and all('2019-01-01' <= d <= '2019-03-31' for d in dates[p['product_id']])]
`,'Sản phẩm phải có bán hàng và mọi ngày bán đều thuộc quý I/2019; chỉ có một lần bán ngoài quý cũng bị loại.','O(s+p)','O(s)',{difficulty:'easy'});
add(1085,'Sum of Digits in the Minimum Number','math',[[34,23,1,24,75,33,54,8]],0,`
class Solution:
    def sumOfDigits(self, nums):
        minimum = min(nums)
        digits = [int(ch) for ch in str(minimum)]
        total = sum(digits)
        return int(total%2 == 0)
`,'Chỉ lấy số nhỏ nhất, cộng các chữ số của nó rồi trả 1 nếu tổng chẵn, 0 nếu lẻ.','O(n+digits)','O(digits)',{difficulty:'easy'});
add(1086,'High Five','array',[[[1,91],[1,92],[2,93],[2,97],[1,60],[2,77],[1,65],[1,87],[1,100],[2,100],[2,76]]],[[1,87],[2,88]],`
class Solution:
    def highFive(self, items):
        groups = {}
        for student,score in items:
            groups.setdefault(student,[]).append(score)
        answer = []
        for student,scores in sorted(groups.items()):
            best = sorted(scores,reverse=True)[:5]
            assert len(best) == 5
            answer.append([student,sum(best)//5])
        return answer
`,'Nhóm điểm theo sinh viên; chỉ lấy 5 điểm cao nhất và tính trung bình nguyên.','O(n log n)','O(n)',{difficulty:'easy'});
add(1087,'Brace Expansion','string',['{a,b}c{d,e}f'],['acdf','acef','bcdf','bcef'],`
class Solution:
    def expand(self, s):
        answer,cursor = [''],0
        while cursor < len(s):
            if s[cursor] == '{':
                end = s.index('}',cursor)
                options = s[cursor+1:end].split(',')
                cursor = end+1
            else:
                options = [s[cursor]]
                cursor += 1
            answer = [prefix+choice for prefix in answer for choice in options]
        return sorted(answer)
`,'Mỗi cặp ngoặc là tập lựa chọn; nối mọi tiền tố hiện có với mọi lựa chọn của vị trí tiếp theo. Bài I không có ngoặc lồng nhau.','O(output length)','O(output length)');
add(1088,'Confusing Number II','backtracking',[20],6,`
class Solution:
    def confusingNumberII(self, n):
        assert 1 <= n <= 10000
        mapping = {'0':'0','1':'1','6':'9','8':'8','9':'6'}
        def visit(text):
            total = 0
            if text:
                value = int(text)
                if value > n:
                    return 0
                rotated = int(''.join(mapping[ch] for ch in text[::-1]))
                total += rotated != value
            for digit in mapping:
                if text or digit != '0':
                    if int((text or '')+digit) <= n:
                        total += visit(text+digit)
            return total
        return visit('')
`,'Chỉ xây số từ 0,1,6,8,9, không có 0 đầu. Đổi 6↔9 và đảo thứ tự; đếm số đổi thành giá trị khác sau quay.','O(5^digits·digits)','O(digits)',{difficulty:'hard',traceOptions:{maxEvents:40000}});
add(1090,'Largest Values From Labels','greedy',[[5,4,3,2,1],[1,1,2,2,3],3,1],9,`
class Solution:
    def largestValsFromLabels(self, values, labels, numWanted, useLimit):
        counts,chosen = {},[]
        for value,label in sorted(zip(values,labels),reverse=True):
            if len(chosen) == numWanted:
                break
            if counts.get(label,0) < useLimit:
                chosen.append(value)
                counts[label] = counts.get(label,0)+1
        return sum(chosen)
`,'Xét giá trị cao trước; chỉ lấy khi nhãn chưa đạt hạn mức. Dừng khi đủ số món yêu cầu.','O(n log n)','O(n)');
const histogram=Array(256).fill(0);histogram[1]=1;histogram[2]=3;histogram[3]=4;
add(1093,'Statistics from a Large Sample','math',[histogram],[1,3,2.375,2.5,3],`
class Solution:
    def sampleStats(self, count):
        values = [i for i,c in enumerate(count) if c]
        total = sum(count)
        mean = sum(i*c for i,c in enumerate(count))/total
        targets = [(total+1)//2,(total+2)//2]
        cumulative,middle = 0,[]
        for value in values:
            frequency = count[value]
            previous = cumulative
            cumulative += frequency
            for target in targets:
                if previous < target <= cumulative:
                    middle.append(value)
        mode = max(range(len(count)),key=lambda i:count[i])
        return [values[0],values[-1],mean,sum(middle)/2,mode]
`,'Không bung mẫu lớn: tần suất cho min/max/mode, tổng có trọng số cho mean, tần suất tích lũy xác định hai vị trí giữa cho median.','O(256)','O(256)',{maxArrayLength:256,focus:['count','cumulative','middle','mean','mode']});
add(1097,'Game Play Analysis V','sql',[[{player_id:1,event_date:'2016-03-01'},{player_id:1,event_date:'2016-03-02'},{player_id:2,event_date:'2016-03-01'}]],[{install_dt:'2016-03-01',installs:2,Day1_retention:0.5}],`
class Solution:
    def installReport(self, activity):
        from datetime import date,timedelta
        from decimal import Decimal,ROUND_HALF_UP
        visits = {}
        for row in activity:
            visits.setdefault(row['player_id'],set()).add(date.fromisoformat(row['event_date']))
        groups = {}
        for days in visits.values():
            first = min(days)
            groups.setdefault(first,[]).append(first+timedelta(days=1) in days)
        return [{'install_dt':str(day),'installs':len(retained),'Day1_retention':float((Decimal(sum(retained))/len(retained)).quantize(Decimal('.01'),rounding=ROUND_HALF_UP))} for day,retained in sorted(groups.items())]
`,'Ngày cài là lần chơi đầu của mỗi người. Nhóm theo ngày cài và tính tỉ lệ quay lại đúng ngày hôm sau trong nhóm đó.','O(n log n)','O(n)',{difficulty:'hard'});
add(1098,'Unpopular Books','sql',[[{book_id:1,name:'A',available_from:'2010-01-01'},{book_id:2,name:'B',available_from:'2012-01-01'},{book_id:3,name:'C',available_from:'2019-06-02'}],[{book_id:1,quantity:12,dispatch_date:'2019-05-20'}]],[{book_id:2,name:'B'}],`
class Solution:
    def unpopularBooks(self, books, orders):
        sold = {}
        for row in orders:
            if '2018-06-23' <= row['dispatch_date'] <= '2019-06-23':
                book = row['book_id']
                sold[book] = sold.get(book,0)+row['quantity']
        return [{'book_id':b['book_id'],'name':b['name']} for b in books if b['available_from'] < '2019-05-23' and sold.get(b['book_id'],0) < 10]
`,'Tại 2019-06-23, cộng lượng bán trong một năm gần nhất; chỉ giữ sách có trước 2019-05-23 và bán dưới 10 bản, kể cả chưa có đơn.','O(b+o)','O(b)');
add(1099,'Two Sum Less Than K','array',[[34,23,1,24,75,33,54,8],60],58,`
class Solution:
    def twoSumLessThanK(self, nums, k):
        ordered = sorted(nums)
        left,right,best = 0,len(nums)-1,-1
        while left < right:
            total = ordered[left]+ordered[right]
            if total < k:
                best = max(best,total)
                left += 1
            else:
                right -= 1
        return best
`,'Sau sắp xếp, tổng quá lớn thì giảm phải; tổng hợp lệ thì lưu và tăng trái để tìm tổng lớn hơn nhưng vẫn <k.','O(n log n)','O(n)',{difficulty:'easy'});
module.exports=lessons;
