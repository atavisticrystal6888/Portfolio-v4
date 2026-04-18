const { execSync } = require('child_process');
process.chdir(__dirname);
console.log('CWD:', process.cwd());
require('./node_modules/next/dist/bin/next');
