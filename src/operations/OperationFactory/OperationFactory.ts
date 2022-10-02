import { IOperation } from '../../interfaces';
import { ActionInput, OperationType } from '../../types';
import EntitiesSearchOperation from '../EntitiesSearchOperation/EntitiesSearchOperation';
import EntityGetterOperation from '../EntityGetterOperation/EntityGetterOperation';
import EntityUpserterOperation from '../EntityUpserterOperation/EntityUpserterOperation';

export default class OperationFactory {
	createOperation(input: ActionInput): IOperation {
		switch (input.operation) {
			case OperationType.Get:
				return new EntityGetterOperation(input);
			case OperationType.Upsert:
				return new EntityUpserterOperation(input);
			case OperationType.Search:
				return new EntitiesSearchOperation(input);
			default:
				throw new Error('Operation not supported, must be one of GET, UPSERT');
		}
	}
}
