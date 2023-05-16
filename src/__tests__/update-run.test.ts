import * as core from '@actions/core';

import main from '../main';
import { TestInputs, clearInputs, getBaseInput, setInputs } from './utils/utils';

describe('Update Run Integration Tests', () => {
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

	test('Should update run successfully', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'UPDATE_RUN',
				runId: 'r_1HDz2pBPYltPcfA1',
				message: 'Test message',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('runId', expect.any(String));
		expect(failedMock).toHaveBeenCalledTimes(0);
	});

	test('Should fail to update run - run already completed', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'UPDATE_RUN',
				runId: 'r_NAFIufSPQomsEjhm',
				status: 'SUCCESS',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);

		expect(failedMock).toHaveBeenCalledWith('Request failed with status code 422');
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

	test('Should fail parse input - invalid status value', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'UPDATE_RUN',
				runId: 'r_oB7y1xUZY37J6uRU',
				status: 'INVALID',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith('ACTION_UPDATE Operation - status must be one of SUCCESS or FAILURE');
	});
});
