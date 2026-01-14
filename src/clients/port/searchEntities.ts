import * as core from '@actions/core';
import axios from 'axios';

import { Entity, EntityQueryParameters, SearchBody } from '../../types';

const toSearchParams = (params?: EntityQueryParameters): URLSearchParams => {
	const searchParams = new URLSearchParams();
	if (!params) return searchParams;

	Object.entries(params).forEach(([key, value]) => {
		if (Array.isArray(value)) {
			value.forEach((v) => searchParams.append(key, v));
		} else if (value !== undefined) {
			searchParams.append(key, value);
		}
	});
	return searchParams;
};

const searchEntities = async (
	baseUrl: string,
	accessToken: string,
	searchBody: SearchBody,
	queryParameters?: EntityQueryParameters,
): Promise<Entity[]> => {
	const url = new URL(`${baseUrl}/v1/entities/search`);
	url.search = toSearchParams(queryParameters).toString();

	try {
		core.info(`Performing POST request to URL: ${url.toString()}`);

		const config = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};

		const response = await axios.post(url.toString(), searchBody, config);

		return response.data.entities;
	} catch (e: any) {
		const statusCode = e?.response?.status || e?.code;
		const error = e?.response?.data?.message || e.message;
		const log = statusCode >= 400 && statusCode < 500 ? core.warning : core.error;
		if (log) {
			log(`Failed to search entities with error "${error}" (${statusCode})`);
		}
		throw e;
	}
};

export default searchEntities;
