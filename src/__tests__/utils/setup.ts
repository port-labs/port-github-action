import axios from 'axios';

import clients from '../../clients';

export const ensureBlueprint = async (
	baseUrl: string,
	accessToken: string,
	blueprintId: string,
	blueprintSchema: any,
): Promise<void> => {
	try {
		await axios.get(`${baseUrl}/v1/blueprints/${blueprintId}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		console.log(`Blueprint ${blueprintId} already exists`);
	} catch (error: any) {
		if (error?.response?.status === 404) {
			try {
				await axios.post(`${baseUrl}/v1/blueprints`, blueprintSchema, {
					headers: { Authorization: `Bearer ${accessToken}` },
				});
			} catch (createError: any) {
				const errorMsg = createError?.response?.data?.message || createError?.message || 'Unknown error';
				console.warn(`Failed to create blueprint ${blueprintId}: ${errorMsg}`);
				throw new Error(`Failed to create blueprint ${blueprintId}: ${errorMsg}`);
			}
		} else {
			const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
			throw new Error(`Failed to check blueprint ${blueprintId}: ${errorMsg}`);
		}
	}
};

export const ensureAction = async (
	baseUrl: string,
	accessToken: string,
	blueprintId: string,
	actionId: string,
	actionSchema: any,
): Promise<void> => {
	try {
		// Check if action exists using the new endpoint
		await axios.get(`${baseUrl}/v1/actions/${actionId}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		console.log(`Action ${actionId} already exists`);
	} catch (error: any) {
		if (error?.response?.status === 404) {
			// Action doesn't exist, create it
			try {
				await axios.post(`${baseUrl}/v1/actions`, actionSchema, {
					headers: { Authorization: `Bearer ${accessToken}` },
				});
			} catch (createError: any) {
				const errorMsg = createError?.response?.data?.message || createError?.message || 'Unknown error';
				console.warn(`Failed to create action ${actionId}: ${errorMsg}`);
				throw new Error(`Failed to create action ${actionId}: ${errorMsg}`);
			}
		} else {
			const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
			throw new Error(`Failed to check action ${actionId}: ${errorMsg}`);
		}
	}
};

export const ensureTeam = async (
	baseUrl: string,
	accessToken: string,
	teamIdentifier: string,
): Promise<void> => {
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
		console.warn(`Failed to create team ${teamIdentifier}: ${errorMsg}`);
		throw new Error(`Failed to create team ${teamIdentifier}: ${errorMsg}`);
	}
};

export const ensureTestEntity = async (
	baseUrl: string,
	accessToken: string,
	blueprintId: string,
	entity: any,
): Promise<void> => {
	try {
		await clients.port.upsertEntity(baseUrl, accessToken, {
			...entity,
			blueprint: blueprintId,
		});
	} catch (error: any) {
		const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
		console.warn(`Failed to create entity ${entity.identifier}: ${errorMsg}`);
		throw new Error(`Failed to create entity ${entity.identifier}: ${errorMsg}`);
	}
};

const silentDeleteEntity = async (
	baseUrl: string,
	accessToken: string,
	blueprint: string,
	identifier: string,
): Promise<void> => {
	try {
		await axios.delete(`${baseUrl}/v1/blueprints/${blueprint}/entities/${encodeURIComponent(identifier)}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
	} catch (error: any) {
		if (error?.response?.status !== 404) {
			console.log(`Could not delete ${identifier}: ${error?.response?.data?.message || error?.message}`);
		}
	}
};

const deleteAllEntitiesFromBlueprint = async (
	baseUrl: string,
	accessToken: string,
	blueprintId: string,
): Promise<void> => {
	try {
		// Search for all entities in this blueprint
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

		if (entities && Array.isArray(entities)) {
			for (const entity of entities) {
				if (entity.identifier) {
					await silentDeleteEntity(baseUrl, accessToken, blueprintId, entity.identifier);
				}
			}
		}
	} catch (error: any) {
		// If search fails, that's okay - blueprint might not exist or have no entities
		if (error?.response?.status !== 404) {
			console.log(`Could not search entities for blueprint ${blueprintId}: ${error?.response?.data?.message || error?.message}`);
		}
	}
};

const silentDeleteRun = async (
	baseUrl: string,
	accessToken: string,
	runId: string,
): Promise<void> => {
	try {
		await axios.delete(`${baseUrl}/v1/actions/runs/${runId}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
	} catch (error: any) {
		if (error?.response?.status !== 404 && error?.response?.status !== 422) {
			console.log(`Could not delete run ${runId}: ${error?.response?.data?.message || error?.message}`);
		}
	}
};

const silentDeleteAction = async (
	baseUrl: string,
	accessToken: string,
	actionId: string,
): Promise<void> => {
	try {
		await axios.delete(`${baseUrl}/v1/actions/${actionId}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
	} catch (error: any) {
		if (error?.response?.status !== 404) {
			console.log(`Could not delete action ${actionId}: ${error?.response?.data?.message || error?.message}`);
		}
	}
};

const cleanupActionRuns = async (
	baseUrl: string,
	accessToken: string,
	actionId: string,
): Promise<void> => {
	try {
		// Try to get runs for the action
		const response = await axios.get(`${baseUrl}/v1/actions/${actionId}/runs`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		
		if (response.data?.runs && Array.isArray(response.data.runs)) {
			for (const run of response.data.runs) {
				if (run.id) {
					await silentDeleteRun(baseUrl, accessToken, run.id);
				}
			}
		}
	} catch (error: any) {
		// If the endpoint doesn't exist or action doesn't exist, that's okay
		if (error?.response?.status !== 404) {
			console.log(`Could not list runs for action ${actionId}: ${error?.response?.data?.message || error?.message}`);
		}
	}
};

export const cleanupPortEnvironment = async (baseUrl: string, clientId: string, clientSecret: string): Promise<void> => {
	try {
		const accessToken = await clients.port.getToken(baseUrl, clientId, clientSecret);

		const entitiesToDelete = [
			{ blueprint: 'gh-action-test-bp2', identifier: 'test_entity' },
			{ blueprint: 'gh-action-test-bp2', identifier: 'test' },
			{ blueprint: 'gh-action-test-bp2', identifier: 'delete_test_parent' },
			{ blueprint: 'gh-action-test-bp', identifier: 'delete_test_child' },
			{ blueprint: 'gh-action-test-bp-entity', identifier: 'gh-action-test-bp-entity' },
			{ blueprint: '_team', identifier: 'Test' },
			{ blueprint: '_team', identifier: 'test' },
		];

		for (const entity of entitiesToDelete) {
			await silentDeleteEntity(baseUrl, accessToken, entity.blueprint, entity.identifier);
		}

		// Clean up runs for test actions before deleting actions
		const testActions = ['gh-action-test', 'gh-action-test-entity'];
		for (const actionId of testActions) {
			await cleanupActionRuns(baseUrl, accessToken, actionId);
		}

		// Delete test actions
		for (const actionId of testActions) {
			await silentDeleteAction(baseUrl, accessToken, actionId);
		}

		// Delete all entities from blueprints before deleting blueprints
		const blueprints = ['gh-action-test-bp', 'gh-action-test-bp-entity', 'gh-action-test-bp2'];
		for (const blueprintId of blueprints) {
			await deleteAllEntitiesFromBlueprint(baseUrl, accessToken, blueprintId);
		}

		// Delete blueprints (this will also delete associated actions)
		for (const blueprintId of blueprints) {
			try {
				await axios.delete(`${baseUrl}/v1/blueprints/${blueprintId}`, {
					headers: { Authorization: `Bearer ${accessToken}` },
				});
			} catch (error: any) {
				if (error?.response?.status !== 404) {
					console.log(`Could not delete blueprint ${blueprintId}: ${error?.response?.data?.message || error?.message}`);
				}
			}
		}
	} catch (error: any) {
		console.warn('Error during cleanup:', error?.message || 'Unknown error');
	}
};

export const setupPortEnvironment = async (baseUrl: string, clientId: string, clientSecret: string): Promise<void> => {
	const accessToken = await clients.port.getToken(baseUrl, clientId, clientSecret);

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
	});

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
	});

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
	});

	// Ensure team entity exists before creating entities that reference it
	try {
		await ensureTeam(baseUrl, accessToken, 'Test');
	} catch (error: any) {
		console.warn(`Could not create team Test: ${error.message}`);
	}

	try {
		await ensureTeam(baseUrl, accessToken, 'test');
	} catch (error: any) {
		console.warn(`Could not create team test: ${error.message}`);
	}

	// Seed entities for tests
	try {
		await ensureTestEntity(baseUrl, accessToken, 'gh-action-test-bp2', {
			identifier: 'test_entity',
			title: 'GH Action 2 Test Identity',
			team: ['Test'],
			properties: { str: 'foo' },
			relations: {},
		});
	} catch (error: any) {
		console.warn(`Could not seed test_entity: ${error.message}`);
	}

	try {
		await ensureTestEntity(baseUrl, accessToken, 'gh-action-test-bp2', {
			identifier: 'test',
			title: 'GH Action Test Relation Target',
			team: ['Test'],
			properties: { str: 'relation-target' },
			relations: {},
		});
	} catch (error: any) {
		console.warn(`Could not seed test: ${error.message}`);
	}

	try {
		await ensureTestEntity(baseUrl, accessToken, 'gh-action-test-bp-entity', {
			identifier: 'gh-action-test-bp-entity',
			title: 'GH Action Test Entity',
			team: ['Test'],
			properties: { text: 'test', number: 1, boolean: true },
			relations: {},
		});
	} catch (error: any) {
		console.warn(`Could not seed gh-action-test-bp-entity: ${error.message}`);
	}

	// Setup actions for CREATE_RUN and PATCH_RUN tests
	await ensureAction(baseUrl, accessToken, 'gh-action-test-bp', 'gh-action-test', {
		identifier: 'gh-action-test',
		title: 'GH Action Test',
		icon: 'DefaultBlueprint',
		trigger: {
			operation: 'DELETE',
			type: 'self-service',
			userInputs: {
				properties: {}
			}
		},
		invocationMethod: {
			type: 'WEBHOOK',
			url: 'https://example.com',
		}
	});

	await ensureAction(baseUrl, accessToken, 'gh-action-test-bp-entity', 'gh-action-test-entity', {
		identifier: 'gh-action-test-entity',
		title: 'GH Action Test Entity',
		icon: 'DefaultBlueprint',
		trigger: {
			operation: 'DELETE',
			blueprintIdentifier: 'gh-action-test-bp-entity',
			type: 'self-service',
			userInputs: {
				properties: {}
			}
		},
		invocationMethod: {
			type: 'WEBHOOK',
			url: 'https://example.com',
		}
	});
};

