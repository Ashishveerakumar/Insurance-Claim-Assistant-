import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class MyPlansService {

  private apiUrl = 'http://localhost:5000/api/my-plans';

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) { }

  cancelPlan(planId: string): Observable<any> {
    const token = this.tokenStorage.getAccessToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/${planId}`, { headers });
  }

  getMyPlans(): Observable<any> {
    const token = this.tokenStorage.getAccessToken();
    console.log('Token from storage:', token);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(this.apiUrl, { headers });
  }


}