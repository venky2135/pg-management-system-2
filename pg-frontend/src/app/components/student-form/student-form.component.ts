import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';
import { RoomSelectionComponent } from '../room-selection/room-selection.component';
import {
  IonItem, IonInput, IonLabel, IonButton, IonIcon, IonAvatar,
  IonCheckbox, IonDatetime, IonDatetimeButton, IonModal, IonContent,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonFabButton,
  IonCard, IonCardContent, IonSpinner, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, mailOutline, callOutline, calendarOutline, cameraOutline,
  arrowBackOutline, createOutline, bedOutline, chevronForwardOutline, trashOutline,
  alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RoomSelectionComponent,
    IonItem, IonInput, IonLabel, IonButton, IonIcon, IonAvatar,
    IonCheckbox, IonDatetime, IonDatetimeButton, IonModal, IonContent,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonFabButton,
    IonCard, IonCardContent, IonSpinner
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

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastController = inject(ToastController);

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
  errors: Record<string, string> = {};
  formError: string | null = null;
  submitting = false;

  constructor(private cdr: ChangeDetectorRef, private studentService: StudentService) {
    console.log('StudentFormComponent initialized');
    addIcons({
      personOutline, mailOutline, callOutline, calendarOutline, cameraOutline,
      arrowBackOutline, createOutline, bedOutline, chevronForwardOutline, trashOutline,
      alertCircleOutline
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
      this.route.queryParams.subscribe(params => {
        if (params['roomNo']) {
          this.formStudent.roomNo = params['roomNo'];
          this.cdr.detectChanges();
        }
      });
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
    this.submitting = false;
  }

  clearError(field: string) {
    if (this.errors[field]) {
      delete this.errors[field];
    }
    this.formError = null;
  }

  async onSubmit() {
    this.formError = null;
    if (!this.validateForm()) {
      return;
    }

    this.submitting = true;

    if (this.isEditMode && this.student?.id !== undefined) {
      this.studentService.update(this.student.id, this.formStudent).subscribe({
        next: async (response) => {
          this.submitting = false;
          this.studentSaved.emit(response);
          this.resetForm();

          const toast = await this.toastController.create({
            message: 'Tenant updated successfully!',
            duration: 2500,
            color: 'success',
            position: 'top'
          });
          await toast.present();

          if (!this.student) {
            this.router.navigate(['/students']);
          }
        },
        error: (err) => {
          this.submitting = false;
          this.formError = err.error?.error || err.error?.message || 'Error updating student';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.studentService.create(this.formStudent).subscribe({
        next: async (response) => {
          this.submitting = false;
          this.studentSaved.emit(response);
          this.resetForm();

          const toast = await this.toastController.create({
            message: 'Tenant added successfully!',
            duration: 2500,
            color: 'success',
            position: 'top'
          });
          await toast.present();

          if (!this.student) {
            this.router.navigate(['/students']);
          }
        },
        error: (err) => {
          this.submitting = false;
          this.formError = err.error?.error || err.error?.message || 'Error adding student';
          this.cdr.detectChanges();
        }
      });
    }
  }

  onCancel() {
    this.cancelled.emit();
    // If opened as a page route, navigate back to students
    if (!this.student) {
      this.router.navigate(['/students']);
    }
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
      this.errors['name'] = 'Full Name is required';
      isValid = false;
    }

    if (!this.formStudent.phone?.trim()) {
      this.errors['phone'] = 'Phone Number is required';
      isValid = false;
    } else if (!this.isValidPhone(this.formStudent.phone)) {
      this.errors['phone'] = 'Phone must be a valid 10-digit number';
      isValid = false;
    }

    if (!this.formStudent.email?.trim()) {
      this.errors['email'] = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.formStudent.email)) {
      this.errors['email'] = 'Please enter a valid email address (e.g., name@gmail.com)';
      isValid = false;
    }

    if (!this.formStudent.roomNo?.trim()) {
      this.errors['roomNo'] = 'Please select a room';
      isValid = false;
    }

    this.cdr.detectChanges();
    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email.trim());
  }

  isValidPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 10;
  }

  onRoomSelected(roomNumber: string) {
    this.formStudent.roomNo = roomNumber;
    this.clearError('roomNo');
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
