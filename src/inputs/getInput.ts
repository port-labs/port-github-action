import * as core from '@actions/core';

import { ActionInput, OperationType } from '../types';

const getInput = (): ActionInput => ({
	baseUrl: core.getInput('baseUrl', { required: true }),
	clientId: core.getInput('clientId', { required: true }),
	clientSecret: core.getInput('clientSecret', {
		required: true,
	}),
	operation: core.getInput('operation', { required: true }).toLowerCase() as OperationType,
	identifier: core.getInput('identifier', { required: false }),
	title: core.getInput('title', { required: false }),
	icon: core.getInput('icon', { required: false }),
	blueprint: core.getInput('blueprint', { required: false }),
	properties: core.getMultilineInput('properties', {
		required: false,
	}),
	query: core.getMultilineInput('query', {
		required: false,
	}),
	include: core.getInput('include', { required: false }),
	team: core.getInput('team', { required: false }),
	relations: core.getMultilineInput('relations', {
		required: false,
	}),
	runId: core.getInput('runId', { required: false }),
	logMessage: core.getInput('logMessage', { required: false }),
	status: core.getInput('status', { required: false }) as 'SUCCESS' | 'FAILURE',
	link: core.getInput('link', { required: false }),
	summary: core.getInput('summary', { required: false }),
	externalRunId: core.getInput('externalRunId', { required: false }),
	entities: core.getInput('entities', { required: false }),
	action: core.getInput('action', { required: false }),
	delete_dependents: core.getInput('delete_dependents', { required: false }),
	createMissingRelatedEntities: core.getInput('createMissingRelatedEntities', { required: false }),
});

export default getInput;
