// src/app/events/events.service.ts
import { Injectable, signal } from '@angular/core';

export interface Event {
  title: string;
  date: string;
  startHour: string;
  endHour: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private eventsSignal = signal<Event[]>([]);

  // Read-only access to events
  events = this.eventsSignal.asReadonly();

  addEvent(event: Event) {
    this.eventsSignal.update(events => [...events, event]);
  }

  getEventByDate(date: string): Event | undefined {
    console.log(date);
    return this.eventsSignal().find(event => event.date === date);
  }
}