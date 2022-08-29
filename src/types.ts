type EntityProperties = Record<string, any>;
type EntityRelations = Record<string, string>;

export type Entity = {
	identifier?: string;
	title?: string;
	blueprint: string;
	properties: EntityProperties;
	team?: string;
	relations?: EntityRelations;
};

export type ActionInput = {
	baseUrl: string;
	clientId: string;
	clientSecret: string;
	identifier?: string;
	title?: string;
	blueprint: string;
	properties: string[];
	team?: string;
	relations?: string[];
};
