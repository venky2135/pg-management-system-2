import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, IonContent, IonButton],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-content [fullscreen]="true" class="welcome-content">
      <swiper-container class="welcome-swiper" pagination="true" pagination-dynamic-bullets="true">
        
        <!-- Slide 1 -->
        <swiper-slide>
          <div class="slide-content">
            <div class="illustration-container">
              <div class="illustration-placeholder">
                <img src="assets/pghut.png" alt="NestPG Logo" class="logo-img" />
              </div>
            </div>
            <div class="text-content">
              <h1>Welcome to NestPG</h1>
              <p>Manage rooms, tenants, and rent in one simple and organized place.</p>
            </div>
          </div>
        </swiper-slide>

        <!-- Slide 2 -->
        <swiper-slide>
          <div class="slide-content">
            <div class="illustration-container">
              <div class="illustration-placeholder orange-bg">
                <img src="assets/pghut.png" alt="Rooms" class="logo-img" />
              </div>
            </div>
            <div class="text-content">
              <h1>Track Occupancy</h1>
              <p>Keep track of available beds, occupied rooms, and tenant details effortlessly.</p>
            </div>
          </div>
        </swiper-slide>

        <!-- Slide 3 -->
        <swiper-slide>
          <div class="slide-content">
            <div class="illustration-container">
              <div class="illustration-placeholder green-bg">
                <img src="assets/pghut.png" alt="Payments" class="logo-img" />
              </div>
            </div>
            <div class="text-content">
              <h1>Manage Payments</h1>
              <p>Record rent payments, track dues, and generate monthly reports.</p>
            </div>
          </div>
        </swiper-slide>

      </swiper-container>

      <div class="bottom-action">
        <ion-button class="get-started-btn" expand="block" (click)="navigateToLogin()">
          Get Started
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .welcome-content {
      --background: #ffffff;
    }

    swiper-container {
      height: 85%;
      --swiper-pagination-color: var(--ion-color-secondary);
      --swiper-pagination-bullet-inactive-color: #d1d5db;
    }

    swiper-slide {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #ffffff;
    }

    .slide-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px;
      text-align: center;
      height: 100%;
    }

    .illustration-container {
      margin-bottom: 40px;
    }

    .illustration-placeholder {
      width: 240px;
      height: 240px;
      background: #F6F7FB;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .illustration-placeholder.orange-bg {
      background: #FFF3E0;
    }

    .illustration-placeholder.green-bg {
      background: #ECFDF5;
    }

    .logo-img {
      width: 120px;
      height: 120px;
      object-fit: contain;
    }

    .text-content h1 {
      font-size: 28px;
      font-weight: 800;
      color: var(--ion-color-primary);
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }

    .text-content p {
      font-size: 16px;
      color: #6B7280;
      line-height: 1.6;
      max-width: 300px;
      margin: 0 auto;
    }

    .bottom-action {
      height: 15%;
      padding: 0 24px 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
    }

    .get-started-btn {
      --background: var(--ion-color-primary);
      --color: white;
      --border-radius: 50px;
      font-weight: 700;
      height: 56px;
      font-size: 18px;
      text-transform: none;
      --box-shadow: 0 10px 25px rgba(5, 11, 20, 0.2);
      width: 100%;
    }
  `]
})
export class WelcomeComponent {
  constructor(private router: Router) { }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
