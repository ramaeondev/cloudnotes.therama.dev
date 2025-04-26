import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NewsletterSubscribeResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private subscribeEndpoint = environment.supabase_url.replace(/\/$/, '') + '/functions/v1/newsletter-subscribe';

  constructor(private http: HttpClient) {}

  subscribe(email: string): Observable<NewsletterSubscribeResponse> {
    return this.http.post<NewsletterSubscribeResponse>(
      this.subscribeEndpoint,
      { email }
    );
  }
}

