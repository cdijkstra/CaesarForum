import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EventsService } from '../../services/events.service';
import { UserService } from '../../services/user.service';

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
})
export class EventsComponent {
  private eventsService = inject(EventsService);
  private router = inject(Router);
  private userService = inject(UserService);

  // Authentication state
  isAuthenticated = this.userService.isAuthenticated;

  // Default values for form fields
  readonly DEFAULT_DATE = new Date().toISOString().slice(0, 10);
  readonly DEFAULT_START_HOUR = '18:00';
  readonly DEFAULT_END_HOUR = '21:00';

  title = signal<string>('');
  date = signal(this.DEFAULT_DATE);
  startHour = signal(this.DEFAULT_START_HOUR);
  endHour = signal(this.DEFAULT_END_HOUR);

  // Signal for created events
  events = this.eventsService.events;
  eventsLoading = this.eventsService.eventsLoading;

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
      return 'Start- en eindtijden moeten op hele of halve uren zijn (:00 of :30).';
    }
    return '';
  });

  // Handle form submission
  onSubmit() {
    if (!this.isAuthenticated()) {
      alert('Log in om evenementen aan te maken.');
      return;
    }

    if (this.isFormValid()) {
      this.eventsService
        .addEvent({
          title: this.title(),
          date: this.date(),
          startHour: this.startHour(),
          endHour: this.endHour(),
        })
        .catch((error) => {
          console.error('Error adding event:', error);
          alert('Er is een fout opgetreden bij het toevoegen van het evenement.');
        });
      // Reset form fields to default values
      this.title.set('');
      this.date.set(this.DEFAULT_DATE);
      this.startHour.set(this.DEFAULT_START_HOUR);
      this.endHour.set(this.DEFAULT_END_HOUR);
    }
  }

  deleteEvent(eventId: string) {
    if (!this.isAuthenticated()) {
      alert('Log in om evenementen te verwijderen.');
      return;
    }

    if (confirm('Weet je zeker dat je dit evenement wilt verwijderen?')) {
      this.eventsService.deleteEvent(eventId).catch((error) => {
        console.error('Error deleting event:', error);
        alert('Er is een fout opgetreden bij het verwijderen van het evenement.');
      });
    }
  }

  navigateToEvent(date: string) {
    this.router.navigate(['/', date]);
  }

  setTitle(value: string) {
    this.title.set(value);
  }
  setDate(value: string) {
    this.date.set(value);
  }
  setStartHour(value: string) {
    this.startHour.set(value);
  }
  setEndHour(value: string) {
    this.endHour.set(value);
  }
}
