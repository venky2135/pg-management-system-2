import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Room } from '../../models/room.model';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { PGService } from '../../services/pg.service';
import {
  IonGrid, IonRow, IonCol,
  IonButton, IonIcon, IonSelect, IonSelectOption,
  IonSpinner, IonContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bedOutline, checkmarkCircleOutline, closeOutline, refreshOutline, alertCircleOutline, snowOutline, flameOutline, searchOutline, filterOutline, addOutline } from 'ionicons/icons';

@Component({
  selector: 'app-room-selection',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonGrid, IonRow, IonCol,
    IonButton, IonIcon, IonSelect, IonSelectOption,
    IonSpinner, IonContent
  ],
  templateUrl: './room-selection.component.html',
  styleUrls: ['./room-selection.component.css']
})
export class RoomSelectionComponent implements OnInit {
  @Output() roomSelected = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  private router = inject(Router);

  allRooms: Room[] = [];
  filteredRooms: Room[] = [];
  loading = false;
  error: string | null = null;

  // Filters and UI state
  selectedFloor: string = 'all';
  selectedType: string = 'all';
  selectedAc: string = 'all';
  availableOnly: boolean = false;

  floors: string[] = ['all', '1', '2', '3']; // Example floors; could be dynamically loaded
  roomTypes: string[] = ['all', 'SINGLE', 'DOUBLE', 'TRIPLE', '4_SHARING', '5_SHARING', '6_SHARING', '7_SHARING', '8_SHARING', '9_SHARING', '10_SHARING'];

  formatRoomType(type: string): string {
    if (!type) return '';
    if (type === 'SINGLE') return 'Single';
    if (type === 'DOUBLE') return 'Double';
    if (type === 'TRIPLE') return 'Triple';
    return type.replace('_SHARING', ' Sharing').replace('_', ' ');
  }

  // Grouping
  groupedRooms: { floor: string, rooms: Room[] }[] = [];

  constructor(
    private roomService: RoomService,
    private pgService: PGService
  ) {
    addIcons({ bedOutline, checkmarkCircleOutline, closeOutline, refreshOutline, alertCircleOutline, snowOutline, flameOutline, searchOutline, filterOutline, addOutline });
  }

  ngOnInit() {
    this.pgService.currentPG$.subscribe(pg => {
      if (pg) {
        this.loadRooms(pg.id);
      } else {
        this.error = 'No PG selected. Please select a PG from the home screen.';
        this.loading = false;
      }
    });
  }

  loadRooms(pgId?: number) {
    this.loading = true;
    this.error = null;

    if (!pgId) {
      const currentPG = this.pgService.getCurrentPG();
      if (currentPG) {
        pgId = currentPG.id;
      } else {
        this.error = 'No PG selected. Please select a PG from the home screen.';
        this.loading = false;
        return;
      }
    }

    this.roomService.getRoomsByPG(pgId!).subscribe({
      next: (rooms) => {
        this.allRooms = rooms;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load rooms. Please try again.';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let rooms = [...this.allRooms];

    if (this.selectedFloor !== 'all') {
      rooms = rooms.filter(r => r.floor === this.selectedFloor);
    }
    if (this.selectedType !== 'all') {
      rooms = rooms.filter(r => r.roomType === this.selectedType);
    }
    if (this.selectedAc !== 'all') {
      const isAcRequired = this.selectedAc === 'ac';
      rooms = rooms.filter(r => r.isAc === isAcRequired);
    }
    if (this.availableOnly) {
      rooms = rooms.filter(r => !r.isBooked);
    }

    this.filteredRooms = rooms;
    this.groupRoomsByFloor();
  }

  groupRoomsByFloor() {
    const groups: { [key: string]: Room[] } = {};

    this.filteredRooms.forEach(room => {
      const floor = room.floor || 'Ground'; // Default to Ground if null
      if (!groups[floor]) {
        groups[floor] = [];
      }
      groups[floor].push(room);
    });

    // Convert to array and sort
    this.groupedRooms = Object.keys(groups).map(floor => ({
      floor: floor,
      rooms: groups[floor]
    })).sort((a, b) => {
      if (a.floor === 'Ground') return -1;
      if (a.floor === 'Ground') return 1;
      return a.floor.localeCompare(b.floor, undefined, { numeric: true });
    });
  }

  resetFilters() {
    this.selectedFloor = 'all';
    this.selectedType = 'all';
    this.selectedAc = 'all';
    this.availableOnly = false;
    this.applyFilters();
  }

  toggleAc(value: string) {
    if (this.selectedAc === value) {
      this.selectedAc = 'all';
    } else {
      this.selectedAc = value;
    }
    this.applyFilters();
  }

  toggleAvailable() {
    this.availableOnly = !this.availableOnly;
    this.applyFilters();
  }

  selectFloor(floor: string) {
    if (this.selectedFloor === floor) {
      this.selectedFloor = 'all';
    } else {
      this.selectedFloor = floor;
    }
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  select(room: Room) {
    if (room.isBooked) {
      return;
    }
    if (this.roomSelected.observed) {
      this.roomSelected.emit(room.roomNumber);
    } else {
      this.router.navigate(['/add-student'], { queryParams: { roomNo: room.roomNumber } });
    }
  }

  addStudent(room: Room, event: MouseEvent) {
    event.stopPropagation();
    if (room.isBooked) {
      return;
    }
    if (this.roomSelected.observed) {
      this.roomSelected.emit(room.roomNumber);
    } else {
      this.router.navigate(['/add-student'], { queryParams: { roomNo: room.roomNumber } });
    }
  }

  cancel() {
    if (this.cancelled.observed) {
      this.cancelled.emit();
    } else {
      this.router.navigate(['/home']);
    }
  }

  getRoomStatusText(room: Room): string {
    return room.isBooked ? 'BOOKED' : 'AVAILABLE';
  }

  getRoomStatusColor(room: Room): string {
    return room.isBooked ? 'danger' : 'success';
  }
}
