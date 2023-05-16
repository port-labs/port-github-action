import { OPERATION_IS_NOT_SUPPORTED } from '../../consts';
import { IOperation } from '../../interfaces';
import { ActionInput, OperationType } from '../../types';
import EntitiesSearchOperation from '../EntitiesSearchOperation/EntitiesSearchOperation';
import EntityBulkUpserterOperation from '../EntityBulkUpserterOperation/EntityBulkUpserterOperation';
import EntityGetterOperation from '../EntityGetterOperation/EntityGetterOperation';
import EntityUpserterOperation from '../EntityUpserterOperation/EntityUpserterOperation';
import UpdateRunOperation from '../UpdateRunOperation/UpdateRunOperation';

export default class OperationFactory {
	createOperation(input: ActionInput): IOperation {
		switch (input.operation) {
			case OperationType.Get:
				return new EntityGetterOperation(input);
			case OperationType.Upsert:
				return new EntityUpserterOperation(input);
			case OperationType.Search:
				return new EntitiesSearchOperation(input);
			case OperationType.BulkUpsert:
				return new EntityBulkUpserterOperation(input);
			case OperationType.UpdateRun:
				return new UpdateRunOperation(input);
			default:
				throw new Error(OPERATION_IS_NOT_SUPPORTED);
		}
	}
}
