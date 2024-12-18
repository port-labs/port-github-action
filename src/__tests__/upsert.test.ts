import * as core from '@actions/core';

import clients from '../clients';
import { OPERATION_IS_NOT_SUPPORTED } from '../consts';
import main from '../main';
import { TestInputs, clearInputs, getBaseInput, getInput, setInputs } from './utils/utils';

describe('Upsert Integration Tests', () => {
	jest.setTimeout(100000);

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

	afterEach(async () => {
		const blueprint = getInput('blueprint');
		const identifier = outputMock.mock.calls.length ? outputMock.mock.calls[0][1] : '';
		const baseUrl = process.env['PORT_BASE_URL'] ?? '';
		if (blueprint && identifier)
			await clients.port.deleteEntity(
				baseUrl,
				await clients.port.getToken(baseUrl, getInput('clientId'), getInput('clientSecret')),
				blueprint,
				identifier,
			);
	});

	test('Should upsert entity successfully', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'UPSERT',
				title: 'GH Action Test Identity',
				icon: 'Microservice',
				blueprint: 'gh-action-test-bp',
				team: '["Test"]',
				properties: '{"text": "test", "number": 1, "boolean": true, "array": [1, 2], "object": {"foo": "bar"}}',
				relations: '{"gha-relation": "test"}',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('identifier', expect.any(String));
		expect(failedMock).toHaveBeenCalledTimes(0);
	});

	test('Should fail get input - missing required param blueprint', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'UPSERT',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith('UPSERT Operation - blueprint is missing from input');
	});

	test('Should fail parse input - invalid properties json', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'UPSERT',
				blueprint: 'gh-action-test-bp',
				properties: '{"foo": "a", "bar": 1',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith('Unexpected end of JSON input');
	});

	test('Should fail get token - wrong base url', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'UPSERT',
				baseUrl: 'http://invalidUrl',
				blueprint: 'gh-action-test-bp',
				properties: '{}',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith(expect.stringContaining('invalidurl'));
	});

	test('Should fail upsert entity - relation id not found', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'UPSERT',
				blueprint: 'gh-action-test-bp',
				properties: '{}',
				relations: '{"invalidRelation": "dummyTarget"}',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith('Request failed with status code 404');
	});

	test('Should fail upsert entity - operation is wrong', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'UPSERTT',
				blueprint: 'gh-action-test-bp',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith(OPERATION_IS_NOT_SUPPORTED);
	});
});
