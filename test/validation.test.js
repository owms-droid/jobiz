const test = require('node:test');
const assert = require('node:assert/strict');
const { validateUser, validateJobPost, validateLogin } = require('../middleware/validation');

const runMiddleware = (middleware, body, method = 'POST') => {
  const result = { status: null, payload: null, nextCalled: false };
  const req = { body, method };
  const res = {
    status(code) {
      result.status = code;
      return this;
    },
    json(payload) {
      result.payload = payload;
      return this;
    },
  };

  middleware(req, res, () => {
    result.nextCalled = true;
  });
  return result;
};

test('validateUser rejects unknown fields and non-integer ages', () => {
  const result = runMiddleware(validateUser, {
    full_name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'correct horse battery staple',
    age: '30',
    password_hash: 'client-controlled-hash',
  });

  assert.equal(result.status, 400);
  assert.equal(result.nextCalled, false);
  assert.match(result.payload.errors.join(' '), /not an allowed field/);
  assert.match(result.payload.errors.join(' '), /age must be an integer/);
});

test('validateJobPost rejects client-controlled ownership and timestamps', () => {
  const result = runMiddleware(validateJobPost, {
    title: 'Fix a sink',
    description: 'Repair a kitchen sink',
    user_id: 'client-controlled-owner',
    created_at: '2099-01-01T00:00:00.000Z',
  });

  assert.equal(result.status, 400);
  assert.equal(result.nextCalled, false);
  assert.equal(result.payload.errors.length, 2);
});

test('validateLogin accepts a valid local login request', () => {
  const result = runMiddleware(validateLogin, {
    email: 'ada@example.com',
    password: 'correct horse battery staple',
  });

  assert.equal(result.nextCalled, true);
  assert.equal(result.status, null);
});
