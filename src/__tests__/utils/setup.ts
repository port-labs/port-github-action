import axios from 'axios';

import clients from '../../clients';
import { tryDeleteAction, tryDeleteBlueprint, tryDeleteEntity } from './cleanup';

export const ensureBlueprint = async (
	baseUrl: string,
	accessToken: string,
	blueprintId: string,
	blueprintSchema: any,
): Promise<() => Promise<void>> => {
	try {
		await axios.get(`${baseUrl}/v1/blueprints/${blueprintId}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		console.warn(`Blueprint ${blueprintId} already exists`);
	} catch (error: any) {
		if (error?.response?.status === 404) {
			try {
				await axios.post(`${baseUrl}/v1/blueprints`, blueprintSchema, {
					headers: { Authorization: `Bearer ${accessToken}` },
				});
			} catch (createError: any) {
				const errorMsg = createError?.response?.data?.message || createError?.message || 'Unknown error';
				console.error(`Failed to create blueprint ${blueprintId}: ${errorMsg}`);
				throw new Error(`Failed to create blueprint ${blueprintId}: ${errorMsg}`);
			}
		} else {
			const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
			throw new Error(`Failed to check blueprint ${blueprintId}: ${errorMsg}`);
		}
	}

	return () => tryDeleteBlueprint(baseUrl, accessToken, blueprintId);
};

export const ensureAction = async (
	baseUrl: string,
	accessToken: string,
	actionId: string,
	actionSchema: any,
): Promise<() => Promise<void>> => {
	try {
		// Check if action exists using the new endpoint
		await axios.get(`${baseUrl}/v1/actions/${actionId}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		console.warn(`Action ${actionId} already exists`);
	} catch (error: any) {
		if (error?.response?.status === 404) {
			// Action doesn't exist, create it
			try {
				await axios.post(`${baseUrl}/v1/actions`, actionSchema, {
					headers: { Authorization: `Bearer ${accessToken}` },
				});
			} catch (createError: any) {
				const errorMsg = createError?.response?.data?.message || createError?.message || 'Unknown error';
				console.error(`Failed to create action ${actionId}: ${errorMsg}`);
				throw new Error(`Failed to create action ${actionId}: ${errorMsg}`);
			}
		} else {
			const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
			throw new Error(`Failed to check action ${actionId}: ${errorMsg}`);
		}
	}

	return () => tryDeleteAction(baseUrl, accessToken, actionId);
};

export const ensureTeam = async (
	baseUrl: string,
	accessToken: string,
	teamIdentifier: string,
): Promise<() => Promise<void>> => {
	try {
		await clients.port.upsertEntity(baseUrl, accessToken, {
			identifier: teamIdentifier,
			title: teamIdentifier,
			blueprint: '_team',
			properties: {},
			relations: {},
		});
	} catch (error: any) {
		const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
		console.error(`Failed to create team ${teamIdentifier}: ${errorMsg}`);
		throw new Error(`Failed to create team ${teamIdentifier}: ${errorMsg}`);
	}

	return () => tryDeleteEntity(baseUrl, accessToken, '_team', teamIdentifier);
};

export const ensureTestEntity = async (
	baseUrl: string,
	accessToken: string,
	blueprintId: string,
	entity: any,
): Promise<() => Promise<void>> => {
	try {
		await clients.port.upsertEntity(baseUrl, accessToken, {
			...entity,
			blueprint: blueprintId,
		});
	} catch (error: any) {
		const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
		console.error(`Failed to create entity ${entity.identifier}: ${errorMsg}`);
		throw new Error(`Failed to create entity ${entity.identifier}: ${errorMsg}`);
	}

	return () => tryDeleteEntity(baseUrl, accessToken, blueprintId, entity.identifier);
};

export const setupPortEnvironment = async (
	baseUrl: string,
	clientId: string,
	clientSecret: string,
): Promise<() => Promise<void>> => {
	const cleanupTasks: Array<() => Promise<void>> = [];

	const accessToken = await clients.port.getToken(baseUrl, clientId, clientSecret);

	cleanupTasks.push(
		await ensureBlueprint(baseUrl, accessToken, 'gh-action-test-bp2', {
			identifier: 'gh-action-test-bp2',
			title: 'GH Action Test BP 2',
			icon: 'Microservice',
			schema: {
				properties: {
					str: { type: 'string' },
				},
				required: [],
			},
			teamInheritance: {
				path: 'team',
			},
			ownership: {
				type: 'Direct',
				title: 'team',
			},
		}),
	);

	cleanupTasks.push(
		await ensureBlueprint(baseUrl, accessToken, 'gh-action-test-bp', {
			identifier: 'gh-action-test-bp',
			title: 'GH Action Test BP',
			icon: 'Microservice',
			schema: {
				properties: {
					text: { type: 'string' },
					number: { type: 'number' },
					boolean: { type: 'boolean' },
					array: { type: 'array' },
					object: { type: 'object' },
				},
				required: [],
			},
			relations: {
				'gha-relation': {
					title: 'GHA Relation',
					target: 'gh-action-test-bp2',
					many: false,
					required: false,
				},
			},
			teamInheritance: {
				path: 'team',
			},
			ownership: {
				type: 'Direct',
				title: 'team',
			},
		}),
	);

	cleanupTasks.push(
		await ensureBlueprint(baseUrl, accessToken, 'gh-action-test-bp-entity', {
			identifier: 'gh-action-test-bp-entity',
			title: 'GH Action Test BP Entity',
			icon: 'Microservice',
			schema: {
				properties: {
					text: { type: 'string' },
					number: { type: 'number' },
					boolean: { type: 'boolean' },
				},
				required: [],
			},
			teamInheritance: {
				path: 'team',
			},
			ownership: {
				type: 'Direct',
				title: 'team',
			},
		}),
	);

	// Ensure team entity exists before creating entities that reference it
	try {
		cleanupTasks.push(await ensureTeam(baseUrl, accessToken, 'Test'));
	} catch (error: any) {
		console.warn(`Could not create team Test: ${error.message}`);
	}

	try {
		cleanupTasks.push(await ensureTeam(baseUrl, accessToken, 'test'));
	} catch (error: any) {
		console.warn(`Could not create team test: ${error.message}`);
	}

	// Seed entities for tests
	try {
		cleanupTasks.push(
			await ensureTestEntity(baseUrl, accessToken, 'gh-action-test-bp2', {
				identifier: 'test_entity',
				title: 'GH Action 2 Test Identity',
				team: ['Test'],
				properties: { str: 'foo' },
				relations: {},
			}),
		);
	} catch (error: any) {
		console.warn(`Could not seed test_entity: ${error.message}`);
	}

	try {
		cleanupTasks.push(
			await ensureTestEntity(baseUrl, accessToken, 'gh-action-test-bp2', {
				identifier: 'test',
				title: 'GH Action Test Relation Target',
				team: ['Test'],
				properties: { str: 'relation-target' },
				relations: {},
			}),
		);
	} catch (error: any) {
		console.warn(`Could not seed test: ${error.message}`);
	}

	try {
		cleanupTasks.push(
			await ensureTestEntity(baseUrl, accessToken, 'gh-action-test-bp-entity', {
				identifier: 'gh-action-test-bp-entity',
				title: 'GH Action Test Entity',
				team: ['Test'],
				properties: { text: 'test', number: 1, boolean: true },
				relations: {},
			}),
		);
	} catch (error: any) {
		console.warn(`Could not seed gh-action-test-bp-entity: ${error.message}`);
	}

	// Setup actions for CREATE_RUN and PATCH_RUN tests
	cleanupTasks.push(
		await ensureAction(baseUrl, accessToken, 'gh-action-test', {
			identifier: 'gh-action-test',
			title: 'GH Action Test',
			icon: 'DefaultBlueprint',
			trigger: {
				operation: 'DELETE',
				type: 'self-service',
				userInputs: {
					properties: {},
				},
			},
			invocationMethod: {
				type: 'WEBHOOK',
				url: 'https://example.com',
			},
		}),
	);

	cleanupTasks.push(
		await ensureAction(baseUrl, accessToken, 'gh-action-test-entity', {
			identifier: 'gh-action-test-entity',
			title: 'GH Action Test Entity',
			icon: 'DefaultBlueprint',
			trigger: {
				operation: 'DELETE',
				blueprintIdentifier: 'gh-action-test-bp-entity',
				type: 'self-service',
				userInputs: {
					properties: {},
				},
			},
			invocationMethod: {
				type: 'WEBHOOK',
				url: 'https://example.com',
			},
		}),
	);

	return async () => {
		// eslint-disable-next-line no-restricted-syntax
		for (const cleanup of cleanupTasks.reverse()) {
			// eslint-disable-next-line no-await-in-loop
			await cleanup();
		}
	};
};
