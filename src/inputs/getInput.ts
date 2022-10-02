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
	blueprint: core.getInput('blueprint', { required: false }),
	properties: core.getMultilineInput('properties', {
		required: false,
	}),
	query: core.getMultilineInput('query', {
		required: false,
	}),
	team: core.getInput('team', { required: false }),
	relations: core.getMultilineInput('relations', {
		required: false,
	}),
});

export default getInput;
