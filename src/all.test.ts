import { run, dirnameFrom } from 'sanna';

run({
  dirs: [dirnameFrom(import.meta)],
});
