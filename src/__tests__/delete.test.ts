import * as core from '@actions/core';

import clients from '../clients';
import main from '../main';
import { TestInputs, clearInputs, getBaseInput, getInput, setInputs } from './utils/utils';

describe('Get Integration Tests', () => {
	let outputMock: jest.SpyInstance;
	let failedMock: jest.SpyInstance;
	let input: TestInputs = {};

	beforeAll(async () => {
		outputMock = jest.spyOn(core, 'setOutput');
		failedMock = jest.spyOn(core, 'setFailed');
	});

	beforeEach(async () => {
		jest.clearAllMocks();
		clearInputs(input);
		input = { ...getBaseInput() };
		setInputs(input);
		const entityToUpsert = {
			identifier: 'delete-test',
			title: 'GH Action Test Identity Delete',
			icon: 'GH Action Test Identity',
			blueprint: 'gh-action-test-bp',
			team: [],
			properties: {},
			relations: {},
		};
		await clients.port.upsertEntity(
			getInput('baseUrl'),
			await clients.port.getToken(getInput('baseUrl'), getInput('clientId'), getInput('clientSecret')),
			entityToUpsert,
		);
	});

	test('Should delete entity successfully', async () => {
		input = {
			operation: 'DELETE',
			identifier: 'delete-test',
			blueprint: 'gh-action-test-bp',
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('ok', true);
	});

	test('Should fail get input - missing required param identifier', async () => {
		input = {
			...{
				operation: 'DELETE',
				blueprint: 'gh-action-test-bp',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith('DELETE Operation - identifier is missing from input');
	});

	test('Should fail get input - entity not exists', async () => {
		input = {
			...{
				operation: 'DELETE',
				identifier: 'invalidIdentifier',
				blueprint: 'invalidBlueprint',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith('Request failed with status code 404');
	});
});
