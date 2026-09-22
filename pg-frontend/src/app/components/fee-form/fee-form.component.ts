import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student } from '../../models/student.model';
import { Fee } from '../../models/fee.model';

@Component({
  selector: 'app-fee-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fee-form-container">
      <div class="student-info">
        <h3>💳 Add Payment for {{student?.name}}</h3>
        <p>📧 {{student?.email}} • 🏠 Room {{student?.roomNo}}</p>
      </div>

      <form (ngSubmit)="onSubmit()" #feeForm="ngForm">
        <!-- Amount Section -->
        <div class="form-section">
          <h4>💰 Payment Amount</h4>
          
          <div class="form-group">
            <label for="amount">Amount (₹) *</label>
            <input 
              type="number" 
              id="amount" 
              [(ngModel)]="fee.amount" 
              name="amount"
              class="form-control"
              [class.error]="errors.amount"
              placeholder="Enter payment amount"
              min="1"
              step="0.01"
              required>
            <div *ngIf="errors.amount" class="error-message">{{errors.amount}}</div>
          </div>

          <!-- Quick Amount Buttons -->
          <div class="quick-amounts">
            <button type="button" class="quick-btn" (click)="setQuickAmount(5000)">₹5,000</button>
            <button type="button" class="quick-btn" (click)="setQuickAmount(6000)">₹6,000</button>
            <button type="button" class="quick-btn" (click)="setQuickAmount(7000)">₹7,000</button>
            <button type="button" class="quick-btn" (click)="setQuickAmount(8000)">₹8,000</button>
            <button type="button" class="quick-btn" (click)="setQuickAmount(10000)">₹10,000</button>
          </div>
        </div>

        <!-- Payment Details -->
        <div class="form-section">
          <h4>📅 Payment Details</h4>
          
          <div class="form-group">
            <label for="paymentDate">Payment Date *</label>
            <input 
              type="date" 
              id="paymentDate" 
              [(ngModel)]="fee.paymentDate" 
              name="paymentDate"
              class="form-control"
              [class.error]="errors.paymentDate"
              required>
            <div *ngIf="errors.paymentDate" class="error-message">{{errors.paymentDate}}</div>
          </div>

          <div class="form-group">
            <label for="mode">Payment Mode *</label>
            <select 
              id="mode" 
              [(ngModel)]="fee.mode" 
              name="mode"
              class="form-control"
              [class.error]="errors.mode"
              required>
              <option value="">Select payment mode</option>
              <option *ngFor="let mode of paymentModes" [value]="mode.value">
                {{mode.label}}
              </option>
            </select>
            <div *ngIf="errors.mode" class="error-message">{{errors.mode}}</div>
          </div>
        </div>

        <!-- Summary -->
        <div class="payment-summary">
          <h4>📋 Payment Summary</h4>
          <div class="summary-row">
            <span>Student:</span>
            <span>{{student?.name}}</span>
          </div>
          <div class="summary-row">
            <span>Room:</span>
            <span>{{student?.roomNo}}</span>
          </div>
          <div class="summary-row">
            <span>Amount:</span>
            <span class="amount">₹{{fee.amount | number:'1.2-2'}}</span>
          </div>
          <div class="summary-row">
            <span>Date:</span>
            <span>{{fee.paymentDate | date:'mediumDate'}}</span>
          </div>
          <div class="summary-row">
            <span>Mode:</span>
            <span>{{selectedModeLabel}}</span>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" class="btn btn-cancel" (click)="onCancel()">
            ❌ Cancel
          </button>
          <button type="submit" class="btn btn-submit" 
                  [disabled]="!feeForm.form.valid || isLoading">
            💾 {{isLoading ? 'Recording...' : 'Record Payment'}}
          </button>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="error-message">
          {{errorMessage}}
        </div>
      </form>
    </div>
  `,
  styles: [`
    .fee-form-container {
      padding: 25px;
      max-width: 500px;
      margin: 0 auto;
    }

    .student-info {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 12px;
    }

    .student-info h3 {
      margin: 0 0 10px 0;
      font-size: 1.3rem;
      font-weight: 700;
    }

    .student-info p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }

    .form-section {
      margin-bottom: 25px;
      padding: 20px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 10px;
    }

    .form-section h4 {
      margin: 0 0 15px 0;
      color: #2d3436;
      font-size: 1rem;
      font-weight: 700;
      padding-bottom: 8px;
      border-bottom: 2px solid #f1f3f5;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 6px;
      color: #495057;
      font-weight: 600;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 15px;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .form-control:focus {
      border-color: #667eea;
      outline: none;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control.error {
      border-color: #ff6b6b;
      box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
    }

    .error-message {
      color: #ff6b6b;
      font-size: 12px;
      margin-top: 5px;
      font-weight: 500;
    }

    .quick-amounts {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 15px;
    }

    .quick-btn {
      padding: 8px 12px;
      background: linear-gradient(135deg, #74b9ff, #0984e3);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .quick-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(116, 185, 255, 0.4);
    }

    .payment-summary {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 25px;
      border-left: 4px solid #667eea;
    }

    .payment-summary h4 {
      margin: 0 0 15px 0;
      color: #2d3436;
      font-size: 1rem;
      font-weight: 700;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .summary-row:last-child {
      margin-bottom: 0;
    }

    .summary-row span:first-child {
      color: #6c757d;
      font-weight: 500;
    }

    .summary-row span:last-child {
      color: #2d3436;
      font-weight: 600;
    }

    .summary-row .amount {
      font-size: 16px;
      color: #28a745;
      font-weight: 700;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
    }

    .btn {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-cancel {
      background: linear-gradient(135deg, #6c757d, #5a6268);
      color: white;
    }

    .btn-submit {
      background: linear-gradient(135deg, #28a745, #218838);
      color: white;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 600px) {
      .fee-form-container {
        padding: 15px;
      }
      .quick-amounts {
        justify-content: center;
      }
      .form-actions {
        flex-direction: column;
      }
      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class FeeFormComponent implements OnInit {
  @Input() student: Student | null = null;
  @Output() feeSaved = new EventEmitter<Fee>();
  @Output() cancelled = new EventEmitter<void>();

  fee: Fee = {
    studentId: 0,
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    mode: 'CASH',
    status: 'PAID'
  };

  paymentModes = [
    { value: 'CASH', label: '💵 Cash' },
    { value: 'CARD', label: '💳 Card' },
    { value: 'UPI', label: '📱 UPI' },
    { value: 'BANK_TRANSFER', label: '🏦 Bank Transfer' },
    { value: 'CHEQUE', label: '📄 Cheque' }
  ];

  errors: any = {};
  isLoading = false;
  errorMessage: string | null = null;

  // ✅ FIXED: Added getter to handle complex expression
  get selectedModeLabel(): string {
    const selectedMode = this.paymentModes.find(m => m.value === this.fee.mode);
    return selectedMode ? selectedMode.label : this.fee.mode;
  }

  ngOnInit() {
    if (this.student) {
      this.fee.studentId = this.student.id || 0;
    }
    
    this.fee = {
      studentId: this.student?.id || 0,
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      mode: 'CASH',
      status: 'PAID'
    };
  }

  onSubmit() {
    if (this.validateForm()) {
      this.isLoading = true;
      this.errorMessage = null;
      this.feeSaved.emit(this.fee);
      this.isLoading = false;
    }
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.fee.amount || this.fee.amount <= 0) {
      this.errors.amount = 'Amount must be greater than 0';
      isValid = false;
    }

    if (!this.fee.paymentDate) {
      this.errors.paymentDate = 'Payment date is required';
      isValid = false;
    }

    if (!this.fee.mode) {
      this.errors.mode = 'Payment mode is required';
      isValid = false;
    }

    return isValid;
  }

  onCancel() {
    this.cancelled.emit();
  }

  setQuickAmount(amount: number) {
    this.fee.amount = amount;
  }
}
