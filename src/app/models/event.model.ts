import { BaseModel } from 'pocketbase';

export interface Event extends BaseModel {
  title: string;
  date: string;
  startHour: string;
  endHour: string;
}
