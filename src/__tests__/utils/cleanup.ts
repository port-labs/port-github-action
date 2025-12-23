import axios from 'axios';

import clients from '../../clients';

const tryDelete = async (deleteOperation: () => Promise<void>, resourceName: string): Promise<void> => {
	try {
		await deleteOperation();
	} catch (error: any) {
		console.warn(`Could not delete ${resourceName}: ${error?.response?.data?.message || error?.message}`);
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
		`entity ${identifier} of blueprint ${blueprint}`,
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

export const tryDeleteAction = async (baseUrl: string, accessToken: string, actionId: string): Promise<void> => {
	await tryDelete(
		() =>
			axios.delete(`${baseUrl}/v1/actions/${actionId}`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			}),
		`action ${actionId}`,
	);
};
