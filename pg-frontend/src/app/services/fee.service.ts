import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Fee, FeeResponse, TotalResponse, PaymentLinkResponse } from '../models/fee.model';

@Injectable({
  providedIn: 'root'
})
export class FeeService {
  private apiUrl = 'http://localhost:8080/api/fees';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
    console.log('🔧 FeeService initialized with API URL:', this.apiUrl);
  }

  findAll(): Observable<Fee[]> {
    console.log('📋 FeeService.findAll() called');
    return this.http.get<Fee[]>(this.apiUrl)
      .pipe(
        tap(data => console.log('✅ FeeService.findAll() success:', data.length, 'fees')),
        catchError(this.handleError)
      );
  }

  getFeesByPG(pgId: number): Observable<Fee[]> {
    return this.http.get<Fee[]>(`${this.apiUrl}/pg/${pgId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  findById(id: number): Observable<Fee> {
    return this.http.get<Fee>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  create(fee: any): Observable<Fee> {
    console.log('🚀 FeeService.create() called with:', fee);
    return this.http.post<Fee>(this.apiUrl, fee, this.httpOptions)
      .pipe(
        tap(response => console.log('✅ FeeService.create() SUCCESS:', response)),
        catchError(this.handleError)
      );
  }

  update(id: number, fee: Fee): Observable<Fee> {
    return this.http.put<Fee>(`${this.apiUrl}/${id}`, fee, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteFee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getFeesByStudent(studentId: number): Observable<FeeResponse> {
    console.log('📊 FeeService.getFeesByStudent() called for student:', studentId);
    return this.http.get<FeeResponse>(`${this.apiUrl}/student/${studentId}`)
      .pipe(
        tap(response => console.log('✅ Fee history loaded:', response)),
        catchError(this.handleError)
      );
  }

  getTotalByStudent(studentId: number): Observable<TotalResponse> {
    return this.http.get<TotalResponse>(`${this.apiUrl}/student/${studentId}/total`)
      .pipe(
        catchError(this.handleError)
      );
  }

  findByStudentId(studentId: number): Observable<Fee[]> {
    return this.getFeesByStudent(studentId).pipe(
      tap(response => console.log('✅ Fees for student loaded:', response.fees)),
      catchError(this.handleError)
    ) as any;
  }

  deleteById(id: number): Observable<any> {
    return this.deleteFee(id);
  }

  existsById(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${id}/exists`)
      .pipe(
        catchError(this.handleError)
      );
  }

  sendPaymentLink(feeId: number): Observable<PaymentLinkResponse> {
    console.log('📧 Sending payment link for fee:', feeId);
    // Corrected endpoint: /api/payments/send-link/{feeId}
    const paymentApiUrl = 'http://localhost:8080/api/payments';
    return this.http.post<PaymentLinkResponse>(`${paymentApiUrl}/send-link/${feeId}`, {}, this.httpOptions)
      .pipe(
        tap(response => console.log('✅ Payment link sent successfully:', response)),
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('🚨 FeeService Error:', error);
    return throwError(() => error);
  }
}
