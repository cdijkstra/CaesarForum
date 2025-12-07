import { BaseModel } from 'pocketbase';

export interface TimelineSession extends BaseModel {
  id: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  name: string;
  abstract: string;
  sessionType: string;
  presenter: string;
  event: string; // event id (foreign key to events collection)
  room: string; // room id (foreign key to rooms collection)
}
