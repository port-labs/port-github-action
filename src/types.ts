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
	team?: string;
	relations?: EntityRelations;
};

export type EntityToUpsert = {
	identifier?: string;
	title?: string;
	blueprint: string;
	properties: EntityProperties;
	team?: string;
	relations?: EntityRelations;
};

export type EntityToGet = {
	identifier: string;
	blueprint: string;
};

export enum OperationType {
	Upsert = 'upsert',
	Get = 'get',
	Search = 'search',
}

export type ActionInput = {
	baseUrl: string;
	clientId: string;
	clientSecret: string;
	operation: OperationType;
	query?: string[];
	identifier?: string;
	title?: string;
	blueprint?: string;
	properties?: string[];
	team?: string;
	relations?: string[];
};
