import * as core from '@actions/core';
import axios from 'axios';

import { RunLog } from '../../types';

const updateRunLogs = async (
	baseUrl: string,
	accessToken: string,
	runId: string,
	message: { message: string },
): Promise<RunLog> => {
	const url = `${baseUrl}/v1/actions/runs/${runId}/logs`;
	try {
		core.info(`Performing POST request to URL: ${url}, with body: ${JSON.stringify(message)}`);

		const config = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};

		const response = await axios.post(url, message, config);

		return response.data.runLog;
	} catch (e: any) {
		const statusCode = e?.response?.status || e?.code;
		const error = e?.response?.data?.message || e.message;
		const log = statusCode >= 400 && statusCode < 500 ? core.warning : core.error;
		if (log) {
			log(`Failed to insert logs with error "${error}" (${statusCode})`);
		}
		throw e;
	}
};

export default updateRunLogs;
