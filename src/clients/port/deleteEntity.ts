import * as core from '@actions/core';
import axios from 'axios';

const deleteEntity = async (
	baseUrl: string,
	accessToken: string,
	blueprint: string,
	identifier: string,
	options: Partial<{ runId: string }> = {},
): Promise<void> => {
	const url = `${baseUrl}/v1/blueprints/${blueprint}/entities/${identifier}`;
	try {
		core.info(`Performing DELETE request to URL: ${url}`);

		const config = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			params: {
				...(options.runId && { run_id: options.runId }),
			},
		};

		await axios.delete(url, config);
	} catch (e: any) {
		const statusCode = e?.response?.status || e?.code;
		const error = e?.response?.data?.message || e.message;
		const log = statusCode >= 400 && statusCode < 500 ? core.warning : core.error;
		if (log) {
			log(`Failed to delete entity with error "${error}" (${statusCode})`);
		}
		throw e;
	}
};

export default deleteEntity;
