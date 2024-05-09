import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse } from '../models/post';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TumblrService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Agent': 'TagLensr/0.1',
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
      `${this.baseUrl}/v2/tagged?api_key=${this.apiKey}&tag=${tag}&before=${timestamp}&filter=text`
    );
  }
}
