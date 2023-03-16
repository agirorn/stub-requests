import { runAndExit } from 'magic-carpet';

runAndExit(`
  yardman
    '.eslintrc*'
    '.prettier*'
    nyc.config.js
    package.json
    tsconfig.json
    scripts
    src
    'yarn dev:exec'
`);
