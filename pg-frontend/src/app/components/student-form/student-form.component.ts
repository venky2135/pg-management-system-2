import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';
import { RoomSelectionComponent } from '../room-selection/room-selection.component';
import {
  IonItem, IonInput, IonLabel, IonButton, IonIcon, IonAvatar,
  IonCheckbox, IonDatetime, IonDatetimeButton, IonModal, IonContent,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonFabButton,
  IonCard, IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, mailOutline, callOutline, calendarOutline, cameraOutline,
  arrowBackOutline, createOutline, bedOutline, chevronForwardOutline, trashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RoomSelectionComponent,
    IonItem, IonInput, IonLabel, IonButton, IonIcon, IonAvatar,
    IonCheckbox, IonDatetime, IonDatetimeButton, IonModal, IonContent,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonFabButton,
    IonCard, IonCardContent
  ],
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})
export class StudentFormComponent implements OnInit {
  @Input() student: Student | null = null;
  @Input() isEditMode: boolean = false;
  @Output() studentSaved = new EventEmitter<Student>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() deleteRequested = new EventEmitter<Student>();

  formStudent: Student = {
    name: '',
    email: '',
    phone: '',
    roomNo: '',
    profileImage: '',
    joinDate: new Date().toISOString().split('T')[0],
    isActive: true
  };

  showRoomSelection = false;
  errors: any = {};
  formError: string | null = null;

  constructor(private cdr: ChangeDetectorRef, private studentService: StudentService) {
    console.log('StudentFormComponent initialized');
    addIcons({
      personOutline, mailOutline, callOutline, calendarOutline, cameraOutline,
      arrowBackOutline, createOutline, bedOutline, chevronForwardOutline, trashOutline
    });
  }

  ngOnInit() {
    if (this.student && this.isEditMode) {
      this.formStudent = { ...this.student };
      if (this.formStudent.joinDate) {
        this.formStudent.joinDate = new Date(this.formStudent.joinDate).toISOString().split('T')[0];
      }
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.formStudent = {
      name: '',
      email: '',
      phone: '',
      roomNo: '',
      profileImage: '',
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true
    };
    this.errors = {};
    this.formError = null;
  }

  onSubmit() {
    this.formError = null;
    if (!this.validateForm()) return;

    if (this.isEditMode && this.student?.id !== undefined) {
      this.studentService.update(this.student.id, this.formStudent).subscribe({
        next: (response) => {
          this.studentSaved.emit(response);
          this.resetForm();
        },
        error: (err) => {
          this.formError = err.error?.error || 'Error updating student';
        }
      });
    } else {
      this.studentService.create(this.formStudent).subscribe({
        next: (response) => {
          this.studentSaved.emit(response);
          this.resetForm();
        },
        error: (err) => {
          this.formError = err.error?.error || 'Error adding student';
        }
      });
    }
  }

  onCancel() {
    this.cancelled.emit();
  }

  onDelete() {
    if (this.student) {
      this.deleteRequested.emit(this.student);
    }
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.formStudent.name?.trim()) {
      this.errors.name = 'Name is required';
      isValid = false;
    }

    if (!this.formStudent.email?.trim()) {
      this.errors.email = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.formStudent.email)) {
      this.errors.email = 'Invalid email format';
      isValid = false;
    }

    if (!this.formStudent.phone?.trim()) {
      this.errors.phone = 'Phone is required';
      isValid = false;
    } else if (!this.isValidPhone(this.formStudent.phone)) {
      this.errors.phone = 'Phone must be 10 digits';
      isValid = false;
    }

    if (!this.formStudent.roomNo?.trim()) {
      this.errors.roomNo = 'Room number is required';
      isValid = false;
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = phone.replace(/\D/g, '');
    return phoneRegex.test(cleanPhone);
  }

  onRoomSelected(roomNumber: string) {
    this.formStudent.roomNo = roomNumber;
    this.showRoomSelection = false;
    this.cdr.detectChanges();
  }

  openRoomSelection() {
    this.showRoomSelection = true;
    this.cdr.detectChanges();
  }

  closeRoomSelection() {
    this.showRoomSelection = false;
    this.cdr.detectChanges();
  }

  onProfileImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.formStudent.profileImage = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfileImage() {
    this.formStudent.profileImage = '';
    this.cdr.detectChanges();
  }
}
