import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonTabBar, IonTabButton,
  IonIcon, IonLabel,
  IonContent, MenuController, IonTabs
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, people, personAdd, bed, logOut, menu, personCircleOutline } from 'ionicons/icons';
import { SideMenuComponent } from '../side-menu/side-menu.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet,
    IonTabBar, IonTabButton,
    IonIcon, IonLabel,
    IonContent, IonTabs,
    SideMenuComponent
  ],
  template: `
    <!-- Side Menu -->
    <app-side-menu></app-side-menu>

    <!-- Main Page Wrapper -->
    <div class="ion-page" id="main-content">
      
      <!-- Main Content -->
      <ion-content>
        <div class="content-container">
          <router-outlet></router-outlet>
        </div>
      </ion-content>

      <!-- Mobile Tab Bar (Fixed at bottom) -->
      <ion-tabs>
        <ion-tab-bar slot="bottom" class="curved-footer ion-hide-md-up">
          <ion-tab-button tab="home" href="/home">
            <ion-icon name="home"></ion-icon>
            <ion-label>Home</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="students" href="/students">
            <ion-icon name="people"></ion-icon>
            <ion-label>Students</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="add-student" href="/add-student">
            <ion-icon name="person-add"></ion-icon>
            <ion-label>Add</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="rooms" href="/rooms">
            <ion-icon name="bed"></ion-icon>
            <ion-label>Rooms</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </div>
  `,
  styles: [`
    /* Desktop Header Styles */
    .desktop-header ion-toolbar {
      --background: white;
      --color: var(--ion-color-primary);
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .desktop-header ion-title {
      font-weight: 700;
      font-size: 1.5rem;
    }

    .desktop-header ion-button {
      --color: var(--ion-color-medium);
      font-weight: 500;
      margin-left: 8px;
    }

    .desktop-header ion-button.active-link {
      --color: var(--ion-color-secondary);
      --background: var(--ion-color-warning);
    }

    /* Profile Button */
    .profile-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-right: 16px;
    }

    .profile-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .profile-btn:active {
      transform: scale(0.98);
    }

    .profile-btn ion-icon {
      font-size: 24px;
      color: white;
    }

    ion-tab-button ion-label {
      font-size: 11px;
      font-weight: 600;
    }
    
    .content-container {
      height: 100%;
      overflow-y: auto;
    }

    /* Responsive Utilities */
    @media (min-width: 768px) {
      .ion-hide-md-up {
        display: none !important;
      }
    }

    @media (max-width: 767px) {
      .ion-hide-md-down {
        display: none !important;
      }
    }
  `]
})
export class MainLayoutComponent {
  private menuController = inject(MenuController);

  constructor() {
    // Register icons
    addIcons({ home, people, personAdd, bed, logOut, menu, personCircleOutline });
  }

  async openMenu() {
    await this.menuController.open();
  }
}
