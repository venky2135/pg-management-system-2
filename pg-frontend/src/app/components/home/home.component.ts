import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonGrid, IonRow, IonCol,
  IonCard, IonCardContent, IonIcon, IonButton, IonAvatar,
  MenuController, IonHeader, IonToolbar, IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline, bedOutline, personAddOutline, cardOutline, arrowForwardOutline,
  cashOutline, notificationsOutline, chevronDownOutline, chatboxOutline,
  documentTextOutline, searchOutline, filterOutline, addOutline,
  personCircleOutline
} from 'ionicons/icons';

import { PGSwitcherComponent } from '../pg-switcher/pg-switcher.component';
import { RoomService } from '../../services/room.service';
import { StudentService } from '../../services/student.service';
import { FeeService } from '../../services/fee.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonGrid, IonRow, IonCol,
    IonCard, IonCardContent, IonIcon, IonButton,
    IonHeader, IonToolbar, IonButtons,
    PGSwitcherComponent
  ],
  template: `
    <ion-header class="ion-no-border home-header">
      <ion-toolbar class="home-toolbar">
        <div class="header-content">
          <div class="user-info">
            <button class="profile-btn logo-btn" (click)="openMenu()">
              <img src="assets/pghut-removebg-preview.png" alt="Logo" class="logo-img">
            </button>
            <div class="greeting">
              <span class="label">Good Morning</span>
              <app-pg-switcher></app-pg-switcher>
            </div>
          </div>
          <ion-buttons slot="end">
            <ion-button class="notification-btn">
              <ion-icon name="notifications-outline"></ion-icon>
              <span class="badge"></span>
            </ion-button>
          </ion-buttons>
        </div>
      </ion-toolbar>

      <div class="search-container">
        <div class="search-box">
          <ion-icon name="search-outline"></ion-icon>
          <input type="text" placeholder="Search rooms, tenants..." />
        </div>
      </div>
    </ion-header>

    <ion-content class="ion-padding home-content" fullscreen="true">
      
      <!-- Occupancy Summary -->
      <div class="section-header">
        <h2>Occupancy</h2>
        <span class="see-all" (click)="navigate('/rooms')">See all</span>
      </div>

      <ion-grid class="occupancy-grid">
        <ion-row>
          <ion-col size="6">
            <div class="stat-card orange-card" (click)="navigate('/rooms')">
              <div class="card-content">
                <div class="icon-circle">
                  <ion-icon name="bed-outline"></ion-icon>
                </div>
                <div class="stat-info">
                  <span class="value">{{ availableBeds }}</span>
                  <span class="label">Available Beds</span>
                </div>
              </div>
              <div class="add-btn">
                <ion-icon name="add-outline"></ion-icon>
              </div>
            </div>
          </ion-col>
          <ion-col size="6">
            <div class="stat-card blue-card" (click)="navigate('/students')">
              <div class="card-content">
                <div class="icon-circle">
                  <ion-icon name="people-outline"></ion-icon>
                </div>
                <div class="stat-info">
                  <span class="value">{{ occupiedBeds }}</span>
                  <span class="label">Occupied Beds</span>
                </div>
              </div>
              <div class="add-btn">
                <ion-icon name="arrow-forward-outline"></ion-icon>
              </div>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Quick Actions -->
      <div class="section-header">
        <h2>Quick Actions</h2>
      </div>

      <div class="quick-actions-scroll">
        <div class="action-item" (click)="navigate('/add-student')">
          <div class="action-card">
            <ion-icon name="person-add-outline" class="orange-text"></ion-icon>
          </div>
          <span>Add Tenant</span>
        </div>
        <div class="action-item" (click)="navigate('/payments')">
          <div class="action-card">
            <ion-icon name="cash-outline" class="green-text"></ion-icon>
          </div>
          <span>Collect Rent</span>
        </div>
        <div class="action-item" (click)="navigate('/complaints')">
          <div class="action-card">
            <ion-icon name="chatbox-outline" class="yellow-text"></ion-icon>
          </div>
          <span>Complaints</span>
        </div>
        <div class="action-item">
          <div class="action-card">
            <ion-icon name="document-text-outline" class="blue-text"></ion-icon>
          </div>
          <span>Reports</span>
        </div>
      </div>

      <!-- Revenue Card -->
      <div class="section-header">
        <h2>Revenue</h2>
      </div>

      <ion-card class="revenue-card">
        <ion-card-content>
          <div class="revenue-top">
            <div class="revenue-info">
              <span class="label">Total Revenue</span>
              <span class="amount">₹8,14,220</span>
            </div>
            <div class="growth-badge">
              +3.5%
            </div>
          </div>
          
          <div class="graph-visual">
            <div class="bar" style="height: 40%"></div>
            <div class="bar" style="height: 60%"></div>
            <div class="bar" style="height: 45%"></div>
            <div class="bar" style="height: 75%"></div>
            <div class="bar" style="height: 55%"></div>
            <div class="bar active" style="height: 85%"></div>
            <div class="bar" style="height: 65%"></div>
          </div>
          <div class="graph-days">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
        </ion-card-content>
      </ion-card>

      <div class="spacer-bottom"></div>
    </ion-content>
  `,
  styles: [`
    /* Header Styles */
    .home-header {
      background: #ffffff;
      padding-bottom: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    }

    .home-toolbar {
      --background: transparent;
      --color: var(--ion-color-primary);
      padding-top: 10px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

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
      padding: 0;
      overflow: hidden;
    }

    .logo-btn {
      background: transparent;
      width: auto;
      height: 40px;
      border-radius: 0;
    }

    .logo-img {
      height: 100%;
      width: auto;
      object-fit: contain;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border: 2px solid #F3F4F6;
    }

    .greeting {
      display: flex;
      flex-direction: column;
    }

    .greeting .label {
      font-size: 12px;
      color: #9CA3AF;
      font-weight: 500;
    }

    .greeting .name {
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--ion-color-primary);
    }

    .notification-btn {
      --color: var(--ion-color-primary);
      --background: #F9FAFB;
      --border-radius: 12px;
      width: 40px;
      height: 40px;
      margin: 0;
      --padding-start: 0;
      --padding-end: 0;
      position: relative;
    }

    .badge {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 8px;
      height: 8px;
      background: var(--ion-color-secondary);
      border-radius: 50%;
      border: 1px solid white;
    }

    /* Search Box */
    .search-container {
      padding: 0 16px;
      margin-top: 16px;
    }

    .search-box {
      background: #F9FAFB;
      border-radius: 16px;
      height: 52px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
      border: 1px solid #F3F4F6;
    }

    .search-box input {
      border: none;
      outline: none;
      width: 100%;
      font-size: 14px;
      color: var(--ion-color-primary);
      background: transparent;
      font-weight: 500;
    }

    .search-box ion-icon {
      font-size: 22px;
      color: #9CA3AF;
    }

    /* Content */
    .home-content {
      --background: #ffffff;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 16px 16px;
    }

    .section-header h2 {
      font-size: 18px;
      font-weight: 800;
      color: var(--ion-color-primary);
      margin: 0;
    }

    .see-all {
      font-size: 14px;
      color: var(--ion-color-secondary);
      font-weight: 600;
    }

    /* Occupancy Grid */
    .occupancy-grid {
      padding: 0 8px;
    }

    .stat-card {
      border-radius: 24px;
      padding: 20px;
      height: 180px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s;
    }

    .stat-card:active {
      transform: scale(0.98);
    }

    .orange-card {
      background: var(--ion-color-warning);
    }

    .blue-card {
      background: var(--ion-color-tertiary);
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .icon-circle {
      width: 48px;
      height: 48px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .orange-card .icon-circle { color: var(--ion-color-secondary); }
    .blue-card .icon-circle { color: var(--ion-color-primary); }

    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-info .value {
      font-size: 28px;
      font-weight: 800;
      color: var(--ion-color-primary);
    }

    .stat-info .label {
      font-size: 13px;
      color: #6B7280;
      font-weight: 600;
    }

    .add-btn {
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 36px;
      height: 36px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .orange-card .add-btn { color: var(--ion-color-secondary); }
    .blue-card .add-btn { color: var(--ion-color-primary); }

    /* Quick Actions */
    .quick-actions-scroll {
      display: flex;
      overflow-x: auto;
      padding: 0 16px 10px;
      gap: 20px;
      scrollbar-width: none;
    }

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      min-width: 70px;
    }

    .action-card {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: #F9FAFB;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      border: 1px solid #F3F4F6;
    }

    .orange-text { color: var(--ion-color-secondary); }
    .green-text { color: #10B981; }
    .yellow-text { color: #F59E0B; }
    .blue-text { color: #3B82F6; }

    .action-item span {
      font-size: 12px;
      font-weight: 600;
      color: var(--ion-color-primary);
    }

    /* Revenue Card */
    .revenue-card {
      margin: 0 16px 24px;
      background: white;
      border-radius: 24px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.05);
      border: 1px solid #F3F4F6;
    }

    .revenue-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .revenue-info {
      display: flex;
      flex-direction: column;
    }

    .revenue-info .label {
      font-size: 12px;
      color: #9CA3AF;
      margin-bottom: 6px;
      font-weight: 500;
    }

    .revenue-info .amount {
      font-size: 26px;
      font-weight: 800;
      color: var(--ion-color-primary);
    }

    .growth-badge {
      background: var(--ion-color-success);
      color: #064E3B;
      padding: 6px 12px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 700;
    }

    .graph-visual {
      height: 140px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }

    .bar {
      flex: 1;
      background: #F3F4F6;
      border-radius: 8px;
      transition: height 0.3s;
    }

    .bar.active {
      background: var(--ion-color-primary);
    }

    .graph-days {
      display: flex;
      justify-content: space-between;
      padding: 0 6px;
    }

    .graph-days span {
      font-size: 12px;
      color: #9CA3AF;
      width: 100%;
      text-align: center;
      font-weight: 500;
    }

    .spacer-bottom {
      height: 80px; /* Space for curved footer */
    }
  `]
})
export class HomeComponent implements OnInit {
  currentPG: any = null;
  ownerPGs: any[] = [];

  availableBeds: number = 0;
  occupiedBeds: number = 0;
  totalRevenue: number = 0;

  private menuController = inject(MenuController);
  private roomService = inject(RoomService);
  private studentService = inject(StudentService);
  private feeService = inject(FeeService);

  constructor(
    private router: Router
  ) {
    addIcons({
      peopleOutline, bedOutline, personAddOutline, cardOutline, arrowForwardOutline,
      cashOutline, notificationsOutline, chevronDownOutline, chatboxOutline,
      documentTextOutline, searchOutline, filterOutline, addOutline,
      personCircleOutline
    });
  }

  async openMenu() {
    await this.menuController.open();
  }

  ngOnInit() {
    this.loadPGData();
  }

  loadPGData() {
    const pgData = localStorage.getItem('currentPG');
    if (pgData) {
      this.currentPG = JSON.parse(pgData);
      this.fetchDashboardStats(this.currentPG.id);
    }

    const pgsData = localStorage.getItem('ownerPGs');
    if (pgsData) {
      this.ownerPGs = JSON.parse(pgsData);
    }
  }

  fetchDashboardStats(pgId: number) {
    // Fetch Rooms to calculate available and occupied beds
    this.roomService.getRoomsByPG(pgId).subscribe(rooms => {
      this.availableBeds = rooms.filter(room => !room.isBooked).length;
      this.occupiedBeds = rooms.filter(room => room.isBooked).length;
    });

    // Fetch Fees to calculate total revenue
    this.feeService.getFeesByPG(pgId).subscribe(fees => {
      this.totalRevenue = fees.reduce((acc: number, fee: any) => acc + fee.amount, 0);
    });
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
