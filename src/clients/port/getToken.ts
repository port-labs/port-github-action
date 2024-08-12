import * as core from '@actions/core';
import axios from 'axios';

const getToken = async (baseUrl: string, clientId: string, clientSecret: string): Promise<string> => {
	try {
		core.info(`Trying to obtain Port access token`);
		const { data } = await axios.post(`${baseUrl}/v1/auth/access_token`, { clientId, clientSecret });

		return data.accessToken;
	} catch (e: any) {
		const message = e?.response?.data?.error || e.message;
		core.error(`Failed to obtain Port access token with error "${message}"`);
		throw e;
	}
};

export default getToken;
