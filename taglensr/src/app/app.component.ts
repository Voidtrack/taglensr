import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ApiPost,
  BlogApiResponse,
  ParsedPost,
  PostApiResponse,
} from './models/post';
import { TumblrService } from './services/tumblr.service';

@Component({
  selector: 'app-root',
  imports: [
    MatSidenavContainer,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    MatTooltipModule,
    FormsModule,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  // Specify max requests per post
  readonly REQUEST_LIMIT = 12;

  private _snackBar = inject(MatSnackBar);

  posts: ParsedPost[] = [];
  loading = false;
  selectedDate = new Date().toISOString().split('T')[0];
  internalDate = this.selectedDate;
  requestedPosts = 5;
  getVideo = false;
  pendingSearch = true;
  target = '';
  requestsMade = 0;

  constructor(private tuServe: TumblrService) {}

  openPost(url: string) {
    window.open(url, '_blank');
  }

  resetNav() {
    this.pendingSearch = true;
  }

  backInTime() {
    this.selectedDate = this.internalDate;
    this.search();
  }

  search() {
    if (this.target.length === 0) {
      return;
    }
    this.posts = [];
    this.loading = true;
    this.pendingSearch = false;
    this.requestsMade = 0;
    this.loadPosts();
  }

  loadPosts(date: Date = new Date(this.selectedDate)) {
    this.requestsMade += 1;
    if (this.target.includes('@')) {
      this.tuServe
        .getBlogPosts(
          this.target.replace('@', ''),
          this.getVideo ? 'video' : 'photo',
          date
        )
        .subscribe({
          next: this.parseBlogResponse.bind(this),
          error: (e) => {
            this.resetNav();
            this.displayErrorSnack(
              `We got an error from Tumblr's API when looking for posts! Code: ${Number(
                e.status
              )}. Please drop us an issue!`
            );
            console.error(e);
            this.loading = false;
          },
        });
    } else {
      if (!this.target.includes('#'))
        this.displayErrorSnack("Query doesn't have a # or @. Assuming #");
      this.tuServe
        .getTaggedPosts(this.target.replace('#', ''), date)
        .subscribe({
          next: this.parsePostResponse.bind(this),
          error: (e) => {
            this.resetNav();
            this.displayErrorSnack(
              `We got an error from Tumblr's API when looking for posts! Code: ${Number(
                e.status
              )}. Please drop us an issue!`
            );
            console.error(e);
            this.loading = false;
          },
        });
    }
  }

  private displayErrorSnack(errorText: string) {
    this._snackBar.open(`⚠️ ${errorText}`, 'Dismiss');
  }

  private parseBlogResponse(response: BlogApiResponse) {
    if (response.response.posts.length === 0) {
      this.displayErrorSnack('No more posts found');
      this.loading = false;
      this.resetNav();
      return;
    }
    this.parsePosts(response.response.posts);
  }

  private parsePostResponse(response: PostApiResponse) {
    if (response.response.length === 0) {
      this.displayErrorSnack('No more posts found');
      this.loading = false;
      this.resetNav();
      return;
    }
    this.parsePosts(response.response);
  }

  private parsePosts(posts: ApiPost[]) {
    let updatedDate: Date | null = null;
    for (const post of posts) {
      if (post.content.length === 0) {
        //Posts without content are reblogs
        this.parsePost({
          post_url: post.post_url,
          parent_post_url: '',
          summary: '🔁 ' + post.summary,
          timestamp: post.timestamp,
          content: post.trail[0].content,
          trail: [],
        });
      } else {
        this.parsePost(post);
      }
      if (this.posts.length === this.requestedPosts) {
        updatedDate = this.updateLocalTimestamp(post.timestamp);
        break;
      }
    }
    if (!updatedDate)
      updatedDate = this.updateLocalTimestamp(posts.pop()!.timestamp);
    if (this.posts.length < this.requestedPosts) {
      if (this.requestsMade < this.REQUEST_LIMIT * this.requestedPosts) {
        this.loadPosts(updatedDate);
        return;
      }
      this.displayErrorSnack(
        "We had to stop the search because it used too many requests. Please drop us an issue and don't try again!"
      );
      this.resetNav();
    }
    this.loading = false;
  }

  private parsePost(post: ApiPost) {
    let summary = post.summary;
    if (summary.length > 40) {
      summary = summary.substring(0, 40) + '...';
    }
    if (this.getVideo && post.content[0].type === 'video') {
      switch (post.content[0].provider) {
        case 'youtube': {
          const id = post.content[0].metadata!.id;
          this.posts.push(
            new ParsedPost(
              post.post_url,
              `https://img.youtube.com/vi/${id}/0.jpg`,
              summary
            )
          );
          break;
        }
      }
      if (post.content[0].media) {
        this.posts.push(
          new ParsedPost(post.post_url, post.content[0].poster![0].url, summary)
        );
      }
    }
    if (!this.getVideo && post.content[0].type === 'image') {
      this.posts.push(
        new ParsedPost(post.post_url, post.content[0].media![0].url, summary)
      );
    }
  }

  private updateLocalTimestamp(timestamp: number): Date {
    this.internalDate = new Date(timestamp * 1000).toISOString().split('T')[0];
    return new Date(timestamp);
  }
}
