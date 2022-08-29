import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	roots: ['<rootDir>/lib'],
	preset: 'ts-jest',
	verbose: true,
	testMatch: ['**/?(*.)+(spec|test).[jt]s'],
	bail: 1,
};
export default config;
