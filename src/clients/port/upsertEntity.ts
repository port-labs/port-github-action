import * as core from '@actions/core';
import axios from 'axios';

import { Entity } from '../../types';

const upsertEntity = async (baseUrl: string, accessToken: string, entity: Entity): Promise<Entity> => {
	const url = `${baseUrl}/v1/blueprints/${entity.blueprint}/entities?upsert=true`;
	try {
		core.info(`Performing post request to "${url}"`);

		const config = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};

		const response = await axios.post(url, entity, config);

		return response.data.entity;
	} catch (e: any) {
		const statusCode = e?.response?.status || e?.code;
		const error = e?.response?.data?.message || e.message;
		const log = statusCode >= 400 && statusCode < 500 ? core.warning : core.error;
		if (log) {
			log(`Failed to upsert entity with error "${error}" (${statusCode})`);
		}
		throw e;
	}
};

export default upsertEntity;
