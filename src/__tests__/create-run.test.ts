import * as core from '@actions/core';

import main from '../main';
import { TestInputs, clearInputs, getBaseInput, setInputs } from './utils/utils';

describe('Create Run Integration Tests', () => {
	let outputMock: jest.SpyInstance;
	let failedMock: jest.SpyInstance;
	let input: TestInputs = {};

	beforeAll(() => {
		outputMock = jest.spyOn(core, 'setOutput');
		failedMock = jest.spyOn(core, 'setFailed');
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
				blueprint: 'gh-action-test-bp',
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
				blueprint: 'gh-action-test-bp',
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
