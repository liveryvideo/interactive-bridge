const { execSync } = require('node:child_process');

const config = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/npm',
    '@semantic-release/git',
  ],
};

// Only update changelog in master branch
const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
if (branch !== 'master') {
  config.plugins = config.plugins.filter(
    (plugin) => plugin !== '@semantic-release/changelog',
  );
}

module.exports = config;
