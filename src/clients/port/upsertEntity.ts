import * as core from '@actions/core';
import axios from 'axios';

import { Entity, EntityToUpsert } from '../../types';

const upsertEntity = async (
	baseUrl: string,
	accessToken: string,
	entity: EntityToUpsert,
): Promise<Entity> => {
	const url = `${baseUrl}/v1/blueprints/${encodeURIComponent(entity.blueprint)}/entities`;
	try {
		core.info(`Performing POST request to URL: ${url}, with body: ${JSON.stringify(entity)}`);

		const config = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			params: {
				upsert: true,
				merge: true,
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
