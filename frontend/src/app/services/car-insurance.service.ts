import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CarInsuranceService {
  private apiUrl = 'http://localhost:5000/api/car-insurance';

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) { }

  submitApplication(formData: any): Observable<any> {
    const token = this.tokenStorage.getAccessToken();
    console.log('Submitting application with token:', token);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, formData, { headers }).pipe(
      catchError((error) => {
        console.error('Caught error in service:', error);
        return throwError(() => new Error('Something bad happened; please try again later.'));
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getAccessToken();
  }
}