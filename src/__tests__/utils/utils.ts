import axios from 'axios';
import { setTimeout } from 'timers/promises';

export type TestInputs = Record<string, string>;

export const getBaseInput = (): TestInputs => ({
	baseUrl: process.env['PORT_BASE_URL'] || 'http://localhost:1234',
	clientId: process.env['INPUT_CLIENTID'] || 'mock-client-id',
	clientSecret: process.env['INPUT_CLIENTSECRET'] || 'mock-client-secret',
	properties: '{}',
	relations: '{}',
});

// When running locally (not in a GH Action), mock axios requests:
if (!process.env['CI']) {
	console.log('⚠️  Environment variables not supplied - using axios mocks for local testing ⚠️');

	const mockResponse = async (urlString: string, data?: any) => {
		if (urlString.endsWith('/auth/token')) {
			return { data: { accessToken: 'mock-token' } };
		}
		if (urlString.includes('/gh-action-test-bp2/entities/test_entity')) {
			return {
				data: {
					entity: {
						blueprint: 'gh-action-test-bp2',
						identifier: 'test_entity',
						properties: { str: 'foo' },
						relations: {},
						team: ['Test'],
						title: 'GH Action 2 Test Identity',
					},
				},
			};
		}
		if (urlString.toLowerCase().includes('invalidurl')) {
			throw { code: 'ENOTFOUND', message: 'getaddrinfo ENOTFOUND invalidurl' };
		}
		if (urlString.includes('invalid')) {
			throw { code: 404, message: 'Request failed with status code 404' };
		}
		if (data && JSON.stringify(data).includes('invalid')) {
			throw { code: 404, message: 'Request failed with status code 404' };
		}
		if (urlString.includes('/audit-log')) {
			return {
				data: {
					audits: [
						{
							context: {
								entity: 'gh-action-test-bp-entity',
							},
						},
					],
				},
			};
		}
		return {
			data: {
				entities: [],
				run: { id: 'runId', status: 'IN_PROGRESS' },
				entity: { identifier: 'id' },
				runLog: { runId: 'runId', message: 'Test message' },
			},
		};
	};

	jest.spyOn(axios, 'post').mockImplementation((url, data, __) => mockResponse(url, data));
	jest.spyOn(axios, 'get').mockImplementation((url, _) => mockResponse(url));
	jest.spyOn(axios, 'delete').mockImplementation((url, _) => mockResponse(url));
	jest.spyOn(axios, 'put').mockImplementation((url, _, __) => mockResponse(url));
	let patchCallCount = 0;
	jest.spyOn(axios, 'patch').mockImplementation((url, data: any, __) => {
		patchCallCount++;
		// First PATCH (in beforeAll to complete a run) succeeds, subsequent ones with status fail
		if (patchCallCount > 1 && data?.status) {
			throw { response: { status: 422 }, message: 'Request failed with status code 422' };
		}
		return mockResponse(url);
	});
}

const getInputName = (name: string): string => `INPUT_${name.replace(/ /g, '_').toUpperCase()}`;

export const getInput = (name: string): string => process.env[getInputName(name)] ?? '';

const setInput = (name: string, value: string): void => {
	process.env[getInputName(name)] = value;
};

export const setInputs = (inputs: TestInputs): void => {
	Object.entries(inputs).forEach(([key, value]) => setInput(key, value));
};

export const clearInputs = (inputs: TestInputs): void => {
	const baseInputKeys = ['baseUrl', 'clientId', 'clientSecret'];

	Object.keys(inputs).forEach((input) => {
		if (!baseInputKeys.includes(input)) {
			delete process.env[getInputName(input)];
		}
	});
};

export async function eventually<T>(
	fn: (bail: (e: Error) => void, attempt: number) => Promise<T>,
	options?: { maxTimeout?: number; backoffBaseMs?: number; backoffFactor?: number },
) {
	const maxTimeout = options?.maxTimeout;
	const backoffBaseMs = options?.backoffBaseMs ?? 100;
	const backoffFactor = options?.backoffFactor ?? 2;

	let lastError: Error | null = null;
	let attempt = 0;
	let backoffMs = backoffBaseMs;

	let bailedOut = false;
	const bail = (e: Error) => {
		lastError = e;
		bailedOut = true;
	};

	const startTime = performance.now();

	do {
		attempt += 1;

		if (maxTimeout && performance.now() - startTime >= maxTimeout) {
			if (lastError !== null) {
				throw lastError;
			}
			throw new Error('Max timeout reached before running fn');
		}

		try {
			const result = await fn(bail, attempt);
			return result;
		} catch (error) {
			if (bailedOut) {
				throw lastError;
			}

			if (maxTimeout) {
				const timeSpent = performance.now() - startTime;
				if (timeSpent + backoffMs >= maxTimeout) {
					throw error;
				}
			}

			lastError = error as Error;
			await setTimeout(backoffMs);
			backoffMs *= backoffFactor;
		}
	} while (lastError !== null && !bailedOut);

	if (bailedOut) {
		throw lastError;
	}
}
