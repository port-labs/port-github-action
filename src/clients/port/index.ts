import axios from 'axios';

import deleteEntity from './deleteEntity';
import getToken from './getToken';
import upsertEntity from './upsertEntity';

const USER_AGENT = 'github-action/v1.0';
const axget = axios.get;
const axpost = axios.post;
const axput = axios.put;
const axdelete = axios.delete;

axios.get = async (url: string, config?: any) =>
	axget(url, { ...config, headers: { ...config?.headers, 'User-Agent': USER_AGENT } });
axios.post = async (url: string, data?: any, config?: any) =>
	axpost(url, data, { ...config, headers: { ...config?.headers, 'User-Agent': USER_AGENT } });
axios.put = async (url: string, data?: any, config?: any) =>
	axput(url, data, { ...config, headers: { ...config?.headers, 'User-Agent': USER_AGENT } });
axios.delete = async (url: string, config?: any) =>
	axdelete(url, { ...config, headers: { ...config?.headers, 'User-Agent': USER_AGENT } });

export default {
	getToken,
	upsertEntity,
	deleteEntity,
};
