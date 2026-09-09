const test = require('node:test');
const assert = require('node:assert/strict');
const { getMissingEnv, validateEnv } = require('../utils/env');

test('getMissingEnv returns the keys missing from process.env', () => {
  const previous = { ...process.env };
  process.env.PORT = '3000';
  delete process.env.MONGODB_URI;
  delete process.env.SESSION_SECRET;

  try {
    assert.deepEqual(
      getMissingEnv(['PORT', 'MONGODB_URI', 'SESSION_SECRET']),
      ['MONGODB_URI', 'SESSION_SECRET']
    );
  } finally {
    process.env = previous;
  }
});

test('validateEnv throws a clear error when required env vars are missing', () => {
  const previous = { ...process.env };
  delete process.env.MONGODB_URI;
  delete process.env.SESSION_SECRET;
  delete process.env.GITHUB_CLIENT_ID;
  delete process.env.GITHUB_CLIENT_SECRET;
  delete process.env.GITHUB_CALLBACK_URL;

  try {
    assert.throws(
      () => validateEnv(),
      /Missing required environment variables: MONGODB_URI, SESSION_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL/
    );
  } finally {
    process.env = previous;
  }
});
