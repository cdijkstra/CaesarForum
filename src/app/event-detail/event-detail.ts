import {Component, computed, inject, input, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {EventsService, TimelineSession} from "../event-service/event-service";
import {Router} from "@angular/router";
import { UserService } from '../services/user.service';

interface TimeSlot {
  time: string;
  index: number;
}

interface RoomSelection {
  room: string;
  startSlot: TimeSlot | null;
  endSlot: TimeSlot | null;
}

type SessionType = 'Presentation' | 'Brainstorm' | 'Workshop' | 'Feedback';


@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-detail.html'
})
export class EventDetailComponent {
  private router = inject(Router);
  private eventsService = inject(EventsService);
  private userService = inject(UserService);

  // Get current user and automatically use their name as presenter
  currentUser = this.userService.currentUser;
  presenter = computed(() => this.currentUser().name);


  public routeEvents() {
    this.router.navigate(['/events']);
  }


  date = input.required<string>();

  // Get the event from the service based on the date
  event = computed(() => this.eventsService.getEventByDate(this.date()));

  // Get sessions for this event
  sessions = computed(() => this.eventsService.getSessionsByEventDate(this.date()));

  // Selection state
  selection = signal<RoomSelection | null>(null);
  isSelecting = signal(false);

  // Form state
  showForm = signal(false);
  eventName = signal('');
  eventAbstract = signal('');
  sessionType = signal<SessionType>('Presentation');
  // presenter is now computed from currentUser above

  // Read-only session view
  selectedSession = signal<TimelineSession | null>(null);
  showSessionDetails = signal(false);

  // Session type options - make it readonly and accessible
  readonly sessionTypes: SessionType[] = ['Presentation', 'Brainstorm', 'Workshop', 'Feedback'];


  // Generate time labels based on start and end times
  timeLabels = computed(() => {
    const evt = this.event();
    if (!evt) return [];

    const start = this.parseTime(evt.startHour);
    const end = this.parseTime(evt.endHour);
    const labels: string[] = [];

    let current = start;
    while (current <= end) {
      const hours = Math.floor(current / 60);
      const minutes = current % 60;
      labels.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      current += 30; // 30-minute intervals
    }

    return labels;
  });

  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  onSlotMouseDown(room: string, time: string, index: number) {
    // Check if there's already a session at this slot
    const existingSession = this.getSessionAtSlot(room, index);
    if (existingSession) {
      this.showSessionDetails.set(true);
      this.selectedSession.set(existingSession);
      return;
    }

    this.isSelecting.set(true);
    this.selection.set({
      room,
      startSlot: { time, index },
      endSlot: { time, index }
    });
  }

  onSlotMouseEnter(room: string, time: string, index: number) {
    if (!this.isSelecting()) return;

    const currentSelection = this.selection();
    if (currentSelection && currentSelection.room === room && currentSelection.startSlot) {
      this.selection.set({
        ...currentSelection,
        endSlot: { time, index }
      });
    }
  }

  onSlotMouseUp() {
    this.isSelecting.set(false);
    const selection = this.selection();
    if (selection && selection.startSlot && selection.endSlot) {
      // Normalize selection (ensure start is before end)
      const start = Math.min(selection.startSlot.index, selection.endSlot.index);
      const end = Math.max(selection.startSlot.index, selection.endSlot.index);

      this.selection.set({
        room: selection.room,
        startSlot: { time: this.timeLabels()[start], index: start },
        endSlot: { time: this.timeLabels()[end], index: end }
      });

      this.showForm.set(true);
    }
  }

  isSlotSelected(room: string, index: number): boolean {
    const selection = this.selection();
    if (!selection || selection.room !== room || !selection.startSlot || !selection.endSlot) {
      return false;
    }

    const start = Math.min(selection.startSlot.index, selection.endSlot.index);
    const end = Math.max(selection.startSlot.index, selection.endSlot.index);

    return index >= start && index <= end;
  }

  submitEvent() {
    const selection = this.selection();
    if (!selection || !selection.startSlot || !selection.endSlot) return;

    // Save session to service
    this.eventsService.addTimelineSession({
      eventDate: this.date(),
      room: selection.room,
      startTime: selection.startSlot.time,
      endTime: this.getNextTimeSlot(selection.endSlot.time),
      name: this.eventName(),
      abstract: this.eventAbstract(),
      sessionType: this.sessionType(),
      presenter: this.presenter() // Include presenter
    });

    // Reset form
    this.cancelSelection();
  }

  getSessionAtSlot(room: string, index: number): TimelineSession | undefined {
    const timeLabel = this.timeLabels()[index];
    return this.sessions().find(session =>
      session.room === room &&
      this.isTimeInSession(timeLabel, session)
    );
  }

  private isTimeInSession(time: string, session: TimelineSession): boolean {
    const timeMinutes = this.parseTime(time);
    const startMinutes = this.parseTime(session.startTime);
    const endMinutes = this.parseTime(session.endTime);
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  }

  closeSessionDetails() {
    this.showSessionDetails.set(false);
    this.selectedSession.set(null);
  }

  getSlotClass(room: string, index: number): string {
    const session = this.getSessionAtSlot(room, index);
    if (session) {
      // Slot has a session - use muted session colors
      switch(room) {
        case 'Room X':
          return 'bg-slate-500 hover:bg-slate-600 shadow-sm';
        case 'Room Y':
          return 'bg-slate-600 hover:bg-slate-700 shadow-sm';
        case 'Room Z':
          return 'bg-stone-500 hover:bg-stone-600 shadow-sm';
        case 'Room A':
          return 'bg-stone-600 hover:bg-stone-700 shadow-sm';
        case 'Room B':
          return 'bg-gray-600 hover:bg-gray-700 shadow-sm';
        default:
          return 'bg-gray-500 hover:bg-gray-600 shadow-sm';
      }
    } else if (this.isSlotSelected(room, index)) {
      // Slot is selected for new session - subtle selection colors
      switch(room) {
        case 'Room X':
          return 'bg-slate-200 border-2 border-slate-400 shadow-sm';
        case 'Room Y':
          return 'bg-slate-200 border-2 border-slate-500 shadow-sm';
        case 'Room Z':
          return 'bg-stone-200 border-2 border-stone-400 shadow-sm';
        case 'Room A':
          return 'bg-stone-200 border-2 border-stone-500 shadow-sm';
        case 'Room B':
          return 'bg-gray-200 border-2 border-gray-400 shadow-sm';
        default:
          return 'bg-gray-200 border-2 border-gray-400 shadow-sm';
      }
    } else {
      // Empty slot - very subtle hover effects
      switch(room) {
        case 'Room X':
          return 'bg-white hover:bg-slate-50';
        case 'Room Y':
          return 'bg-white hover:bg-slate-50';
        case 'Room Z':
          return 'bg-white hover:bg-stone-50';
        case 'Room A':
          return 'bg-white hover:bg-stone-50';
        case 'Room B':
          return 'bg-white hover:bg-gray-50';
        default:
          return 'bg-white hover:bg-gray-50';
      }
    }
  }

  cancelSelection() {
    this.selection.set(null);
    this.showForm.set(false);
    this.eventName.set('');
    this.eventAbstract.set('');
    this.sessionType.set('Presentation');
    // presenter is automatically computed from currentUser, no need to reset
  }

  getNextTimeSlot(time: string): string {
    const minutes = this.parseTime(time) + 30;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}