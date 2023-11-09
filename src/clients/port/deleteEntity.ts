import * as core from '@actions/core';
import axios from 'axios';

const deleteEntity = async (
	baseUrl: string,
	accessToken: string,
	blueprint: string,
	identifier: string,
	options: Partial<{ runId: string; delete_dependents: boolean }> = {},
): Promise<void> => {
	const url = `${baseUrl}/v1/blueprints/${blueprint}/entities/${identifier}`;
	try {
		const config = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			params: {
				delete_dependents: options.delete_dependents,
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
