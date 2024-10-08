import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/post';

@Injectable({
  providedIn: 'root',
})
export class TumblrService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  apiKey = environment.api_key;
  baseUrl = 'https://api.tumblr.com';

  constructor(private httpClient: HttpClient) {}

  getTaggedPosts(tag: string, date: Date): Observable<ApiResponse> {
    const timestamp =
      date.getTime() > 9999999999
        ? Math.floor(date.getTime() / 1000)
        : date.getTime();
    return this.httpClient.get<ApiResponse>(
      `${this.baseUrl}/v2/tagged?api_key=${this.apiKey}&tag=${tag}&before=${timestamp}&npf=true`
    );
  }
}
