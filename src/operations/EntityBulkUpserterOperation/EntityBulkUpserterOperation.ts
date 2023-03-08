/* eslint-disable no-await-in-loop */

/* eslint-disable no-restricted-syntax */
import assert from 'assert';

import clients from '../../clients';
import { IOperation } from '../../interfaces';
import { ActionInput, EntitiesToUpsert } from '../../types';

export default class EntityBulkUpserter implements IOperation {
	constructor(private input: ActionInput) {
		this.input = input;
	}

	private parseInput = (): EntitiesToUpsert => {
		assert(this.input.entities, 'BULK_UPSERT Operation - entities is missing from input');

		return {
			...(this.input.entities && { entities: JSON.parse(this.input.entities) }),
		};
	};

	execute = async (): Promise<Record<string, any>> => {
		const entitiesToUpsert = this.parseInput();

		const entitiesRes = [];
		const accessToken = await clients.port.getToken(this.input.baseUrl, this.input.clientId, this.input.clientSecret);

		for (const entityToUpsert of entitiesToUpsert.entities!) {
			const entityRes = await clients.port.upsertEntity(this.input.baseUrl, accessToken, entityToUpsert, {
				runId: this.input.runId,
			});

			entitiesRes.push(entityRes);
		}

		return { identifiers: entitiesRes.map((entity) => entity.identifier) };
	};
}
