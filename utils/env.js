const REQUIRED_ENV = [
  'MONGODB_URI',
  'SESSION_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GITHUB_CALLBACK_URL',
];

const getMissingEnv = (keys = REQUIRED_ENV) =>
  keys.filter((key) => !process.env[key] || process.env[key].trim() === '');

const validateEnv = (keys = REQUIRED_ENV) => {
  const missing = getMissingEnv(keys);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  return true;
};

module.exports = { getMissingEnv, validateEnv, REQUIRED_ENV };
