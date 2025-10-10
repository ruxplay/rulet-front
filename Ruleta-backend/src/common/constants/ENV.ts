// src/common/constants/ENV.ts - VERSIÓN LIMPIA
import jetEnv, { num } from 'jet-env';
import { NodeEnvs } from '.';

const ENV = jetEnv({
  NodeEnv: (val: string) => Object.values(NodeEnvs).includes(val as NodeEnvs),
  Port: num,
});

export default ENV;