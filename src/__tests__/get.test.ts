import * as core from '@actions/core';

import main from '../main';
import { cleanupPortEnvironment, setupPortEnvironment } from './utils/setup';
import { TestInputs, clearInputs, getBaseInput, setInputs } from './utils/utils';

describe('Get Integration Tests', () => {
	jest.setTimeout(100000);

	let outputMock: jest.SpyInstance;
	let warningMock: jest.SpyInstance;
	let input: TestInputs = {};

	beforeAll(async () => {
		outputMock = jest.spyOn(core, 'setOutput');
		warningMock = jest.spyOn(core, 'warning');
		
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

	test('Should get entity successfully', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'GET',
				identifier: 'test_entity',
				blueprint: 'gh-action-test-bp2',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('entity', {
			blueprint: 'gh-action-test-bp2',
			identifier: 'test_entity',
			properties: { str: 'foo' },
			relations: {},
			team: ['Test'],
			title: 'GH Action 2 Test Identity',
		});
		expect(warningMock).toHaveBeenCalledTimes(0);
	});

	test('Should fail get input - missing required param identifier', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'GET',
				blueprint: 'gh-action-test-bp2',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(warningMock).toHaveBeenCalledWith('GET Operation - identifier is missing from input');
	});

	test('Should fail get input - entity not exists', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'GET',
				identifier: 'invalidIdentifier',
				blueprint: 'invalidBlueprint',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(warningMock).toHaveBeenCalledWith('Request failed with status code 404');
	});
});
