import { ActionType } from '../enums/action-type.enum';

export class ClassChangeLogDto {
  id: string;
  packageId: string;
  operatorId: string;
  actionType: ActionType;
  lessonChange: string;
  reason: string | null;
  occurTime: Date;
  createdAt: Date;
  updatedAt: Date;
}
