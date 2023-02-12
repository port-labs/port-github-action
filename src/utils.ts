const parseTeamInput = (testString: string) => {
	try {
		return JSON.parse(testString);
	} catch (e) {
		return testString;
	}
};

export default parseTeamInput;
