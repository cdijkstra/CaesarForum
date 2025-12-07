import { BaseModel } from 'pocketbase';

export interface TimelineSession extends BaseModel {
  id: string;
  eventDate: string;
  room: string;
  startTime: string;
  endTime: string;
  name: string;
  abstract: string;
  sessionType: string;
  presenter: string;
}
