import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BlogApiResponse, PostApiResponse, PostType } from '../models/post';

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

  private buildTimestamp(date: Date): number {
    return date.getTime() > 9999999999
      ? Math.floor(date.getTime() / 1000)
      : date.getTime();
  }

  getTaggedPosts(tag: string, date: Date): Observable<PostApiResponse> {
    return this.httpClient.get<PostApiResponse>(
      `${this.baseUrl}/v2/tagged?api_key=${
        this.apiKey
      }&tag=${tag}&before=${this.buildTimestamp(date)}&npf=true`
    );
  }

  getBlogPosts(
    blog: string,
    type: PostType,
    date: Date
  ): Observable<BlogApiResponse> {
    return this.httpClient.get<BlogApiResponse>(
      `${this.baseUrl}/v2/blog/${blog}/posts/${type}?api_key=${
        this.apiKey
      }&before=${this.buildTimestamp(date)}&npf=true`
    );
  }
}
