import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-buyer-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-dark-900">
      <app-navbar />
      <main class="flex-1 pt-16">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `
})
export class BuyerLayoutComponent {}
