import * as core from '@actions/core';
import axios from 'axios';

import { Entity, SearchBody, EntityQueryParameters } from '../../types';

const searchEntities = async (baseUrl: string, accessToken: string, searchBody: SearchBody, queryParameters?: EntityQueryParameters): Promise<Entity[]> => {
	const url = `${baseUrl}/v1/entities/search`;
	try {
		core.info(`Performing POST request to URL: ${url}`);

		const config = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};

		const requestBody: Record<string, any> = {
			...searchBody,
			...queryParameters,
		};

		const response = await axios.post(url, requestBody, config);

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
