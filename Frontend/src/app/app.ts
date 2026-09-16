import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AccessibilityComponent } from './components/accessibility/accesibility';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AccessibilityComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
