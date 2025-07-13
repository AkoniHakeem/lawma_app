import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { BaseModel } from './base.model';

export default class ServicedClientSigninModel extends BaseModel {
  @IsNotEmpty({ message: 'Property Code is required' })
  @IsString()
  propertyCode = '';

  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\d{10,15}$/, {
    message: 'Enter a valid phone number',
  })
  phoneNumber = '';

  reset() {
    this.propertyCode = '';
    this.phoneNumber = '';
    this.errors = [];
  }
}
