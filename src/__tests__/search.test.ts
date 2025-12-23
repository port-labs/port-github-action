import * as core from '@actions/core';

import main from '../main';
import { setupPortEnvironment } from './utils/setup';
import { TestInputs, clearInputs, getBaseInput, setInputs } from './utils/utils';

describe('Search Integration Tests', () => {
	jest.setTimeout(100000);

	let outputMock: jest.SpyInstance;
	let failedMock: jest.SpyInstance;
	let input: TestInputs = {};

	let cleanup: (() => Promise<void>) | undefined;

	beforeAll(async () => {
		outputMock = jest.spyOn(core, 'setOutput');
		failedMock = jest.spyOn(core, 'setFailed').mockImplementation(() => {});

		const baseInput = getBaseInput();
		cleanup = await setupPortEnvironment(baseInput.baseUrl, baseInput.clientId, baseInput.clientSecret);
	});

	afterAll(async () => {
		await cleanup?.();
	});

	beforeEach(() => {
		jest.clearAllMocks();
		clearInputs(input);
		input = {};
	});

	test('Should search entities successfully', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'SEARCH',
				query:
					'{ "rules": [{ "operator": "=", "value": "not_exists_entity", "property": "$identifier"}], "combinator": "and" }',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('entities', []);
		expect(failedMock).toHaveBeenCalledTimes(0);
	});

	test('Should fail search input - missing required param query', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'SEARCH',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith('SEARCH Operation - query is missing from input');
	});
});
