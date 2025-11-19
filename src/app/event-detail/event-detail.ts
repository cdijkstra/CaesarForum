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
}
