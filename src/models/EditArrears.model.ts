import { IsNotEmpty, IsNumberString } from 'class-validator';
import { BaseModel } from './base.model';

export class EditArrearsModel extends BaseModel {
  @IsNotEmpty()
  @IsNumberString({}, { message: 'Please, enter a valid amount in numbers.' })
  amount: string;

  @IsNotEmpty({ message: 'Property Subscription Reference not defined.' })
  propertySubscriptionId: string;

  @IsNotEmpty()
  reason: string;
}
