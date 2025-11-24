// src/app/events/events.service.ts
import { Injectable, signal } from '@angular/core';

export interface Event {
  title: string;
  date: string;
  startHour: string;
  endHour: string;
}

export interface TimelineSession {
  id: string;
  eventDate: string;
  room: string;
  startTime: string;
  endTime: string;
  name: string;
  abstract: string;
  sessionType: string;
  presenter: string; // Added presenter field
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private eventsSignal = signal<Event[]>([]);
  private timelineSessionsSignal = signal<TimelineSession[]>([]);

  // Read-only access to events and sessions
  events = this.eventsSignal.asReadonly();
  timelineSessions = this.timelineSessionsSignal.asReadonly();

  addEvent(event: Event) {
    this.eventsSignal.update(events => [...events, event]);
  }

  deleteEvent(index: number) {
    this.eventsSignal.update(events => events.filter((_, i) => i !== index));
  }

  addTimelineSession(session: Omit<TimelineSession, 'id'>) {
    const sessionWithId: TimelineSession = {
      ...session,
      id: this.generateId()
    };
    this.timelineSessionsSignal.update(sessions => [...sessions, sessionWithId]);
  }

  getSessionsByEventDate(eventDate: string): TimelineSession[] {
    return this.timelineSessionsSignal().filter(session => session.eventDate === eventDate);
  }

  getSessionById(id: string): TimelineSession | undefined {
    return this.timelineSessionsSignal().find(session => session.id === id);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  getEventByDate(date: string): Event | undefined {
    console.log(date);
    return this.eventsSignal().find(event => event.date === date);
  }
}