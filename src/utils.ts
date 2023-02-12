const parseTeamInput = (testString: string) => {
	if (!testString.includes('[') && testString !== '') {
		return [`"${testString}"`];
	}
	return testString === '' ? ['[', ']'].join('') : JSON.stringify(JSON.parse(testString)).split('\n').join('');
};

export default parseTeamInput;
