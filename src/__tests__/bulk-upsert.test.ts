import * as core from '@actions/core';

import clients from '../clients';
import main from '../main';
import { TestInputs, clearInputs, getBaseInput, getInput, setInputs } from './utils/utils';

describe('Bulk Upsert Integration Tests', () => {
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
		const identifier = outputMock.mock.calls.length ? outputMock.mock.calls[0][1][0] : '';
		if (blueprint && identifier)
			await clients.port.deleteEntity(
				getInput('baseUrl'),
				await clients.port.getToken(getInput('baseUrl'), getInput('clientId'), getInput('clientSecret')),
				blueprint,
				identifier,
			);
	});

	test('Should bulk upsert entities successfully', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'BULK_UPSERT',
				entities:
					'[{"title": "GH Action Test Identity", "icon": "GH Action Test Identity", "blueprint": "gh-action-test-bp", "team": ["Test"],"properties": {"text": "test","number": 1,"boolean": true, "array": [1,2],"object": { "foo": "bar" } },"relations": { "gha-relation": "e_nrw9dSY4yAYl9A8U"}, "runId": "r_1HDz2pBPYltPcfA1"}]',
				runId: 'r_1HDz2pBPYltPcfA1',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('identifiers', [expect.any(String)]);
		expect(failedMock).toHaveBeenCalledTimes(0);
	});

	test('Should fail get input - missing required param entities', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'BULK_UPSERT',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith('BULK_UPSERT Operation - entities is missing from input');
	});

	test('Should fail parse input - invalid properties json', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'BULK_UPSERT',
				entities: '[]]',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith('Unexpected token ] in JSON at position 2');
	});
});
