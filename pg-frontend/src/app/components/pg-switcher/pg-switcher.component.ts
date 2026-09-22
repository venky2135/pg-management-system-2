import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonIcon, IonButton, IonPopover, IonContent,
  IonList, IonItem, IonLabel, IonAvatar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { business, addCircle, chevronDown, checkmark, person } from 'ionicons/icons';
import { PGService } from '../../services/pg.service';

@Component({
  selector: 'app-pg-switcher',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonIcon,
    IonPopover,
    IonContent,
    IonList,
    IonItem,
    IonLabel
  ],
  template: `
    <div class="pg-switcher-container">
      <!-- Trigger Button -->
      <div class="trigger-wrapper" (click)="presentPopover($event)">
        <div class="icon-circle">
          <ion-icon name="business"></ion-icon>
        </div>
        <span class="pg-name">{{ getCurrentPGName() }}</span>
        <ion-icon name="chevron-down" class="chevron"></ion-icon>
      </div>

      <!-- Popover Menu -->
      <ion-popover 
        [isOpen]="isPopoverOpen" 
        (didDismiss)="isPopoverOpen = false"
        [event]="popoverEvent"
        [dismissOnSelect]="true" 
        [showBackdrop]="false"
        [arrow]="true"
        alignment="center" 
        side="bottom"
        class="pg-switcher-popover">
        <ng-template>
          <ion-content class="ion-no-padding">
            <ion-list lines="none" class="popover-list">
              <ion-item button *ngFor="let pg of pgs" (click)="selectPG(pg)" [detail]="false" class="pg-item">
                <div class="item-icon-circle" slot="start">
                  <ion-icon name="business"></ion-icon>
                </div>
                <ion-label>
                  <h2 [class.selected]="currentPGId === pg.id">{{ pg.name }}</h2>
                  <p>{{ pg.address }}</p>
                </ion-label>
                <ion-icon name="checkmark" slot="end" color="success" *ngIf="currentPGId === pg.id"></ion-icon>
              </ion-item>
              
              <div class="divider"></div>

              <ion-item button (click)="addNewPG()" lines="none" class="add-new-item">
                <div class="item-icon-circle add" slot="start">
                  <ion-icon name="add-circle"></ion-icon>
                </div>
                <ion-label class="add-text">Add New Property</ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ng-template>
      </ion-popover>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .pg-switcher-container {
      display: inline-block;
    }

    /* Trigger Styles */
    .trigger-wrapper {
      display: flex;
      align-items: center;
      background: #f5f5f5;
      border-radius: 24px;
      padding: 4px 12px 4px 4px;
      cursor: pointer;
      transition: background 0.2s;
      border: 1px solid transparent;
    }

    .trigger-wrapper:active {
      background: #e0e0e0;
    }

    .icon-circle {
      width: 32px;
      height: 32px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      margin-right: 8px;
    }

    .icon-circle ion-icon {
      font-size: 16px;
      color: var(--ion-color-dark);
    }

    .pg-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--ion-color-dark);
      margin-right: 8px;
      max-width: 140px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chevron {
      font-size: 14px;
      color: var(--ion-color-medium);
    }

    /* Popover Styles */
    ::ng-deep ion-popover.pg-switcher-popover {
      --width: 260px; /* Smaller width */
      --box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      --border-radius: 16px;
      --offset-y: 10px;
      --background: rgba(255, 255, 255, 0.85); /* Translucent */
      --backdrop-opacity: 0;
    }

    /* Glassmorphism for content */
    ::ng-deep ion-popover.pg-switcher-popover::part(content) {
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .popover-list {
      padding: 6px;
      background: transparent;
    }

    .pg-item {
      --padding-start: 8px;
      --padding-end: 8px;
      --inner-padding-end: 0;
      --min-height: 48px; /* Smaller height */
      border-radius: 10px;
      margin-bottom: 2px;
      --background: transparent;
    }

    .pg-item::part(native) {
      border-radius: 10px;
    }

    .pg-item:hover {
      --background: rgba(0, 0, 0, 0.03);
    }

    .item-icon-circle {
      width: 32px; /* Smaller icon circle */
      height: 32px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
    }

    .item-icon-circle ion-icon {
      font-size: 16px;
      color: var(--ion-color-medium);
    }

    .item-icon-circle.add {
      background: rgba(var(--ion-color-primary-rgb), 0.1);
    }

    .item-icon-circle.add ion-icon {
      color: var(--ion-color-primary);
    }

    ion-label h2 {
      font-size: 13px; /* Smaller font */
      font-weight: 600;
      color: var(--ion-color-dark);
      margin-bottom: 1px;
    }

    ion-label h2.selected {
      color: var(--ion-color-primary);
    }

    ion-label p {
      font-size: 11px;
      color: var(--ion-color-medium);
    }

    .add-text {
      font-size: 13px;
      font-weight: 600;
      color: var(--ion-color-primary);
    }

    .divider {
      height: 1px;
      background: rgba(0, 0, 0, 0.05);
      margin: 4px 8px;
    }
  `]
})
export class PGSwitcherComponent implements OnInit {
  pgs: any[] = [];
  currentPGId: number | null = null;
  isPopoverOpen = false;
  popoverEvent: any = null;

  constructor(
    private router: Router,
    private pgService: PGService
  ) {
    addIcons({ business, addCircle, chevronDown, checkmark, person });
  }

  ngOnInit() {
    this.pgService.ownerPGs$.subscribe(pgs => {
      this.pgs = pgs;
    });

    this.pgService.currentPG$.subscribe(pg => {
      if (pg) {
        this.currentPGId = pg.id;
      }
    });
  }

  // Removed loadPGs as it's handled by subscription

  getCurrentPGName(): string {
    if (this.pgs.length === 0) return 'Add Property';
    const pg = this.pgs.find(p => p.id === this.currentPGId);
    return pg ? pg.name : 'Select PG';
  }

  presentPopover(e: Event) {
    this.popoverEvent = e;
    this.isPopoverOpen = true;
  }

  selectPG(pg: any) {
    this.pgService.setCurrentPG(pg);
    this.isPopoverOpen = false;
  }

  addNewPG() {
    this.isPopoverOpen = false;
    this.router.navigate(['/property-setup']);
  }
}
