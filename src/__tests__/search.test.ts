import * as core from '@actions/core';
import axios from 'axios';

import main from '../main';
import { cleanupPortEnvironment, setupPortEnvironment } from './utils/setup';
import { TestInputs, clearInputs, getBaseInput, setInputs } from './utils/utils';

describe('Search Integration Tests', () => {
	jest.setTimeout(100000);

	let outputMock: jest.SpyInstance;
	let failedMock: jest.SpyInstance;
	let axiosPostSpy: jest.SpyInstance;
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
		axiosPostSpy = jest.spyOn(axios, 'post');
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

		expect(axiosPostSpy).toHaveBeenCalled();
		const requestBody = axiosPostSpy.mock.calls[0][1];
		expect(requestBody.include).toBeUndefined();
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

	test('Should search entities with include parameter - single value', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'SEARCH',
				query:
					'{ "rules": [{ "operator": "=", "value": "not_exists_entity", "property": "$identifier"}], "combinator": "and" }',
				include: 'identifier',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('entities', []);
		expect(failedMock).toHaveBeenCalledTimes(0);

		expect(axiosPostSpy).toHaveBeenCalled();
		const requestBody = axiosPostSpy.mock.calls[1][1];
		expect(requestBody.include).toEqual(['identifier']);
	});

	test('Should search entities with include parameter - multiple values', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'SEARCH',
				query:
					'{ "rules": [{ "operator": "=", "value": "not_exists_entity", "property": "$identifier"}], "combinator": "and" }',
				include: 'properties.str,identifier',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('entities', []);
		expect(failedMock).toHaveBeenCalledTimes(0);

		expect(axiosPostSpy).toHaveBeenCalled();
		const requestBody = axiosPostSpy.mock.calls[1][1];
		expect(requestBody.include).toEqual(['properties.str', 'identifier']);
	});

	test('Should search entities with include parameter - with extra whitespace', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'SEARCH',
				query:
					'{ "rules": [{ "operator": "=", "value": "not_exists_entity", "property": "$identifier"}], "combinator": "and" }',
				include: '  properties.str  ,  identifier  ,  blueprint  ',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('entities', []);
		expect(failedMock).toHaveBeenCalledTimes(0);

		expect(axiosPostSpy).toHaveBeenCalled();
		const requestBody = axiosPostSpy.mock.calls[1][1];
		expect(requestBody.include).toEqual(['properties.str', 'identifier', 'blueprint']);
	});
});
