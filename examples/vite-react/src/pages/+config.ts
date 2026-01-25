export { config };

import type { Config } from 'vike/types';
import vikeReact from 'vike-react/config';

const config = {
  extends: vikeReact,
  prerender: true,
} satisfies Config;
