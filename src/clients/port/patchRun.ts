import * as core from '@actions/core';
import axios from 'axios';

import { Run, RunToUpdate } from '../../types';

const patchRun = async (baseUrl: string, accessToken: string, runId: string, run: RunToUpdate): Promise<Run> => {
	const url = `${baseUrl}/v1/actions/runs/${runId}`;
	try {
		core.info(`Performing PATCH request to URL: ${url}, with body: ${JSON.stringify(run)}`);

		const config = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			params: { runId },
		};

		const response = await axios.patch(url, run, config);

		return response.data.run;
	} catch (e: any) {
		const statusCode = e?.response?.status || e?.code;
		const error = e?.response?.data?.message || e.message;
		const log = statusCode >= 400 && statusCode < 500 ? core.warning : core.error;
		if (log) {
			log(`Failed to patch run with error "${error}" (${statusCode})`);
		}
		throw e;
	}
};

export default patchRun;
