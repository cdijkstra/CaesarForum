// src/app/events/events.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { TimelineSession } from '../models/timelineSession.model';
import { Event } from '../models/event.model';
import { Room } from '../models/room.model';
import { PocketbaseService } from './pocketbase.service';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private pocketbaseService = inject(PocketbaseService);
  private eventsSignal = signal<Event[]>([]);
  private timelineSessionsSignal = signal<TimelineSession[]>([]);
  private roomsSignal = signal<Room[]>([]);
  private eventsLoadingSignal = signal<boolean>(true);
  private timelineSessionsLoadingSignal = signal<boolean>(true);
  private roomsLoadingSignal = signal<boolean>(true);

  // Read-only access to events, sessions, and rooms
  events = this.eventsSignal.asReadonly();
  timelineSessions = this.timelineSessionsSignal.asReadonly();
  rooms = this.roomsSignal.asReadonly();
  eventsLoading = this.eventsLoadingSignal.asReadonly();
  timelineSessionsLoading = this.timelineSessionsLoadingSignal.asReadonly();
  roomsLoading = this.roomsLoadingSignal.asReadonly();

  constructor() {
    this.loadEvents();
    this.loadTimelineSessions();
    this.loadRooms();
  }

  async loadEvents(): Promise<void> {
    try {
      this.eventsLoadingSignal.set(true);
      const events = await this.pocketbaseService.getAll<Event>('events');
      this.eventsSignal.set(events);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      this.eventsLoadingSignal.set(false);
    }
  }

  async loadTimelineSessions(): Promise<void> {
    try {
      this.timelineSessionsLoadingSignal.set(true);
      const sessions = await this.pocketbaseService.getAll<TimelineSession>('timeline_sessions');
      this.timelineSessionsSignal.set(sessions);
    } catch (error) {
      console.error('Error loading timeline sessions:', error);
    } finally {
      this.timelineSessionsLoadingSignal.set(false);
    }
  }

  async loadRooms(): Promise<void> {
    try {
      this.roomsLoadingSignal.set(true);
      const rooms = await this.pocketbaseService.getAll<Room>('rooms');
      this.roomsSignal.set(rooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      this.roomsLoadingSignal.set(false);
    }
  }

  async addEvent(event: Omit<Event, 'id' | 'created' | 'updated'>): Promise<Event> {
    try {
      const createdEvent = await this.pocketbaseService.create<Event>('events', event);
      this.eventsSignal.update((events) => [...events, createdEvent]);
      return createdEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await this.pocketbaseService.delete('events', id);
      this.eventsSignal.update((events) => events.filter((event) => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  async addTimelineSession(
    session: Omit<TimelineSession, 'id' | 'created' | 'updated'>
  ): Promise<TimelineSession> {
    try {
      const createdSession = await this.pocketbaseService.create<TimelineSession>(
        'timeline_sessions',
        session
      );
      this.timelineSessionsSignal.update((sessions) => [...sessions, createdSession]);
      return createdSession;
    } catch (error) {
      console.error('Error adding timeline session:', error);
      throw error;
    }
  }

  getSessionsByEventDate(eventDate: string): TimelineSession[] {
    return this.timelineSessionsSignal().filter((session) => session.eventDate === eventDate);
  }

  getSessionsByEventId(eventId: string): TimelineSession[] {
    return this.timelineSessionsSignal().filter((session) => session.event === eventId);
  }

  async getSessionById(id: string): Promise<TimelineSession | undefined> {
    try {
      const session = await this.pocketbaseService.getOne<TimelineSession>('timeline_sessions', id);
      return session;
    } catch (error) {
      console.error('Error getting session by id:', error);
      return undefined;
    }
  }

  getEventByDate(date: string): Event | undefined {
    return this.eventsSignal().find((event) => event.date === date);
  }
}
