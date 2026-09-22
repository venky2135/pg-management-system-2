import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';
import { FeeService } from '../../services/fee.service';
import { RoomService } from '../../services/room.service';
import { StudentFormComponent } from '../student-form/student-form.component';
import { FeeFormComponent } from '../fee-form/fee-form.component';
import { FeeHistoryComponent } from '../fee-history/fee-history.component';
import { PGService } from '../../services/pg.service';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonFab, IonFabButton,
  IonModal, IonButtons, IonGrid, IonRow, IonCol, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline, filterOutline, alertCircleOutline, sadOutline, personOutline,
  bedOutline, addOutline, trashOutline, createOutline, mailOutline, callOutline,
  calendarOutline, checkmarkCircleOutline, closeOutline, warningOutline, timeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, StudentFormComponent, FeeFormComponent, FeeHistoryComponent,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonFab, IonFabButton,
    IonModal, IonButtons, IonGrid, IonRow, IonCol, IonSpinner
  ],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  loading = false;
  error: string | null = null;
  searchName = '';
  searchRoomNo = '';
  statusFilter = 'all';
  acFilter = 'all'; // 'all', 'ac', 'non-ac'
  showStudentModal = false;
  showFeeModal = false;
  showFeeHistoryModal = false;
  selectedStudent: Student | null = null;
  isEditMode = false;
  roomAcMap: { [key: string]: boolean } = {};

  constructor(
    private studentService: StudentService,
    private feeService: FeeService,
    private roomService: RoomService,
    private pgService: PGService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      searchOutline, filterOutline, alertCircleOutline, sadOutline, personOutline,
      bedOutline, addOutline, trashOutline, createOutline, mailOutline, callOutline,
      calendarOutline, checkmarkCircleOutline, closeOutline, warningOutline, timeOutline
    });
  }

  ngOnInit() {
    this.pgService.currentPG$.subscribe(pg => {
      if (pg) {
        this.loadRooms(pg.id);
        this.loadStudents(pg.id);
      } else {
        this.error = 'No PG selected';
        this.loading = false;
      }
    });
  }

  loadRooms(pgId: number) {
    this.roomService.getRoomsByPG(pgId).subscribe(rooms => {
      rooms.forEach(room => {
        this.roomAcMap[room.roomNumber] = room.isAc;
      });
      this.applyFilters();
    });
  }

  loadStudents(pgId?: number) {
    this.loading = true;
    this.error = null;

    if (!pgId) {
      const currentPG = this.pgService.getCurrentPG();
      if (currentPG) {
        pgId = currentPG.id;
      } else {
        this.error = 'No PG selected';
        this.loading = false;
        return;
      }
    }

    this.studentService.getStudentsByPG(pgId!).subscribe({
      next: (data) => {
        console.log('Student List Data:', data);
        this.students = data;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load students. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    let filtered = [...this.students];
    if (this.searchName) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(this.searchName.toLowerCase())
      );
    }
    if (this.searchRoomNo) {
      filtered = filtered.filter(student =>
        student.roomNo?.toLowerCase().includes(this.searchRoomNo.toLowerCase())
      );
    }
    if (this.statusFilter === 'active') {
      filtered = filtered.filter(student => student.isActive !== false);
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(student => student.isActive === false);
    }

    // AC/Non-AC filtering
    if (this.acFilter !== 'all') {
      const isAcRequired = this.acFilter === 'ac';
      filtered = filtered.filter(student => {
        const isAc = this.roomAcMap[student.roomNo] || false;
        return isAc === isAcRequired;
      });
    }

    this.filteredStudents = filtered;
  }

  clearSearch() {
    this.searchName = '';
    this.searchRoomNo = '';
    this.statusFilter = 'all';
    this.acFilter = 'all';
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  addStudent() {
    this.selectedStudent = null;
    this.isEditMode = false;
    this.showStudentModal = true;
    this.cdr.detectChanges();
  }

  editStudent(student: Student) {
    this.selectedStudent = { ...student };
    this.isEditMode = true;
    this.showStudentModal = true;
    this.cdr.detectChanges();
  }

  onDeleteRequested(student: Student) {
    this.deleteStudent(student);
  }

  deleteStudent(student: Student) {
    const confirmMessage = `Are you sure you want to delete ${student.name}? This action cannot be undone.`;
    if (confirm(confirmMessage)) {
      this.studentService.delete(student.id!).subscribe({
        next: () => {
          alert('✅ Student deleted successfully!');
          this.loadStudents();
          this.closeStudentModal();
        },
        error: (errorResponse) => {
          if (errorResponse.error?.error?.includes('Cannot delete student with existing fee records')) {
            const feeCount = errorResponse.error.feeCount || 'some';
            const choice = confirm(
              `❌ Cannot delete ${student.name} - has ${feeCount} payment record(s).\n` +
              `Click OK to DELETE ALL payment records and the student (PERMANENT).\n` +
              `Click Cancel to just deactivate the student (RECOMMENDED).`
            );
            if (choice) {
              if (confirm(`⚠️ FINAL WARNING ⚠️\nThis will PERMANENTLY delete:\n• ${student.name}\n• All ${feeCount} payment records\n\nAre you absolutely sure?`)) {
                this.forceDeleteStudent(student);
              }
            } else {
              this.deactivateStudent(student);
            }
          } else {
            alert(`❌ Error deleting student: ${errorResponse.error?.error || errorResponse.error?.message || 'Unknown error'}`);
          }
        }
      });
    }
  }

  forceDeleteStudent(student: Student) {
    this.studentService.forceDelete(student.id!).subscribe({
      next: (response) => {
        const deletedFees = response.deletedFees || 0;
        alert(`✅ Successfully deleted ${student.name} and ${deletedFees} payment records!`);
        this.loadStudents();
        this.closeStudentModal();
      },
      error: (error) => {
        alert(`❌ Error force deleting student: ${error.error?.error || 'Unknown error'}`);
      }
    });
  }

  deactivateStudent(student: Student) {
    this.studentService.toggleStatus(student.id!).subscribe({
      next: () => {
        alert(`✅ ${student.name} has been deactivated successfully! Data preserved but student marked as inactive.`);
        this.loadStudents();
      },
      error: (error) => {
        alert(`❌ Error deactivating student: ${error.error?.error || 'Unknown error'}`);
      }
    });
  }

  toggleStudentStatus(student: Student) {
    const action = student.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} ${student.name}?`)) {
      this.studentService.toggleStatus(student.id!).subscribe({
        next: (response) => {
          const newStatus = response.student.isActive ? 'activated' : ' deactivated';
          alert(`✅ ${student.name} has been ${newStatus} successfully!`);
          this.loadStudents();
        },
        error: (error) => {
          alert(`❌ Error updating student status: ${error.error?.error || 'Unknown error'}`);
        }
      });
    }
  }

  addFee(student: Student) {
    this.selectedStudent = student;
    this.showFeeModal = true;
    this.cdr.detectChanges();
  }

  viewFeeHistory(student: Student) {
    this.selectedStudent = student;
    this.showFeeHistoryModal = true;
    this.cdr.detectChanges();
  }

  onStudentSaved(student: Student) {
    if (!student) {
      alert('❌ Invalid student data received');
      return;
    }
    if (!student.name || !student.email || !student.phone || !student.roomNo) {
      alert('❌ Missing required fields. Please fill all mandatory fields.');
      return;
    }
    if (this.isEditMode && student.id) {
      this.studentService.update(student.id, student).subscribe({
        next: () => {
          alert('✅ Student updated successfully!');
          this.loadStudents();
          this.closeStudentModal();
        },
        error: (error) => {
          alert(`❌ ${error.error?.error || error.error?.message || 'Error updating student'} `);
        }
      });
    } else {
      const newStudent = { ...student };
      delete newStudent.id;
      this.studentService.create(newStudent).subscribe({
        next: () => {
          alert('✅ Student added successfully!');
          this.loadStudents();
          this.closeStudentModal();
        },
        error: (error) => {
          alert(`❌ ${error.error?.error || error.error?.message || 'Error creating student'} `);
        }
      });
    }
  }

  onFeeSaved(feeData: any) {
    if (!this.selectedStudent?.id) {
      alert('❌ No student selected for fee payment');
      return;
    }
    const fee = {
      ...feeData,
      studentId: this.selectedStudent.id
    };
    this.feeService.create(fee).subscribe({
      next: () => {
        alert('✅ Fee added successfully!');
        this.closeFeeModal();
        this.loadStudents();
      },
      error: (error) => {
        alert(`❌ ${error.error?.error || error.error?.message || 'Error adding fee'} `);
      }
    });
  }

  closeStudentModal() {
    this.showStudentModal = false;
    this.selectedStudent = null;
    this.isEditMode = false;
    this.cdr.detectChanges();
  }

  closeFeeModal() {
    this.showFeeModal = false;
    this.selectedStudent = null;
    this.cdr.detectChanges();
  }

  closeFeeHistoryModal() {
    this.showFeeHistoryModal = false;
    this.selectedStudent = null;
    this.cdr.detectChanges();
  }

  getStudentStatusText(student: Student): string {
    return student.isActive !== false ? 'Active' : 'Inactive';
  }

  getStudentStatusClass(student: Student): string {
    return student.isActive !== false ? 'status-active' : 'status-inactive';
  }

  getProfileImageUrl(student: Student): string {
    const baseUrl = 'http://localhost:8080/api/students';
    return student.profileImage ? `${baseUrl}/${student.id}/profile-image` : 'assets/shapes.svg';
  }

  hasProfileImage(student: Student): boolean {
    return !!student.profileImage;
  }

  formatJoinDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}