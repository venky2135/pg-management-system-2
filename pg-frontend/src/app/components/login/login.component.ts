import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonContent, IonButton, IonText, IonItem, IonInput, IonIcon, IonCheckbox, IonLabel, IonSpinner, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoWhatsapp, lockClosed, eye, eyeOff, logoGoogle, logoApple, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonText, IonItem, IonInput, IonIcon, IonCheckbox, IonLabel, IonSpinner],
  template: `
    <ion-content [fullscreen]="true" class="login-content">
      <div class="login-container">
        <div class="header-section">
          <div class="back-btn" (click)="goBack()">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </div>
          <h1>Welcome back</h1>
          <p>Access your account securely by using your WhatsApp number and password.</p>
        </div>

      <div class="form-section">
        <div class="input-group">
          <ion-item class="custom-input" lines="none">
            <ion-icon name="logo-whatsapp" slot="start" color="medium"></ion-icon>
            <ion-input [(ngModel)]="credentials.whatsappNumber" name="whatsappNumber" placeholder="WhatsApp Number" type="tel"></ion-input>
          </ion-item>

          <ion-item class="custom-input" lines="none">
            <ion-icon name="lock-closed" slot="start" color="medium"></ion-icon>
            <ion-input [(ngModel)]="credentials.password" name="password" [type]="showPassword ? 'text' : 'password'" placeholder="Password"></ion-input>
            <ion-icon [name]="showPassword ? 'eye-off' : 'eye'" slot="end" color="medium" (click)="togglePassword()"></ion-icon>
          </ion-item>
        </div>

        <div class="options-row">
          <ion-checkbox mode="md">Save password</ion-checkbox>
          <span class="forgot-password">Forgot password?</span>
        </div>

        <ion-button class="login-btn" expand="block" (click)="login()" [disabled]="loading">
          <ion-spinner *ngIf="loading" name="crescent"></ion-spinner>
          <span *ngIf="!loading">Sign In</span>
        </ion-button>

        <div class="divider">
          <span>Or continue with</span>
        </div>

        <div class="social-login">
          <ion-button fill="outline" class="social-btn">
            <ion-icon name="logo-google" slot="start"></ion-icon>
            Continue with Google
          </ion-button>
          <ion-button fill="outline" class="social-btn">
            <ion-icon name="logo-apple" slot="start"></ion-icon>
            Continue with Apple
          </ion-button>
        </div>

        <div class="signup-link">
          <span>Didn't have an account? <strong (click)="navigateToRegister()">Sign Up</strong></span>
        </div>
      </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-content {
      --background: #ffffff;
    }

    .login-container {
      padding: 24px;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: center;
      position: relative;
    }

    .header-section {
      margin-bottom: 32px;
    }

    .back-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: #F3F4F6;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      cursor: pointer;
      font-size: 20px;
      color: #1F2937;
      transition: all 0.2s ease;
    }

    .back-btn:active {
      transform: scale(0.95);
      background: #E5E7EB;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--ion-color-primary);
      margin-bottom: 12px;
    }

    p {
      font-size: 14px;
      color: #9CA3AF;
      line-height: 1.5;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
    }

    .custom-input {
      --background: #F9FAFB;
      --border-radius: 12px;
      --padding-start: 16px;
      --inner-padding-end: 16px;
      height: 56px;
      margin-bottom: 0;
      border-radius: 12px;
    }

    .options-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      font-size: 14px;
    }

    ion-checkbox {
      --size: 18px;
      --border-radius: 4px;
      --checkbox-background-checked: var(--ion-color-secondary);
      --border-color-checked: var(--ion-color-secondary);
      font-size: 14px;
      color: #6B7280;
    }

    .forgot-password {
      color: var(--ion-color-secondary);
      font-weight: 600;
    }

    .login-btn {
      --background: var(--ion-color-primary);
      --border-radius: 50px;
      height: 56px;
      font-weight: 700;
      font-size: 16px;
      text-transform: none;
      margin-bottom: 32px;
      --box-shadow: 0 10px 25px rgba(13, 26, 45, 0.2);
    }

    .divider {
      text-align: center;
      position: relative;
      margin-bottom: 24px;
    }

    .divider::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 100%;
      height: 1px;
      background: #E5E7EB;
      z-index: 1;
    }

    .divider span {
      background: white;
      padding: 0 16px;
      color: #9CA3AF;
      font-size: 12px;
      position: relative;
      z-index: 2;
    }

    .social-login {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 40px;
    }

    .social-btn {
      --border-radius: 50px;
      --border-color: #E5E7EB;
      --color: #1F2937;
      height: 56px;
      font-weight: 500;
      text-transform: none;
    }

    .signup-link {
      text-align: center;
      font-size: 14px;
      color: #6B7280;
      margin-bottom: 24px;
    }

    .signup-link strong {
      color: var(--ion-color-primary);
      cursor: pointer;
    }
  `]
})
export class LoginComponent {
  credentials = {
    whatsappNumber: '',
    password: ''
  };
  showPassword = false;
  loading = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({ logoWhatsapp, lockClosed, eye, eyeOff, logoGoogle, logoApple, arrowBackOutline });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    if (!this.credentials.whatsappNumber || !this.credentials.password) {
      this.showToast('Please enter WhatsApp number and password', 'warning');
      return;
    }

    this.loading = true;
    this.http.post('http://localhost:8080/api/owners/login', this.credentials).subscribe({
      next: (response: any) => {
        this.loading = false;
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.checkPGsAndNavigate(response.id);
      },
      error: (error) => {
        this.loading = false;
        this.showToast(error.error?.message || 'Login failed', 'danger');
      }
    });
  }

  checkPGsAndNavigate(ownerId: number) {
    this.http.get<any[]>(`http://localhost:8080/api/pgs/owner/${ownerId}`).subscribe({
      next: (pgs) => {
        if (pgs && pgs.length > 0) {
          // Store the first PG as current PG for now
          localStorage.setItem('currentPG', JSON.stringify(pgs[0]));
          localStorage.setItem('ownerPGs', JSON.stringify(pgs));
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/property-setup']);
        }
      },
      error: () => {
        // If error fetching PGs, assume none and go to register
        this.router.navigate(['/property-setup']);
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}
