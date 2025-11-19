

import {Component, computed, inject, input, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {EventsService} from "../event-service/event-service";

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
  styleUrl: './event-detail.scss'
})
export class EventDetailComponent {
  private eventsService = inject(EventsService);

  date = input.required<string>();

  // Get the event from the service based on the date
  event = computed(() => this.eventsService.getEventByDate(this.date()));

  // Selection state
  selection = signal<RoomSelection | null>(null);
  isSelecting = signal(false);

  // Form state
  showForm = signal(false);
  eventName = signal('');
  eventAbstract = signal('');
  sessionType = signal<SessionType>('Presentation');

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

    console.log('Event created:', {
      room: selection.room,
      startTime: selection.startSlot.time,
      endTime: this.getNextTimeSlot(selection.endSlot.time),
      name: this.eventName(),
      abstract: this.eventAbstract(),
      sessionType: this.sessionType()
    });

    // Reset form
    this.cancelSelection();
  }

  cancelSelection() {
    this.selection.set(null);
    this.showForm.set(false);
    this.eventName.set('');
    this.eventAbstract.set('');
    this.sessionType.set('Presentation');
  }

  getNextTimeSlot(time: string): string {
    const minutes = this.parseTime(time) + 30;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}