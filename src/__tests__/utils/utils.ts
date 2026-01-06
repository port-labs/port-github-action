import axios from 'axios';
import { url } from 'inspector';

export type TestInputs = Record<string, string>;

export const getBaseInput = (): TestInputs => ({
	baseUrl: process.env['PORT_BASE_URL'] ?? 'http://localhost',
	clientId: process.env['INPUT_CLIENTID'] ?? ' ',
	clientSecret: process.env['INPUT_CLIENTSECRET'] ?? ' ',
	properties: '{}',
	relations: '{}',
});

// When running locally (not in a GH Action), mock axios requests:
if (!process.env['CI']) {
	console.log('⚠️  Environment variables not supplied - using axios mocks for local testing ⚠️');

	const mockResponse = async (urlString: string, data?: any) => {
		const url = URL.parse(urlString);
		if (url === null) {
			throw new Error(`Invalid URL: ${urlString}`);
		}
		if (url.pathname.endsWith('/auth/token')) {
			return { data: { accessToken: 'mock-token' } };
		}
		if (url.pathname.endsWith('/gh-action-test-bp2/entities/test_entity')) {
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
		if (url.pathname.includes('invalid')) {
			throw { code: 404, message: 'Request failed with status code 404' };
		}
		if (data && JSON.stringify(data).includes('invalid')) {
			throw { code: 404, message: 'Request failed with status code 404' };
		}
		if (url.hostname.includes('invalidurl')) {
			throw { code: 'ENOTFOUND', message: 'getaddrinfo ENOTFOUND invalidurl' };
		}
		return {
			data: { entities: [], run: { id: 'runId' }, entity: { identifier: 'id' } },
		};
	};

	jest.spyOn(axios, 'post').mockImplementation((url, data, __) => mockResponse(url, data));
	jest.spyOn(axios, 'get').mockImplementation((url, _) => mockResponse(url));
	jest.spyOn(axios, 'delete').mockImplementation((url, _) => mockResponse(url));
	jest.spyOn(axios, 'put').mockImplementation((url, _, __) => mockResponse(url));
	jest
		.spyOn(axios, 'patch')
		.mockImplementationOnce((url, _, __) => mockResponse(url))
		.mockImplementation(() => {
			throw { code: 422, message: 'Request failed with status code 422' };
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
