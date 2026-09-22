import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PGService } from '../../services/pg.service';
import {
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonBadge, IonGrid, IonRow, IonCol,
    ToastController, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForward, arrowBack, checkmarkCircle, add, trash } from 'ionicons/icons';

@Component({
    selector: 'app-property-wizard',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
        IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption,
        IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonBadge, IonGrid, IonRow, IonCol,
        IonSpinner
    ],
    templateUrl: './property-wizard.component.html',
    styleUrls: ['./property-wizard.component.css']
})
export class PropertyWizardComponent {
    currentStep = 1;
    loading = false;

    // Step 1: Property Details
    pgData = {
        name: '',
        address: '',
        description: '',
        type: 'Co-ed' // Default
    };
    createdPGId: number | null = null;

    // Step 2: Floors
    floors: any[] = [
        { floorNumber: 0, description: 'Ground Floor' }
    ];
    createdFloors: any[] = [];

    // Step 3: Rooms
    // Map floorId -> list of rooms
    roomsByFloor: { [key: number]: any[] } = {};

    roomTypeOptions = [
        { label: 'Single', value: 'SINGLE', capacity: 1 },
        { label: 'Double', value: 'DOUBLE', capacity: 2 },
        { label: 'Triple', value: 'TRIPLE', capacity: 3 },
        { label: '4 Sharing', value: '4_SHARING', capacity: 4 },
        { label: '5 Sharing', value: '5_SHARING', capacity: 5 },
        { label: '6 Sharing', value: '6_SHARING', capacity: 6 },
        { label: '7 Sharing', value: '7_SHARING', capacity: 7 },
        { label: '8 Sharing', value: '8_SHARING', capacity: 8 },
        { label: '9 Sharing', value: '9_SHARING', capacity: 9 },
        { label: '10 Sharing', value: '10_SHARING', capacity: 10 },
    ];

    constructor(
        private pgService: PGService,
        private router: Router,
        private toastController: ToastController
    ) {
        addIcons({ arrowForward, arrowBack, checkmarkCircle, add, trash });
    }

    // --- Step 1: Create PG ---
    async createPG() {
        if (!this.pgData.name || !this.pgData.address) {
            this.showToast('Please fill in name and address', 'warning');
            return;
        }

        const owner = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!owner.id) {
            this.showToast('Please login first', 'danger');
            this.router.navigate(['/login']);
            return;
        }

        this.loading = true;
        this.pgService.createPG(owner.id, this.pgData).subscribe({
            next: (pg) => {
                this.createdPGId = pg.id;
                this.loading = false;
                this.currentStep = 2;
                this.showToast('Property created! Now add floors.', 'success');
            },
            error: (err) => {
                this.loading = false;
                this.showToast('Failed to create property', 'danger');
            }
        });
    }

    // --- Step 2: Configure Floors ---
    addFloorRow() {
        const nextFloorNum = this.floors.length;
        this.floors.push({ floorNumber: nextFloorNum, description: `Floor ${nextFloorNum}` });
    }

    removeFloorRow(index: number) {
        if (this.floors.length > 1) {
            this.floors.splice(index, 1);
        }
    }

    async saveFloors() {
        if (!this.createdPGId) return;

        this.loading = true;
        this.pgService.createFloorsBulk(this.createdPGId, this.floors).subscribe({
            next: (savedFloors) => {
                this.createdFloors = savedFloors;
                // Initialize rooms for each floor
                this.createdFloors.forEach(floor => {
                    this.roomsByFloor[floor.id] = [
                        { roomNumber: `${floor.floorNumber}01`, roomType: 'DOUBLE', rentAmount: 5000, isAc: false, capacity: 2 }
                    ];
                });
                this.loading = false;
                this.currentStep = 3;
                this.showToast('Floors saved! Now configure rooms.', 'success');
            },
            error: (err) => {
                this.loading = false;
                this.showToast('Failed to save floors', 'danger');
            }
        });
    }

    // --- Step 3: Configure Rooms ---
    addRoomRow(floorId: number) {
        const currentRooms = this.roomsByFloor[floorId];
        const nextNum = currentRooms.length + 1;
        // Try to guess next room number based on floor
        const floorObj = this.createdFloors.find(f => f.id === floorId);
        const floorPrefix = floorObj ? floorObj.floorNumber : '';

        currentRooms.push({
            roomNumber: `${floorPrefix}0${nextNum}`,
            roomType: 'DOUBLE',
            rentAmount: 5000,
            isAc: false,
            capacity: 2
        });
    }

    removeRoomRow(floorId: number, index: number) {
        if (this.roomsByFloor[floorId].length > 0) {
            this.roomsByFloor[floorId].splice(index, 1);
        }
    }

    onRoomTypeChange(room: any) {
        const selectedOption = this.roomTypeOptions.find(opt => opt.value === room.roomType);
        if (selectedOption) {
            room.capacity = selectedOption.capacity;
        }
    }

    async finishWizard() {
        this.loading = true;

        // We need to save rooms for each floor. We can do this in parallel or sequence.
        // Let's do sequence for simplicity and error handling.

        try {
            for (const floor of this.createdFloors) {
                const rooms = this.roomsByFloor[floor.id];
                if (rooms && rooms.length > 0) {
                    await this.pgService.createRoomsBulk(floor.id, rooms).toPromise();
                }
            }

            this.loading = false;
            this.showToast('Setup Complete!', 'success');

            // Set as current PG and go home
            // Fetch full PG details first? Or just use what we have.
            // Let's fetch the PG again to get full structure if needed, or just navigate.
            // We need to update the 'ownerPGs' in local storage.

            const owner = JSON.parse(localStorage.getItem('currentUser') || '{}');
            this.pgService.getPGsByOwner(owner.id).subscribe(pgs => {
                localStorage.setItem('ownerPGs', JSON.stringify(pgs));
                // Set the newly created one as current
                const newPG = pgs.find(p => p.id === this.createdPGId);
                localStorage.setItem('currentPG', JSON.stringify(newPG));
                this.router.navigate(['/home']);
            });

        } catch (error) {
            this.loading = false;
            this.showToast('Error saving rooms. Please try again.', 'danger');
        }
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
