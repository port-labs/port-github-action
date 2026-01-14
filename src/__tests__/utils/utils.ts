import axios from 'axios';

export type TestInputs = Record<string, string>;

// Mock values for local testing
const MOCK_CONFIG = {
	baseUrl: 'https://api.getport.io',
	clientId: 'mock-client-id',
	clientSecret: 'mock-client-secret',
};

const MOCK_ENTITY = {
	blueprint: 'gh-action-test-bp2',
	identifier: 'test_entity',
	properties: { str: 'foo' },
	relations: {},
	team: ['Test'],
	title: 'GH Action 2 Test Identity',
};

const isCI = (): boolean => Boolean(process.env.CI);

export const getBaseInput = (): TestInputs => ({
	baseUrl: process.env.PORT_BASE_URL || (isCI() ? '' : MOCK_CONFIG.baseUrl),
	clientId: process.env.INPUT_CLIENTID || (isCI() ? '' : MOCK_CONFIG.clientId),
	clientSecret: process.env.INPUT_CLIENTSECRET || (isCI() ? '' : MOCK_CONFIG.clientSecret),
	properties: '{}',
	relations: '{}',
});

// Setup axios mocks for local testing (when not in CI)
if (!isCI()) {
	// eslint-disable-next-line no-console
	console.log('⚠️  Environment variables not supplied - using axios mocks for local testing ⚠️');

	const completedRuns = new Set<string>();
	let runCounter = 0;
	let lastCreatedRunId = 'runId';

	const extractRunId = (url: string, pattern: RegExp): string | null => {
		const match = url.match(pattern);
		return match ? match[1] : null;
	};

	const createError = (code: number | string, message: string): never => {
		const error = new Error(message) as Error & { code: number | string };
		error.code = code;
		throw error;
	};

	const mockResponse = async (url: string, data?: Record<string, unknown>) => {
		const urlLower = url.toLowerCase();

		// Invalid URL errors
		if (urlLower.includes('invalidurl')) {
			createError('ENOTFOUND', 'getaddrinfo ENOTFOUND invalidurl');
		}
		if (urlLower.includes('invalid') || (data && JSON.stringify(data).includes('invalid'))) {
			createError(404, 'Request failed with status code 404');
		}

		// Auth endpoint
		if (url.endsWith('/auth/token')) {
			return { data: { accessToken: 'mock-token' } };
		}

		// Entity endpoint (with or without query params)
		if (url.includes('/gh-action-test-bp2/entities/test_entity')) {
			return { data: { entity: MOCK_ENTITY } };
		}

		// Audit log endpoint
		if (url.includes('/audit-log')) {
			return { data: { audits: [{ context: { entity: 'gh-action-test-bp-entity' } }] } };
		}

		// Run logs endpoint
		if (url.includes('/runs/') && url.includes('/logs')) {
			const runId = extractRunId(url, /\/runs\/([^/]+)\/logs/) ?? lastCreatedRunId;
			return { data: { runLog: { runId, message: data?.message ?? 'Test message' } } };
		}

		// Action run creation endpoint
		if (url.includes('/actions/') && url.includes('/runs')) {
			runCounter += 1;
			lastCreatedRunId = `runId_${runCounter}`;
			return { data: { run: { id: lastCreatedRunId, status: 'IN_PROGRESS' } } };
		}

		// Default response
		return {
			data: {
				entities: [],
				run: { id: lastCreatedRunId, status: 'IN_PROGRESS' },
				entity: { identifier: 'id' },
			},
		};
	};

	const mockPatchResponse = (url: string, data?: Record<string, unknown>) => {
		const runId = extractRunId(url, /\/runs\/([^/]+)$/) ?? 'unknown';

		if (completedRuns.has(runId)) {
			createError(422, 'Request failed with status code 422');
		}

		if (data?.status === 'SUCCESS' || data?.status === 'FAILURE') {
			completedRuns.add(runId);
		}

		return mockResponse(url);
	};

	jest.spyOn(axios, 'get').mockImplementation((url) => mockResponse(url));
	jest.spyOn(axios, 'post').mockImplementation((url, data) => mockResponse(url, data as Record<string, unknown>));
	jest.spyOn(axios, 'put').mockImplementation((url) => mockResponse(url));
	jest.spyOn(axios, 'delete').mockImplementation((url) => mockResponse(url));
	jest.spyOn(axios, 'patch').mockImplementation((url, data) => mockPatchResponse(url, data as Record<string, unknown>));
}

// Input helpers
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
