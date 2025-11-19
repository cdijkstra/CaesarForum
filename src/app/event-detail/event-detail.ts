
import {Component, computed, inject, input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {EventsService} from "../event-service/event-service";

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss'
})
export class EventDetailComponent {
  private eventsService = inject(EventsService);

  date = input.required<string>();

  // Get the event from the service based on the date
  event = computed(() => this.eventsService.getEventByDate(this.date()));

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
}