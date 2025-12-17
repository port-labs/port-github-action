import assert from 'assert';

import clients from '../../clients';
import { IOperation } from '../../interfaces';
import { ActionInput, Entity, EntityQueryParameters, EntityToGet } from '../../types';

export default class EntityGetterOperation implements IOperation {
	constructor(private input: ActionInput) {
		this.input = input;
	}

	private parseInput = (): EntityToGet => {
		assert(this.input.identifier, 'GET Operation - identifier is missing from input');
		assert(this.input.blueprint, 'GET Operation - blueprint is missing from input');
		return { blueprint: this.input.blueprint, identifier: this.input.identifier };
	};

	private parseQueryParameters = (): EntityQueryParameters => {
		const include = this.input.include?.split(',').map((s) => s.trim()).filter((s) => s.length > 0) || undefined;
		return {
			...(include && { include }),
		};
	};

	execute = async (): Promise<Record<string, any>> => {
		const entityToGet: EntityToGet = this.parseInput();
		const queryParameters = this.parseQueryParameters();
		const accessToken = await clients.port.getToken(this.input.baseUrl, this.input.clientId, this.input.clientSecret);

		const entity: Entity = await clients.port.getEntity(this.input.baseUrl, accessToken, entityToGet, queryParameters);

		return {
			entity: {
				identifier: entity.identifier,
				...(entity.title && { title: entity.title }),
				blueprint: entity.blueprint,
				properties: entity.properties,
				...(entity.team && { team: entity.team }),
				...(entity.relations && { relations: entity.relations }),
				...(entity.scorecards && { scorecards: entity.scorecards }),
			},
		};
	};
}
