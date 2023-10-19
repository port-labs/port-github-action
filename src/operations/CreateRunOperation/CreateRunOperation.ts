import * as core from '@actions/core';
import assert from 'assert';

import clients from '../../clients';
import { IOperation } from '../../interfaces';
import { ActionInput, RunToCreate } from '../../types';

export default class CreateActionOperation implements IOperation {
	constructor(private input: ActionInput) {
		this.input = input;
	}

	private parseInput = (): RunToCreate => {
		assert(this.input.blueprint, 'CREATE_RUN Operation - blueprint is missing from input');
		assert(this.input.action, 'CREATE_RUN Operation - action is missing from input');

		return {
			...(this.input.identifier && { identifier: this.input.identifier }),
			blueprint: this.input?.blueprint,
			action: this.input?.action,
			properties: this.input.properties?.length ? JSON.parse(this.input.properties.join('')) : {},
		};
	};

	execute = async (): Promise<Record<string, any>> => {
		const createRunInput = this.parseInput();

		const accessToken = await clients.port.getToken(this.input.baseUrl, this.input.clientId, this.input.clientSecret);

		const runRes = await clients.port.createRun(this.input.baseUrl, accessToken, createRunInput);

		return {
			runId: runRes.id,
		};
	};
}
