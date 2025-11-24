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
				console.error(`Failed to create blueprint ${blueprintId}: ${errorMsg}`);
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
				console.error(`Failed to create action ${actionId}: ${errorMsg}`);
				throw new Error(`Failed to create action ${actionId}: ${errorMsg}`);
			}
		} else {
			const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
			throw new Error(`Failed to check action ${actionId}: ${errorMsg}`);
		}
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
		console.error(`Failed to create entity ${entity.identifier}: ${errorMsg}`);
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

export const cleanupPortEnvironment = async (baseUrl: string, clientId: string, clientSecret: string): Promise<void> => {
	try {
		const accessToken = await clients.port.getToken(baseUrl, clientId, clientSecret);

		const entitiesToDelete = [
			{ blueprint: 'gh-action-test-bp2', identifier: 'test_entity' },
			{ blueprint: 'gh-action-test-bp2', identifier: 'test' },
			{ blueprint: 'gh-action-test-bp2', identifier: 'delete_test_parent' },
			{ blueprint: 'gh-action-test-bp', identifier: 'delete_test_child' },
		];

		for (const entity of entitiesToDelete) {
			await silentDeleteEntity(baseUrl, accessToken, entity.blueprint, entity.identifier);
		}

		// Delete blueprints (this will also delete associated actions and remaining entities)
		const blueprints = ['gh-action-test-bp', 'gh-action-test-bp-entity', 'gh-action-test-bp2'];
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
		console.error('Error during cleanup:', error?.message || 'Unknown error');
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

	// Actions are skipped for now - CREATE_RUN and PATCH_RUN tests will need manual setup
};

