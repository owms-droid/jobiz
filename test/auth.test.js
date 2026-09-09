const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isAuthenticated,
  isAdmin,
  canAccessUser,
  canAccessJobPost,
} = require('../middleware/authenticate');

test('isAuthenticated rejects unauthenticated users', () => {
  let statusCode;
  let body;

  const req = { isAuthenticated: () => false };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      body = payload;
      return this;
    },
  };
  const next = () => {
    throw new Error('next should not be called');
  };

  isAuthenticated(req, res, next);

  assert.equal(statusCode, 401);
  assert.deepEqual(body, { message: 'You must be logged in to perform this action.' });
});

test('isAdmin allows administrators only', () => {
  let called = false;

  const req = { isAuthenticated: () => true, user: { role: 'admin' } };
  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  isAdmin(req, res, () => {
    called = true;
  });

  assert.equal(called, true);

  const otherReq = { isAuthenticated: () => true, user: { role: 'user' } };
  isAdmin(otherReq, res, () => {
    throw new Error('next should not be called');
  });

  assert.equal(res.code, 403);
  assert.deepEqual(res.payload, { message: 'Admin access required.' });
});

test('canAccessUser permits owner or admin', () => {
  let called = false;
  const ownerReq = {
    isAuthenticated: () => true,
    user: { _id: '507f1f77bcf86cd799439011' },
    params: { id: '507f1f77bcf86cd799439011' },
  };

  canAccessUser(ownerReq, {}, () => {
    called = true;
  });
  assert.equal(called, true);

  const adminReq = {
    isAuthenticated: () => true,
    user: { _id: '507f1f77bcf86cd799439012', role: 'admin' },
    params: { id: '507f1f77bcf86cd799439011' },
  };

  let adminCalled = false;
  canAccessUser(adminReq, {}, () => {
    adminCalled = true;
  });
  assert.equal(adminCalled, true);

  const outsiderReq = {
    isAuthenticated: () => true,
    user: { _id: '507f1f77bcf86cd799439013', role: 'user' },
    params: { id: '507f1f77bcf86cd799439011' },
  };

  let statusCode;
  let response;
  const outsiderRes = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      response = payload;
      return this;
    },
  };

  canAccessUser(outsiderReq, outsiderRes, () => {
    throw new Error('next should not be called');
  });

  assert.equal(statusCode, 403);
  assert.deepEqual(response, { message: 'You do not have permission to access this user.' });
});

test('canAccessJobPost permits owner or admin', () => {
  let called = false;
  const ownerReq = {
    isAuthenticated: () => true,
    user: { _id: '507f1f77bcf86cd799439011' },
    params: { id: '507f1f77bcf86cd799439011' },
    body: { created_by: '507f1f77bcf86cd799439011' },
  };

  canAccessJobPost(ownerReq, {}, () => {
    called = true;
  });
  assert.equal(called, true);

  const adminReq = {
    isAuthenticated: () => true,
    user: { _id: '507f1f77bcf86cd799439012', role: 'admin' },
    params: { id: '507f1f77bcf86cd799439011' },
    body: { created_by: '507f1f77bcf86cd799439011' },
  };

  let adminCalled = false;
  canAccessJobPost(adminReq, {}, () => {
    adminCalled = true;
  });
  assert.equal(adminCalled, true);

  const outsiderReq = {
    isAuthenticated: () => true,
    user: { _id: '507f1f77bcf86cd799439013', role: 'user' },
    params: { id: '507f1f77bcf86cd799439011' },
    body: { created_by: '507f1f77bcf86cd799439014' },
  };

  let statusCode;
  let response;
  const outsiderRes = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      response = payload;
      return this;
    },
  };

  canAccessJobPost(outsiderReq, outsiderRes, () => {
    throw new Error('next should not be called');
  });

  assert.equal(statusCode, 403);
  assert.deepEqual(response, { message: 'You do not have permission to modify this job post.' });
});
