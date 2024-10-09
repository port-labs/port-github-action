type EntityProperties = Record<string, any>;
type EntityRelations = Record<string, string>;
type EntityScorecards = Record<string, any>;

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
	scorecards?: EntityScorecards;
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
	link?: string[];
	summary?: string;
	externalRunId?: string;
};

export type RunToCreate = {
	identifier?: string;
	action: string;
	properties?: EntityProperties;
};

export type ActionLogs = {};

export type EntitiesToUpsert = {
	entities: EntityToUpsert[];
};

export type EntityToGet = {
	identifier: string;
	blueprint: string;
};

export type EntityToDelete = EntityToGet;

export enum OperationType {
	Upsert = 'upsert',
	Get = 'get',
	Search = 'search',
	BulkUpsert = 'bulk_upsert',
	CreateRun = 'create_run',
	PatchRun = 'patch_run',
	Delete = 'delete',
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
	statusLabel?: string;
	link?: string;
	summary?: string;
	externalRunId?: string;
	action?: string;
	delete_dependents?: string;
};
