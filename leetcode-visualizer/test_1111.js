// Test the algorithm for LeetCode 1111
function maxDepthAfterSplit(seq) {
  const ans = new Array(seq.length).fill(0);
  let x = 0;
  
  for (let i = 0; i < seq.length; i++) {
    if (seq[i] === '(') {
      ans[i] = x & 1;
      x++;
    } else {
      x--;
      ans[i] = x & 1;
    }
  }
  
  return ans;
}

// Test cases from LeetCode
console.log('Test 1: "(()())"');
console.log('Expected: [0,1,1,1,1,0]');
console.log('Got:', maxDepthAfterSplit('(()())'));
console.log('');

console.log('Test 2: "()(())()"');
console.log('Expected: [0,0,0,1,1,0,1,1]');
console.log('Got:', maxDepthAfterSplit('()(())()'));
console.log('');

// Simple visualization test
function visualize(seq, ans) {
  console.log('String: ' + seq.split('').join(' '));
  console.log('Assign: ' + ans.map(a => a === 0 ? 'A' : 'B').join(' '));
  
  let depthA = 0, depthB = 0;
  let maxA = 0, maxB = 0;
  
  for (let i = 0; i < seq.length; i++) {
    if (seq[i] === '(') {
      if (ans[i] === 0) {
        depthA++;
        maxA = Math.max(maxA, depthA);
      } else {
        depthB++;
        maxB = Math.max(maxB, depthB);
      }
    } else {
      if (ans[i] === 0) {
        depthA--;
      } else {
        depthB--;
      }
    }
  }
  
  console.log('Max depth A:', maxA, 'Max depth B:', maxB, 'Max overall:', Math.max(maxA, maxB));
}

console.log('Visualization for "(()())":');
visualize('(()())', maxDepthAfterSplit('(()())'));