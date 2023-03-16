import { runAndExit } from 'magic-carpet';

const TEST = 'time node ./dist/all.test.js';

runAndExit(`
  clear
  &&   time yarn --silent compile
  && : clear
  && : ${TEST}
  && : exit 0
  && : ${TEST}/testNewOrder.test.js
  && : clear
  && : exit 0
  &&   time yarn --silent test
  &&   yarn --silent lint
  && : yarn --silent unused-exports
`);
