import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = 'http://localhost:8080/api/rooms';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
    console.log('🔧 RoomService initialized with API URL:', this.apiUrl);
  }

  findAll(): Observable<Room[]> {
    console.log('🏠 RoomService.findAll() called');
    return this.http.get<Room[]>(this.apiUrl)
      .pipe(
        tap(data => console.log('✅ RoomService.findAll() success:', data.length, 'rooms')),
        catchError(this.handleError)
      );
  }

  findById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  findByRoomNumber(roomNumber: string): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/number/${roomNumber}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  findAvailableRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/available`)
      .pipe(
        catchError(this.handleError)
      );
  }

  findBookedRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/booked`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getRoomsByPG(pgId: number): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/pg/${pgId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  save(room: Room): Observable<Room> {
    if (room.id) {
      return this.http.put<Room>(`${this.apiUrl}/${room.id}`, room, this.httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    } else {
      return this.http.post<Room>(this.apiUrl, room, this.httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }
  }

  bookRoom(roomId: number, studentId: number): Observable<Room> {
    return this.http.post<Room>(`${this.apiUrl}/book/${roomId}/student/${studentId}`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  unbookRoom(roomId: number): Observable<Room> {
    return this.http.post<Room>(`${this.apiUrl}/unbook/${roomId}`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('🚨 RoomService Error:', error);
    return throwError(() => error);
  }
}
