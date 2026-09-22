import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:8080/api/students';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
    console.log('🔧 StudentService initialized with API URL:', this.apiUrl);
  }

  getAll(): Observable<Student[]> {
    console.log('📋 StudentService.getAll() called');
    return this.http.get<Student[]>(this.apiUrl)
      .pipe(
        tap(data => console.log('✅ StudentService.getAll() success:', data.length, 'students')),
        catchError(this.handleError)
      );
  }

  getStudentsByPG(pgId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/pg/${pgId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  findById(id: number): Observable<Student> {
    console.log('🔍 StudentService.findById() called:', id);
    return this.http.get<Student>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(data => console.log('✅ StudentService.findById() success:', data)),
        catchError(this.handleError)
      );
  }

  create(student: Student): Observable<Student> {
    console.log('🚀 StudentService.create() called with:', student);
    return this.http.post<Student>(this.apiUrl, student, this.httpOptions)
      .pipe(
        tap(response => console.log('✅ StudentService.create() SUCCESS:', response)),
        catchError(this.handleError)
      );
  }

  update(id: number, student: Student): Observable<Student> {
    console.log('📝 StudentService.update() called:', id, student);
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student, this.httpOptions)
      .pipe(
        tap(response => console.log('✅ Update success:', response)),
        catchError(this.handleError)
      );
  }

  delete(id: number): Observable<any> {
    console.log('🗑️ StudentService.delete() called:', id);
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  forceDelete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/force`)
      .pipe(
        catchError(this.handleError)
      );
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, {}, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  existsByEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/email/${email}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  existsByRoomNo(roomNo: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/room/${roomNo}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  findByRoomNo(roomNo: string): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/room/${roomNo}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  findByEmailContainingIgnoreCase(email: string): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/search/email/${email}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  search(params: any): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/search`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('🚨 StudentService Error:', error);
    return throwError(() => error);
  }
}
