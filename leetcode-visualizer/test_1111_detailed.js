// Detailed test for LeetCode 1111
function maxDepthAfterSplit(seq) {
  const ans = new Array(seq.length).fill(0);
  let x = 0;
  
  console.log('Processing:', seq);
  for (let i = 0; i < seq.length; i++) {
    if (seq[i] === '(') {
      ans[i] = x & 1;
      console.log(`  pos ${i}: '(' -> x=${x}, x&1=${x & 1} -> assign to ${ans[i] === 0 ? 'A' : 'B'}`);
      x++;
    } else {
      x--;
      ans[i] = x & 1;
      console.log(`  pos ${i}: ')' -> x=${x} (after decrement), x&1=${x & 1} -> assign to ${ans[i] === 0 ? 'A' : 'B'}`);
    }
  }
  
  return ans;
}

const seq = '()(())()';
console.log('\n=== Testing: ' + seq + ' ===');
const result = maxDepthAfterSplit(seq);
console.log('Result:', result);
console.log('Expected alternative: [0,0,0,1,1,0,1,1]');

// Check if both are valid
function isValidSplit(seq, ans) {
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
        if (depthA === 0) return false; // Unmatched closing
        depthA--;
      } else {
        if (depthB === 0) return false; // Unmatched closing
        depthB--;
      }
    }
  }
  
  return depthA === 0 && depthB === 0;
}

const myResult = result;
const expectedResult = [0,0,0,1,1,0,1,1];

console.log('\n=== Validation ===');
console.log('My result is valid?', isValidSplit(seq, myResult));
console.log('Expected result is valid?', isValidSplit(seq, expectedResult));

// Calculate max depths
function calculateMaxDepth(seq, ans) {
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
  
  return Math.max(maxA, maxB);
}

console.log('\n=== Max Depths ===');
console.log('My result max depth:', calculateMaxDepth(seq, myResult));
console.log('Expected result max depth:', calculateMaxDepth(seq, expectedResult));