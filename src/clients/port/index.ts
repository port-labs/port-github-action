import axios from 'axios';

import createRun from './createRun';
import deleteEntity from './deleteEntity';
import getEntity from './getEntity';
import getToken from './getToken';
import patchRun from './patchRun';
import searchEntities from './searchEntities';
import updateRunLogs from './updateRunLogs';
import upsertEntity from './upsertEntity';

const USER_AGENT = 'github-action/v1.0';
const axget = axios.get;
const axpost = axios.post;
const axput = axios.put;
const axdelete = axios.delete;

const getConfigWithAgent = (config: any) => ({ ...config, headers: { ...config?.headers, 'User-Agent': USER_AGENT } });

axios.get = async (url: string, config?: any) => axget(url, getConfigWithAgent(config));
axios.post = async (url: string, data?: any, config?: any) => axpost(url, data, getConfigWithAgent(config));
axios.put = async (url: string, data?: any, config?: any) => axput(url, data, getConfigWithAgent(config));
axios.delete = async (url: string, config?: any) => axdelete(url, getConfigWithAgent(config));

export default {
	getToken,
	upsertEntity,
	deleteEntity,
	searchEntities,
	getEntity,
	createRun,
	patchRun,
	updateRunLogs,
};
