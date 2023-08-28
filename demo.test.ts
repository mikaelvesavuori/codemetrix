import test from 'node:test';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * @see https://nodejs.org/api/test.html
 * @see https://glebbahmutov.com/blog/trying-node-test-runner/
 */

function greet(fail = false) {
  if (fail) throw new Error('Failed!');
  return 'Hi there!';
}

async function greetAsync(fail = false) {
  if (fail) throw new Error('Failed!');
  return 'Hi there!';
}

// Basic example
test('Basic greet', () => {
  const expected = 'Hi there!';
  const result = greet();

  assert.equal(result, expected, 'checking the greeting');
});

// Using describe + it semantics
describe('Greet', () => {
  const expected = 'Hi there!';

  it('Should greet', () => {
    const result = greet();
    assert.strictEqual(result, expected, 'checking the greeting');
  });

  it('Should fail', () => {
    assert.throws(() => {
      greet(true);
    });
  });
});

// Async usage
describe('Greet async', () => {
  const expected = 'Hi there!';

  it('Should greet', async () => {
    const result = await greetAsync();
    assert.strictEqual(result, expected, 'checking the greeting');
  });

  it('Should fail', async () => {
    const expected = {
      name: 'Error',
      message: 'Failed!'
    };

    await assert.rejects(async () => {
      await greetAsync(true);
    }, expected);
  });
});
