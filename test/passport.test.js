const test = require('node:test');
const assert = require('node:assert/strict');
const passport = require('../config/passport');

const sampleProfile = {
  id: '123456',
  displayName: 'Ada Lovelace',
  username: 'ada',
  emails: [{ value: 'ada@example.com' }],
  photos: [{ value: 'https://example.com/avatar.png' }],
};

test('buildGitHubUserRecord normalizes GitHub profile data', () => {
  const user = passport.buildGitHubUserRecord(sampleProfile);

  assert.equal(user.githubId, '123456');
  assert.equal(user.full_name, 'Ada Lovelace');
  assert.equal(user.email, 'ada@example.com');
  assert.equal(user.role, 'user');
  assert.equal(user.avatar, 'https://example.com/avatar.png');
});

test('findOrCreateGithubUser links an existing email match to GitHub', async () => {
  const existingUser = {
    _id: { toString: () => 'existing-user-id' },
    githubId: null,
    email: 'ada@example.com',
    full_name: 'Ada Lovelace',
    role: 'user',
    avatar: 'https://old.example.com/avatar.png',
  };

  const calls = [];
  const collection = {
    findOne: async (query) => {
      calls.push(query);
      if (query.githubId === '123456') return null;
      if (query.email === 'ada@example.com') return existingUser;
      return null;
    },
    updateOne: async (query, update) => {
      calls.push({ query, update });
      return { acknowledged: true, modifiedCount: 1 };
    },
    insertOne: async () => {
      throw new Error('Should not insert a record when the user already exists');
    },
  };

  const db = { collection: () => collection };
  const result = await passport.findOrCreateGithubUser(db, sampleProfile);

  assert.equal(result._id.toString(), 'existing-user-id');
  assert.equal(result.githubId, '123456');
  assert.equal(result.email, 'ada@example.com');
  assert.equal(result.role, 'user');
});
