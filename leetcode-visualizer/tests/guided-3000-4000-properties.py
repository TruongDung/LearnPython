"""Independent small-state oracles for new teaching algorithms and constructors."""
import collections
import functools
import heapq
import itertools
import json
import math
import pathlib
import random
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
ENTRIES={entry['id']:entry for entry in json.loads((ROOT/'problems/guided-3000-4000.json').read_text(encoding='utf8'))}
FUNCTIONS={}
def run(id,*args):
    if id not in FUNCTIONS:
        entry=ENTRIES[id];scope={}
        exec(entry.get('prelude',''),scope)  # pylint: disable=exec-used
        exec(entry['code'],scope)  # pylint: disable=exec-used
        FUNCTIONS[id]=getattr(scope['Solution'](),entry['method'])
    return FUNCTIONS[id](*json.loads(json.dumps(args)))


@functools.lru_cache(maxsize=None)
def remove_divisible_subarrays(values, divisor):
    answer=sum(values)
    for left in range(len(values)):
        for right in range(left+1,len(values)+1):
            if sum(values[left:right])%divisor==0:
                answer=min(answer,remove_divisible_subarrays(
                    values[:left]+values[right:],divisor))
    return answer


@functools.lru_cache(maxsize=None)
def maximum_card_matching(cards, letter, mask):
    best=0
    for i,j in itertools.combinations(range(len(cards)),2):
        if (mask>>i&1 and mask>>j&1 and letter in cards[i] and letter in cards[j]
                and sum(a!=b for a,b in zip(cards[i],cards[j]))==1):
            best=max(best,1+maximum_card_matching(
                cards,letter,mask^(1<<i)^(1<<j)))
    return best


def count_paths(grid):
    dp=[0]*len(grid[0]);dp[0]=1
    for row in grid:
        for c,cell in enumerate(row):
            dp[c]=0 if cell=='#' else dp[c]+(dp[c-1] if c else 0)
    return dp[-1]
def subsets(n):return range(1<<n)
RNG=random.Random(3040)

class Properties(unittest.TestCase):
    def test_inverse_coins_and_once_twice_bits(self):
        for n in range(1,8):
            for mask in subsets(n):
                coins=[i+1 for i in range(n) if mask>>i&1]
                ways=[1]+[0]*n
                for coin in coins:
                    for amount in range(coin,n+1):ways[amount]+=ways[amount-coin]
                self.assertEqual(run(3592,ways[1:]),coins)
        for _ in range(80):
            values=RNG.sample(range(1000),6)
            nums=[values[0]]+[values[1]]*2+sum(([v]*3 for v in values[2:]),[])
            RNG.shuffle(nums)
            self.assertEqual(run(3595,nums),values[:2])

    def test_stability_replacement_and_reverse_grid_moves(self):
        def stability(nums):
            best=0
            for left in range(len(nums)):
                g=0
                for right in range(left,len(nums)):
                    g=math.gcd(g,nums[right])
                    if g>=2:best=max(best,right-left+1)
            return best
        for _ in range(80):
            nums=[RNG.randrange(1,10) for _ in range(5)];k=RNG.randrange(4)
            expected=min(
                stability([1 if mask>>i&1 else value for i,value in enumerate(nums)])
                for mask in subsets(5) if mask.bit_count()<=k
            )
            self.assertEqual(run(3605,nums,k),expected)
        for sx,sy in itertools.product(range(3),repeat=2):
            distance={(sx,sy):0};q=collections.deque([(sx,sy)])
            while q:
                x,y=q.popleft();m=max(x,y)
                for p in [(x+m,y),(x,y+m)]:
                    if max(p)<=10 and p not in distance:distance[p]=distance[x,y]+1;q.append(p)
            for tx,ty in itertools.product(range(7),repeat=2):
                self.assertEqual(
                    run(3609,sx,sy,tx,ty),distance.get((tx,ty),-1),(sx,sy,tx,ty))

    def test_popcount_palindromes_and_or_xor_states(self):
        def depth(value):
            d=0
            while value!=1:value=value.bit_count();d+=1
            return d
        for n in [1,2,3,4,17,100,255]:
            for k in range(5):self.assertEqual(run(3621,n,k),sum(depth(v)==k for v in range(1,n+1)))
        for n in [0,1,2,3,9,31,256,1000]:self.assertEqual(run(3677,n),sum(bin(v)[2:]==bin(v)[2:][::-1] for v in range(n+1)))
        specials=[
            v for v in range(1,100000)
            if str(v)==str(v)[::-1]
            and all(int(d)==count for d,count in collections.Counter(str(v)).items())
        ]
        for n in [0,1,2,21,22,100,211,212,999,4999]:self.assertEqual(run(3646,n),next(v for v in specials if v>n))
        for _ in range(80):
            nums=[RNG.randrange(16) for _ in range(5)]
            xor_values={
                functools.reduce(
                    int.__xor__,(v for i,v in enumerate(nums) if mask>>i&1),0)
                for mask in subsets(5)
            }
            self.assertEqual(run(3681,nums),max(xor_values))
            total=functools.reduce(int.__or__,nums,0)
            expected=sum(
                functools.reduce(
                    int.__or__,(v for i,v in enumerate(nums) if not mask>>i&1),0)<total
                for mask in subsets(5)
            )
            self.assertEqual(run(3757,nums),expected)

    def test_repeated_deletions_and_optimal_card_matching(self):
        for _ in range(70):
            nums=tuple(RNG.randrange(1,6) for _ in range(6));k=RNG.randrange(2,5)
            self.assertEqual(
                run(3654,nums,k),remove_divisible_subarrays(nums,k))
            cards=tuple(''.join(RNG.choices('abc',k=2)) for _ in range(8))
            self.assertEqual(run(3664,cards,'a'),maximum_card_matching(cards,'a',255))

    def test_stable_subsequences_and_fixed_points(self):
        for _ in range(100):
            nums=[RNG.randrange(8) for _ in range(7)]
            expected=0;fixed=0
            for mask in subsets(len(nums)):
                selected=[v for i,v in enumerate(nums) if mask>>i&1]
                if mask and all(not(a%2==b%2==c%2) for a,b,c in zip(selected,selected[1:],selected[2:])):expected+=1
                fixed=max(fixed,sum(i==v for i,v in enumerate(selected)))
            self.assertEqual(run(3686,nums),expected)
            self.assertEqual(run(3920,nums),fixed)

    def test_circular_peaks_and_alternating_deletions(self):
        for n in range(1,80):
            values=list(range(1,n+1));left=True
            while len(values)>1:
                values=values[::2] if left else values[::-1][::2][::-1]
                left=not left
            self.assertEqual(run(3782,n),values[0])
        for _ in range(100):
            nums=[RNG.randrange(5) for _ in range(6)];k=RNG.randrange(4);best=math.inf
            for mask in subsets(6):
                if mask.bit_count()<k or any(mask>>i&1 and mask>>((i+1)%6)&1 for i in range(6)):continue
                best=min(best,sum(max(0,max(nums[(i-1)%6],nums[(i+1)%6])+1-nums[i]) for i in range(6) if mask>>i&1))
            self.assertEqual(run(3892,nums,k),best)

    def test_forbidden_swaps_and_token_collisions(self):
        for _ in range(60):
            nums=tuple(RNG.randrange(3) for _ in range(5));forbidden=tuple(RNG.randrange(3) for _ in range(5))
            q=collections.deque([(nums,0)]);seen={nums};expected=-1
            while q:
                state,moves=q.popleft()
                if all(a!=b for a,b in zip(state,forbidden)):expected=moves;break
                for i,j in itertools.combinations(range(5),2):
                    next_items=list(state)
                    next_items[i],next_items[j]=next_items[j],next_items[i]
                    next_state=tuple(next_items)
                    if next_state not in seen:seen.add(next_state);q.append((next_state,moves+1))
            self.assertEqual(run(3785,nums,forbidden),expected)
            values=[RNG.randrange(10) for _ in range(6)]
            s=''.join(RNG.choices('01',k=6))
            tokens=[i for i,c in enumerate(s) if c=='1'];best=0
            for choices in itertools.product(*([[i-1,i] if i else [i] for i in tokens])):
                best=max(best,sum(values[i] for i in set(choices)))
            self.assertEqual(run(3952,values,s),best)

    def test_coherent_strings_and_binary_transform_operations(self):
        for n in range(1,7):
            strings=[''.join(bits) for bits in itertools.product('01',repeat=n)]
            coherent=[
                s for s in strings
                if not any(
                    ''.join(s[i] for i in indices) in ('011','110')
                    for indices in itertools.combinations(range(n),3)
                )
            ]
            for source in strings:
                self.assertEqual(run(3922,source),min(sum(a!=b for a,b in zip(source,target)) for target in coherent))
                q=collections.deque([source]);distance={source:0}
                while q:
                    state=q.popleft();next_states=[]
                    for i,c in enumerate(state):
                        if c=='0':next_states.append(state[:i]+'1'+state[i+1:])
                        if i+1<n and state[i:i+2]=='11':next_states.append(state[:i]+'00'+state[i+2:])
                    for next_state in next_states:
                        if next_state not in distance:distance[next_state]=distance[state]+1;q.append(next_state)
                for target in strings:self.assertEqual(run(3980,source,target),distance.get(target,-1),(source,target))

    def test_tree_independent_sets_and_decay_cutoff(self):
        for _ in range(80):
            parent=[-1]+[RNG.randrange(i) for i in range(1,6)];nums=[RNG.randrange(1,8) for _ in parent];k=RNG.randrange(1,5)
            expected=sum(
                sum(nums[i] for i in range(6) if mask>>i&1)%k==0
                and not any(
                    mask>>i&1 and mask>>parent[i]&1 for i in range(1,6)
                )
                for mask in range(1,64)
            )
            self.assertEqual(run(3939,parent,nums,k),expected)
            values=[RNG.randrange(1,20) for _ in range(4)];decay=[RNG.randrange(1,6) for _ in values];m=RNG.randrange(1,25)
            heap=[(-v,i)for i,v in enumerate(values)];heapq.heapify(heap);total=0
            for __ in range(m):
                neg,i=heapq.heappop(heap)
                if neg>=0:break
                total-=neg;heapq.heappush(heap,(neg+decay[i],i))
            self.assertEqual(run(3971,values,decay,m),total)

    def test_all_small_path_grid_constructors(self):
        for m,n,k in itertools.product(range(1,11),range(1,11),range(1,5)):
            grid=run(3988,m,n,k)
            maximum=math.comb(m+n-2,m-1)
            if maximum<k:self.assertEqual(grid,[])
            else:self.assertEqual(count_paths(grid),k,(m,n,k))
        for k in range(1,1001):
            grid=run(3990,k)
            self.assertLessEqual(len(grid),25);self.assertLessEqual(len(grid[0]),25)
            self.assertEqual(count_paths(grid),k,k)

    def test_rotation_classes_preserve_order_not_only_character_counts(self):
        self.assertEqual(run(3999,['abcdef','ebadcf']),1)
        self.assertEqual(run(3999,['abcdef','abedcf']),2)
        for _ in range(60):
            words=[''.join(RNG.choices('abc',k=6)) for __ in range(8)];groups=[]
            for word in words:
                equivalent=set()
                for a,b in itertools.product(range(3),repeat=2):
                    even=word[::2];odd=word[1::2];even=even[a:]+even[:a];odd=odd[b:]+odd[:b]
                    equivalent.add(''.join(v for pair in zip(even,odd) for v in pair))
                if not any(word in group for group in groups):groups.append(equivalent)
            self.assertEqual(run(3999,words),len(groups))

if __name__=='__main__':unittest.main(verbosity=2)
