import axios from 'axios';

import deleteEntity from './deleteEntity';
import getToken from './getToken';
import upsertEntity from './upsertEntity';

const USER_AGENT = 'port-github-action/1.0.0';
// wrap axios http methods with github-action user agent
['get', 'post', 'delete', 'put'].forEach((method) => {
	axios[method] = async (url: string, data?: any, config?: any) => axios[method](url, data, { ...config, headers: { ...config?.headers, 'User-Agent': USER_AGENT } });
});

export default {
	getToken,
	upsertEntity,
	deleteEntity,
};
