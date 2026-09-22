import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Student } from '../../models/student.model';
import { Fee } from '../../models/fee.model';
import { FeeService } from '../../services/fee.service';

@Component({
  selector: 'app-fee-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fee-history.component.html',
  styleUrls: ['./fee-history.component.css']
})
export class FeeHistoryComponent implements OnInit {
  @Input() student: Student | null = null;

  fees: Fee[] = [];
  totalPaid = 0;
  loading = false;
  error: string | null = null;

  constructor(private feeService: FeeService) { }

  ngOnInit() {
    if (this.student?.id) {
      this.loadFeeHistory();
      this.loadTotalPaid();
    }
  }

  loadFeeHistory() {
    if (!this.student?.id) return;

    this.loading = true;
    this.error = null;

    this.feeService.getFeesByStudent(this.student.id).subscribe({
      next: (response) => {
        this.fees = response.fees || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading fee history:', error);
        this.error = 'Failed to load payment history. Please try again.';
        this.loading = false;
      }
    });
  }

  loadTotalPaid() {
    if (!this.student?.id) return;

    this.feeService.getTotalByStudent(this.student.id).subscribe({
      next: (response) => {
        this.totalPaid = response.totalPaid || 0;
      },
      error: (error) => {
        console.error('Error loading total paid:', error);
      }
    });
  }

  deleteFee(fee: Fee) {
    if (!fee.id) return;

    const confirmMsg = `Are you sure you want to delete payment of ₹${fee.amount}?\n\nThis action cannot be undone.`;
    if (confirm(confirmMsg)) {
      this.feeService.deleteFee(fee.id).subscribe({
        next: () => {
          alert('✅ Payment deleted successfully!');
          this.loadFeeHistory();
          this.loadTotalPaid();
        },
        error: (error) => {
          console.error('Error deleting fee:', error);
          alert('❌ Failed to delete payment. Please try again.');
        }
      });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }

  sendingLinkId: number | null = null;

  sendLink(fee: Fee) {
    if (!fee.id) return;

    this.sendingLinkId = fee.id;

    this.feeService.sendPaymentLink(fee.id).subscribe({
      next: (response) => {
        alert(`✅ ${response.message}`);
        this.sendingLinkId = null;
      },
      error: (error) => {
        console.error('Error sending payment link:', error);
        alert('❌ Failed to send payment link. Please try again.');
        this.sendingLinkId = null;
      }
    });
  }
}
