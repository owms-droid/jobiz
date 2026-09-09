const test = require('node:test');
const assert = require('node:assert/strict');
const { csrfProtection, issueCsrfToken } = require('../middleware/csrf');

test('csrfProtection rejects state-changing requests without a valid token', () => {
    let statusCode;
    let payload;
    const req = {
        method: 'POST',
        session: { csrfToken: 'expected-token' },
        get: () => undefined,
    };
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(body) {
            payload = body;
            return this;
        },
    };

    csrfProtection(req, res, () => {
        throw new Error('next should not be called');
    });

    assert.equal(statusCode, 403);
    assert.deepEqual(payload, { message: 'CSRF token is missing or invalid.' });
});

test('issueCsrfToken creates a session token and returns it', () => {
    const req = { session: {} };
    let payload;
    const res = {
        status() {
            return this;
        },
        json(body) {
            payload = body;
            return this;
        },
    };

    issueCsrfToken(req, res);

    assert.equal(typeof req.session.csrfToken, 'string');
    assert.equal(payload.csrfToken, req.session.csrfToken);
});
