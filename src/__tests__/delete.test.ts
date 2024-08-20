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
		const baseUrl = process.env['PORT_BASE_URL'] ?? '';

		const parentEntityToUpsert = {
			identifier: 'delete_test_parent',
			title: 'GH Action Test Identity Delete Parent',
			icon: 'GH Action Test Identity',
			blueprint: 'gh-action-test-bp2',
			team: [],
			properties: {},
			relations: {},
		};

		const childEntityToUpsert = {
			identifier: 'delete_test_child',
			title: 'GH Action Test Identity Delete Child',
			icon: 'GH Action Test Identity',
			blueprint: 'gh-action-test-bp',
			team: [],
			properties: {},
			relations: { 'gha-relation': 'delete_test_parent' },
		};

		await clients.port.upsertEntity(
			baseUrl,
			await clients.port.getToken(baseUrl, getInput('clientId'), getInput('clientSecret')),
			parentEntityToUpsert,
		);

		await clients.port.upsertEntity(
			baseUrl,
			await clients.port.getToken(baseUrl, getInput('clientId'), getInput('clientSecret')),
			childEntityToUpsert,
		);
	});

	test('Should delete entity successfully', async () => {
		input = {
			operation: 'DELETE',
			identifier: 'delete_test_child',
			blueprint: 'gh-action-test-bp',
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('ok', true);
	});

	test('Should delete entity successfully using dependent', async () => {
		input = {
			operation: 'DELETE',
			identifier: 'delete_test_parent',
			blueprint: 'gh-action-test-bp2',
			delete_dependents: 'true',
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
