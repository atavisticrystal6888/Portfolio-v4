/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const { execSync } = require('child_process');
process.chdir(__dirname);
console.log('CWD:', process.cwd());
require('./node_modules/next/dist/bin/next');
