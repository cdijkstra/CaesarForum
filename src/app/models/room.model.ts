import { BaseModel } from 'pocketbase';

export interface Room extends BaseModel {
  name: string;
  capacity: number;
}
