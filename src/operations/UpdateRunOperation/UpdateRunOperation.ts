import assert from 'assert';

import clients from '../../clients';
import { STATUS_OPTIONS } from '../../consts';
import { IOperation } from '../../interfaces';
import { ActionInput, RunToUpdate } from '../../types';

export default class UpdateActionOperation implements IOperation {
	constructor(private input: ActionInput) {
		this.input = input;
	}

	private parseInput = (): RunToUpdate => {
		if (!this.input.message && !this.input.status) {
			throw new Error('UPDATE_RUN Operation - message or status is required');
		}

		if (this.input.status && !STATUS_OPTIONS.includes(this.input.status)) {
			throw new Error('UPDATE_RUN Operation - status must be one of SUCCESS or FAILURE');
		}

		return {
			...(this.input.message && { message: this.input.message }),
			...(this.input.status && { status: this.input.status }),
			...(this.input.link && { link: this.input.link }),
			...(this.input.summary && { summary: this.input.summary }),
			...(this.input.externalRunId && { externalRunId: this.input.externalRunId }),
		};
	};

	execute = async (): Promise<Record<string, any>> => {
		assert(this.input.runId, 'UPDATE_RUN Operation - runId is missing from input');
		const updateRun = this.parseInput();
		const { message, ...runToUpdate } = updateRun;
		const accessToken = await clients.port.getToken(this.input.baseUrl, this.input.clientId, this.input.clientSecret);
		if (message) {
			await clients.port.updateRunLogs(this.input.baseUrl, accessToken, this.input.runId, { message });
		}
		if (Object.keys(runToUpdate).length !== 0) {
			await clients.port.updateRun(this.input.baseUrl, accessToken, this.input.runId, runToUpdate);
		}
		return {
			runId: this.input.runId,
		};
	};
}
