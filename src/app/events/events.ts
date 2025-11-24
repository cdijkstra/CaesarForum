import {Component, signal, computed, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {EventsService} from "../event-service/event-service";

function isWholeOrHalfHour(time: string): boolean {
  // time format: "HH:mm"
  const match = /^\d{2}:(\d{2})$/.exec(time);
  if (!match) return false;
  const minutes = Number(match[1]);
  console.log(minutes);
  return minutes === 0 || minutes === 30;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './events.html',
  styleUrl: './events.scss'
})
export class EventsComponent {
  private eventsService = inject(EventsService);
  private router = inject(Router);

  // Default values for form fields
  readonly DEFAULT_TITLE = 'My Event';
  readonly DEFAULT_DATE = new Date().toISOString().slice(0, 10);
  readonly DEFAULT_START_HOUR = '09:00';
  readonly DEFAULT_END_HOUR = '10:00';

  title = signal(this.DEFAULT_TITLE);
  date = signal(this.DEFAULT_DATE);
  startHour = signal(this.DEFAULT_START_HOUR);
  endHour = signal(this.DEFAULT_END_HOUR);

  // Signal for created events
  events = this.eventsService.events;

  // Computed signal for form validity
  isFormValid = computed(() => {
    return (
      this.title().trim() !== '' &&
      this.date().trim() !== '' &&
      this.startHour().trim() !== '' &&
      this.endHour().trim() !== '' &&
      isWholeOrHalfHour(this.startHour()) &&
      isWholeOrHalfHour(this.endHour())
    );
  });

  // Computed signal for error message
  errorMessage = computed(() => {
    if (!isWholeOrHalfHour(this.startHour()) || !isWholeOrHalfHour(this.endHour())) {
      return 'Start and end hours must be at whole or half hours (:00 or :30).';
    }
    return '';
  });

  // Handle form submission
  onSubmit() {
    if (this.isFormValid()) {
      this.eventsService.addEvent({
        title: this.title(),
        date: this.date(),
        startHour: this.startHour(),
        endHour: this.endHour()
      });
      // Reset form fields to default values
      this.title.set('')
      this.date.set(this.DEFAULT_DATE);
      this.startHour.set(this.DEFAULT_START_HOUR);
      this.endHour.set(this.DEFAULT_END_HOUR);
    }
  }

  deleteEvent(index: number) {
    if (confirm('Weet je zeker dat je dit evenement wilt verwijderen?')) {
      this.eventsService.deleteEvent(index);
    }
  }

  navigateToEvent(date: string) {
    this.router.navigate(['/', date]);
  }


  setTitle(value: string) { this.title.set(value); }
  setDate(value: string) { this.date.set(value); }
  setStartHour(value: string) { this.startHour.set(value); }
  setEndHour(value: string) { this.endHour.set(value); }
}
