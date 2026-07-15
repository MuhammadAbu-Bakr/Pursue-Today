import assert from 'node:assert';

// A simple function to perform unit testing on
function add(a, b) {
  return a + b;
}

// Unit Tests
function runTests() {
  console.log('Running unit tests...');
  try {
    assert.strictEqual(add(2, 3), 5, '2 + 3 should equal 5');
    assert.strictEqual(add(-1, 1), 0, '-1 + 1 should equal 0');
    assert.strictEqual(add(0, 0), 0, '0 + 0 should equal 0');
    
    console.log('✅ All unit tests passed successfully!');
  } catch (error) {
    console.error('❌ Unit test failed:', error.message);
  }
}

runTests();
