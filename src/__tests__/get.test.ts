import * as core from '@actions/core';

import main from '../main';
import { cleanupPortEnvironment, setupPortEnvironment } from './utils/setup';
import { TestInputs, clearInputs, getBaseInput, setInputs } from './utils/utils';

describe('Get Integration Tests', () => {
	jest.setTimeout(100000);

	let outputMock: jest.SpyInstance;
	let failedMock: jest.SpyInstance;
	let input: TestInputs = {};

	beforeAll(async () => {
		outputMock = jest.spyOn(core, 'setOutput');
		failedMock = jest.spyOn(core, 'setFailed').mockImplementation(() => {});

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
		expect(failedMock).toHaveBeenCalledTimes(0);
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
		expect(failedMock).toHaveBeenCalledWith('GET Operation - identifier is missing from input');
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
		expect(failedMock).toHaveBeenCalledWith('Request failed with status code 404');
	});

	test('Should get entity with include parameter - single value', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'GET',
				identifier: 'test_entity',
				blueprint: 'gh-action-test-bp2',
				include: 'identifier',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('entity', expect.objectContaining({
			blueprint: 'gh-action-test-bp2',
			identifier: 'test_entity',
			properties: { str: 'foo' },
		}));
		expect(failedMock).toHaveBeenCalledTimes(0);
	});

	test('Should get entity with include parameter - multiple values', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'GET',
				identifier: 'test_entity',
				blueprint: 'gh-action-test-bp2',
				include: 'properties.str, identifier',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('entity', expect.objectContaining({
			blueprint: 'gh-action-test-bp2',
			identifier: 'test_entity',
			properties: { str: 'foo' },
		}));
		expect(failedMock).toHaveBeenCalledTimes(0);
	});

	test('Should get entity with include parameter - with extra whitespace', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'GET',
				identifier: 'test_entity',
				blueprint: 'gh-action-test-bp2',
				include: '  properties.str  ,  identifier  ,  blueprint  ',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('entity', expect.objectContaining({
			blueprint: 'gh-action-test-bp2',
			identifier: 'test_entity',
			properties: { str: 'foo' },
		}));
		expect(failedMock).toHaveBeenCalledTimes(0);
	});
});
