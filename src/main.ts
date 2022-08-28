import * as core from '@actions/core';

import clients from './clients';
import inputs from './inputs';
import { Entity } from './types';

async function run(): Promise<void> {
	try {
		const input = inputs.getInput();
		const entity: Entity = inputs.parseInput(input);
		core.info(`Entity: ${JSON.stringify(entity)}`);

		const accessToken = await clients.port.getToken(input.baseUrl, input.clientId, input.clientSecret);
		const entityRes = await clients.port.upsertEntity(input.baseUrl, accessToken, entity);

		core.setOutput('identifier', entityRes.identifier);
	} catch (error) {
		if (error instanceof Error) core.setFailed(error.message);
	}
}

export default run;
