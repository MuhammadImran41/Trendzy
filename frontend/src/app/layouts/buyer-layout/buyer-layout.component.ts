import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-buyer-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div style="min-height:100vh;display:flex;flex-direction:column;background:#faf7f4;">
      <app-navbar />
      <main style="flex:1; padding-top: 122px;">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `
})
export class BuyerLayoutComponent {}
