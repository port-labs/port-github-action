import * as core from '@actions/core';

import clients from '../clients';
import main from '../main';
import { cleanupPortEnvironment, setupPortEnvironment } from './utils/setup';
import { TestInputs, clearInputs, getBaseInput, setInputs } from './utils/utils';

describe('Patch Run Integration Tests', () => {
	jest.setTimeout(100000);

	let outputMock: jest.SpyInstance;
	let failedMock: jest.SpyInstance;
	let input: TestInputs = {};
	let completedRunId: string;

	const createFreshRun = async (): Promise<string> => {
		const baseInput = getBaseInput();
		const accessToken = await clients.port.getToken(baseInput.baseUrl, baseInput.clientId, baseInput.clientSecret);
		const run = await clients.port.createRun(baseInput.baseUrl, accessToken, {
			action: 'gh-action-test',
			properties: {},
		});

		if (run.status !== 'IN_PROGRESS') {
			throw new Error(`Expected run ${run.id} to be IN_PROGRESS but got ${run.status}`);
		}
		return run.id;
	};

	beforeAll(async () => {
		outputMock = jest.spyOn(core, 'setOutput');
		failedMock = jest.spyOn(core, 'setFailed');
		
		const baseInput = getBaseInput();
		await setupPortEnvironment(baseInput.baseUrl, baseInput.clientId, baseInput.clientSecret);
		
		const accessToken = await clients.port.getToken(baseInput.baseUrl, baseInput.clientId, baseInput.clientSecret);
		
		// Create a completed run for the test that checks failure on completed runs
		const run2 = await clients.port.createRun(baseInput.baseUrl, accessToken, {
			action: 'gh-action-test',
			properties: {},
		});
		await clients.port.patchRun(baseInput.baseUrl, accessToken, run2.id, {
			status: 'SUCCESS',
		});
		completedRunId = run2.id;
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

	// TODO: This test is flaky
	test.skip('Should patch run successfully', async () => {
		const runId = await createFreshRun();

		input = {
			...getBaseInput(),
			...{
				operation: 'PATCH_RUN',
				runId,
				logMessage: 'Test message',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('runId', expect.any(String));
		expect(outputMock).toHaveBeenCalledWith('logMessage', 'Test message');

		expect(failedMock).toHaveBeenCalledTimes(0);
	});

	// TODO: This test is flaky
	test.skip('Should patch run successfully - with link', async () => {
		const runId = await createFreshRun();

		input = {
			...getBaseInput(),
			...{
				operation: 'PATCH_RUN',
				runId,
				logMessage: 'Test message',
				link: `["https://www.google.com","https://www.google.com"]`,
			},
		};

		setInputs(input);
		await main();

		expect(outputMock).toHaveBeenCalledWith('runId', expect.any(String));
		expect(outputMock).toHaveBeenCalledWith('logMessage', 'Test message');
		expect(failedMock).toHaveBeenCalledTimes(0);
	});

	test('Should fail to update run - run already completed', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'PATCH_RUN',
				runId: completedRunId,
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
				operation: 'PATCH_RUN',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith('PATCH_RUN Operation - runId is missing from input');
	});

	test('Should fail parse input - invalid status value', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'PATCH_RUN',
				runId: 'r_OsJdfkZvZQxGI8Dr',
				status: 'INVALID',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith('PATCH_RUN Operation - status must be one of SUCCESS or FAILURE');
	});
});
