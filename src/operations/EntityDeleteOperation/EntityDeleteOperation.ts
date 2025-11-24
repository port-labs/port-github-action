import assert from 'assert';

import clients from '../../clients';
import { IOperation } from '../../interfaces';
import { ActionInput, EntityToDelete } from '../../types';

export default class EntityGetterOperation implements IOperation {
	constructor(private input: ActionInput) {
		this.input = input;
	}

	private parseInput = (): EntityToDelete => {
		assert(this.input.identifier, 'DELETE Operation - identifier is missing from input');
		assert(this.input.blueprint, 'DELETE Operation - blueprint is missing from input');
		assert(
			!this.input.delete_dependents || this.input.delete_dependents === 'true' || this.input.delete_dependents === 'false',
			'Invalid value for delete_dependents. It must be "true" or "false".',
		);
		return { blueprint: this.input.blueprint, identifier: this.input.identifier };
	};

	execute = async (): Promise<Record<string, any>> => {
		const entityToDelete: EntityToDelete = this.parseInput();
		const accessToken = await clients.port.getToken(this.input.baseUrl, this.input.clientId, this.input.clientSecret);

		await clients.port.deleteEntity(this.input.baseUrl, accessToken, entityToDelete.blueprint, entityToDelete.identifier, {
			runId: this.input.runId,
			delete_dependents: this.input.delete_dependents === 'true',
		});

		return { ok: true };
	};
}
