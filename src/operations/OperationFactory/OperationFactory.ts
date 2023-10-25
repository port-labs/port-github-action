import { OPERATION_IS_NOT_SUPPORTED } from '../../consts';
import { IOperation } from '../../interfaces';
import { ActionInput, OperationType } from '../../types';
import CreateRunOperation from '../CreateRunOperation/CreateRunOperation';
import EntitiesSearchOperation from '../EntitiesSearchOperation/EntitiesSearchOperation';
import EntityBulkUpserterOperation from '../EntityBulkUpserterOperation/EntityBulkUpserterOperation';
import EntityDeleteOperation from '../EntityDeleteOperation/EntityDeleteOperation';
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
			case OperationType.CreateRun:
				return new CreateRunOperation(input);
			case OperationType.PatchRun:
				return new UpdateRunOperation(input);
			case OperationType.Delete:
				return new EntityDeleteOperation(input);
			default:
				throw new Error(OPERATION_IS_NOT_SUPPORTED);
		}
	}
}
