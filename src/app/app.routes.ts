import { Routes } from '@angular/router';
import { EventsComponent } from './components/events/events';
import { EventDetailComponent } from './components/event-detail/event-detail';
import { OAuthRedirectComponent } from './components/login/oauth-redirect';

export const routes: Routes = [
  { path: '', component: EventsComponent },
  { path: 'events', component: EventsComponent },
  { path: 'login/redirect', component: OAuthRedirectComponent },
  { path: ':date', component: EventDetailComponent },
];
