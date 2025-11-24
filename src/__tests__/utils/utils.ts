export type TestInputs = Record<string, string>;

export const getBaseInput = (): TestInputs => ({
	baseUrl: process.env['PORT_BASE_URL'] ?? '',
	clientId: process.env['INPUT_CLIENTID'] ?? '',
	clientSecret: process.env['INPUT_CLIENTSECRET'] ?? '',
	properties: '{}',
	relations: '{}',
});

const getInputName = (name: string): string => `INPUT_${name.replace(/ /g, '_').toUpperCase()}`;

export const getInput = (name: string): string => process.env[getInputName(name)] ?? '';

const setInput = (name: string, value: string): void => {
	process.env[getInputName(name)] = value;
};

export const setInputs = (inputs: TestInputs): void => {
	Object.entries(inputs).forEach(([key, value]) => setInput(key, value));
};

export const clearInputs = (inputs: TestInputs): void => {
	const baseInputKeys = ['baseUrl', 'clientId', 'clientSecret'];
	
	Object.keys(inputs).forEach((input) => {
		if (!baseInputKeys.includes(input)) {
			delete process.env[getInputName(input)];
		}
	});
};
