import { ActionInput, Entity } from '../types';

const parseInput = (input: ActionInput): Entity => ({
	...(input.identifier && { identifier: input.identifier }),
	...(input.title && { title: input.title }),
	blueprint: input.blueprint,
	properties: input.properties.length ? JSON.parse(input.properties.join('')) : {},
	...(input.team && { team: input.team }),
	relations: input.relations?.length ? JSON.parse(input.relations.join('')) : {},
});

export default parseInput;
