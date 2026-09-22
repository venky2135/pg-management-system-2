import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonIcon, IonLabel, IonMenuToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  business, bed, layers, settings, logOut, createOutline,
  homeOutline, personCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [
    CommonModule,
    IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonIcon, IonLabel, IonMenuToggle
  ],
  template: `
    <ion-menu contentId="main-content" side="start" type="overlay">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Menu</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding">
        <div class="user-info">
          <div class="avatar">
            <ion-icon name="person-circle-outline"></ion-icon>
          </div>
          <h3>{{ ownerName }}</h3>
          <p class="user-role">Property Owner</p>
        </div>

        <ion-list lines="none" class="menu-list">
          <div class="menu-section">
            <div class="section-title">Property Management</div>
            
            <ion-menu-toggle auto-hide="false">
              <ion-item button (click)="navigateTo('/property-setup')" detail="false">
                <ion-icon slot="start" name="create-outline"></ion-icon>
                <ion-label>Edit Property Details</ion-label>
              </ion-item>
            </ion-menu-toggle>

            <ion-menu-toggle auto-hide="false">
              <ion-item button (click)="navigateTo('/rooms')" detail="false">
                <ion-icon slot="start" name="bed"></ion-icon>
                <ion-label>Manage Rooms</ion-label>
              </ion-item>
            </ion-menu-toggle>

            <ion-menu-toggle auto-hide="false">
              <ion-item button (click)="navigateTo('/floors')" detail="false">
                <ion-icon slot="start" name="layers"></ion-icon>
                <ion-label>Manage Floors</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </div>

          <div class="menu-section">
            <div class="section-title">Account</div>
            
            <ion-menu-toggle auto-hide="false">
              <ion-item button (click)="navigateTo('/settings')" detail="false">
                <ion-icon slot="start" name="settings"></ion-icon>
                <ion-label>Settings</ion-label>
              </ion-item>
            </ion-menu-toggle>

            <ion-menu-toggle auto-hide="false">
              <ion-item button (click)="logout()" detail="false" class="logout-item">
                <ion-icon slot="start" name="log-out"></ion-icon>
                <ion-label>Logout</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </div>
        </ion-list>
      </ion-content>
    </ion-menu>
  `,
  styles: [`
    ion-menu ion-toolbar {
      --background: var(--ion-color-primary);
      --color: white;
    }

    .user-info {
      text-align: center;
      padding: 24px 16px;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 16px;
    }

    .avatar {
      width: 80px;
      height: 80px;
      margin: 0 auto 12px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar ion-icon {
      font-size: 48px;
      color: white;
    }

    .user-info h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--ion-color-dark);
      margin: 0 0 4px 0;
    }

    .user-role {
      font-size: 13px;
      color: var(--ion-color-medium);
      margin: 0;
    }

    .menu-list {
      background: transparent;
    }

    .menu-section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--ion-color-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 16px;
      margin-bottom: 4px;
    }

    ion-item {
      --padding-start: 16px;
      --inner-padding-end: 16px;
      --min-height: 48px;
      border-radius: 12px;
      margin: 4px 8px;
      transition: all 0.2s;
    }

    ion-item:hover {
      --background: rgba(var(--ion-color-primary-rgb), 0.05);
    }

    ion-item ion-icon {
      font-size: 20px;
      margin-right: 16px;
      color: var(--ion-color-primary);
    }

    ion-item ion-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--ion-color-dark);
    }

    .logout-item ion-icon {
      color: var(--ion-color-danger);
    }

    .logout-item ion-label {
      color: var(--ion-color-danger);
    }

    .logout-item:hover {
      --background: rgba(var(--ion-color-danger-rgb), 0.05);
    }
  `]
})
export class SideMenuComponent {
  ownerName = 'Owner';

  constructor(private router: Router) {
    addIcons({
      business, bed, layers, settings, logOut, createOutline,
      homeOutline, personCircleOutline
    });

    // Get owner name from localStorage if available
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.ownerName = user.name || user.username || 'Owner';
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    // Clear local storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('currentPG');
    localStorage.removeItem('ownerPGs');

    // Navigate to login
    this.router.navigate(['/login']);
  }
}
