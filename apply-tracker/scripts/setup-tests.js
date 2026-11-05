/**
 * One-time setup: installs the testing libraries and adds the test scripts
 * and Jest config to package.json. Works on Windows, macOS and Linux.
 *
 * Run after the Expo packages are installed:  node scripts/setup-tests.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pkgPath = path.join(root, 'package.json');

// react-test-renderer must be exactly the same version as react.
const reactVersion = require(path.join(root, 'node_modules', 'react', 'package.json')).version;

execSync(
  `npm install --save-dev @testing-library/react-native@^13 react-test-renderer@${reactVersion}`,
  { stdio: 'inherit', cwd: root },
);

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = { ...pkg.scripts, test: 'jest', typecheck: 'tsc --noEmit' };
pkg.jest = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log('\nDone. Run "npm test" to run the tests.');
