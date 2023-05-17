import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	verbose: true,
	testMatch: ['**/?(*.)+(spec|test).[jt]s'],
	bail: 1,
};
export default config;
