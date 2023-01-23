import assert from 'assert';

import clients from '../../clients';
import { IOperation } from '../../interfaces';
import { ActionInput, EntityToUpsert } from '../../types';

export default class EntityUpserterOperation implements IOperation {
	constructor(private input: ActionInput) {
		this.input = input;
	}

	private parseInput = (): EntityToUpsert => {
		assert(this.input.blueprint, 'UPSERT Operation - blueprint is missing from input');

		return {
			...(this.input.identifier && { identifier: this.input.identifier }),
			...(this.input.title && { title: this.input.title }),
			...(this.input.icon && { icon: this.input.icon }),
			blueprint: this.input?.blueprint,
			properties: this.input.properties?.length ? JSON.parse(this.input.properties.join('')) : {},
			...(this.input.team && { team: this.input.team }),
			relations: this.input.relations?.length ? JSON.parse(this.input.relations.join('')) : {},
		};
	};

	execute = async (): Promise<Record<string, any>> => {
		const entityToUpsert = this.parseInput();
		const accessToken = await clients.port.getToken(this.input.baseUrl, this.input.clientId, this.input.clientSecret);
		const entityRes = await clients.port.upsertEntity(this.input.baseUrl, accessToken, entityToUpsert);

		return {
			identifier: entityRes.identifier,
		};
	};
}
