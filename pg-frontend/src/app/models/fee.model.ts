export interface Fee {
  id?: number;
  studentId: number;
  amount: number;
  paymentDate: string;
  mode: string;
  status: string;
  studentName?: string;
  studentEmail?: string;
}

export interface FeeResponse {
  fees: Fee[];
  studentName?: string;
  studentEmail?: string;
}

export interface TotalResponse {
  totalPaid: number;
  paymentCount?: number;
}

export interface PaymentLinkResponse {
  message: string;
  link_url: string;
}
