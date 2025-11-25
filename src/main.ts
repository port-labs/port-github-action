import * as core from '@actions/core';

import inputs from './inputs';
import OperationFactory from './operations/OperationFactory/OperationFactory';

async function run(): Promise<void> {
	try {
		const input = inputs.getInput();

		const output = await new OperationFactory().createOperation(input).execute();
		Object.entries(output).forEach(([key, value]) => core.setOutput(key, value));
	} catch (error: any) {
		if (error?.message) core.warning(error.message);
	}
}

export default run;
