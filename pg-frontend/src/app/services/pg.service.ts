import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PGService {
  private apiUrl = 'http://localhost:8080/api';

  private currentPGSubject = new BehaviorSubject<any>(null);
  currentPG$ = this.currentPGSubject.asObservable();

  private ownerPGsSubject = new BehaviorSubject<any[]>([]);
  ownerPGs$ = this.ownerPGsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const pgData = localStorage.getItem('currentPG');
    if (pgData) {
      this.currentPGSubject.next(JSON.parse(pgData));
    }

    const pgsData = localStorage.getItem('ownerPGs');
    if (pgsData) {
      this.ownerPGsSubject.next(JSON.parse(pgsData));
    }
  }

  setCurrentPG(pg: any) {
    localStorage.setItem('currentPG', JSON.stringify(pg));
    this.currentPGSubject.next(pg);
  }

  setOwnerPGs(pgs: any[]) {
    localStorage.setItem('ownerPGs', JSON.stringify(pgs));
    this.ownerPGsSubject.next(pgs);

    // If no current PG is selected, select the first one
    if (!this.currentPGSubject.value && pgs.length > 0) {
      this.setCurrentPG(pgs[0]);
    }
  }

  getCurrentPG() {
    return this.currentPGSubject.value;
  }

  // PG Management
  createPG(ownerId: number, pgData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/pgs?ownerId=${ownerId}`, pgData);
  }

  getPGsByOwner(ownerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pgs/owner/${ownerId}`);
  }

  updatePG(pgId: number, pgData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/pgs/${pgId}`, pgData);
  }

  getFloorsByPG(pgId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/floors/pg/${pgId}`);
  }

  // Floor Management
  createFloorsBulk(pgId: number, floors: any[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/floors/pg/${pgId}/bulk`, floors);
  }

  // Room Management
  createRoomsBulk(floorId: number, rooms: any[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/rooms/floor/${floorId}/bulk`, rooms);
  }
}
