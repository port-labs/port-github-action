import * as core from '@actions/core';

import main from '../main';
import { cleanupPortEnvironment, setupPortEnvironment } from './utils/setup';
import { TestInputs, clearInputs, getBaseInput, setInputs } from './utils/utils';

describe('Create Run Integration Tests', () => {
	jest.setTimeout(100000);

	let outputMock: jest.SpyInstance;
	let failedMock: jest.SpyInstance;
	let input: TestInputs = {};

	beforeAll(async () => {
		outputMock = jest.spyOn(core, 'setOutput');
		failedMock = jest.spyOn(core, 'setFailed');
		
		const baseInput = getBaseInput();
		await setupPortEnvironment(baseInput.baseUrl, baseInput.clientId, baseInput.clientSecret);
	});

	afterAll(async () => {
		const baseInput = getBaseInput();
		await cleanupPortEnvironment(baseInput.baseUrl, baseInput.clientId, baseInput.clientSecret);
	});

	beforeEach(() => {
		jest.clearAllMocks();
		clearInputs(input);
		input = {};
	});

	test('Should create run successfully', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'CREATE_RUN',
				action: 'gh-action-test',
				properties: '{"text": "test", "number": 1, "boolean": true}',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('runId', expect.any(String));
		expect(failedMock).toHaveBeenCalledTimes(0);
	});

	test('Should create run successfully for entity', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'CREATE_RUN',
				action: 'gh-action-test-entity',
				identifier: 'gh-action-test-bp-entity',
				properties: '{"text": "test", "number": 1, "boolean": true}',
			},
		};

		setInputs(input);
		await main();

		expect(outputMock).toHaveBeenCalledWith('runId', expect.any(String));
		expect(failedMock).toHaveBeenCalledTimes(0);
	});
});
