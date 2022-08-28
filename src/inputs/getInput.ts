import * as core from '@actions/core';

import { ActionInput } from '../types';

const getInput = (): ActionInput => ({
	baseUrl: core.getInput('baseUrl', { required: true }),
	clientId: core.getInput('clientId', { required: true }),
	clientSecret: core.getInput('clientSecret', {
		required: true,
	}),
	identifier: core.getInput('identifier', { required: false }),
	title: core.getInput('title', { required: false }),
	blueprint: core.getInput('blueprint', { required: true }),
	properties: core.getMultilineInput('properties', {
		required: true,
	}),
	team: core.getInput('team', { required: false }),
	relations: core.getMultilineInput('relations', {
		required: false,
	}),
});

export default getInput;
