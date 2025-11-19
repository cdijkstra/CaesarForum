import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {EventsComponent} from "./events/events";

@Component({
  selector: 'app-root',
    imports: [RouterOutlet, EventsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('CaesarForum');
}
