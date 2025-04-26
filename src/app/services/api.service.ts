import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { filter, map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  post<T>(endpoint: string, body: any, options?: any): Observable<T> {
    return this.http.post<T>(`${environment.api_endpoint.replace(/\/$/, '')}${endpoint}`, body, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      ...options
    }).pipe(
      filter(event => event.type === HttpEventType.Response),
      map((event: HttpResponse<T>) => event.body as T)
    );
  }

  // You can add get/put/delete methods as needed
}
