import * as core from '@actions/core';
import axios from 'axios';

import { Run, RunToCreate } from '../../types';

const createRun = async (baseUrl: string, accessToken: string, run: RunToCreate): Promise<Run> => {
	const url = `${baseUrl}/v1/actions/${run.action}/runs`;
	const body = {
		properties: run.properties,
		...(run.identifier ? { entity: run.identifier } : null),
	};
	try {
		core.info(`Performing CREATE request to URL: ${url}, with body: ${JSON.stringify(body)}`);

		const config = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};

		const response = await axios.post(url, body, config);
		return response.data.run;
	} catch (e: any) {
		const statusCode = e?.response?.status || e?.code;
		const error = e?.response?.data?.message || e.message;
		const log = statusCode >= 400 && statusCode < 500 ? core.warning : core.error;
		if (log) {
			log(`Failed to create run with error "${error}" (${statusCode})`);
		}
		throw e;
	}
};

export default createRun;
