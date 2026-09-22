import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Student } from '../../models/student.model';
import { Fee } from '../../models/fee.model';
import { FeeService } from '../../services/fee.service';
import { FeeHistoryComponent } from '../fee-history/fee-history.component';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, FeeHistoryComponent],
  template: `
    <div class="student-management">
      <!-- Header Section (matches main app style) -->
      <div class="header">
        <div class="header-content">
          <h1>👤 Student Profile</h1>
          <p>Detailed view and payment history for {{student.name}}</p>
        </div>
      </div>

      <!-- Student Profile Card -->
      <div class="student-card">
        <div class="student-header">
          <div class="profile-section">
            <div class="profile-image">
              <img *ngIf="student.profileImage" 
                   [src]="student.profileImage" 
                   [alt]="student.name"
                   class="profile-img" />
              <div *ngIf="!student.profileImage" class="no-profile-img">👤</div>
            </div>
            
            <div class="student-info">
              <h3>{{student.name}}</h3>
              <span class="status-badge" [class]="student.isActive ? 'active' : 'inactive'">
                {{student.isActive ? 'Active' : 'Inactive'}}
              </span>
            </div>
          </div>
        </div>

        <!-- Student Details -->
        <div class="student-details">
          <div class="detail-row">
            <span class="label">📧 Email:</span>
            <span class="value">{{student.email}}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">📱 Phone:</span>
            <span class="value">{{student.phone}}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">🏠 Room:</span>
            <span class="value">
              <span class="room-number">{{student.roomNo || 'Not Assigned'}}</span>
            </span>
          </div>
          
          <div class="detail-row">
            <span class="label">📅 Joined:</span>
            <span class="value">{{formatDate(student.joinDate)}}</span>
          </div>
        </div>

        <!-- Payment Summary Section -->
        <div class="fee-section">
          <h4>💰 Payment Summary</h4>
          
          <div class="payment-summary-grid">
            <div class="summary-item">
              <span class="summary-label">Total Paid:</span>
              <span class="summary-value total">₹{{totalPaid | number}}</span>
            </div>
            
            <div class="summary-item">
              <span class="summary-label">Pending:</span>
              <span class="summary-value pending">₹{{pendingAmount | number}}</span>
            </div>
            
            <div class="summary-item">
              <span class="summary-label">Last Payment:</span>
              <span class="summary-value">{{lastPaymentDate || 'No payments yet'}}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment History Section -->
      <div class="student-card">
        <app-fee-history [student]="student"></app-fee-history>
      </div>
    </div>
  `,
  styles: [`
    /* ✅ UNIFIED STYLING - MATCHES MAIN APP THEME */
    .student-management {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      background: #f5f6fa !important;
      min-height: 100vh;
      color: #2c3e50 !important;
    }

    /* Header - matches main app style */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 25px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      border-radius: 15px;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      color: white !important;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 2.2rem;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      color: white !important;
    }

    .header-content p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
      color: white !important;
    }

    /* Student Card - matches main app cards */
    .student-card {
      background: white !important;
      border-radius: 16px;
      padding: 25px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      border: 1px solid #f1f3f5;
      margin-bottom: 25px;
      color: #2c3e50 !important;
    }

    .student-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
    }

    /* Student Header */
    .student-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f8f9fa;
    }

    .profile-section {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .profile-image {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #667eea;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .profile-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-profile-img {
      font-size: 48px;
      color: white;
    }

    .student-info h3 {
      margin: 0 0 10px 0;
      color: #2d3436 !important;
      font-size: 1.8rem;
      font-weight: 700;
    }

    /* Status Badge */
    .status-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.active {
      background: linear-gradient(135deg, #00d2d3, #54a0ff);
      color: white;
    }

    .status-badge.inactive {
      background: linear-gradient(135deg, #ff6b6b, #ee5a52);
      color: white;
    }

    /* Student Details */
    .student-details {
      margin-bottom: 25px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #f8f9fa;
    }

    .detail-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .detail-row .label {
      font-weight: 600;
      color: #6c757d !important;
      font-size: 14px;
      flex-shrink: 0;
    }

    .detail-row .value {
      color: #2d3436 !important;
      font-size: 14px;
      text-align: right;
      word-break: break-word;
    }

    .room-number {
      background: linear-gradient(135deg, #74b9ff, #0984e3);
      color: white !important;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 13px;
    }

    /* Fee Section */
    .fee-section {
      border-top: 2px solid #f8f9fa;
      padding-top: 20px;
      margin-top: 20px;
    }

    .fee-section h4 {
      color: #2d3436 !important;
      margin-bottom: 15px;
      font-size: 1.1rem;
      font-weight: 700;
    }

    /* Payment Summary Grid */
    .payment-summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
      border-left: 4px solid #667eea;
    }

    .summary-label {
      font-weight: 600;
      color: #6c757d !important;
      font-size: 14px;
    }

    .summary-value {
      font-weight: 700;
      color: #2d3436 !important;
      font-size: 16px;
    }

    .summary-value.total {
      color: #28a745 !important;
    }

    .summary-value.pending {
      color: #dc3545 !important;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .student-management {
        padding: 15px;
      }

      .header {
        padding: 20px;
      }

      .header-content h1 {
        font-size: 1.8rem;
      }

      .profile-section {
        flex-direction: column;
        text-align: center;
        gap: 15px;
      }

      .profile-image {
        width: 100px;
        height: 100px;
      }

      .student-info h3 {
        font-size: 1.5rem;
      }

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }

      .detail-row .value {
        text-align: left;
      }

      .payment-summary-grid {
        grid-template-columns: 1fr;
      }
    }

    /* ✅ FORCE LIGHT MODE - OVERRIDE ANY DARK THEME */
    @media (prefers-color-scheme: dark) {
      .student-management {
        background: #f5f6fa !important;
        color: #2c3e50 !important;
      }
      
      .student-card {
        background: white !important;
        color: #2c3e50 !important;
      }
      
      .detail-row .label,
      .detail-row .value,
      .student-info h3,
      .fee-section h4,
      .summary-label,
      .summary-value {
        color: #2c3e50 !important;
      }
      
      .summary-value.total {
        color: #28a745 !important;
      }
      
      .summary-value.pending {
        color: #dc3545 !important;
      }
    }
  `]
})
export class StudentDetailComponent implements OnInit {
  @Input() student!: Student;
  
  totalPaid = 0;
  pendingAmount = 0;
  lastPaymentDate: string | null = null;

  constructor(private feeService: FeeService) {}

  ngOnInit() {
    if (this.student?.id) {
      this.loadPaymentSummary();
    }
  }

  loadPaymentSummary() {
    this.feeService.getTotalByStudent(this.student.id!).subscribe({
      next: (response) => {
        this.totalPaid = response.totalPaid || 0;
      },
      error: (error) => console.error('Error loading total paid:', error)
    });

    this.feeService.getFeesByStudent(this.student.id!).subscribe({
      next: (response) => {
        const fees = response.fees || [];
        if (fees.length > 0) {
          const sortedFees = fees.sort((a: any, b: any) => 
            new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
          );
          this.lastPaymentDate = this.formatDate(sortedFees[0].paymentDate);
        }
      },
      error: (error) => console.error('Error loading payment history:', error)
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
