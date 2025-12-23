import assert from 'assert';

import clients from '../../clients';
import { IOperation } from '../../interfaces';
import { ActionInput, Entity, EntityQueryParameters, SearchBody } from '../../types';

export default class EntitiesSearchOperation implements IOperation {
	constructor(private input: ActionInput) {
		this.input = input;
	}

	private parseInput = (): SearchBody => {
		assert.notDeepEqual(this.input.query, [], 'SEARCH Operation - query is missing from input');

		const searchBodySchema = this.input.query?.length ? JSON.parse(this.input.query.join('')) : {};

		return searchBodySchema;
	};

	private parseQueryParameters = (): EntityQueryParameters => {
		const include =
			this.input.include
				?.split(',')
				.map((s) => s.trim())
				.filter((s) => s.length > 0) || undefined;
		return {
			...(include && { include }),
		};
	};

	execute = async (): Promise<Record<string, any>> => {
		const searchBody = this.parseInput();
		const queryParameters = this.parseQueryParameters();
		const accessToken = await clients.port.getToken(this.input.baseUrl, this.input.clientId, this.input.clientSecret);

		const entities: Entity[] = await clients.port.searchEntities(
			this.input.baseUrl,
			accessToken,
			searchBody,
			queryParameters,
		);

		return { entities };
	};
}
