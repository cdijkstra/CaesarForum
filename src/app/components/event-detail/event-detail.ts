import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventsService } from '../../services/events.service';
import { TimelineSession } from '../../models/timelineSession.model';
import { Room } from '../../models/room.model';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

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
  templateUrl: './event-detail.html',
})
export class EventDetailComponent {
  private router = inject(Router);
  private eventsService = inject(EventsService);
  private userService = inject(UserService);

  // Get current user and automatically use their name as presenter
  currentUser = this.userService.currentUser;
  presenter = computed(() => this.currentUser()?.name || '');

  public routeEvents() {
    this.router.navigate(['/events']);
  }

  date = input.required<string>();

  // Get the event from the service based on the date
  event = computed(() => this.eventsService.getEventByDate(this.date()));

  // Get sessions for this event (filtered by event ID)
  sessions = computed(() => {
    const evt = this.event();
    if (!evt) return [];
    return this.eventsService.getSessionsByEventId(evt.id);
  });

  // Map each unique session ID to a unique color index
  sessionColorMap = computed(() => {
    const sessionsList = this.sessions();
    const colorMap = new Map<string, number>();
    sessionsList.forEach((session, index) => {
      if (!colorMap.has(session.id)) {
        colorMap.set(session.id, index);
      }
    });
    return colorMap;
  });

  timelineSessionsLoading = this.eventsService.timelineSessionsLoading;
  eventsLoading = this.eventsService.eventsLoading;

  // Get rooms from service
  rooms = this.eventsService.rooms;
  roomsLoading = this.eventsService.roomsLoading;

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
      endSlot: { time, index },
    });
  }

  onSlotMouseEnter(room: string, time: string, index: number) {
    if (!this.isSelecting()) return;

    const currentSelection = this.selection();
    if (currentSelection && currentSelection.room === room && currentSelection.startSlot) {
      this.selection.set({
        ...currentSelection,
        endSlot: { time, index },
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
        endSlot: { time: this.timeLabels()[end], index: end },
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
    const evt = this.event();
    if (!selection || !selection.startSlot || !selection.endSlot || !evt) return;

    // Save session to service
    this.eventsService
      .addTimelineSession({
        event: evt.id,
        room: selection.room,
        startTime: selection.startSlot.time,
        endTime: this.getNextTimeSlot(selection.endSlot.time),
        name: this.eventName(),
        abstract: this.eventAbstract(),
        sessionType: this.sessionType(),
        presenter: this.presenter(), // Include presenter
      })
      .catch((error) => {
        console.error('Error adding timeline session:', error);
        alert('Er is een fout opgetreden bij het toevoegen van de sessie.');
      });

    // Reset form
    this.cancelSelection();
  }

  getSessionAtSlot(room: string, index: number): TimelineSession | undefined {
    const timeLabel = this.timeLabels()[index];
    return this.sessions().find(
      (session: TimelineSession) =>
        session.room === room && this.isTimeInSession(timeLabel, session)
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

  getSlotClass(roomId: string, index: number): string {
    const roomIndex = this.rooms().findIndex((r) => r.id === roomId);
    const session = this.getSessionAtSlot(roomId, index);
    if (session) {
      // Slot has a session - use session colors based on session ID
      return this.getSessionSlotClass(session.id);
    } else if (this.isSlotSelected(roomId, index)) {
      // Slot is selected for new session
      return this.getSelectedSlotClass(roomIndex);
    } else {
      // Empty slot
      return this.getEmptySlotClass(roomIndex);
    }
  }

  getRoomLabelClass(index: number): string {
    const classes = [
      'bg-gradient-to-r from-blue-500 to-blue-600',
      'bg-gradient-to-r from-emerald-500 to-emerald-600',
      'bg-gradient-to-r from-purple-500 to-purple-600',
      'bg-gradient-to-r from-orange-500 to-orange-600',
      'bg-gradient-to-r from-pink-500 to-pink-600',
      'bg-gradient-to-r from-indigo-500 to-indigo-600',
    ];
    return classes[index % classes.length];
  }

  getRoomRowClass(index: number): string {
    const classes = [
      'bg-blue-50/30',
      'bg-emerald-50/30',
      'bg-purple-50/30',
      'bg-orange-50/30',
      'bg-pink-50/30',
      'bg-indigo-50/30',
    ];
    return classes[index % classes.length];
  }

  private getSessionColorIndex(sessionId: string): number {
    // Get the unique color index for this session from the computed map
    const colorMap = this.sessionColorMap();
    return colorMap.get(sessionId) ?? 0;
  }

  getSessionClass(sessionId: string): string {
    const colorIndex = this.getSessionColorIndex(sessionId);
    const classes = [
      'bg-blue-600 hover:bg-blue-700',
      'bg-emerald-600 hover:bg-emerald-700',
      'bg-purple-600 hover:bg-purple-700',
      'bg-orange-600 hover:bg-orange-700',
      'bg-pink-600 hover:bg-pink-700',
      'bg-indigo-600 hover:bg-indigo-700',
      'bg-red-600 hover:bg-red-700',
      'bg-cyan-600 hover:bg-cyan-700',
      'bg-teal-600 hover:bg-teal-700',
      'bg-lime-600 hover:bg-lime-700',
      'bg-yellow-600 hover:bg-yellow-700',
      'bg-amber-600 hover:bg-amber-700',
      'bg-violet-600 hover:bg-violet-700',
      'bg-fuchsia-600 hover:bg-fuchsia-700',
      'bg-rose-600 hover:bg-rose-700',
      'bg-sky-600 hover:bg-sky-700',
      'bg-green-600 hover:bg-green-700',
      'bg-blue-500 hover:bg-blue-600',
      'bg-emerald-500 hover:bg-emerald-600',
      'bg-purple-500 hover:bg-purple-600',
      'bg-orange-500 hover:bg-orange-600',
      'bg-pink-500 hover:bg-pink-600',
      'bg-indigo-500 hover:bg-indigo-600',
      'bg-red-500 hover:bg-red-600',
      'bg-cyan-500 hover:bg-cyan-600',
      'bg-teal-500 hover:bg-teal-600',
      'bg-lime-500 hover:bg-lime-600',
      'bg-yellow-500 hover:bg-yellow-600',
      'bg-amber-500 hover:bg-amber-600',
      'bg-violet-500 hover:bg-violet-600',
      'bg-fuchsia-500 hover:bg-fuchsia-600',
      'bg-rose-500 hover:bg-rose-600',
      'bg-sky-500 hover:bg-sky-600',
      'bg-green-500 hover:bg-green-600',
      'bg-blue-700 hover:bg-blue-800',
      'bg-emerald-700 hover:bg-emerald-800',
      'bg-purple-700 hover:bg-purple-800',
      'bg-orange-700 hover:bg-orange-800',
      'bg-pink-700 hover:bg-pink-800',
      'bg-indigo-700 hover:bg-indigo-800',
      'bg-red-700 hover:bg-red-800',
      'bg-cyan-700 hover:bg-cyan-800',
      'bg-teal-700 hover:bg-teal-800',
      'bg-lime-700 hover:bg-lime-800',
      'bg-yellow-700 hover:bg-yellow-800',
      'bg-amber-700 hover:bg-amber-800',
      'bg-violet-700 hover:bg-violet-800',
      'bg-fuchsia-700 hover:bg-fuchsia-800',
      'bg-rose-700 hover:bg-rose-800',
      'bg-sky-700 hover:bg-sky-800',
      'bg-green-700 hover:bg-green-800',
    ];
    return classes[colorIndex % classes.length];
  }

  getSessionPresenterClass(sessionId: string): string {
    const colorIndex = this.getSessionColorIndex(sessionId);
    const classes = [
      'text-blue-100',
      'text-emerald-100',
      'text-purple-100',
      'text-orange-100',
      'text-pink-100',
      'text-indigo-100',
      'text-red-100',
      'text-cyan-100',
      'text-teal-100',
      'text-lime-100',
      'text-yellow-100',
      'text-amber-100',
      'text-violet-100',
      'text-fuchsia-100',
      'text-rose-100',
      'text-sky-100',
      'text-green-100',
      'text-blue-50',
      'text-emerald-50',
      'text-purple-50',
      'text-orange-50',
      'text-pink-50',
      'text-indigo-50',
      'text-red-50',
      'text-cyan-50',
      'text-teal-50',
      'text-lime-50',
      'text-yellow-50',
      'text-amber-50',
      'text-violet-50',
      'text-fuchsia-50',
      'text-rose-50',
      'text-sky-50',
      'text-green-50',
      'text-blue-200',
      'text-emerald-200',
      'text-purple-200',
      'text-orange-200',
      'text-pink-200',
      'text-indigo-200',
      'text-red-200',
      'text-cyan-200',
      'text-teal-200',
      'text-lime-200',
      'text-yellow-200',
      'text-amber-200',
      'text-violet-200',
      'text-fuchsia-200',
      'text-rose-200',
      'text-sky-200',
      'text-green-200',
    ];
    return classes[colorIndex % classes.length];
  }

  private getSessionSlotClass(sessionId: string): string {
    const colorIndex = this.getSessionColorIndex(sessionId);
    const classes = [
      'bg-blue-600 hover:bg-blue-700 shadow-lg',
      'bg-emerald-600 hover:bg-emerald-700 shadow-lg',
      'bg-purple-600 hover:bg-purple-700 shadow-lg',
      'bg-orange-600 hover:bg-orange-700 shadow-lg',
      'bg-pink-600 hover:bg-pink-700 shadow-lg',
      'bg-indigo-600 hover:bg-indigo-700 shadow-lg',
      'bg-red-600 hover:bg-red-700 shadow-lg',
      'bg-cyan-600 hover:bg-cyan-700 shadow-lg',
      'bg-teal-600 hover:bg-teal-700 shadow-lg',
      'bg-lime-600 hover:bg-lime-700 shadow-lg',
      'bg-yellow-600 hover:bg-yellow-700 shadow-lg',
      'bg-amber-600 hover:bg-amber-700 shadow-lg',
      'bg-violet-600 hover:bg-violet-700 shadow-lg',
      'bg-fuchsia-600 hover:bg-fuchsia-700 shadow-lg',
      'bg-rose-600 hover:bg-rose-700 shadow-lg',
      'bg-sky-600 hover:bg-sky-700 shadow-lg',
      'bg-green-600 hover:bg-green-700 shadow-lg',
      'bg-blue-500 hover:bg-blue-600 shadow-lg',
      'bg-emerald-500 hover:bg-emerald-600 shadow-lg',
      'bg-purple-500 hover:bg-purple-600 shadow-lg',
      'bg-orange-500 hover:bg-orange-600 shadow-lg',
      'bg-pink-500 hover:bg-pink-600 shadow-lg',
      'bg-indigo-500 hover:bg-indigo-600 shadow-lg',
      'bg-red-500 hover:bg-red-600 shadow-lg',
      'bg-cyan-500 hover:bg-cyan-600 shadow-lg',
      'bg-teal-500 hover:bg-teal-600 shadow-lg',
      'bg-lime-500 hover:bg-lime-600 shadow-lg',
      'bg-yellow-500 hover:bg-yellow-600 shadow-lg',
      'bg-amber-500 hover:bg-amber-600 shadow-lg',
      'bg-violet-500 hover:bg-violet-600 shadow-lg',
      'bg-fuchsia-500 hover:bg-fuchsia-600 shadow-lg',
      'bg-rose-500 hover:bg-rose-600 shadow-lg',
      'bg-sky-500 hover:bg-sky-600 shadow-lg',
      'bg-green-500 hover:bg-green-600 shadow-lg',
      'bg-blue-700 hover:bg-blue-800 shadow-lg',
      'bg-emerald-700 hover:bg-emerald-800 shadow-lg',
      'bg-purple-700 hover:bg-purple-800 shadow-lg',
      'bg-orange-700 hover:bg-orange-800 shadow-lg',
      'bg-pink-700 hover:bg-pink-800 shadow-lg',
      'bg-indigo-700 hover:bg-indigo-800 shadow-lg',
      'bg-red-700 hover:bg-red-800 shadow-lg',
      'bg-cyan-700 hover:bg-cyan-800 shadow-lg',
      'bg-teal-700 hover:bg-teal-800 shadow-lg',
      'bg-lime-700 hover:bg-lime-800 shadow-lg',
      'bg-yellow-700 hover:bg-yellow-800 shadow-lg',
      'bg-amber-700 hover:bg-amber-800 shadow-lg',
      'bg-violet-700 hover:bg-violet-800 shadow-lg',
      'bg-fuchsia-700 hover:bg-fuchsia-800 shadow-lg',
      'bg-rose-700 hover:bg-rose-800 shadow-lg',
      'bg-sky-700 hover:bg-sky-800 shadow-lg',
      'bg-green-700 hover:bg-green-800 shadow-lg',
    ];
    return classes[colorIndex % classes.length];
  }

  private getSelectedSlotClass(roomIndex: number): string {
    const classes = [
      'bg-gradient-to-r from-blue-400 to-blue-500 shadow-lg',
      'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg',
      'bg-gradient-to-r from-purple-400 to-purple-500 shadow-lg',
      'bg-gradient-to-r from-orange-400 to-orange-500 shadow-lg',
      'bg-gradient-to-r from-pink-400 to-pink-500 shadow-lg',
      'bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-lg',
    ];
    return classes[roomIndex % classes.length];
  }

  private getEmptySlotClass(roomIndex: number): string {
    const classes = [
      'bg-white hover:bg-blue-50',
      'bg-white hover:bg-emerald-50',
      'bg-white hover:bg-purple-50',
      'bg-white hover:bg-orange-50',
      'bg-white hover:bg-pink-50',
      'bg-white hover:bg-indigo-50',
    ];
    return classes[roomIndex % classes.length];
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

  getRoomName(roomId: string): string {
    const room = this.rooms().find((r) => r.id === roomId);
    return room?.name || roomId;
  }
}
