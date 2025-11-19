import { Routes } from '@angular/router';
import { EventsComponent } from './events/events';
import { EventDetailComponent } from './event-detail/event-detail';

export const routes: Routes = [
  { path: '', component: EventsComponent },
  { path: ':date', component: EventDetailComponent }
];
