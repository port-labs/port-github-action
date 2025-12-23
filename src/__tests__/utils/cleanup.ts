import axios from 'axios';

import clients from '../../clients';
import { Run } from '../../types';

const tryDelete = async (deleteOperation: () => Promise<void>, resourceName: string): Promise<void> => {
	try {
		await deleteOperation();
	} catch (error: any) {
		if (error?.response?.status !== 404 && error?.response?.status !== 422) {
			console.warn(`Could not delete ${resourceName}: ${error?.response?.data?.message || error?.message}`);
		}
	}
};

export const tryDeleteEntity = async (
	baseUrl: string,
	accessToken: string,
	blueprint: string,
	identifier: string,
): Promise<void> => {
	await tryDelete(
		() =>
			axios.delete(`${baseUrl}/v1/blueprints/${blueprint}/entities/${encodeURIComponent(identifier)}`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			}),
		identifier,
	);
};

const trySearchBlueprintEntities = async (baseUrl: string, accessToken: string, blueprintId: string): Promise<any[]> => {
	try {
		const entities = await clients.port.searchEntities(baseUrl, accessToken, {
			rules: [
				{
					operator: '=',
					value: blueprintId,
					property: '$blueprint',
				},
			],
			combinator: 'and',
		});
		return entities && Array.isArray(entities) ? entities : [];
	} catch (error: any) {
		console.warn(
			`Could not search entities for blueprint ${blueprintId}: ${error?.response?.data?.message || error?.message}`,
		);
		return [];
	}
};

const tryDeleteAllBlueprintEntities = async (baseUrl: string, accessToken: string, blueprintId: string): Promise<void> => {
	const entities = await trySearchBlueprintEntities(baseUrl, accessToken, blueprintId);
	await Promise.all(
		entities
			.filter((entity) => entity.identifier)
			.map((entity) => tryDeleteEntity(baseUrl, accessToken, blueprintId, entity.identifier)),
	);
};

export const tryDeleteBlueprint = async (baseUrl: string, accessToken: string, blueprintId: string): Promise<void> => {
	await tryDeleteAllBlueprintEntities(baseUrl, accessToken, blueprintId);
	await tryDelete(
		() =>
			axios.delete(`${baseUrl}/v1/blueprints/${blueprintId}`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			}),
		`blueprint ${blueprintId}`,
	);
};

const tryDeleteRun = async (baseUrl: string, accessToken: string, runId: string): Promise<void> => {
	await tryDelete(
		() =>
			axios.delete(`${baseUrl}/v1/actions/runs/${runId}`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			}),
		`run ${runId}`,
	);
};

const tryGetActionRuns = async (baseUrl: string, accessToken: string, actionId: string): Promise<Run[]> => {
	try {
		const response = await axios.get(`${baseUrl}/v1/actions/${actionId}/runs`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return response.data?.runs && Array.isArray(response.data.runs) ? response.data?.runs : [];
	} catch (error: any) {
		console.warn(`Could not get runs for action ${actionId}: ${error?.response?.data?.message || error?.message}`);
		return [];
	}
};

const tryDeleteActionRuns = async (baseUrl: string, accessToken: string, actionId: string): Promise<void> => {
	const runs = await tryGetActionRuns(baseUrl, accessToken, actionId);
	await Promise.all(runs.filter((r: Run) => r.id).map((r: Run) => tryDeleteRun(baseUrl, accessToken, r.id)));
};

export const tryDeleteAction = async (baseUrl: string, accessToken: string, actionId: string): Promise<void> => {
	await tryDeleteActionRuns(baseUrl, accessToken, actionId);
	await tryDelete(
		() =>
			axios.delete(`${baseUrl}/v1/actions/${actionId}`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			}),
		`action ${actionId}`,
	);
};
