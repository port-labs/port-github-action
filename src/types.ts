type EntityProperties = Record<string, any>;
type EntityRelations = Record<string, string>;

export type SearchBody = {
	rules: {
		blueprint?: string;
		property?: string;
		operator: string;
		value: any;
	}[];
	combinator: 'and' | 'or';
	not?: boolean;
};

export type Entity = {
	identifier: string;
	title?: string;
	blueprint: string;
	properties: EntityProperties;
	team?: string | string[];
	relations?: EntityRelations;
};

export type Run = {
	id: string;
	status: 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';
	source: string;
	link: string[];
	summary: string;
	requiredApproval: boolean;
	action: {
		identifier: string;
		title: string;
		icon: string;
	};
	blueprint: {
		identifier: string;
		title: string;
		icon: string;
	};
	properties: EntityProperties;
};

export type RunLog = {
	id: string;
	runId: string;
	message: string;
};

export type EntityToUpsert = Omit<Entity, 'identifier'> & {
	identifier?: string;
};

export type RunToUpdate = {
	status?: 'SUCCESS' | 'FAILURE';
	logMessage?: string;
	link?: string;
	summary?: string;
	externalRunId?: string;
};

export type ActionLogs = {};

export type EntitiesToUpsert = {
	entities: EntityToUpsert[];
};

export type EntityToGet = {
	identifier: string;
	blueprint: string;
};

export enum OperationType {
	Upsert = 'upsert',
	Get = 'get',
	Search = 'search',
	BulkUpsert = 'bulk_upsert',
	PatchRun = 'patch_run',
}

export type ActionInput = {
	baseUrl: string;
	clientId: string;
	clientSecret: string;
	operation: OperationType;
	query?: string[];
	identifier?: string;
	title?: string;
	icon?: string;
	blueprint?: string;
	properties?: string[];
	team?: string;
	relations?: string[];
	runId?: string;
	entities: string;
	logMessage?: string;
	status?: 'SUCCESS' | 'FAILURE';
	link?: string;
	summary?: string;
	externalRunId?: string;
};
