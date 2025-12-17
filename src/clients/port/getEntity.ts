import * as core from '@actions/core';
import axios from 'axios';

import { Entity, EntityToGet, EntityQueryParameters } from '../../types';

const toSearchParams = (params?: EntityQueryParameters): URLSearchParams => {
	const searchParams = new URLSearchParams();
	Object.entries(params || {}).forEach(([key, value]) => {
		if (Array.isArray(value)) {
			value.forEach((v) => searchParams.append(key, v));
			return;
		}
		if (value !== undefined) {
			searchParams.append(key, value);
		}
	});
	return searchParams;
}

const getEntity = async (baseUrl: string, accessToken: string, entity: EntityToGet, queryParameters?: EntityQueryParameters): Promise<Entity> => {
	const url = new URL(`${baseUrl}/v1/blueprints/${entity.blueprint}/entities/${encodeURIComponent(entity.identifier)}`);
	url.search = toSearchParams(queryParameters).toString();
	
	try {
		core.info(`Performing GET request to URL: ${url.toString()}`);

		const config = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};

		const response = await axios.get(url.toString(), config);

		return response.data.entity;
	} catch (e: any) {
		const statusCode = e?.response?.status || e?.code;
		const error = e?.response?.data?.message || e.message;
		const log = statusCode >= 400 && statusCode < 500 ? core.warning : core.error;
		if (log) {
			log(`Failed to get entity with error "${error}" (${statusCode})`);
		}
		throw e;
	}
};

export default getEntity;
