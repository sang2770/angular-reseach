import { ROUTER_UTILS } from './../app.router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly ROUTER_UTILS = ROUTER_UTILS;
}
