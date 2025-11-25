import assert from 'assert';

import clients from '../../clients';
import { STATUS_OPTIONS } from '../../consts';
import { IOperation } from '../../interfaces';
import { ActionInput, RunToUpdate } from '../../types';

export default class UpdateActionOperation implements IOperation {
	constructor(private input: ActionInput) {
		this.input = input;
	}

	private parseLinkInput = (testString: string) => {
		try {
			return JSON.parse(testString);
		} catch (e) {
			return testString;
		}
	};

	private parseInput = (): RunToUpdate => {
		if (this.input.status && !STATUS_OPTIONS.includes(this.input.status)) {
			throw new Error('PATCH_RUN Operation - status must be one of SUCCESS or FAILURE');
		}

		return {
			...(this.input.logMessage && { logMessage: this.input.logMessage }),
			...(this.input.status && { status: this.input.status }),
			...(this.input.statusLabel && { statusLabel: this.input.statusLabel }),
			...(this.input.link && { link: this.parseLinkInput(this.input.link) }),
			...(this.input.summary && { summary: this.input.summary }),
			...(this.input.externalRunId && { externalRunId: this.input.externalRunId }),
		};
	};

	execute = async (): Promise<Record<string, any>> => {
		assert(this.input.runId, 'PATCH_RUN Operation - runId is missing from input');
		const updateRunInput = this.parseInput();
		const { logMessage, ...runToUpdate } = updateRunInput;
		const accessToken = await clients.port.getToken(this.input.baseUrl, this.input.clientId, this.input.clientSecret);
		const run: { runId: string; logMessage?: string } = { runId: '' };

		let currentRunId = this.input.runId;

		if (Object.keys(runToUpdate).length !== 0) {
			const updateRun = await clients.port.patchRun(this.input.baseUrl, accessToken, this.input.runId, runToUpdate);
			run.runId = updateRun.id;
			currentRunId = updateRun.id;
		}
		if (logMessage) {
			const runLogs = await clients.port.updateRunLogs(this.input.baseUrl, accessToken, currentRunId, {
				message: logMessage,
			});
			run.logMessage = runLogs.message;
			if (!run.runId) {
				run.runId = runLogs.runId;
			}
		}

		if (!run.runId) {
			run.runId = this.input.runId;
		}

		return run;
	};
}
